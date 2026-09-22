import createClient from 'openapi-fetch';
import { ApiEnv, getApiBaseUrl } from './api-base';
import type { components, paths } from './api/generated/schema';

export type HealthResponse = components['schemas']['HealthResponseDto'];
export type AccountResponse = components['schemas']['AccountResponseDto'];
export type JourneySummary = components['schemas']['JourneySummaryDto'];
export type JourneyDetail = components['schemas']['JourneyDetailDto'];
export type ChapterDetail = components['schemas']['ChapterDetailDto'];
export type QuestDetail = components['schemas']['QuestDetailDto'];
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

export type AccountResult =
  | {
      readonly ok: true;
      readonly data: AccountResponse;
      readonly requestId: string | null;
    }
  | { readonly ok: false; readonly kind: 'unauthenticated' }
  | Exclude<HealthResult, { readonly ok: true }>;

export type PublicApiResult<T> =
  | { readonly ok: true; readonly data: T; readonly requestId: string | null }
  | Exclude<HealthResult, { readonly ok: true }>;

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

function isAccountResponse(value: unknown): value is AccountResponse {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.timezone === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isJourneySummary(value: unknown): value is JourneySummary {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    typeof value.position === 'number' &&
    typeof value.chapterCount === 'number' &&
    typeof value.questCount === 'number'
  );
}

function isQuestSummary(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    typeof value.position === 'number' &&
    ['instructional', 'capstone'].includes(String(value.kind)) &&
    typeof value.guestEligible === 'boolean' &&
    typeof value.contentVersion === 'string' &&
    typeof value.assessmentVersion === 'string' &&
    ['introductory', 'developing', 'integrative'].includes(
      String(value.difficulty),
    ) &&
    typeof value.xpAward === 'number'
  );
}

function isChapterSummary(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    typeof value.position === 'number' &&
    typeof value.objectiveSummary === 'string' &&
    typeof value.questCount === 'number'
  );
}

function isJourneyDetail(value: unknown): value is JourneyDetail {
  if (!isRecord(value) || !isJourneySummary(value)) return false;
  const record: Record<string, unknown> = value;
  return (
    isStringArray(record.entryRequirements) &&
    Array.isArray(record.outcomes) &&
    record.outcomes.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.description === 'string',
    ) &&
    Array.isArray(record.chapters) &&
    record.chapters.every(isChapterSummary)
  );
}

function isChapterDetail(value: unknown): value is ChapterDetail {
  if (!isRecord(value) || !isChapterSummary(value)) return false;
  return (
    isJourneySummary(value.journey) &&
    Array.isArray(value.quests) &&
    value.quests.every(isQuestSummary)
  );
}

function isQuestDetail(value: unknown): value is QuestDetail {
  if (!isRecord(value) || !isQuestSummary(value)) return false;
  return (
    isRecord(value.hierarchy) &&
    isJourneySummary(value.hierarchy.journey) &&
    isChapterSummary(value.hierarchy.chapter) &&
    typeof value.objective === 'string' &&
    typeof value.outcomeId === 'string' &&
    Array.isArray(value.concepts) &&
    value.concepts.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.title === 'string',
    ) &&
    Array.isArray(value.prerequisites) &&
    value.prerequisites.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.slug === 'string' &&
        typeof item.title === 'string',
    ) &&
    isRecord(value.hints) &&
    typeof value.hints.question === 'string' &&
    typeof value.hints.concept === 'string' &&
    typeof value.hints.nextStep === 'string' &&
    typeof value.lesson === 'string' &&
    typeof value.starterCode === 'string' &&
    Array.isArray(value.cases) &&
    value.cases.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        ['normal', 'boundary'].includes(String(item.category)) &&
        ['console', 'function'].includes(String(item.kind)) &&
        typeof item.feedback === 'string',
    )
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export interface ApiClientOptions {
  readonly env?: ApiEnv;
  readonly fetch?: typeof fetch;
  readonly getAccessToken?: () => Promise<string | null>;
}

