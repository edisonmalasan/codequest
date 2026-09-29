import { describe, expect, it } from 'vitest';
import {
  assertShellBudget,
  canServeShell,
  canUseOfflineFallback,
  isPublicShellUrl,
  MAX_SHELL_BYTES,
  MAX_SHELL_ENTRY_BYTES,
} from './cache-policy';

const origin = 'https://app.codequest.test';
describe('public shell cache boundary', () => {
  it.each([
    '/offline.html',
    '/offline-learning',
    '/icons/icon-192.png',
    '/_next/static/chunks/app/page-abc123.js',
  ])('allows public asset %s', (url) => {
    expect(isPublicShellUrl(url)).toBe(true);
    expect(canServeShell(new Request(origin + url), origin)).toBe(true);
  });
  it.each([
    '/account',
    '/login',
    '/auth/callback?code=secret',
    '/api/v1/account/me',
    '/runtime/bootstrap.js',
    '/preview/bootstrap.js',
    '/offline.html?token=secret',
    '/offline-learning?token=secret',
    '//attacker.test/offline.html',
    'https://app.codequest.test/offline.html',
    '/_next/static/chunks/test.js.map',
    '/_next/static/data/test.json',
    '/quests/a?_rsc=123',
  ])('excludes %s', (url) => {
    expect(isPublicShellUrl(url)).toBe(false);
  });
  it('rejects credential, data, mutation, query and external requests', () => {
    for (const request of [
      new Request(origin + '/offline.html', {
        headers: { authorization: 'Bearer fixture' },
      }),
      new Request(origin + '/offline.html', { headers: { rsc: '1' } }),
      new Request(origin + '/offline.html', {
        headers: { 'next-router-prefetch': '1' },
      }),
      new Request(origin + '/offline.html', { method: 'POST' }),
      new Request(origin + '/offline.html?x=1'),
      new Request('https://runner.test/offline.html'),
    ])
      expect(canServeShell(request, origin)).toBe(false);
  });
  it('does not silently exceed entry or total budgets', () => {
    expect(() =>
      assertShellBudget([{ size: MAX_SHELL_ENTRY_BYTES }]),
    ).not.toThrow();
    expect(() =>
      assertShellBudget([{ size: MAX_SHELL_ENTRY_BYTES + 1 }]),
    ).toThrow();
    expect(() =>
      assertShellBudget(
        Array.from(
          { length: MAX_SHELL_BYTES / MAX_SHELL_ENTRY_BYTES + 1 },
          () => ({ size: MAX_SHELL_ENTRY_BYTES }),
        ),
      ),
    ).toThrow();
    expect(() => assertShellBudget([{ size: NaN }])).toThrow();
  });
  it('requires document navigation and excludes auth/API/compartments', () => {
    expect(
      canUseOfflineFallback(new Request(origin + '/account'), origin),
    ).toBe(false);
    const documentRequest = (path: string) => {
      const request = new Request(origin + path);
      Object.defineProperty(request, 'mode', { value: 'navigate' });
      return request;
    };
    expect(canUseOfflineFallback(documentRequest('/account'), origin)).toBe(
      true,
    );
    for (const path of [
      '/auth/callback?code=secret',
      '/api/v1/me',
      '/runtime/a',
      '/preview/a',
    ])
      expect(canUseOfflineFallback(documentRequest(path), origin)).toBe(false);
  });
});
