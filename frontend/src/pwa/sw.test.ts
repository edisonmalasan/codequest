import { afterEach, describe, expect, it, vi } from 'vitest';

const handlers = vi.hoisted(() => ({
  install: vi.fn().mockResolvedValue(undefined),
  activate: vi.fn().mockResolvedValue(undefined),
  request: vi.fn().mockResolvedValue(new Response('public asset')),
  fallback: vi.fn().mockResolvedValue(new Response('offline shell')),
  skipWaiting: vi.fn(),
}));
vi.mock('serwist', () => ({
  Serwist: class {
    constructor() {
      globalThis.addEventListener('message', handlers.skipWaiting);
    }
    handleInstall = handlers.install;
    handleActivate = handlers.activate;
    handleRequest = handlers.request;
    matchPrecache = handlers.fallback;
  },
}));
class WorkerScope extends EventTarget {
  location = { origin: 'https://app.test' };
  __SW_MANIFEST = [{ url: '/offline.html', revision: 'fixture' }];
}
class FetchFixture extends Event {
  response: Promise<Response> | undefined;
  constructor(public request: Request) {
    super('fetch');
  }
  respondWith(value: Promise<Response>) {
    this.response = value;
  }
}
async function scope() {
  vi.resetModules();
  const worker = new WorkerScope();
  vi.stubGlobal('self', worker);
  vi.stubGlobal('addEventListener', worker.addEventListener.bind(worker));
  await import('./sw');
  return worker;
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
describe('worker security handlers', () => {
  it('ignores arbitrary cache and skip-waiting messages before library handlers', async () => {
    const worker = await scope();
    worker.dispatchEvent(
      new MessageEvent('message', { data: { type: 'SKIP_WAITING' } }),
    );
    worker.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'CACHE_URLS', payload: { urlsToCache: ['/account'] } },
      }),
    );
    expect(handlers.skipWaiting).not.toHaveBeenCalled();
  });
  it('only routes allowlisted public fetches through Serwist', async () => {
    const worker = await scope();
    for (const url of ['/account', '/api/v1/me', '/offline.html?secret=1']) {
      const event = new FetchFixture(new Request('https://app.test' + url));
      worker.dispatchEvent(event);
      expect(event.response).toBeUndefined();
    }
    const event = new FetchFixture(
      new Request('https://app.test/offline.html'),
    );
    worker.dispatchEvent(event);
    expect(await event.response?.then((value) => value.text())).toBe(
      'public asset',
    );
    expect(handlers.request).toHaveBeenCalledTimes(1);
  });
  it('uses public fallback only after failed document transport without caching HTML', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const worker = await scope();
    const request = new Request('https://app.test/account');
    Object.defineProperty(request, 'mode', { value: 'navigate' });
    const event = new FetchFixture(request);
    worker.dispatchEvent(event);
    expect(await event.response?.then((value) => value.text())).toBe(
      'offline shell',
    );
    expect(handlers.request).not.toHaveBeenCalled();
    expect(handlers.fallback).toHaveBeenCalledWith('/offline.html');
  });
});
