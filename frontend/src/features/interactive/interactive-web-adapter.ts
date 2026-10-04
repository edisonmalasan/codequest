import {
  buildInteractiveDocument,
  type InteractiveDocument,
} from './interactive-document';
import {
  createInteractiveChannel,
  type InteractiveChannel,
} from './interactive-channel';
import {
  decodeDisplayPacket,
  decodeRunnerStep,
  type DisplayPacket,
  type RunnerStep,
} from './interactive-protocol';
import {
  captureInteractiveSnapshot,
  InteractiveSourceError,
  resolveInteractiveOrigins,
} from './interactive-snapshot';
import {
  INTERACTIVE_LIMITS,
  type InteractiveEvent,
  type InteractiveResult,
  type InteractiveSnapshot,
  type InteractiveStatus,
  type InteractiveWebAdapter,
} from './interactive-types';

interface Session {
  readonly generationId: string;
  readonly sessionId: string;
  readonly document: InteractiveDocument;
  readonly source: string;
  readonly snapshot: InteractiveSnapshot;
  readonly controller: AbortController;
  readonly seenEvents: Set<string>;
  eventCount: number;
  ready: boolean;
  busy: boolean;
  description: string;
  startedAt: number;
  textByNode: Map<string, string>;
}

function result(
  session: Session | undefined,
  status: InteractiveStatus,
  message: string,
  output: readonly string[] = [],
): InteractiveResult {
  return {
    generationId: session?.generationId ?? crypto.randomUUID(),
    status,
    message,
    output,
    filteredActiveContent: session?.document.filteredActiveContent ?? false,
    description: session?.description ?? '',
    durationMs: session
      ? Math.max(0, performance.now() - session.startedAt)
      : 0,
  };
}

