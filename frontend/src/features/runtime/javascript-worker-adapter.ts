import {
  createIframeBootstrapChannel,
  type BootstrapChannel,
  type BootstrapChannelFactory,
} from './bootstrap-channel';
import { decodeTerminalPacket, utf8Bytes } from './execution-protocol';
import {
  EXECUTION_LIMITS,
  type ExecutionAdapter,
  type ExecutionRequest,
  type ExecutionResult,
  type ExecutionStatus,
} from './execution-types';

interface ActiveRun {
  runId: string;
  startedAt: number;
  resolve: (result: ExecutionResult) => void;
  requestedStatus?: 'timeout' | 'cancelled';
  deadline: ReturnType<typeof setTimeout>;
  recovery?: ReturnType<typeof setTimeout>;
  removeAbort?: () => void;
}

function result(
  runId: string,
  status: ExecutionStatus,
  startedAt: number,
  fields: Partial<Pick<ExecutionResult, 'output' | 'value' | 'message'>> = {},
): ExecutionResult {
  return {
    runId,
    status,
    output: fields.output ?? [],
    value: fields.value ?? '',
    message: fields.message ?? '',
    durationMs: Math.max(0, performance.now() - startedAt),
  };
}

export class JavaScriptWorkerAdapter implements ExecutionAdapter {
  private channel: BootstrapChannel | undefined;
  private unsubscribe: (() => void) | undefined;
  private active: ActiveRun | undefined;
  private disposed = false;

  constructor(
    private readonly runtimeOrigin: string | null,
    private readonly createChannel: BootstrapChannelFactory = createIframeBootstrapChannel,
  ) {}

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    await this.cancel();
    const runId = crypto.randomUUID();
    const startedAt = performance.now();
    if (this.disposed || this.runtimeOrigin === null) {
      return result(runId, 'internal-error', startedAt, {
        message: 'Isolated runtime unavailable',
      });
    }
    if (utf8Bytes(request.source) > EXECUTION_LIMITS.sourceBytes) {
      return result(runId, 'output-limit', startedAt, {
        message: 'Source exceeds the execution limit',
      });
    }
    if (request.signal?.aborted) {
      return result(runId, 'cancelled', startedAt, {
        message: 'Execution cancelled',
      });
    }

    try {
      await this.ensureChannel();
    } catch {
      this.resetChannel();
      return result(runId, 'internal-error', startedAt, {
        message: 'Isolated runtime unavailable',
      });
    }

    return new Promise<ExecutionResult>((resolve) => {
      const deadline = setTimeout(() => {
        void this.stopActive('timeout');
      }, EXECUTION_LIMITS.deadlineMs);
      const active: ActiveRun = { runId, startedAt, resolve, deadline };
      if (request.signal) {
        const abort = () => void this.stopActive('cancelled');
        request.signal.addEventListener('abort', abort, { once: true });
        active.removeAbort = () =>
          request.signal?.removeEventListener('abort', abort);
      }
      this.active = active;
      this.channel?.post({ type: 'execute', runId, source: request.source });
    });
  }

  async cancel(): Promise<void> {
    await this.stopActive('cancelled');
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    await this.cancel();
    this.disposed = true;
    this.channel?.post({ type: 'dispose' });
    this.resetChannel();
  }

  private async ensureChannel(): Promise<void> {
    if (this.channel === undefined) {
      if (this.runtimeOrigin === null) throw new Error('Runtime unavailable');
      this.channel = this.createChannel(this.runtimeOrigin);
      this.unsubscribe = this.channel.subscribe((message) =>
        this.receive(message),
      );
    }
    await this.channel.ready;
  }

  private receive(message: unknown): void {
    const active = this.active;
    if (active === undefined) return;
    const packet = decodeTerminalPacket(message, active.runId);
    if (packet === null) {
      if (
        typeof message === 'object' &&
        message !== null &&
        'runId' in message &&
        message.runId === active.runId
      ) {
        this.channel?.post({ type: 'cancel', runId: active.runId });
        this.finish(
          result(active.runId, 'internal-error', active.startedAt, {
            message: 'Runtime returned an invalid result',
          }),
        );
      }
      return;
    }
    const status = active.requestedStatus ?? packet.status;
    this.finish(
      result(active.runId, status, active.startedAt, {
        output: packet.output,
        value: packet.value,
        message:
          active.requestedStatus === 'timeout'
            ? 'Execution timed out'
            : active.requestedStatus === 'cancelled'
              ? 'Execution cancelled'
              : packet.message,
      }),
    );
  }

  private stopActive(status: 'timeout' | 'cancelled'): Promise<void> {
    const active = this.active;
    if (active === undefined) return Promise.resolve();
    active.requestedStatus = status;
    clearTimeout(active.deadline);
    this.channel?.post({ type: 'cancel', runId: active.runId });
    return new Promise((resolve) => {
      const finishRecovery = (): void => {
        if (this.active === active) {
          this.resetChannel();
          this.finish(
            result(active.runId, status, active.startedAt, {
              message:
                status === 'timeout'
                  ? 'Execution timed out'
                  : 'Execution cancelled',
            }),
          );
        }
        resolve();
      };
      active.recovery = setTimeout(finishRecovery, EXECUTION_LIMITS.recoveryMs);
      const originalResolve = active.resolve;
      active.resolve = (executionResult) => {
        originalResolve(executionResult);
        resolve();
      };
    });
  }

  private finish(executionResult: ExecutionResult): void {
    const active = this.active;
    if (active === undefined || active.runId !== executionResult.runId) return;
    clearTimeout(active.deadline);
    if (active.recovery !== undefined) clearTimeout(active.recovery);
    active.removeAbort?.();
    this.active = undefined;
    active.resolve(executionResult);
  }

  private resetChannel(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.channel?.dispose();
    this.channel = undefined;
  }
}
