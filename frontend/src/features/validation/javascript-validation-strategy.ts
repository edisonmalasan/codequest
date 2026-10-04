import {
  createIframeBootstrapChannel,
  type BootstrapChannel,
  type BootstrapChannelFactory,
} from '@/features/runtime/bootstrap-channel';
import { utf8Bytes } from '@/features/runtime/execution-protocol';
import { validDefinition } from './validation-definition';
import {
  VALIDATION_LIMITS,
  type ValidationCaseResult,
  type ValidationRequest,
  type ValidationResult,
  type ValidationStatus,
  type ValidationStrategy,
} from './validation-types';

interface ActiveCheck {
  id: string;
  startedAt: number;
  resolve: (result: ValidationResult) => void;
  definition: ValidationRequest['definition'];
  deadline: ReturnType<typeof setTimeout>;
  recovery?: ReturnType<typeof setTimeout>;
  requestedStatus?: 'cancelled';
  recoveryDone?: Promise<void>;
  removeAbort?: () => void;
}

function result(
  id: string,
  startedAt: number,
  status: ValidationStatus,
  cases: readonly ValidationCaseResult[] = [],
  feedback = '',
): ValidationResult {
  return {
    checkId: id,
    status,
    passed:
      status === 'completed' &&
      cases.length > 0 &&
      cases.every((item) => item.status === 'passed'),
    cases,
    failedCaseIds: cases
      .filter((item) => item.status === 'failed')
      .map((item) => item.id),
    feedback,
    durationMs: Math.max(0, performance.now() - startedAt),
  };
}

interface CasePacket {
  id: string;
  status:
    'completed' | 'syntax-error' | 'runtime-error' | 'output-limit' | 'timeout';
  passed: boolean;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decode(
  value: unknown,
  active: ActiveCheck,
): {
  status: ValidationStatus;
  cases: readonly CasePacket[];
  message: string;
} | null {
  if (
    !record(value) ||
    value.type !== 'validation-result' ||
    value.checkId !== active.id ||
    typeof value.status !== 'string' ||
    !['completed', 'timeout', 'cancelled', 'internal-error'].includes(
      value.status,
    ) ||
    typeof value.message !== 'string' ||
    utf8Bytes(value.message) > VALIDATION_LIMITS.feedbackBytes ||
    !Array.isArray(value.cases) ||
    value.cases.length > active.definition.cases.length
  )
    return null;
  let encoded: string;
  try {
    encoded = JSON.stringify(value);
  } catch {
    return null;
  }
  if (utf8Bytes(encoded) > VALIDATION_LIMITS.packetBytes) return null;
  const cases: CasePacket[] = [];
  for (const [index, item] of value.cases.entries()) {
    if (
      !record(item) ||
      Object.keys(item).length !== 3 ||
      item.id !== active.definition.cases[index]?.id ||
      typeof item.passed !== 'boolean' ||
      typeof item.status !== 'string' ||
      ![
        'completed',
        'syntax-error',
        'runtime-error',
        'output-limit',
        'timeout',
      ].includes(item.status) ||
      (item.status !== 'completed' && item.passed)
    )
      return null;
    cases.push({
      id: item.id as string,
      status: item.status as CasePacket['status'],
      passed: item.passed,
    });
  }
  if (
    value.status === 'completed' &&
    cases.length !== active.definition.cases.length
  )
    return null;
  return {
    status: value.status as ValidationStatus,
    cases,
    message: value.message,
  };
}

export class JavaScriptValidationStrategy implements ValidationStrategy {
  private channel: BootstrapChannel | undefined;
  private unsubscribe: (() => void) | undefined;
  private active: ActiveCheck | undefined;
  private disposed = false;
  private sequence = 0;

  constructor(
    private readonly runtimeOrigin: string | null,
    private readonly createChannel: BootstrapChannelFactory = (origin) =>
      createIframeBootstrapChannel(
        origin,
        '/runtime/validation-bootstrap.html',
      ),
  ) {}