function awaitPacket<T>(
  channel: InteractiveChannel,
  decode: (packet: unknown) => T | null,
  signal: AbortSignal,
  timeoutMs: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Interactive operation cancelled', 'AbortError'));
      return;
    }
    let finished = false;
    const finish = (value: T | Error, error: boolean): void => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      unsubscribe();
      signal.removeEventListener('abort', onAbort);
      if (error) reject(value);
      else resolve(value as T);
    };
    const onAbort = (): void =>
      finish(
        new DOMException('Interactive operation cancelled', 'AbortError'),
        true,
      );
    const unsubscribe = channel.subscribe((packet) => {
      const value = decode(packet);
      if (value !== null) finish(value, false);
    });
    const timer = setTimeout(
      () => finish(new Error('Interactive operation timed out'), true),
      timeoutMs,
    );
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export class IsolatedInteractiveWebAdapter implements InteractiveWebAdapter {
  private readonly runnerOrigin: string;
  private readonly previewOrigin: string;
  private runner?: InteractiveChannel;
  private preview?: InteractiveChannel;
  private host?: HTMLElement;
  private session?: Session;
  private readonly listeners = new Set<(value: InteractiveResult) => void>();
  private unsubscribePreview?: () => void;
  private unsubscribeRunner?: () => void;
  private operation = 0;
  private disposed = false;

  constructor(runnerOrigin: string, previewOrigin: string) {
    const origins =
      typeof window === 'undefined'
        ? null
        : resolveInteractiveOrigins(
            window.location.origin,
            runnerOrigin,
            previewOrigin,
          );
    if (
      !origins ||
      origins.runnerOrigin !== runnerOrigin ||
      origins.previewOrigin !== previewOrigin
    ) {
      throw new Error('Interactive mode requires three distinct origins');
    }
    this.runnerOrigin = runnerOrigin;
    this.previewOrigin = previewOrigin;
  }

  attach(host: HTMLElement): void {
    if (this.host === host && !this.disposed) return;
    if (this.disposed || this.host)
      throw new Error('Interactive adapter is already attached');
    this.host = host;
  }

  subscribe(listener: (value: InteractiveResult) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(value: InteractiveResult): void {
    for (const listener of this.listeners) listener(value);
  }

  private stop(): void {
    this.operation += 1;
    const previous = this.session;
    this.session = undefined;
    previous?.controller.abort();
    if (previous)
      this.runner?.post({ type: 'cancel', sessionId: previous.sessionId });
    this.preview?.post({ type: 'clear' });
  }

  private async channels(): Promise<{
    runner: InteractiveChannel;
    preview: InteractiveChannel;
  }> {
    if (!this.host || this.disposed)
      throw new Error('Interactive preview unavailable');
    this.runner ??= createInteractiveChannel(
      this.runnerOrigin,
      '/runtime/interactive-bootstrap.html',
    );
    this.preview ??= createInteractiveChannel(
      this.previewOrigin,
      '/preview/interactive-bootstrap.html',
      this.host,
    );
    try {
      await Promise.all([this.runner.ready, this.preview.ready]);
    } catch (error) {
      this.unsubscribeRunner?.();
      this.unsubscribePreview?.();
      this.unsubscribeRunner = undefined;
      this.unsubscribePreview = undefined;
      this.runner.dispose();
      this.preview.dispose();
      this.runner = undefined;
      this.preview = undefined;
      throw error;
    }
    if (!this.unsubscribePreview) {
      this.unsubscribePreview = this.preview.subscribe((packet) => {
        const current = this.session;
        if (!current?.ready || current.controller.signal.aborted) return;
        const display = decodeDisplayPacket(
          packet,
          current.generationId,
          new Set(current.document.nodes.map((node) => node.nodeId)),
        );
        if (display?.type === 'invalid' || display?.type === 'error') {
          const failed = result(
            current,
            'internal-error',
            'Interactive display rejected an update',
          );
          this.stop();
          this.emit(failed);
          return;
        }
        if (
          display?.type !== 'interaction' ||
          current.seenEvents.has(display.eventId)
        )
          return;
        current.seenEvents.add(display.eventId);
        void this.dispatch(display.event).then((value) => this.emit(value));
      });
    }
    if (!this.unsubscribeRunner) {
      this.unsubscribeRunner = this.runner.subscribe((packet) => {
        const current = this.session;
        if (
          !current ||
          typeof packet !== 'object' ||
          packet === null ||
          Array.isArray(packet)
        )
          return;
        if (
          !('type' in packet) ||
          packet.type !== 'session-ended' ||
          !('sessionId' in packet) ||
          packet.sessionId !== current.sessionId ||
          !('status' in packet) ||
          packet.status !== 'cancelled' ||
          Object.keys(packet).length !== 4
        )
          return;
        const ended = result(
          current,
          'cancelled',
          'Interactive session expired',
        );
        this.stop();
        this.emit(ended);
      });
    }
    return { runner: this.runner, preview: this.preview };
  }

  async start(
    snapshot: InteractiveSnapshot,
    signal?: AbortSignal,
  ): Promise<InteractiveResult> {
    this.stop();
    if (this.disposed || !this.host)
      return result(
        undefined,
        'unavailable',
        'Interactive preview unavailable',
      );
    let captured;
    let document;
    try {
      captured = captureInteractiveSnapshot(snapshot);
      document = buildInteractiveDocument(captured);
    } catch (error) {
      return result(
        undefined,
        error instanceof InteractiveSourceError
          ? 'unsupported'
          : 'internal-error',
        error instanceof Error
          ? error.message
          : 'Interactive source unavailable',
      );
    }
    const controller = new AbortController();
    const abort = (): void => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const session: Session = {
      generationId: crypto.randomUUID(),
      sessionId: crypto.randomUUID(),
      document,
      source: captured.javascript,
      snapshot: captured,
      controller,
      seenEvents: new Set(),
      eventCount: 0,
      ready: false,
      busy: false,
      description: document.description,
      startedAt: performance.now(),
      textByNode: new Map(
        document.nodes.map((node) => [node.nodeId, node.ownText]),
      ),
    };
    this.session = session;
    const operation = this.operation;
    try {
      const { runner, preview } = await this.channels();
      if (controller.signal.aborted || this.operation !== operation)
        return result(session, 'cancelled', 'Interactive operation cancelled');
      const nodeIds = new Set(document.nodes.map((node) => node.nodeId));
      const rendered = awaitPacket(
        preview,
        (packet): DisplayPacket | null => {
          const value = decodeDisplayPacket(
            packet,
            session.generationId,
            nodeIds,
          );
          return value && ['rendered', 'invalid', 'error'].includes(value.type)
            ? value
            : null;
        },
        controller.signal,
        INTERACTIVE_LIMITS.deadlineMs,
      );
      preview.post({
        type: 'render',
        generationId: session.generationId,
        body: document.body,
        css: document.css,
        nodeIds: [...nodeIds],
      });
      const display = await rendered;
      if (display.type !== 'rendered')
        throw new Error('Interactive display rejected the document');
      const stepId = crypto.randomUUID();
      const step = awaitPacket(
        runner,
        (packet): RunnerStep | null =>
          decodeRunnerStep(packet, session.sessionId, stepId, nodeIds),
        controller.signal,
        INTERACTIVE_LIMITS.deadlineMs + 200,
      );
      runner.post({
        type: 'start',
        sessionId: session.sessionId,
        stepId,
        source: session.source,
        nodes: document.nodes,
      });
      const outcome = await step;
      if (outcome.status === 'ready')
        await this.applyMutations(preview, session, stepId, outcome.mutations);
      session.ready = outcome.status === 'ready';
      if (!session.ready && this.session === session) this.stop();
      return result(
        session,
        outcome.status,
        outcome.message ||
          (session.ready
            ? 'Interactive preview ready'
            : 'Interactive execution failed'),
        outcome.output,
      );
    } catch (error) {
      const status: InteractiveStatus = controller.signal.aborted
        ? 'cancelled'
        : error instanceof Error && error.message.includes('timed out')
          ? 'timeout'
          : 'unavailable';
      if (this.session === session) this.stop();
      return result(
        session,
        status,
        error instanceof Error ? error.message : 'Interactive mode unavailable',
      );
    } finally {
      signal?.removeEventListener('abort', abort);
    }
  }

  private async applyMutations(
    preview: InteractiveChannel,
    session: Session,
    stepId: string,
    mutations: RunnerStep['mutations'],
  ): Promise<void> {
    if (mutations.length === 0) return;
    const applied = awaitPacket(
      preview,
      (packet): DisplayPacket | null => {
        const value = decodeDisplayPacket(
          packet,
          session.generationId,
          new Set(session.document.nodes.map((node) => node.nodeId)),
        );
        return value?.type === 'applied' && value.stepId === stepId
          ? value
          : null;
      },
      session.controller.signal,
      INTERACTIVE_LIMITS.deadlineMs,
    );
    preview.post({
      type: 'mutate',
      generationId: session.generationId,
      stepId,
      mutations,
    });
    await applied;
    for (const mutation of mutations)
      if (mutation.kind === 'text') {
        session.textByNode.set(mutation.nodeId, mutation.value);
        const descendants = new Set([mutation.nodeId]);
        for (const node of session.document.nodes) {
          if (node.parentId && descendants.has(node.parentId)) {
            descendants.add(node.nodeId);
            session.textByNode.delete(node.nodeId);
          }
        }
      }
    const text = mutations
      .filter((mutation) => mutation.kind === 'text')
      .map((mutation) => mutation.value.trim())
      .filter(Boolean)
      .slice(-5)
      .join(' · ');
    session.description = (
      text ||
      `Updated ${mutations.length} page element${mutations.length === 1 ? '' : 's'}`
    ).slice(0, 2_048);
  }

  async dispatch(
    event: InteractiveEvent,
    signal?: AbortSignal,
  ): Promise<InteractiveResult> {
    const session = this.session;
    if (!session?.ready || !this.runner || !this.preview)
      return result(
        session,
        'unavailable',
        'Run the interactive preview first',
      );
    if (session.busy)
      return result(
        session,
        'unsupported',
        'An interactive event is still running',
      );
    if (session.eventCount >= INTERACTIVE_LIMITS.events) {
      this.stop();
      return result(session, 'output-limit', 'Interactive event limit reached');
    }
    if (
      !['click', 'input', 'change'].includes(event.type) ||
      !session.document.nodes.some((node) => node.nodeId === event.targetId) ||
      (event.value !== undefined &&
        new TextEncoder().encode(event.value).byteLength > 256)
    ) {
      return result(
        session,
        'unsupported',
        'Interactive event is not supported',
      );
    }
    const stepId = crypto.randomUUID();
    const abort = (): void => session.controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) session.controller.abort();
    session.eventCount += 1;
    session.busy = true;
    session.startedAt = performance.now();
    try {
      const nodeIds = new Set(
        session.document.nodes.map((node) => node.nodeId),
      );
      const pending = awaitPacket(
        this.runner,
        (packet) =>
          decodeRunnerStep(packet, session.sessionId, stepId, nodeIds),
        session.controller.signal,
        INTERACTIVE_LIMITS.deadlineMs + 200,
      );
      this.runner.post({
        type: 'event',
        sessionId: session.sessionId,
        stepId,
        event,
      });
      const outcome = await pending;
      if (outcome.status === 'ready')
        await this.applyMutations(
          this.preview,
          session,
          stepId,
          outcome.mutations,
        );
      if (outcome.status !== 'ready' && this.session === session) this.stop();
      return result(
        session,
        outcome.status,
        outcome.message || 'Interactive event handled',
        outcome.output,
      );
    } catch (error) {
      const status: InteractiveStatus = session.controller.signal.aborted
        ? 'cancelled'
        : error instanceof Error && error.message.includes('timed out')
          ? 'timeout'
          : 'internal-error';
      if (this.session === session) this.stop();
      return result(
        session,
        status,
        error instanceof Error ? error.message : 'Interactive event failed',
      );
    } finally {
      session.busy = false;
      signal?.removeEventListener('abort', abort);
    }
  }

  reload(signal?: AbortSignal): Promise<InteractiveResult> {
    if (!this.session)
      return Promise.resolve(
        result(undefined, 'unavailable', 'Run the interactive preview first'),
      );
    return this.start(this.session.snapshot, signal);
  }

  readText(elementId: string): string | null {
    const session = this.session;
    if (!session?.ready || !/^[a-z][a-z0-9-]{0,31}$/.test(elementId))
      return null;
    const node = session.document.nodes.find(
      (item) => item.elementId === elementId,
    );
    return node ? (session.textByNode.get(node.nodeId) ?? null) : null;
  }

  async cancel(): Promise<void> {
    this.stop();
  }

  async dispose(): Promise<void> {
    this.stop();
    this.disposed = true;
    this.unsubscribePreview?.();
    this.unsubscribePreview = undefined;
    this.unsubscribeRunner?.();
    this.unsubscribeRunner = undefined;
    this.preview?.dispose();
    this.runner?.dispose();
    this.preview = undefined;
    this.runner = undefined;
    this.host = undefined;
    this.listeners.clear();
  }
}
