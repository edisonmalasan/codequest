import { describe, expect, it } from 'vitest';
import { loadBackendConfig } from './backend-config';

const DATABASE_URL =
  'postgresql://codequest:local-password@127.0.0.1:5432/codequest';

describe('loadBackendConfig', () => {
  it('provides bounded local defaults', () => {
    expect(loadBackendConfig({ DATABASE_URL })).toEqual({
      environment: 'development',
      host: '127.0.0.1',
      port: 3001,
      corsOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      bodyLimitBytes: 262_144,
      rateLimitTtlMs: 60_000,
      rateLimitMax: 120,
      databaseUrl: DATABASE_URL,
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
      DATABASE_URL,
    });

    expect(config).toEqual({
      environment: 'production',
      host: '0.0.0.0',
      port: 4000,
      corsOrigins: ['https://codequest.example'],
      bodyLimitBytes: 4096,
      rateLimitTtlMs: 10_000,
      rateLimitMax: 50,
      databaseUrl: DATABASE_URL,
    });
  });

  it('requires explicit non-wildcard production origins', () => {
    expect(() =>
      loadBackendConfig({ NODE_ENV: 'production', DATABASE_URL }),
    ).toThrow('production requires explicit allowed origins');
    expect(() =>
      loadBackendConfig({
        NODE_ENV: 'production',
        CORS_ORIGINS: '*',
        DATABASE_URL,
      }),
    ).toThrow('wildcard origins are not allowed');
  });

  it('does not expose a credential-like invalid origin in startup error text', () => {
    const invalidOrigin =
      'https://learner:super-secret@example.com/private?token=credential-token';

    let thrown: unknown;
    try {
      loadBackendConfig({ CORS_ORIGINS: invalidOrigin, DATABASE_URL });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    const message = thrown instanceof Error ? thrown.message : String(thrown);
    const startupLog = JSON.stringify({
      event: 'application.startup_failed',
      message,
    });

    expect(message).toBe('Invalid CORS_ORIGINS entry');
    expect(startupLog).not.toContain(invalidOrigin);
    expect(startupLog).not.toContain('super-secret');
    expect(startupLog).not.toContain('credential-token');
  });

  it('does not expose credential-like database values in error text', () => {
    const invalidDatabaseUrl =
      'https://database-user:super-secret@example.com/codequest?token=credential-token';

    let thrown: unknown;
    try {
      loadBackendConfig({ DATABASE_URL: invalidDatabaseUrl });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    const message = thrown instanceof Error ? thrown.message : String(thrown);
    const startupLog = JSON.stringify({
      event: 'application.startup_failed',
      message,
    });

    expect(message).toBe('Invalid DATABASE_URL');
    expect(startupLog).not.toContain(invalidDatabaseUrl);
    expect(startupLog).not.toContain('super-secret');
    expect(startupLog).not.toContain('credential-token');
  });

  it.each([
    [{ NODE_ENV: 'staging', DATABASE_URL }, 'NODE_ENV'],
    [{ HOST: 'bad host', DATABASE_URL }, 'HOST'],
    [{ PORT: '0', DATABASE_URL }, 'PORT'],
    [{ PORT: 'abc', DATABASE_URL }, 'PORT'],
    [
      { CORS_ORIGINS: 'https://example.com/path', DATABASE_URL },
      'CORS_ORIGINS',
    ],
    [{ BODY_LIMIT_BYTES: '1023', DATABASE_URL }, 'BODY_LIMIT_BYTES'],
    [{ RATE_LIMIT_TTL_MS: '999', DATABASE_URL }, 'RATE_LIMIT_TTL_MS'],
    [{ RATE_LIMIT_MAX: '0', DATABASE_URL }, 'RATE_LIMIT_MAX'],
    [{ DATABASE_URL: 'not-a-url' }, 'DATABASE_URL'],
  ])('rejects invalid configuration %o', (env, setting) => {
    expect(() => loadBackendConfig(env)).toThrow(setting);
  });
});
