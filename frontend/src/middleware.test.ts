import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { middleware } from './middleware';

const auth = vi.hoisted(() => vi.fn());
vi.mock('@/features/auth/update-session', () => ({ updateAuthSession: auth }));
afterEach(() => {
  vi.unstubAllEnvs();
  auth.mockClear();
});
describe('PWA middleware isolation', () => {
  it.each([
    '/sw.js',
    '/manifest.webmanifest',
    '/offline.html',
    '/offline.css',
    '/icons/icon-192.png',
  ])('serves %s without auth refresh', async (path) => {
    vi.stubEnv('NODE_ENV', 'production');
    const result = await middleware(new NextRequest('https://app.test' + path));
    expect(result?.status).toBe(200);
    expect(auth).not.toHaveBeenCalled();
  });
  it('does not serve a leftover production worker in development or preview builds', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(
      (await middleware(new NextRequest('https://app.test/sw.js')))?.status,
    ).toBe(404);
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CODEQUEST_PREVIEW_BUILD', '1');
    expect(
      (await middleware(new NextRequest('https://app.test/sw.js')))?.status,
    ).toBe(404);
  });
  it.each(['NEXT_PUBLIC_RUNTIME_ORIGIN', 'NEXT_PUBLIC_PREVIEW_ORIGIN'])(
    'keeps public shell unavailable on %s',
    async (variable) => {
      vi.stubEnv(variable, 'https://isolated.test');
      for (const path of ['/sw.js', '/manifest.webmanifest', '/offline.html']) {
        const request = new NextRequest('https://isolated.test' + path, {
          headers: { host: 'isolated.test' },
        });
        expect((await middleware(request))?.status).toBe(404);
      }
      expect(auth).not.toHaveBeenCalled();
    },
  );
});
