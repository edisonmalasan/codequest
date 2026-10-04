import { INTERACTIVE_LIMITS } from './interactive-types';

type BootstrapPath =
  '/runtime/interactive-bootstrap.html' | '/preview/interactive-bootstrap.html';

export interface InteractiveChannel {
  readonly ready: Promise<void>;
  post(packet: unknown): void;
  subscribe(listener: (packet: unknown) => void): () => void;
  dispose(): void;
}

export function createInteractiveChannel(
  origin: string,
  path: BootstrapPath,
  host?: HTMLElement,
): InteractiveChannel {
  const bootstrapId = crypto.randomUUID();
  const frame = document.createElement('iframe');
  frame.title = path.startsWith('/runtime/')
    ? 'Isolated interactive runner'
    : 'Isolated interactive preview';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  frame.referrerPolicy = 'no-referrer';
  if (host) {
    frame.style.cssText =
      'display:block;width:100%;height:100%;min-height:18rem;border:0;background:white';
  } else {
    frame.hidden = true;
  }
  const url = new URL(path, origin);
  url.searchParams.set('parentOrigin', window.location.origin);
  url.hash = bootstrapId;
  frame.src = url.href;

  const messageChannel = new MessageChannel();
  const listeners = new Set<(packet: unknown) => void>();
  let disposed = false;
  let connected = false;
  let settled = false;
  let resolveReady: (() => void) | undefined;
  let rejectReady: ((reason: Error) => void) | undefined;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const onWindowMessage = (event: MessageEvent<unknown>): void => {
    const data = event.data;
    if (
      disposed ||
      connected ||
      event.source !== frame.contentWindow ||
      event.origin !== origin ||
      typeof data !== 'object' ||
      data === null ||
      Array.isArray(data) ||
      !('type' in data) ||
      data.type !== 'bootstrap-ready' ||
      !('bootstrapId' in data) ||
      data.bootstrapId !== bootstrapId ||
      Object.keys(data).length !== 2
    )
      return;
    const target = frame.contentWindow;
    if (!target) return;
    connected = true;
    target.postMessage({ type: 'connect', bootstrapId }, origin, [
      messageChannel.port2,
    ]);
  };

  function dispose(): void {
    if (disposed) return;
    disposed = true;
    window.clearTimeout(timer);
    window.removeEventListener('message', onWindowMessage);
    if (settled) messageChannel.port1.postMessage({ type: 'dispose' });
    messageChannel.port1.close();
    frame.remove();
    listeners.clear();
    if (!settled) {
      settled = true;
      rejectReady?.(new Error('Interactive origin unavailable'));
    }
  }

  const timer = window.setTimeout(() => {
    if (!settled) dispose();
  }, INTERACTIVE_LIMITS.recoveryMs);

  messageChannel.port1.onmessage = (event: MessageEvent<unknown>) => {
    if (disposed) return;
    const packet = event.data;
    if (!settled) {
      if (
        typeof packet === 'object' &&
        packet !== null &&
        !Array.isArray(packet) &&
        'type' in packet &&
        packet.type === 'connected' &&
        (!('bootstrapId' in packet) || packet.bootstrapId === bootstrapId)
      ) {
        settled = true;
        window.clearTimeout(timer);
        resolveReady?.();
      }
      return;
    }
    for (const listener of listeners) listener(packet);
  };
  messageChannel.port1.start();
  window.addEventListener('message', onWindowMessage);
  frame.addEventListener('error', dispose, { once: true });
  (host ?? document.body).append(frame);

  return {
    ready,
    post(packet) {
      if (!disposed && settled) messageChannel.port1.postMessage(packet);
    },
    subscribe(listener) {
      if (!disposed) listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose,
  };
}
