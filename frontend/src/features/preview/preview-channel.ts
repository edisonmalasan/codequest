import { PREVIEW_LIMITS } from './preview-types';

export interface PreviewChannel {
  readonly ready: Promise<void>;
  render(generationId: string, document: string): void;
  clear(): void;
  subscribe(listener: (packet: unknown) => void): () => void;
  dispose(): void;
}

export function createPreviewChannel(
  previewOrigin: string,
  host: HTMLElement,
): PreviewChannel {
  const bootstrapId = crypto.randomUUID();
  const frame = document.createElement('iframe');
  frame.title = 'Static HTML and CSS preview';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  frame.referrerPolicy = 'no-referrer';
  frame.style.cssText =
    'display:block;width:100%;height:100%;min-height:18rem;border:0;background:white';
  const url = new URL('/preview/bootstrap.html', previewOrigin);
  url.searchParams.set('parentOrigin', window.location.origin);
  url.hash = bootstrapId;
  frame.src = url.href;

  const channel = new MessageChannel();
  const listeners = new Set<(packet: unknown) => void>();
  let disposed = false;
  let settled = false;
  let connected = false;
  let resolveReady: (() => void) | undefined;
  let rejectReady: ((error: Error) => void) | undefined;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  const fail = (): void => {
    if (settled) return;
    settled = true;
    rejectReady?.(new Error('Static preview unavailable'));
  };
  const timer = window.setTimeout(fail, PREVIEW_LIMITS.handshakeMs);

  const onWindowMessage = (event: MessageEvent<unknown>): void => {
    if (
      disposed ||
      connected ||
      event.source !== frame.contentWindow ||
      event.origin !== previewOrigin ||
      typeof event.data !== 'object' ||
      event.data === null ||
      Array.isArray(event.data) ||
      !('type' in event.data) ||
      event.data.type !== 'bootstrap-ready' ||
      !('bootstrapId' in event.data) ||
      event.data.bootstrapId !== bootstrapId ||
      Object.keys(event.data).length !== 2
    ) {
      return;
    }
    const target = frame.contentWindow;
    if (!target) return;
    connected = true;
    target.postMessage({ type: 'connect', bootstrapId }, previewOrigin, [
      channel.port2,
    ]);
  };

  channel.port1.onmessage = (event: MessageEvent<unknown>) => {
    const packet = event.data;
    if (!settled) {
      if (
        typeof packet === 'object' &&
        packet !== null &&
        !Array.isArray(packet) &&
        'type' in packet &&
        packet.type === 'connected' &&
        'bootstrapId' in packet &&
        packet.bootstrapId === bootstrapId &&
        Object.keys(packet).length === 2
      ) {
        settled = true;
        window.clearTimeout(timer);
        resolveReady?.();
      }
      return;
    }
    for (const listener of listeners) listener(packet);
  };
  channel.port1.start();
  window.addEventListener('message', onWindowMessage);
  frame.addEventListener('error', fail, { once: true });
  host.append(frame);

  return {
    ready,
    render(generationId, sourceDocument) {
      if (!disposed && settled) {
        channel.port1.postMessage({
          type: 'render',
          generationId,
          document: sourceDocument,
        });
      }
    },
    clear() {
      if (!disposed) channel.port1.postMessage({ type: 'clear' });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener('message', onWindowMessage);
      channel.port1.close();
      frame.remove();
      if (!settled) fail();
      listeners.clear();
    },
  };
}
