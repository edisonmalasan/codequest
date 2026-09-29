import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

async function prepare(
  update: 'installing' | 'waiting' | 'during-verification',
) {
  const registration = {
    active: { state: 'activated' },
    installing: update === 'installing' ? {} : null,
    waiting: update === 'waiting' ? {} : null,
  };
  const post = vi.fn();
  const match = vi.fn(async (path: string) => {
    if (update === 'during-verification') registration.waiting = {};
    return new Response(readFileSync(`public${path}`), {
      headers: {
        'content-security-policy': path.endsWith('-worker.js')
          ? "default-src 'none'; script-src 'unsafe-eval'; worker-src 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'"
          : "default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",
      },
    });
  });
  runInNewContext(readFileSync('public/runtime/offline-setup.js', 'utf8'), {
    location: {
      href: 'https://runner.test/runtime/offline-setup.html?parentOrigin=https%3A%2F%2Fapp.test#setup-id',
      hash: '#setup-id',
    },
    navigator: {
      onLine: true,
      serviceWorker: {
        register: async () => registration,
        ready: Promise.resolve(registration),
      },
    },
    caches: {
      open: async () => ({
        keys: async () => Array.from({ length: 6 }),
        match,
      }),
    },
    parent: { postMessage: post },
    crypto: webcrypto,
    URL,
    Uint8Array,
  });
  await vi.waitFor(() => expect(post).toHaveBeenCalledOnce());
  expect(post).toHaveBeenCalledWith(
    {
      type: 'offline-runner-setup',
      setupId: 'setup-id',
      status: 'unavailable',
    },
    'https://app.test',
  );
  return match;
}

describe('isolated offline setup during worker updates', () => {
  it.each(['installing', 'waiting'] as const)(
    'refuses %s runtime updates without accepting the cache as ready',
    async (state) => expect(await prepare(state)).not.toHaveBeenCalled(),
  );
  it('rechecks the runtime lifecycle after cache verification', async () => {
    expect(await prepare('during-verification')).toHaveBeenCalledTimes(6);
  });
});
