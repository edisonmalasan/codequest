import { describe, expect, it } from 'vitest';
import { loadBackendConfig } from './backend-config';

const DATABASE_URL =
  'postgresql://codequest:local-password@127.0.0.1:5432/codequest';
const AUTH_ENV = {
  SUPABASE_AUTH_ISSUER: 'http://127.0.0.1:54321/auth/v1',
  SUPABASE_AUTH_AUDIENCE: 'authenticated',
  SUPABASE_AUTH_JWKS_URL:
    'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
} as const;

describe('loadBackendConfig', () => {
  it('provides bounded local defaults', () => {
    expect(loadBackendConfig({ DATABASE_URL, ...AUTH_ENV })).toEqual({
      environment: 'development',
      host: '127.0.0.1',
      port: 3001,
      corsOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      bodyLimitBytes: 262_144,
      rateLimitTtlMs: 60_000,
      rateLimitMax: 120,
      databaseUrl: DATABASE_URL,
      auth: {
        issuer: 'http://127.0.0.1:54321/auth/v1',
        audience: 'authenticated',
        jwksUrl: 'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
      },
    });
  });

  it('normalizes and deduplicates explicit origins', () => {
    const productionAuth = {
      SUPABASE_AUTH_ISSUER: 'https://auth.codequest.example/auth/v1',
      SUPABASE_AUTH_AUDIENCE: 'authenticated',
      SUPABASE_AUTH_JWKS_URL:
        'https://auth.codequest.example/auth/v1/.well-known/jwks.json',
    } as const;
    const config = loadBackendConfig({
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: '4000',
      CORS_ORIGINS: 'https://codequest.example, https://codequest.example',
      BODY_LIMIT_BYTES: '4096',
      RATE_LIMIT_TTL_MS: '10000',
      RATE_LIMIT_MAX: '50',
      DATABASE_URL,
      ...productionAuth,
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
      auth: {
        issuer: 'https://auth.codequest.example/auth/v1',
        audience: 'authenticated',
        jwksUrl: 'https://auth.codequest.example/auth/v1/.well-known/jwks.json',
      },
    });
  });

  it('requires explicit non-wildcard production origins', () => {
    expect(() =>
      loadBackendConfig({
        NODE_ENV: 'production',
        DATABASE_URL,
        ...AUTH_ENV,
      }),
    ).toThrow('production requires explicit allowed origins');
    expect(() =>
      loadBackendConfig({
        NODE_ENV: 'production',
        CORS_ORIGINS: '*',
        DATABASE_URL,
        ...AUTH_ENV,
      }),
    ).toThrow('wildcard origins are not allowed');
  });

  it('does not expose a credential-like invalid origin in startup error text', () => {
    const invalidOrigin =
      'https://learner:super-secret@example.com/private?token=credential-token';

    let thrown: unknown;
    try {
      loadBackendConfig({
        CORS_ORIGINS: invalidOrigin,
        DATABASE_URL,
        ...AUTH_ENV,
      });
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
      loadBackendConfig({ DATABASE_URL: invalidDatabaseUrl, ...AUTH_ENV });
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
    [{ NODE_ENV: 'staging', DATABASE_URL, ...AUTH_ENV }, 'NODE_ENV'],
    [{ HOST: 'bad host', DATABASE_URL, ...AUTH_ENV }, 'HOST'],
    [{ PORT: '0', DATABASE_URL, ...AUTH_ENV }, 'PORT'],
    [{ PORT: 'abc', DATABASE_URL, ...AUTH_ENV }, 'PORT'],
    [
      { CORS_ORIGINS: 'https://example.com/path', DATABASE_URL, ...AUTH_ENV },
      'CORS_ORIGINS',
    ],
    [
      { BODY_LIMIT_BYTES: '1023', DATABASE_URL, ...AUTH_ENV },
      'BODY_LIMIT_BYTES',
    ],
    [
      { RATE_LIMIT_TTL_MS: '999', DATABASE_URL, ...AUTH_ENV },
      'RATE_LIMIT_TTL_MS',
    ],
    [{ RATE_LIMIT_MAX: '0', DATABASE_URL, ...AUTH_ENV }, 'RATE_LIMIT_MAX'],
    [{ DATABASE_URL: 'not-a-url', ...AUTH_ENV }, 'DATABASE_URL'],
  ])('rejects invalid configuration %o', (env, setting) => {
    expect(() => loadBackendConfig(env)).toThrow(setting);
  });

  it('requires internally consistent redacted Auth configuration', () => {
    expect(() => loadBackendConfig({ DATABASE_URL })).toThrow(
      'SUPABASE_AUTH_ISSUER',
    );
    expect(() =>
      loadBackendConfig({
        DATABASE_URL,
        ...AUTH_ENV,
        SUPABASE_AUTH_AUDIENCE: 'invalid audience',
      }),
    ).toThrow('SUPABASE_AUTH_AUDIENCE');
    expect(() =>
      loadBackendConfig({
        DATABASE_URL,
        ...AUTH_ENV,
        SUPABASE_AUTH_JWKS_URL:
          'http://attacker.example/auth/v1/.well-known/jwks.json?token=secret',
      }),
    ).toThrow('Invalid SUPABASE_AUTH_JWKS_URL');
    expect(() =>
      loadBackendConfig({
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://codequest.example',
        DATABASE_URL,
        SUPABASE_AUTH_ISSUER: 'http://supabase.example/auth/v1',
        SUPABASE_AUTH_AUDIENCE: 'authenticated',
        SUPABASE_AUTH_JWKS_URL:
          'http://supabase.example/auth/v1/.well-known/jwks.json',
      }),
    ).toThrow('Invalid SUPABASE_AUTH_ISSUER');
  });
});