export function createCodequestApi(options: ApiClientOptions = {}) {
  const client = createClient<paths>({
    baseUrl: getApiBaseUrl(options.env),
    fetch: options.fetch,
    credentials: 'omit',
  });

  async function accountRequest(
    method: 'GET' | 'PUT',
    signal?: AbortSignal,
  ): Promise<AccountResult> {
    const accessToken = await options.getAccessToken?.();
    if (accessToken === undefined || accessToken === null) {
      return { ok: false, kind: 'unauthenticated' };
    }
    try {
      const request = {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
      };
      const result =
        method === 'GET'
          ? await client.GET('/api/v1/account', request)
          : await client.PUT('/api/v1/account', request);
      const { data, error, response } = result;
      if (response.ok) {
        return isAccountResponse(data)
          ? {
              ok: true,
              data,
              requestId: response.headers.get('x-request-id'),
            }
          : { ok: false, kind: 'invalid-response', status: response.status };
      }
      return isErrorResponse(error) && error.error.status === response.status
        ? {
            ok: false,
            kind: 'http',
            status: response.status,
            error: error.error,
          }
        : { ok: false, kind: 'invalid-response', status: response.status };
    } catch (error) {
      if (error instanceof SyntaxError) {
        return { ok: false, kind: 'invalid-response', status: null };
      }
      return signal?.aborted || isAbortError(error)
        ? { ok: false, kind: 'cancelled' }
        : { ok: false, kind: 'network' };
    }
  }

  async function publicRequest<T>(
    request: () => Promise<{
      data?: unknown;
      error?: unknown;
      response: Response;
    }>,
    validate: (value: unknown) => value is T,
    signal?: AbortSignal,
  ): Promise<PublicApiResult<T>> {
    try {
      const { data, error, response } = await request();
      if (response.ok)
        return validate(data)
          ? {
              ok: true,
              data,
              requestId: response.headers.get('x-request-id'),
            }
          : { ok: false, kind: 'invalid-response', status: response.status };
      return isErrorResponse(error) && error.error.status === response.status
        ? {
            ok: false,
            kind: 'http',
            status: response.status,
            error: error.error,
          }
        : { ok: false, kind: 'invalid-response', status: response.status };
    } catch (error) {
      if (error instanceof SyntaxError)
        return { ok: false, kind: 'invalid-response', status: null };
      return signal?.aborted || isAbortError(error)
        ? { ok: false, kind: 'cancelled' }
        : { ok: false, kind: 'network' };
    }
  }

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
    getAccount(signal?: AbortSignal): Promise<AccountResult> {
      return accountRequest('GET', signal);
    },
    establishAccount(signal?: AbortSignal): Promise<AccountResult> {
      return accountRequest('PUT', signal);
    },
    getJourneys(
      signal?: AbortSignal,
    ): Promise<PublicApiResult<JourneySummary[]>> {
      return publicRequest(
        () => client.GET('/api/v1/journeys', { signal }),
        (value): value is JourneySummary[] =>
          Array.isArray(value) && value.every(isJourneySummary),
        signal,
      );
    },
    getJourney(
      slug: string,
      signal?: AbortSignal,
    ): Promise<PublicApiResult<JourneyDetail>> {
      return publicRequest(
        () =>
          client.GET('/api/v1/journeys/{slug}', {
            params: { path: { slug } },
            signal,
          }),
        isJourneyDetail,
        signal,
      );
    },
    getCourseAlias(
      slug: string,
      signal?: AbortSignal,
    ): Promise<PublicApiResult<JourneyDetail>> {
      return publicRequest(
        () =>
          client.GET('/api/v1/courses/{slug}', {
            params: { path: { slug } },
            signal,
          }),
        isJourneyDetail,
        signal,
      );
    },
    getChapter(
      slug: string,
      signal?: AbortSignal,
    ): Promise<PublicApiResult<ChapterDetail>> {
      return publicRequest(
        () =>
          client.GET('/api/v1/chapters/{slug}', {
            params: { path: { slug } },
            signal,
          }),
        isChapterDetail,
        signal,
      );
    },
    getQuest(
      slug: string,
      signal?: AbortSignal,
    ): Promise<PublicApiResult<QuestDetail>> {
      return publicRequest(
        () =>
          client.GET('/api/v1/quests/{slug}', {
            params: { path: { slug } },
            signal,
          }),
        isQuestDetail,
        signal,
      );
    },
  };
}
