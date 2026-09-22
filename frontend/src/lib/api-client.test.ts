import { describe, expect, expectTypeOf, it } from 'vitest';
import { createCodequestApi, type HealthResponse } from './api-client';
import type { paths } from './api/generated/schema';

const health: HealthResponse = {
  status: 'ok',
  service: 'codequest-api',
  version: '1',
};

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'health-request',
    },
  });
}

describe('CodeQuest typed API client', () => {
  it('uses the generated health path and configured base URL without credentials', async () => {
    expectTypeOf<keyof paths>().toEqualTypeOf<'/api/v1/health'>();
    expectTypeOf<
      '/api/v1/journeys' extends keyof paths ? true : false
    >().toEqualTypeOf<false>();

    const calls: Array<{
      url: string;
      credentials: RequestCredentials;
      authorization: string | null;
    }> = [];
    const fetcher: typeof fetch = async (input, init) => {
      calls.push({
        url: input instanceof Request ? input.url : String(input),
        credentials:
          input instanceof Request
            ? input.credentials
            : (init?.credentials ?? 'same-origin'),
        authorization:
          input instanceof Request
            ? input.headers.get('authorization')
            : new Headers(init?.headers).get('authorization'),
      });
      return jsonResponse(health);
    };
    const client = createCodequestApi({
      env: { NEXT_PUBLIC_API_URL: 'https://api.example.test/' },
      fetch: fetcher,
    });

    await expect(client.getHealth()).resolves.toEqual({
      ok: true,
      data: health,
      requestId: 'health-request',
    });
    expect(calls).toEqual([
      {
        url: 'https://api.example.test/api/v1/health',
        credentials: 'omit',
        authorization: null,
      },
    ]);
  });

  it('returns the safe correlated error for a documented HTTP status', async () => {
    const error = {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
      status: 429,
      requestId: 'limited-request',
    };
    const client = createCodequestApi({
      fetch: async () => jsonResponse({ error }, 429),
    });

    await expect(client.getHealth()).resolves.toEqual({
      ok: false,
      kind: 'http',
      status: 429,
      error,
    });
  });

  it('rejects a mismatched success or error body', async () => {
    const invalidSuccess = createCodequestApi({
      fetch: async () => jsonResponse({ status: 'ok', service: 'other' }),
    });
    const invalidError = createCodequestApi({
      fetch: async () => jsonResponse({ error: { status: 429 } }, 429),
    });

    await expect(invalidSuccess.getHealth()).resolves.toEqual({
      ok: false,
      kind: 'invalid-response',
      status: 200,
    });
    await expect(invalidError.getHealth()).resolves.toEqual({
      ok: false,
      kind: 'invalid-response',
      status: 429,
    });
  });

  it('distinguishes malformed JSON from a network failure', async () => {
    const malformed = createCodequestApi({
      fetch: async () => new Response('{', { status: 200 }),
    });
    const network = createCodequestApi({
      fetch: async () => {
        throw new Error('private transport detail');
      },
    });

    await expect(malformed.getHealth()).resolves.toEqual({
      ok: false,
      kind: 'invalid-response',
      status: null,
    });
    await expect(network.getHealth()).resolves.toEqual({
      ok: false,
      kind: 'network',
    });
  });

  it('reports cancellation without exposing the transport error', async () => {
    const client = createCodequestApi({
      fetch: async (input) => {
        expect(input).toBeInstanceOf(Request);
        if (input instanceof Request) expect(input.signal.aborted).toBe(true);
        throw new DOMException('private cancellation detail', 'AbortError');
      },
    });
    const controller = new AbortController();
    controller.abort();

    await expect(client.getHealth(controller.signal)).resolves.toEqual({
      ok: false,
      kind: 'cancelled',
    });
  });
});
