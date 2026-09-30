import { NextRequest, NextResponse } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { middleware } from './middleware';

const auth = vi.hoisted(() => vi.fn());
vi.mock('@/features/auth/update-session', () => ({ updateAuthSession: auth }));
afterEach(() => {
  vi.unstubAllEnvs();
  auth.mockClear();
});
describe('PWA middleware isolation', () => {
  it('adds defensive headers to trusted application and public shell responses', async () => {
    auth.mockResolvedValue(NextResponse.next());
    for (const path of ['/account', '/offline-learning']) {
      const response = await middleware(
        new NextRequest('https://app.test' + path),
      );
      expect(response.headers.get('x-frame-options')).toBe('DENY');
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
      expect(response.headers.get('permissions-policy')).toContain('camera=()');
    }
  });

  it.each([
    ['NEXT_PUBLIC_RUNTIME_ORIGIN', '/runtime/bootstrap.html'],
    ['NEXT_PUBLIC_PREVIEW_ORIGIN', '/preview/bootstrap.html'],
  ])(
    'does not add application headers to %s bootstrap',
    async (variable, path) => {
      vi.stubEnv(variable, 'https://isolated.test');
      const response = await middleware(
        new NextRequest('https://isolated.test' + path, {
          headers: { host: 'isolated.test' },
        }),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get('x-frame-options')).toBeNull();
      expect(auth).not.toHaveBeenCalled();
    },
  );
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
