import * as Sentry from '@sentry/node';
import { BackendConfig } from '../config/backend-config';

export interface ApiCompletionSignal {
  readonly requestId: string;
  readonly method: string;
  readonly route: string;
  readonly status: number;
  readonly durationMs: number;
}

export interface ApiExceptionSignal {
  readonly requestId: string;
  readonly route: string;
  readonly errorClass: string;
}

export interface BackendMonitoring {
  completed(signal: ApiCompletionSignal): void;
  unexpected(signal: ApiExceptionSignal): void;
}

export interface MonitoringSettings {
  readonly dsn: string;
  readonly release: string;
  readonly environment: string;
  readonly slowMs: number;
}

export function monitoringSettings(
  config: BackendConfig,
): MonitoringSettings | null {
  const candidate = config.monitoring;
  if (candidate?.approved !== 'true' || !candidate.dsn || !candidate.release)
    return null;
  let url: URL;
  try {
    url = new URL(candidate.dsn);
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
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(candidate.release)
  )
    return null;
  const slowMs =
    candidate.slowMs === undefined ? 1000 : Number(candidate.slowMs);
  if (!Number.isInteger(slowMs) || slowMs < 100 || slowMs > 60_000) return null;
  return {
    dsn: candidate.dsn,
    release: candidate.release,
    environment: config.environment,
    slowMs,
  };
}

export function safeRoute(route: string | undefined): string {
  if (
    !route ||
    !route.startsWith('/') ||
    route.includes('?') ||
    route.includes('#') ||
    route.length > 160
  )
    return 'unmatched';
  return route;
}

export function safeErrorClass(error: unknown): string {
  if (!(error instanceof Error)) return 'UnknownApplicationError';
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

function sampled(requestId: string): boolean {
  let hash = 0;
  for (const char of requestId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 100 === 0;
}

function safeRequestId(value: unknown): string | undefined {
  return typeof value === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(value)
    ? value
    : undefined;
}

function safeMethod(value: unknown): string | undefined {
  return typeof value === 'string' &&
    ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(value)
    ? value
    : undefined;
}

function safeDuration(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(Math.round(value), 120_000))
    : undefined;
}

export function createBackendMonitoring(
  config: BackendConfig,
  transport?: NonNullable<Parameters<typeof Sentry.init>[0]>['transport'],
): BackendMonitoring | null {
  const settings = monitoringSettings(config);
  if (!settings) return null;
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
      message:
        event.message === 'api_exception' ? 'api_exception' : 'api_request',
      level: 'error',
      release: settings.release,
      environment: settings.environment,
      tags: {
        category: [
          'server_failure',
          'client_failure',
          'slow_request',
          'sampled_request',
          'unexpected_exception',
        ].includes(String(event.tags?.category))
          ? event.tags?.category
          : 'unknown',
        request_id: safeRequestId(event.tags?.request_id),
        method: safeMethod(event.tags?.method),
        route: safeRoute(
          typeof event.tags?.route === 'string' ? event.tags.route : undefined,
        ),
        status: /^\d{3}$/.test(String(event.tags?.status))
          ? event.tags?.status
          : undefined,
        error_class: [
          'Error',
          'TypeError',
          'RangeError',
          'ReferenceError',
          'SyntaxError',
          'ApplicationError',
          'UnknownApplicationError',
        ].includes(String(event.tags?.error_class))
          ? event.tags?.error_class
          : undefined,
      },
      extra: { duration_ms: safeDuration(event.extra?.duration_ms) },
    }),
  });
  function capture(
    message: string,
    tags: Record<string, string>,
    extra?: Record<string, number>,
  ): void {
    try {
      Sentry.captureMessage(message, { level: 'error', tags, extra });
    } catch {
      /* Monitoring is best effort. */
    }
  }
  return {
    completed(signal) {
      const category =
        signal.status >= 500
          ? 'server_failure'
          : signal.status >= 400
            ? 'client_failure'
            : signal.durationMs >= settings.slowMs
              ? 'slow_request'
              : sampled(signal.requestId)
                ? 'sampled_request'
                : null;
      if (!category) return;
      capture(
        'api_request',
        {
          category,
          request_id: signal.requestId,
          method: signal.method,
          route: safeRoute(signal.route),
          status: String(signal.status),
        },
        { duration_ms: Math.min(Math.round(signal.durationMs), 120_000) },
      );
    },
    unexpected(signal) {
      capture('api_exception', {
        category: 'unexpected_exception',
        request_id: signal.requestId,
        route: safeRoute(signal.route),
        error_class: signal.errorClass,
      });
    },
  };
}
