import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/node';
import { loadBackendConfig } from '../config/backend-config';
import {
  createBackendMonitoring,
  monitoringSettings,
  safeErrorClass,
  safeRoute,
} from './monitoring';

vi.mock('@sentry/node', () => ({ init: vi.fn(), captureMessage: vi.fn() }));

const base = loadBackendConfig({
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://app:secret@localhost:5432/app',
  SUPABASE_AUTH_ISSUER: 'http://localhost:54321/auth/v1',
  SUPABASE_AUTH_AUDIENCE: 'authenticated',
  SUPABASE_AUTH_JWKS_URL:
    'http://localhost:54321/auth/v1/.well-known/jwks.json',
});
const enabled = {
  ...base,
  monitoring: {
    approved: 'true',
    dsn: 'https://public@errors.example/42',
    release: 'test-123',
  },
};

describe('backend monitoring', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stays disabled without a valid approval, HTTPS DSN and release', () => {
    for (const monitoring of [
      undefined,
      { ...enabled.monitoring, approved: 'yes' },
      { ...enabled.monitoring, dsn: 'http://public@errors.example/42' },
      { ...enabled.monitoring, release: 'bad release' },
    ]) {
      expect(createBackendMonitoring({ ...base, monitoring })).toBeNull();
    }
    expect(Sentry.init).not.toHaveBeenCalled();
    expect(monitoringSettings(enabled)?.slowMs).toBe(1000);
  });

  it('captures only bounded fixed fields and drops canary payloads at the SDK boundary', () => {
    const adapter = createBackendMonitoring(enabled);
    expect(adapter).not.toBeNull();
    adapter?.completed({
      requestId: 'request-1',
      method: 'GET',
      route: '/api/v1/quests/:slug',
      status: 500,
      durationMs: 12,
    });
    adapter?.unexpected({
      requestId: 'request-1',
      route: '/api/v1/quests/:slug',
      errorClass: safeErrorClass(new Error('token=canary')),
    });
    expect(Sentry.captureMessage).toHaveBeenCalledTimes(2);
    const sent = vi.mocked(Sentry.captureMessage).mock.calls;
    expect(sent[0]?.[1]).toMatchObject({
      tags: { route: '/api/v1/quests/:slug', category: 'server_failure' },
    });
    expect(JSON.stringify(sent)).not.toContain('canary');
    const initOptions = vi.mocked(Sentry.init).mock.calls[0]?.[0];
    expect(initOptions).toMatchObject({
      defaultIntegrations: false,
      integrations: [],
      tracesSampleRate: 0,
      release: 'test-123',
    });
    const finalEvent = initOptions?.beforeSend?.(
      {
        type: undefined,
        message: 'frontend source canary',
        request: { url: 'https://example.test/private?token=canary' },
        tags: {
          category: 'server_failure',
          route: '/api/v1/quests/:slug',
          secret: 'canary',
        },
      },
      {},
    );
    expect(JSON.stringify(finalEvent)).not.toContain('canary');
  });

  it('records slow success but does not flood routine success', () => {
    const adapter = createBackendMonitoring(enabled);
    adapter?.completed({
      requestId: 'ordinary-1',
      method: 'GET',
      route: '/api/v1/health',
      status: 200,
      durationMs: 1,
    });
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
    adapter?.completed({
      requestId: 'ordinary-1',
      method: 'GET',
      route: '/api/v1/health',
      status: 200,
      durationMs: 1001,
    });
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'api_request',
      expect.objectContaining({
        tags: expect.objectContaining({ category: 'slow_request' }),
      }),
    );
  });

  it('uses fixed unmatched and error classes rather than untrusted text', () => {
    expect(safeRoute(undefined)).toBe('unmatched');
    expect(safeRoute('/api/v1/quests/Q01?token=canary')).toBe('unmatched');
    expect(
      safeErrorClass(Object.assign(new Error('canary'), { name: 'canary' })),
    ).toBe('ApplicationError');
  });
});
