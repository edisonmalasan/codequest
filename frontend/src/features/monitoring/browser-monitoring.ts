'use client';

import * as Sentry from '@sentry/browser';

export type BrowserFailureCategory =
  'route_render' | 'uncaught_error' | 'unhandled_rejection';

export interface BrowserMonitoring {
  capture(category: BrowserFailureCategory, error: unknown): void;
}

export interface BrowserMonitoringSettings {
  readonly dsn: string;
  readonly release: string;
  readonly environment: string;
}

export function browserMonitoringSettings(
  environment: Record<string, string | undefined>,
): BrowserMonitoringSettings | null {
  const dsn = environment.NEXT_PUBLIC_SENTRY_DSN;
  const release = environment.NEXT_PUBLIC_CODEQUEST_RELEASE;
  if (
    environment.NEXT_PUBLIC_MONITORING_CAPTURE_APPROVED !== 'true' ||
    !dsn ||
    !release
  )
    return null;
  let url: URL;
  try {
    url = new URL(dsn);
  } catch {
    return null;
  }
  if (
    url.protocol !== 'https:' ||
    !url.hostname ||
    !/^[A-Za-z0-9]+$/.test(url.username) ||
    url.password ||
    !/^\/\d+$/.test(url.pathname) ||
    url.search ||
    url.hash ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(release)
  )
    return null;
  return {
    dsn,
    release,
    environment:
      environment.NODE_ENV === 'production'
        ? 'production'
        : environment.NODE_ENV === 'test'
          ? 'test'
          : 'development',
  };
}

export function safeBrowserErrorClass(error: unknown): string {
  if (!(error instanceof Error)) return 'UnknownError';
  return [
    'Error',
    'TypeError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
  ].includes(error.name)
    ? error.name
    : 'ApplicationError';
}

let singleton: BrowserMonitoring | null | undefined;
export function createBrowserMonitoring(
  settings: BrowserMonitoringSettings,
  transport?: NonNullable<Parameters<typeof Sentry.init>[0]>['transport'],
): BrowserMonitoring {
  Sentry.init({
    dsn: settings.dsn,
    release: settings.release,
    environment: settings.environment,
    defaultIntegrations: false,
    integrations: [],
    tracesSampleRate: 0,
    attachStacktrace: false,
    ...(transport ? { transport } : {}),
    beforeSend: (event) => ({
      type: undefined,
      event_id: event.event_id,
      timestamp: event.timestamp,
      message: 'frontend_failure',
      level: 'error',
      release: settings.release,
      environment: settings.environment,
      tags: {
        category: [
          'route_render',
          'uncaught_error',
          'unhandled_rejection',
        ].includes(String(event.tags?.category))
          ? event.tags?.category
          : 'unknown',
        error_class: [
          'Error',
          'TypeError',
          'RangeError',
          'ReferenceError',
          'SyntaxError',
          'ApplicationError',
          'UnknownError',
        ].includes(String(event.tags?.error_class))
          ? event.tags?.error_class
          : 'UnknownError',
      },
    }),
  });
  return {
    capture(category, error) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false)
        return;
      try {
        Sentry.captureMessage('frontend_failure', {
          level: 'error',
          tags: { category, error_class: safeBrowserErrorClass(error) },
        });
      } catch {
        /* Monitoring is best effort. */
      }
    },
  };
}

export function getBrowserMonitoring(): BrowserMonitoring | null {
  if (singleton !== undefined) return singleton;
  // Next.js substitutes these explicit references at build time.
  const settings = browserMonitoringSettings({
    NEXT_PUBLIC_MONITORING_CAPTURE_APPROVED:
      process.env.NEXT_PUBLIC_MONITORING_CAPTURE_APPROVED,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_CODEQUEST_RELEASE: process.env.NEXT_PUBLIC_CODEQUEST_RELEASE,
    NODE_ENV: process.env.NODE_ENV,
  });
  singleton = settings ? createBrowserMonitoring(settings) : null;
  return singleton;
}
