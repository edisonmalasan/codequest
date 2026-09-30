import { describe, expect, it } from 'vitest';
import * as Sentry from '@sentry/browser';
import { createBrowserMonitoring } from './browser-monitoring';

describe('browser Sentry transport', () => {
  it('sends only a bounded category and release to a fake sink', async () => {
    const envelopes: string[] = [];
    const monitoring = createBrowserMonitoring(
      {
        dsn: 'https://public@errors.example/42',
        release: 'test-123',
        environment: 'test',
      },
      () => ({
        send: async (envelope) => {
          envelopes.push(JSON.stringify(envelope));
          return { statusCode: 200 };
        },
        flush: async () => true,
      }),
    );
    monitoring.capture('route_render', new Error('source=canary token=canary'));
    await Sentry.flush(1000);
    expect(envelopes).toHaveLength(1);
    expect(envelopes[0]).toContain('test-123');
    expect(envelopes[0]).toContain('route_render');
    expect(envelopes[0]).not.toContain('canary');
    expect(envelopes[0]).not.toContain('errors.example');
    const originalOnline = Object.getOwnPropertyDescriptor(navigator, 'onLine');
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    monitoring.capture('unhandled_rejection', new Error('offline canary'));
    await Sentry.flush(1000);
    expect(envelopes).toHaveLength(1);
    if (originalOnline)
      Object.defineProperty(navigator, 'onLine', originalOnline);
    await Sentry.close(1000);
  });
});
