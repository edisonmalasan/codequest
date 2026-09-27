import type { ExecutionAdapter, ExecutionResult } from '@/features/runtime';

import { createPreviewChannel, type PreviewChannel } from './preview-channel';
import { classifyPreviewResponse } from './preview-protocol';
import {
  buildStaticDocument,
  PreviewSourceError,
  type StaticDocument,
} from './static-document';
import {
  PREVIEW_LIMITS,
  type PreviewAdapter,
  type PreviewFile,
  type PreviewResult,
  type PreviewStatus,
} from './preview-types';

interface ActivePreview {
  id: string;
  resolve: (result: PreviewResult) => void;
  timer: ReturnType<typeof setTimeout>;
  abort: AbortController;
  removeAbort?: () => void;
  document: StaticDocument;
  acknowledged: boolean;
}

function result(
  generationId: string,
  status: PreviewStatus,
  document: StaticDocument | null,
  message: string,
  execution?: ExecutionResult,
): PreviewResult {
  return {
    generationId,
    status,
    message,
    filteredActiveContent: document?.filteredActiveContent ?? false,
    ...(execution ? { execution } : {}),
  };
}

export class StaticPreviewAdapter implements PreviewAdapter {
  private host: HTMLElement | undefined;
  private channel: PreviewChannel | undefined;
  private unsubscribe: (() => void) | undefined;
  private active: ActivePreview | undefined;
  private lastDocument: StaticDocument | undefined;
  private disposed = false;
  private requestSerial = 0;

  constructor(
    private readonly previewOrigin: string | null,
    private readonly executionAdapter?: ExecutionAdapter,
  ) {}

  attach(host: HTMLElement): void {
    if (this.host === host || this.disposed) return;
    void this.cancel();
    this.resetChannel();
    this.host = host;
  }

  async preview(
    files: readonly PreviewFile[],
    signal?: AbortSignal,
  ): Promise<PreviewResult> {
    let sourceDocument: StaticDocument;
    try {
      sourceDocument = buildStaticDocument(files);
    } catch (error) {
      const message =
        error instanceof PreviewSourceError
          ? error.message
          : 'Invalid preview source';
      return result(crypto.randomUUID(), 'error', null, message);
    }
    this.lastDocument = sourceDocument;
    return this.render(sourceDocument, signal);
  }

  async reload(signal?: AbortSignal): Promise<PreviewResult> {
    if (!this.lastDocument) {
      return result(
        crypto.randomUUID(),
        'unavailable',
        null,
        'No preview to reload',
      );
    }
    return this.render(this.lastDocument, signal);
  }

  async cancel(): Promise<void> {
    this.requestSerial += 1;
    const active = this.active;
    if (!active) return;
    active.abort.abort();
    this.channel?.clear();
    this.finish(
      result(active.id, 'cancelled', active.document, 'Preview cancelled'),
    );
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    await this.cancel();
    this.disposed = true;
    this.resetChannel();
    this.host = undefined;
    await this.executionAdapter?.dispose();
  }

  private async render(
    sourceDocument: StaticDocument,
    signal?: AbortSignal,
  ): Promise<PreviewResult> {
    await this.cancel();
    const requestSerial = this.requestSerial;
    const id = crypto.randomUUID();
    if (this.disposed || !this.host || !this.previewOrigin) {
      return result(
        id,
        'unavailable',
        sourceDocument,
        'Static preview unavailable',
      );
    }
    if (signal?.aborted) {
      return result(id, 'cancelled', sourceDocument, 'Preview cancelled');
    }
    try {
      await this.ensureChannel();
    } catch {
      if (requestSerial !== this.requestSerial) {
        return result(id, 'cancelled', sourceDocument, 'Preview cancelled');
      }
      this.resetChannel();
      return result(
        id,
        'unavailable',
        sourceDocument,
        'Static preview unavailable',
      );
    }
    if (requestSerial !== this.requestSerial || signal?.aborted) {
      return result(id, 'cancelled', sourceDocument, 'Preview cancelled');
    }
    return new Promise<PreviewResult>((resolve) => {
      const abort = new AbortController();
      const timer = setTimeout(() => {
        this.channel?.clear();
        this.finish(result(id, 'timeout', sourceDocument, 'Preview timed out'));
      }, PREVIEW_LIMITS.renderMs);
      const active: ActivePreview = {
        id,
        resolve,
        timer,
        abort,
        document: sourceDocument,
        acknowledged: false,
      };
      if (signal) {
        const onAbort = () => void this.cancel();
        signal.addEventListener('abort', onAbort, { once: true });
        active.removeAbort = () => signal.removeEventListener('abort', onAbort);
      }
      this.active = active;
      this.channel?.render(id, sourceDocument.html);
    });
  }

  private async ensureChannel(): Promise<void> {
    if (!this.channel) {
      if (!this.host || !this.previewOrigin)
        throw new Error('Preview unavailable');
      this.channel = createPreviewChannel(this.previewOrigin, this.host);
      this.unsubscribe = this.channel.subscribe((packet) =>
        this.receive(packet),
      );
    }
    await this.channel.ready;
  }

  private receive(packet: unknown): void {
    const active = this.active;
    if (!active) return;
    const response = classifyPreviewResponse(
      packet,
      active.id,
      active.acknowledged,
    );
    if (response === 'stale') return;
    if (response === 'ready') {
      active.acknowledged = true;
      void this.completeWithComputation(active);
    } else {
      this.failActive();
    }
  }

  private async completeWithComputation(active: ActivePreview): Promise<void> {
    if (this.active !== active) return;
    clearTimeout(active.timer);
    const javascript = active.document.javascript;
    if (javascript === undefined) {
      this.finish(
        result(active.id, 'ready', active.document, 'Static preview ready'),
      );
      return;
    }
    if (!this.executionAdapter) {
      this.finish(
        result(
          active.id,
          'error',
          active.document,
          'JavaScript runtime unavailable',
        ),
      );
      return;
    }
    try {
      const execution = await this.executionAdapter.execute({
        source: javascript,
        signal: active.abort.signal,
      });
      if (this.active !== active) return;
      this.finish(
        result(
          active.id,
          execution.status === 'success' ? 'ready' : 'error',
          active.document,
          execution.status === 'success'
            ? 'Static preview ready; JavaScript ran separately'
            : execution.message || 'JavaScript execution failed',
          execution,
        ),
      );
    } catch {
      if (this.active === active) {
        this.finish(
          result(
            active.id,
            'error',
            active.document,
            'JavaScript runtime unavailable',
          ),
        );
      }
    }
  }

  private failActive(): void {
    const active = this.active;
    if (!active) return;
    this.channel?.clear();
    this.resetChannel();
    this.finish(
      result(
        active.id,
        'error',
        active.document,
        'Preview returned an invalid result',
      ),
    );
  }

  private finish(previewResult: PreviewResult): void {
    const active = this.active;
    if (!active || active.id !== previewResult.generationId) return;
    clearTimeout(active.timer);
    active.removeAbort?.();
    this.active = undefined;
    active.resolve(previewResult);
  }

  private resetChannel(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.channel?.dispose();
    this.channel = undefined;
  }
}
