import { describe, expect, it } from 'vitest';
import { loadBackendConfig } from './backend-config';

describe('loadBackendConfig', () => {
  it('provides bounded local defaults', () => {
    expect(loadBackendConfig({})).toEqual({
      environment: 'development',
      host: '127.0.0.1',
      port: 3001,
      corsOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      bodyLimitBytes: 262_144,
      rateLimitTtlMs: 60_000,
      rateLimitMax: 120,
    });
  });

  it('normalizes and deduplicates explicit origins', () => {
    const config = loadBackendConfig({
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: '4000',
      CORS_ORIGINS: 'https://codequest.example, https://codequest.example',
      BODY_LIMIT_BYTES: '4096',
      RATE_LIMIT_TTL_MS: '10000',
      RATE_LIMIT_MAX: '50',
    });

    expect(config).toEqual({
      environment: 'production',
      host: '0.0.0.0',
      port: 4000,
      corsOrigins: ['https://codequest.example'],
      bodyLimitBytes: 4096,
      rateLimitTtlMs: 10_000,
      rateLimitMax: 50,
    });
  });

  it('requires explicit non-wildcard production origins', () => {
    expect(() => loadBackendConfig({ NODE_ENV: 'production' })).toThrow(
      'production requires explicit allowed origins',
    );
    expect(() =>
      loadBackendConfig({ NODE_ENV: 'production', CORS_ORIGINS: '*' }),
    ).toThrow('wildcard origins are not allowed');
  });

  it.each([
    [{ NODE_ENV: 'staging' }, 'NODE_ENV'],
    [{ HOST: 'bad host' }, 'HOST'],
    [{ PORT: '0' }, 'PORT'],
    [{ PORT: 'abc' }, 'PORT'],
    [{ CORS_ORIGINS: 'https://example.com/path' }, 'CORS_ORIGINS'],
    [{ BODY_LIMIT_BYTES: '1023' }, 'BODY_LIMIT_BYTES'],
    [{ RATE_LIMIT_TTL_MS: '999' }, 'RATE_LIMIT_TTL_MS'],
    [{ RATE_LIMIT_MAX: '0' }, 'RATE_LIMIT_MAX'],
  ])('rejects invalid configuration %o', (env, setting) => {
    expect(() => loadBackendConfig(env)).toThrow(setting);
  });
});
