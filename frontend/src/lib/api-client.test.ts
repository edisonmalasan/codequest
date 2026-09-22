import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  createCodequestApi,
  type AccountResponse,
  type ChapterDetail,
  type HealthResponse,
  type JourneyDetail,
  type JourneySummary,
  type QuestDetail,
} from './api-client';
import type { paths } from './api/generated/schema';

const health: HealthResponse = {
  status: 'ok',
  service: 'codequest-api',
  version: '1',
};

const journeySummary: JourneySummary = {
  id: 'JAVASCRIPT-FOUNDATIONS',
  slug: 'javascript-foundations',
  title: 'JavaScript Foundations',
  position: 1,
  chapterCount: 1,
  questCount: 1,
};
const chapterSummary = {
  id: 'CH01',
  slug: 'variables',
  title: 'Variables',
  position: 1,
  objectiveSummary: 'Learn values.',
  questCount: 1,
};
const journey: JourneyDetail = {
  ...journeySummary,
  entryRequirements: ['Use a browser'],
  outcomes: [{ id: 'O1', description: 'Read values' }],
  chapters: [chapterSummary],
};
const questSummary = {
  id: 'Q01',
  slug: 'first-message',
  title: 'First message',
  position: 1,
  kind: 'instructional' as const,
  guestEligible: true,
  contentVersion: '1.0.0',
  assessmentVersion: '1.0.0',
  difficulty: 'introductory' as const,
  xpAward: 10,
};
const chapter: ChapterDetail = {
  ...chapterSummary,
  journey: journeySummary,
  quests: [questSummary],
};
const quest: QuestDetail = {
  ...questSummary,
  hierarchy: { journey: journeySummary, chapter: chapterSummary },
  objective: 'Print a message.',
  outcomeId: 'O1',
  concepts: [{ id: 'js-values', title: 'JavaScript values' }],
  prerequisites: [],
  hints: { question: 'What prints?', concept: 'Strings', nextStep: 'Edit it' },
  lesson: '# First message',
  starterCode: "console.log('Hello');",
  cases: [
    {
      id: 'normal-message',
      category: 'normal',
      kind: 'console',
      feedback: 'Match the output.',
      expectedOutput: 'Hello',
    },
  ],
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
    expectTypeOf<keyof paths>().toEqualTypeOf<
      | '/api/v1/account'
      | '/api/v1/chapters/{slug}'
      | '/api/v1/courses/{slug}'
      | '/api/v1/health'
      | '/api/v1/journeys'
      | '/api/v1/journeys/{slug}'
      | '/api/v1/quests/{slug}'
    >();
    expectTypeOf<
      '/api/v1/journeys' extends keyof paths ? true : false
    >().toEqualTypeOf<true>();

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

  it('gets a fresh token for each account request and never authenticates health', async () => {
    expectTypeOf<keyof paths>().toEqualTypeOf<
      | '/api/v1/account'
      | '/api/v1/chapters/{slug}'
      | '/api/v1/courses/{slug}'
      | '/api/v1/health'
      | '/api/v1/journeys'
      | '/api/v1/journeys/{slug}'
      | '/api/v1/quests/{slug}'
    >();
    const account: AccountResponse = {
      id: '00000000-0000-4000-8000-000000000001',
      timezone: 'UTC',
      createdAt: '2026-09-22T00:00:00.000Z',
      updatedAt: '2026-09-22T00:00:00.000Z',
    };
    const authorizations: Array<string | null> = [];
    let tokenCalls = 0;
    const client = createCodequestApi({
      getAccessToken: async () => `fresh-token-${++tokenCalls}`,
      fetch: async (input) => {
        const request = input instanceof Request ? input : new Request(input);
        authorizations.push(request.headers.get('authorization'));
        return jsonResponse(request.url.endsWith('/health') ? health : account);
      },
    });

    await expect(client.getHealth()).resolves.toMatchObject({ ok: true });
    await expect(client.establishAccount()).resolves.toMatchObject({
      ok: true,
      data: account,
    });
    await expect(client.getAccount()).resolves.toMatchObject({
      ok: true,
      data: account,
    });
    expect(authorizations).toEqual([
      null,
      'Bearer fresh-token-1',
      'Bearer fresh-token-2',
    ]);
  });

  it('fails closed before transport when an account session is missing', async () => {
    let transported = false;
    const client = createCodequestApi({
      getAccessToken: async () => null,
      fetch: async () => {
        transported = true;
        return jsonResponse({});
      },
    });
    await expect(client.getAccount()).resolves.toEqual({
      ok: false,
      kind: 'unauthenticated',
    });
    expect(transported).toBe(false);
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

  it('reads each curriculum contract publicly with encoded path parameters', async () => {
    const calls: Array<{ url: string; authorization: string | null }> = [];
    const client = createCodequestApi({
      getAccessToken: async () => 'must-not-be-used',
      fetch: async (input) => {
        const request = input instanceof Request ? input : new Request(input);
        calls.push({
          url: request.url,
          authorization: request.headers.get('authorization'),
        });
        if (request.url.endsWith('/journeys'))
          return jsonResponse([journeySummary]);
        if (request.url.includes('/courses/')) return jsonResponse(journey);
        if (request.url.includes('/journeys/')) return jsonResponse(journey);
        if (request.url.includes('/chapters/')) return jsonResponse(chapter);
        return jsonResponse(quest);
      },
    });

    await expect(client.getJourneys()).resolves.toMatchObject({ ok: true });
    await expect(
      client.getJourney('javascript foundations'),
    ).resolves.toMatchObject({ ok: true });
    await expect(
      client.getCourseAlias('javascript-foundations'),
    ).resolves.toMatchObject({ ok: true });
    await expect(client.getChapter('variables')).resolves.toMatchObject({
      ok: true,
    });
    await expect(client.getQuest('first-message')).resolves.toMatchObject({
      ok: true,
    });
    expect(calls.map((call) => call.authorization)).toEqual([
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(calls[1].url).toContain('/journeys/javascript%20foundations');
  });

  it('rejects malformed curriculum success data and preserves failure taxonomy', async () => {
    const invalid = createCodequestApi({
      fetch: async () => jsonResponse({ id: 'incomplete' }),
    });
    await expect(invalid.getQuest('first-message')).resolves.toEqual({
      ok: false,
      kind: 'invalid-response',
      status: 200,
    });

    const missing = createCodequestApi({
      fetch: async () =>
        jsonResponse(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Resource not found',
              status: 404,
              requestId: 'curriculum-missing',
            },
          },
          404,
        ),
    });
    await expect(missing.getJourney('missing')).resolves.toMatchObject({
      ok: false,
      kind: 'http',
      status: 404,
    });

    const controller = new AbortController();
    controller.abort();
    const cancelled = createCodequestApi({
      fetch: async () => {
        throw new Error('private transport detail');
      },
    });
    await expect(cancelled.getJourneys(controller.signal)).resolves.toEqual({
      ok: false,
      kind: 'cancelled',
    });
  });
});
