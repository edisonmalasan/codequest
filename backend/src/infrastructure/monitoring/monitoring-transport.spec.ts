import { describe, expect, it } from 'vitest';
import * as Sentry from '@sentry/node';
import { loadBackendConfig } from '../config/backend-config';
import { createBackendMonitoring } from './monitoring';

describe('backend Sentry transport', () => {
  it('sends a bounded release event to a fake sink without network traffic', async () => {
    const envelopes: string[] = [];
    const config = loadBackendConfig({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://app:secret@localhost:5432/app',
      SUPABASE_AUTH_ISSUER: 'http://localhost:54321/auth/v1',
      SUPABASE_AUTH_AUDIENCE: 'authenticated',
      SUPABASE_AUTH_JWKS_URL:
        'http://localhost:54321/auth/v1/.well-known/jwks.json',
      MONITORING_CAPTURE_APPROVED: 'true',
      SENTRY_DSN: 'https://public@errors.example/42',
      CODEQUEST_RELEASE: 'test-123',
    });
    const monitoring = createBackendMonitoring(config, () => ({
      send: async (envelope) => {
        envelopes.push(JSON.stringify(envelope));
        return { statusCode: 200 };
      },
      flush: async () => true,
    }));
    monitoring?.completed({
      requestId: 'test-request',
      method: 'GET',
      route: '/api/v1/quests/:slug',
      status: 500,
      durationMs: 45,
    });
    await Sentry.flush(1000);
    expect(envelopes).toHaveLength(1);
    expect(envelopes[0]).toContain('test-123');
    expect(envelopes[0]).toContain('/api/v1/quests/:slug');
    expect(envelopes[0]).not.toContain('canary');
    expect(envelopes[0]).not.toContain('errors.example');
    await Sentry.close(1000);
  });
});
