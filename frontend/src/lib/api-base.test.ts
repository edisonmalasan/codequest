import { afterEach, describe, expect, it, vi } from 'vitest';
import { getApiBaseUrl, getConfiguredApiBaseUrl } from './api-base';

afterEach(() => vi.unstubAllEnvs());

describe('getApiBaseUrl', () => {
  it('defaults to the local backend', () => {
    expect(getApiBaseUrl({})).toBe('http://127.0.0.1:3001');
  });

  it('uses the configured URL and strips trailing slashes', () => {
    expect(
      getApiBaseUrl({ NEXT_PUBLIC_API_URL: 'https://api.example.com/' }),
    ).toBe('https://api.example.com');
  });

  it('rejects an empty URL', () => {
    expect(() => getApiBaseUrl({ NEXT_PUBLIC_API_URL: '   ' })).toThrow();
  });

  it('reads the browser API origin from public configuration', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://learn-api.example.com/');
    expect(getConfiguredApiBaseUrl()).toBe('https://learn-api.example.com');
  });
});
