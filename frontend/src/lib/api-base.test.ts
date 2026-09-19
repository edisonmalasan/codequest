import { describe, expect, it } from 'vitest';
import { getApiBaseUrl } from './api-base';

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
});
