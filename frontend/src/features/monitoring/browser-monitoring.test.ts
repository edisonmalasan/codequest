import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/browser';
import {
  browserMonitoringSettings,
  getBrowserMonitoring,
  safeBrowserErrorClass,
} from './browser-monitoring';

vi.mock('@sentry/browser', () => ({ init: vi.fn(), captureMessage: vi.fn() }));

describe('browser monitoring', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires explicit approval, HTTPS DSN and bounded release', () => {
    const enabled = {
      NEXT_PUBLIC_MONITORING_CAPTURE_APPROVED: 'true',
      NEXT_PUBLIC_SENTRY_DSN: 'https://public@errors.example/42',
      NEXT_PUBLIC_CODEQUEST_RELEASE: 'test-123',
    };
    expect(browserMonitoringSettings({})).toBeNull();
    expect(
      browserMonitoringSettings({
        ...enabled,
        NEXT_PUBLIC_MONITORING_CAPTURE_APPROVED: 'yes',
      }),
    ).toBeNull();
    expect(
      browserMonitoringSettings({
        ...enabled,
        NEXT_PUBLIC_SENTRY_DSN: 'http://public@errors.example/42',
      }),
    ).toBeNull();
    expect(
      browserMonitoringSettings({
        ...enabled,
        NEXT_PUBLIC_CODEQUEST_RELEASE: 'bad release',
      }),
    ).toBeNull();
    expect(browserMonitoringSettings(enabled)?.release).toBe('test-123');
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('does not initialize the SDK in a default build', () => {
    expect(getBrowserMonitoring()).toBeNull();
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('reduces arbitrary error names to safe classes', () => {
    expect(safeBrowserErrorClass(new TypeError('source=canary'))).toBe(
      'TypeError',
    );
    expect(
      safeBrowserErrorClass(
        Object.assign(new Error('canary'), { name: 'canary' }),
      ),
    ).toBe('ApplicationError');
    expect(safeBrowserErrorClass('canary')).toBe('UnknownError');
  });

  it('sends only fixed fields for an enabled synthetic release', async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_MONITORING_CAPTURE_APPROVED', 'true');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://public@errors.example/42');
    vi.stubEnv('NEXT_PUBLIC_CODEQUEST_RELEASE', 'test-123');
    const sdk = await import('@sentry/browser');
    const { getBrowserMonitoring: freshMonitoring } =
      await import('./browser-monitoring');
    const monitoring = freshMonitoring();
    expect(monitoring).not.toBeNull();
    monitoring?.capture(
      'route_render',
      new Error('source=canary token=canary'),
    );
    expect(sdk.captureMessage).toHaveBeenCalledWith('frontend_failure', {
      level: 'error',
      tags: { category: 'route_render', error_class: 'Error' },
    });
    const options = vi.mocked(sdk.init).mock.calls[0]?.[0];
    expect(options).toMatchObject({
      defaultIntegrations: false,
      integrations: [],
      release: 'test-123',
    });
    const finalEvent = options?.beforeSend?.(
      {
        type: undefined,
        message: 'source=canary',
        request: { url: 'https://app.example/private?token=canary' },
        tags: {
          category: 'route_render',
          error_class: 'Error',
          secret: 'canary',
        },
      },
      {},
    );
    expect(JSON.stringify(finalEvent)).not.toContain('canary');
    vi.unstubAllEnvs();
  });
});
