import createClient from 'openapi-fetch';
import { ApiEnv, getApiBaseUrl } from './api-base';
import type { components, paths } from './api/generated/schema';

export type HealthResponse = components['schemas']['HealthResponseDto'];
type ErrorResponse = components['schemas']['ApiErrorResponseDto'];

export type HealthResult =
  | {
      readonly ok: true;
      readonly data: HealthResponse;
      readonly requestId: string | null;
    }
  | {
      readonly ok: false;
      readonly kind: 'http';
      readonly status: number;
      readonly error: ErrorResponse['error'];
    }
  | {
      readonly ok: false;
      readonly kind: 'invalid-response';
      readonly status: number | null;
    }
  | { readonly ok: false; readonly kind: 'network' }
  | { readonly ok: false; readonly kind: 'cancelled' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isHealthResponse(value: unknown): value is HealthResponse {
  return (
    isRecord(value) &&
    value.status === 'ok' &&
    value.service === 'codequest-api' &&
    value.version === '1'
  );
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  if (!isRecord(value) || !isRecord(value.error)) return false;
  const error = value.error;
  return (
    typeof error.code === 'string' &&
    typeof error.message === 'string' &&
    typeof error.status === 'number' &&
    typeof error.requestId === 'string' &&
    (error.details === undefined ||
      (Array.isArray(error.details) &&
        error.details.every((detail) => typeof detail === 'string')))
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export interface ApiClientOptions {
  readonly env?: ApiEnv;
  readonly fetch?: typeof fetch;
}

export function createCodequestApi(options: ApiClientOptions = {}) {
  const client = createClient<paths>({
    baseUrl: getApiBaseUrl(options.env),
    fetch: options.fetch,
    credentials: 'omit',
  });

  return {
    async getHealth(signal?: AbortSignal): Promise<HealthResult> {
      try {
        const { data, error, response } = await client.GET('/api/v1/health', {
          signal,
        });
        if (response.ok) {
          if (!isHealthResponse(data)) {
            return {
              ok: false,
              kind: 'invalid-response',
              status: response.status,
            };
          }
          return {
            ok: true,
            data,
            requestId: response.headers.get('x-request-id'),
          };
        }
        if (isErrorResponse(error) && error.error.status === response.status) {
          return {
            ok: false,
            kind: 'http',
            status: response.status,
            error: error.error,
          };
        }
        return { ok: false, kind: 'invalid-response', status: response.status };
      } catch (error) {
        if (error instanceof SyntaxError) {
          return { ok: false, kind: 'invalid-response', status: null };
        }
        return signal?.aborted || isAbortError(error)
          ? { ok: false, kind: 'cancelled' }
          : { ok: false, kind: 'network' };
      }
    },
  };
}
