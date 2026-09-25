import { EXECUTION_LIMITS } from './execution-types';

export interface BootstrapCommand {
  type: 'execute' | 'cancel' | 'dispose';
  runId?: string;
  source?: string;
}

export interface BootstrapChannel {
  readonly ready: Promise<void>;
  post(command: BootstrapCommand): void;
  subscribe(listener: (message: unknown) => void): () => void;
  dispose(): void;
}

export type BootstrapChannelFactory = (
  runtimeOrigin: string,
) => BootstrapChannel;

export function createIframeBootstrapChannel(
  runtimeOrigin: string,
): BootstrapChannel {
  const bootstrapId = crypto.randomUUID();
  const iframe = document.createElement('iframe');
  iframe.hidden = true;
  iframe.title = 'CodeQuest isolated JavaScript runtime';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  const url = new URL('/runtime/bootstrap.html', runtimeOrigin);
  url.searchParams.set('parentOrigin', window.location.origin);
  url.hash = bootstrapId;
  iframe.src = url.href;

  const channel = new MessageChannel();
  const listeners = new Set<(message: unknown) => void>();
  let settled = false;
  let disposed = false;
  let resolveReady: (() => void) | undefined;
  let rejectReady: ((reason: Error) => void) | undefined;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const fail = (): void => {
    if (settled) return;
    settled = true;
    rejectReady?.(new Error('Isolated runtime unavailable'));
  };
  const readyTimer = window.setTimeout(fail, EXECUTION_LIMITS.recoveryMs);

  const onWindowMessage = (event: MessageEvent<unknown>): void => {
    if (
      disposed ||
      event.source !== iframe.contentWindow ||
      event.origin !== runtimeOrigin ||
      typeof event.data !== 'object' ||
      event.data === null ||
      !('type' in event.data) ||
      event.data.type !== 'bootstrap-ready' ||
      !('bootstrapId' in event.data) ||
      event.data.bootstrapId !== bootstrapId
    ) {
      return;
    }
    const contentWindow = iframe.contentWindow;
    if (contentWindow === null) return;
    contentWindow.postMessage({ type: 'connect', bootstrapId }, runtimeOrigin, [
      channel.port2,
    ]);
  };

  channel.port1.onmessage = (event: MessageEvent<unknown>) => {
    if (
      !settled &&
      typeof event.data === 'object' &&
      event.data !== null &&
      'type' in event.data &&
      event.data.type === 'connected'
    ) {
      settled = true;
      window.clearTimeout(readyTimer);
      resolveReady?.();
      return;
    }
    for (const listener of listeners) listener(event.data);
  };
  channel.port1.start();

  window.addEventListener('message', onWindowMessage);
  iframe.addEventListener('error', fail, { once: true });
  document.body.append(iframe);

  return {
    ready,
    post(command) {
      if (!disposed) channel.port1.postMessage(command);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      window.clearTimeout(readyTimer);
      window.removeEventListener('message', onWindowMessage);
      channel.port1.close();
      iframe.remove();
      if (!settled) fail();
      listeners.clear();
    },
  };
}
