// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { prepareOfflineRunner } from './download';

const registration = {
  active: {},
  installing: null as object | null,
  waiting: null as object | null,
};
const cachedDocument = vi.fn();
function setup() {
  registration.installing = null;
  registration.waiting = null;
  vi.stubEnv('NEXT_PUBLIC_RUNTIME_ORIGIN', 'https://runner.test');
  vi.stubGlobal('navigator', {
    onLine: true,
    serviceWorker: {
      controller: {},
      getRegistration: async () => registration,
    },
  });
  cachedDocument.mockResolvedValue(new Response('public shell'));
  vi.stubGlobal('caches', { match: cachedDocument });
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  cachedDocument.mockReset();
  document.querySelectorAll('iframe').forEach((frame) => frame.remove());
});
async function preparationFrame(): Promise<HTMLIFrameElement> {
  await vi.waitFor(() =>
    expect(document.querySelector('iframe')).not.toBeNull(),
  );
  const frame = document.querySelector('iframe');
  if (!frame) throw new Error('Missing setup frame');
  return frame;
}
function ready(
  frame: HTMLIFrameElement,
  setupId = new URL(frame.src).hash.slice(1),
) {
  window.dispatchEvent(
    new MessageEvent('message', {
      source: frame.contentWindow,
      origin: 'https://runner.test',
      data: { type: 'offline-runner-setup', setupId, status: 'ready' },
    }),
  );
}

describe('offline exercise readiness with waiting updates', () => {
  it.each(['installing', 'waiting'] as const)(
    'refuses an application %s update before embedding setup',
    async (state) => {
      setup();
      registration[state] = {};
      expect(await prepareOfflineRunner()).toBe(false);
      expect(cachedDocument).not.toHaveBeenCalled();
      expect(document.querySelector('iframe')).toBeNull();
    },
  );
  it('refuses an update discovered during preparation and removes the setup frame', async () => {
    setup();
    const result = prepareOfflineRunner();
    const frame = await preparationFrame();
    registration.waiting = {};
    ready(frame);
    expect(await result).toBe(false);
    expect(document.querySelector('iframe')).toBeNull();
  });
  it('accepts only a correlated ready response and cleans up the listener and frame', async () => {
    setup();
    const result = prepareOfflineRunner();
    const frame = await preparationFrame();
    ready(frame, 'stale-setup');
    expect(document.querySelector('iframe')).toBe(frame);
    ready(frame);
    expect(await result).toBe(true);
    expect(document.querySelector('iframe')).toBeNull();
    ready(frame);
    expect(document.querySelector('iframe')).toBeNull();
  });
});