  async validate(request: ValidationRequest): Promise<ValidationResult> {
    const sequence = ++this.sequence;
    await this.stopActive();
    const id = crypto.randomUUID();
    const startedAt = performance.now();
    if (sequence !== this.sequence)
      return result(id, startedAt, 'cancelled', [], 'Validation cancelled');
    if (this.disposed || this.runtimeOrigin === null)
      return result(
        id,
        startedAt,
        'internal-error',
        [],
        'Isolated validation unavailable',
      );
    if (
      !validDefinition(request.definition) ||
      request.definition.cases.some(
        (item) =>
          ![
            'output-match',
            'value-test',
            'function-test',
            'custom-test',
          ].includes(item.mode),
      )
    )
      return result(
        id,
        startedAt,
        'invalid-definition',
        [],
        'Validation definition is invalid',
      );
    let definition: ValidationRequest['definition'];
    try {
      definition = structuredClone(request.definition);
    } catch {
      return result(
        id,
        startedAt,
        'invalid-definition',
        [],
        'Validation definition is invalid',
      );
    }
    if (
      typeof request.source !== 'string' ||
      utf8Bytes(request.source) > VALIDATION_LIMITS.sourceBytes
    )
      return result(
        id,
        startedAt,
        'output-limit',
        [],
        'Source exceeds the validation limit',
      );
    if (request.signal?.aborted)
      return result(id, startedAt, 'cancelled', [], 'Validation cancelled');
    const abortHandshake = () => void this.cancel();
    request.signal?.addEventListener('abort', abortHandshake, { once: true });
    let channel: BootstrapChannel | undefined;
    try {
      this.resetChannel();
      channel = this.createChannel(this.runtimeOrigin);
      this.channel = channel;
      this.unsubscribe = channel.subscribe((message) => this.receive(message));
      await channel.ready;
    } catch {
      request.signal?.removeEventListener('abort', abortHandshake);
      if (channel !== undefined && this.channel === channel)
        this.resetChannel();
      if (sequence !== this.sequence || request.signal?.aborted)
        return result(id, startedAt, 'cancelled', [], 'Validation cancelled');
      return result(
        id,
        startedAt,
        'internal-error',
        [],
        'Isolated validation unavailable',
      );
    }
    request.signal?.removeEventListener('abort', abortHandshake);
    if (
      sequence !== this.sequence ||
      request.signal?.aborted ||
      this.disposed
    ) {
      if (this.channel === channel) this.resetChannel();
      return result(id, startedAt, 'cancelled', [], 'Validation cancelled');
    }
    return new Promise<ValidationResult>((resolve) => {
      const deadline = setTimeout(
        () =>
          this.finish(
            result(id, startedAt, 'timeout', [], 'Validation timed out'),
          ),
        VALIDATION_LIMITS.totalDeadlineMs + VALIDATION_LIMITS.recoveryMs,
      );
      const active: ActiveCheck = {
        id,
        startedAt,
        resolve,
        definition,
        deadline,
      };
      if (request.signal) {
        const abort = () => void this.cancel();
        request.signal.addEventListener('abort', abort, { once: true });
        active.removeAbort = () =>
          request.signal?.removeEventListener('abort', abort);
      }
      this.active = active;
      this.channel?.post({
        type: 'validate',
        checkId: id,
        source: request.source,
        tests: definition.cases,
      });
    });
  }

  async cancel(): Promise<void> {
    this.sequence += 1;
    await this.stopActive();
  }

  private async stopActive(): Promise<void> {
    const active = this.active;
    if (!active) {
      this.resetChannel();
      return;
    }
    if (active.requestedStatus === 'cancelled') return active.recoveryDone;
    active.requestedStatus = 'cancelled';
    clearTimeout(active.deadline);
    this.channel?.post({ type: 'cancel', checkId: active.id });
    const recoveryDone = new Promise<void>((resolve) => {
      const originalResolve = active.resolve;
      active.resolve = (value) => {
        originalResolve(value);
        resolve();
      };
      active.recovery = setTimeout(() => {
        if (this.active === active) {
          this.finish(
            result(
              active.id,
              active.startedAt,
              'cancelled',
              [],
              'Validation cancelled',
            ),
          );
        }
        resolve();
      }, VALIDATION_LIMITS.recoveryMs);
    });
    active.recoveryDone = recoveryDone;
    return recoveryDone;
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    await this.cancel();
    this.disposed = true;
    this.resetChannel();
  }

  private receive(message: unknown): void {
    const active = this.active;
    if (!active) return;
    if (!record(message) || message.checkId !== active.id) return;
    const packet = decode(message, active);
    if (!packet) {
      this.finish(
        result(
          active.id,
          active.startedAt,
          'internal-error',
          [],
          'Invalid validation result',
        ),
      );
      return;
    }
    if (active.requestedStatus === 'cancelled') {
      this.finish(
        result(
          active.id,
          active.startedAt,
          'cancelled',
          [],
          'Validation cancelled',
        ),
      );
      return;
    }
    const cases = packet.cases.map((item, index): ValidationCaseResult => ({
      id: item.id,
      label: active.definition.cases[index]?.label ?? item.id,
      status: item.passed ? 'passed' : 'failed',
      message: item.passed
        ? 'Passed'
        : item.status === 'completed'
          ? (active.definition.cases[index]?.feedback ?? 'Test failed')
          : `${item.status.replaceAll('-', ' ')}: ${active.definition.cases[index]?.feedback ?? 'Test failed'}`,
    }));
    if (packet.status === 'timeout') {
      for (const item of active.definition.cases.slice(cases.length))
        cases.push({
          id: item.id,
          label: item.label,
          status: 'failed',
          message: 'Validation timed out',
        });
    }
    const failure = packet.cases.find((item) => item.status !== 'completed');
    const status =
      packet.status === 'completed' && failure ? failure.status : packet.status;
    this.finish(
      result(active.id, active.startedAt, status, cases, packet.message),
    );
  }

  private finish(value: ValidationResult): void {
    const active = this.active;
    if (!active || active.id !== value.checkId) return;
    clearTimeout(active.deadline);
    if (active.recovery !== undefined) clearTimeout(active.recovery);
    active.removeAbort?.();
    this.active = undefined;
    this.resetChannel();
    active.resolve(value);
  }

  private resetChannel(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.channel?.dispose();
    this.channel = undefined;
  }
}
