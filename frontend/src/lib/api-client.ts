import createClient from 'openapi-fetch';
import { ApiEnv, getApiBaseUrl, getConfiguredApiBaseUrl } from './api-base';
import type { components, paths } from './api/generated/schema';

export type HealthResponse = components['schemas']['HealthResponseDto'];
export type AccountResponse = components['schemas']['AccountResponseDto'];
export type JourneySummary = components['schemas']['JourneySummaryDto'];
export type JourneyDetail = components['schemas']['JourneyDetailDto'];
export type CourseSummary = components['schemas']['CourseSummaryDto'];
export type CourseDetail = components['schemas']['CourseDetailDto'];
export type ChapterDetail = components['schemas']['ChapterDetailDto'];
export type QuestDetail = components['schemas']['QuestDetailDto'];
export type CreateAttemptRequest = components['schemas']['CreateAttemptDto'];
export type AttemptResponse = components['schemas']['AttemptResponseDto'];
export type AttemptHistory = components['schemas']['AttemptHistoryDto'];
export type ActivityResponse = components['schemas']['ActivityResponseDto'];
export type QuestProgress = components['schemas']['QuestProgressDto'];
export type ChapterProgress = components['schemas']['ChapterProgressDto'];
export type JourneyProgress = components['schemas']['JourneyProgressDto'];
export type CourseProgress = components['schemas']['CourseProgressDto'];
export type XpTotal = components['schemas']['XpTotalDto'];
export type Streak = components['schemas']['StreakDto'];
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

export type ProtectedApiResult<T> =
  | { readonly ok: true; readonly data: T; readonly requestId: string | null }
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

function isStreak(value: unknown): value is Streak {
  return (
    isRecord(value) &&
    Number.isInteger(value.currentStreak) &&
    Number.isInteger(value.longestStreak) &&
    typeof value.timezone === 'string' &&
    (value.latestActivityDate === null ||
      typeof value.latestActivityDate === 'string') &&
    value.clientReported === true
  );
}

function isAttemptResponse(value: unknown): value is AttemptResponse {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.questId === 'string' &&
    typeof value.clientEventId === 'string' &&
    typeof value.contentVersion === 'string' &&
    typeof value.assessmentVersion === 'string' &&
    typeof value.submittedAt === 'string' &&
    typeof value.attemptCount === 'number' &&
    typeof value.reportedPassed === 'boolean' &&
    typeof value.accepted === 'boolean' &&
    value.clientReported === true &&
    typeof value.source === 'string' &&
    isRecord(value.report)
  );
}

function isAttemptHistory(value: unknown): value is AttemptHistory {
  return (
    isRecord(value) &&
    typeof value.attemptCount === 'number' &&
    Array.isArray(value.attempts) &&
    value.attempts.every(isAttemptResponse)
  );
}

function isActivityResponse(value: unknown): value is ActivityResponse {
  return (
    isRecord(value) &&
    typeof value.questId === 'string' &&
    typeof value.occurredAt === 'string'
  );
}

function isQuestProgress(value: unknown): value is QuestProgress {
  return (
    isRecord(value) &&
    typeof value.questId === 'string' &&
    (value.availability === 'available' || value.availability === 'locked') &&
    Array.isArray(value.unmetPrerequisites) &&
    value.unmetPrerequisites.every(isUnmetPrerequisite) &&
    ['not_started', 'in_progress', 'completed'].includes(
      String(value.status),
    ) &&
    [value.startedAt, value.completedAt, value.lastActivityAt].every(
      (at) => at === null || typeof at === 'string',
    ) &&
    Number.isSafeInteger(value.attemptCount) &&
    Number(value.attemptCount) >= 0 &&
    Number.isSafeInteger(value.hintCount) &&
    Number(value.hintCount) >= 0
  );
}

function isChapterProgress(value: unknown): value is ChapterProgress {
  return (
    isRecord(value) &&
    typeof value.chapterId === 'string' &&
    (value.availability === 'available' || value.availability === 'locked') &&
    Array.isArray(value.unmetPrerequisites) &&
    value.unmetPrerequisites.every(isUnmetPrerequisite) &&
    ['not_started', 'in_progress', 'completed'].includes(
      String(value.status),
    ) &&
    Number.isSafeInteger(value.completedQuests) &&
    Number.isSafeInteger(value.totalQuests) &&
    Number.isSafeInteger(value.percentage) &&
    Array.isArray(value.quests) &&
    value.quests.every(isQuestProgress)
  );
}

function isJourneyProgress(value: unknown): value is JourneyProgress {
  return (
    isRecord(value) &&
    typeof value.journeyId === 'string' &&
    (value.availability === 'available' || value.availability === 'locked') &&
    Array.isArray(value.unmetPrerequisites) &&
    value.unmetPrerequisites.every(isUnmetPrerequisite) &&
    ['not_started', 'in_progress', 'completed'].includes(
      String(value.status),
    ) &&
    Number.isSafeInteger(value.completedQuests) &&
    Number.isSafeInteger(value.totalQuests) &&
    Number.isSafeInteger(value.percentage) &&
    Array.isArray(value.chapters) &&
    value.chapters.every(isChapterProgress)
  );
}

function isCourseProgress(value: unknown): value is CourseProgress {
  return (
    isRecord(value) &&
    typeof value.courseId === 'string' &&
    (value.availability === 'available' || value.availability === 'locked') &&
    Array.isArray(value.unmetPrerequisites) &&
    value.unmetPrerequisites.every(isUnmetPrerequisite) &&
    ['not_started', 'in_progress', 'completed'].includes(
      String(value.status),
    ) &&
    Number.isSafeInteger(value.completedQuests) &&
    Number.isSafeInteger(value.totalQuests) &&
    Number.isSafeInteger(value.percentage) &&
    Array.isArray(value.chapters) &&
    value.chapters.every(isChapterProgress)
  );
}

function isUnmetPrerequisite(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.questId === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string'
  );
}

function isSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

function isXpTotal(value: unknown): value is XpTotal {
  if (!isRecord(value)) return false;
  const {
    totalXp,
    level,
    levelStartXp: start,
    nextLevelAtXp: next,
    xpIntoLevel: into,
    xpToNextLevel: remaining,
  } = value;
  if (
    !isSafeInteger(totalXp) ||
    !isSafeInteger(level) ||
    !isSafeInteger(start) ||
    !isSafeInteger(next) ||
    !isSafeInteger(into) ||
    !isSafeInteger(remaining)
  )
    return false;
  const span = next - start;
  return (
    totalXp >= 0 &&
    level >= 1 &&
    start >= 0 &&
    span > 0 &&
    into >= 0 &&
    into < span &&
    remaining === span - into &&
    totalXp === start + into &&
    start === (level - 1) * span &&
    typeof value.curveId === 'string' &&
    value.curveId.length > 0 &&
    typeof value.curveProvisional === 'boolean' &&
    value.clientReported === true
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

function isCourseSummary(value: unknown): value is CourseSummary {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.journeyId === 'string' &&
    typeof value.journeySlug === 'string' &&
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    typeof value.position === 'number' &&
    isStringArray(value.topics) &&
    Number.isSafeInteger(value.chapterCount) &&
    Number.isSafeInteger(value.questCount)
  );
}

function isCourseDetail(value: unknown): value is CourseDetail {
  if (!isRecord(value) || !isCourseSummary(value)) return false;
  const record: Record<string, unknown> = value;
  return (
    Array.isArray(record.outcomes) &&
    record.outcomes.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.description === 'string',
    ) &&
    Array.isArray(record.chapters) &&
    record.chapters.every(isChapterSummary)
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
    record.chapters.every(isChapterSummary) &&
    Array.isArray(record.courses) &&
    record.courses.every(isCourseSummary)
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

export function isQuestDetail(value: unknown): value is QuestDetail {
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
    baseUrl:
      options.env === undefined
        ? getConfiguredApiBaseUrl()
        : getApiBaseUrl(options.env),
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

  async function learningRequest<T>(
    request: (
      token: string,
    ) => Promise<{ data?: unknown; error?: unknown; response: Response }>,
    validate: (value: unknown) => value is T,
    signal?: AbortSignal,
  ): Promise<ProtectedApiResult<T>> {
    const token = await options.getAccessToken?.();
    if (!token) return { ok: false, kind: 'unauthenticated' };
    return publicRequest(() => request(token), validate, signal);
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
    updateTimezone(
      timezone: string,
      signal?: AbortSignal,
    ): Promise<AccountResult> {
      return learningRequest(
        (token) =>
          client.PUT('/api/v1/account/timezone', {
            headers: { Authorization: `Bearer ${token}` },
            body: { timezone },
            signal,
          }),
        isAccountResponse,
        signal,
      );
    },
    getStreak(signal?: AbortSignal): Promise<ProtectedApiResult<Streak>> {
      return learningRequest(
        (token) =>
          client.GET('/api/v1/streaks', {
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isStreak,
        signal,
      );
    },
    getXp(signal?: AbortSignal): Promise<ProtectedApiResult<XpTotal>> {
      return learningRequest(
        (token) =>
          client.GET('/api/v1/xp', {
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isXpTotal,
        signal,
      );
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
    getCourses(
      signal?: AbortSignal,
    ): Promise<PublicApiResult<CourseSummary[]>> {
      return publicRequest(
        () => client.GET('/api/v1/catalog/courses', { signal }),
        (value): value is CourseSummary[] =>
          Array.isArray(value) && value.every(isCourseSummary),
        signal,
      );
    },
    getPublishedCourse(
      slug: string,
      signal?: AbortSignal,
    ): Promise<PublicApiResult<CourseDetail>> {
      return publicRequest(
        () =>
          client.GET('/api/v1/catalog/courses/{slug}', {
            params: { path: { slug } },
            signal,
          }),
        isCourseDetail,
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
    submitAttempt(
      slug: string,
      body: CreateAttemptRequest,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<AttemptResponse>> {
      return learningRequest(
        (token) =>
          client.POST('/api/v1/quests/{slug}/attempts', {
            params: { path: { slug } },
            body,
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isAttemptResponse,
        signal,
      );
    },
    replayAttempt(
      questId: string,
      body: CreateAttemptRequest,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<AttemptResponse>> {
      return learningRequest(
        (token) =>
          client.POST('/api/v1/learning-sync/{questId}', {
            params: { path: { questId } },
            body,
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isAttemptResponse,
        signal,
      );
    },

    importGuestAttempt(
      questId: string,
      body: CreateAttemptRequest,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<AttemptResponse>> {
      return learningRequest(
        (token) =>
          client.POST('/api/v1/guest-import/{questId}', {
            params: { path: { questId } },
            body,
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isAttemptResponse,
        signal,
      );
    },
    getAttemptHistory(
      slug: string,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<AttemptHistory>> {
      return learningRequest(
        (token) =>
          client.GET('/api/v1/quests/{slug}/attempts', {
            params: { path: { slug } },
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isAttemptHistory,
        signal,
      );
    },
    startQuest(
      slug: string,
      contentVersion: string,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<ActivityResponse>> {
      return learningRequest(
        (token) =>
          client.POST('/api/v1/quests/{slug}/start', {
            params: { path: { slug } },
            body: { contentVersion },
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isActivityResponse,
        signal,
      );
    },
    useQuestHint(
      slug: string,
      contentVersion: string,
      hintKey: 'question' | 'concept' | 'nextStep',
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<ActivityResponse>> {
      return learningRequest(
        (token) =>
          client.POST('/api/v1/quests/{slug}/hints', {
            params: { path: { slug } },
            body: { contentVersion, hintKey },
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isActivityResponse,
        signal,
      );
    },
    getQuestProgress(
      slug: string,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<QuestProgress>> {
      return learningRequest(
        (token) =>
          client.GET('/api/v1/quests/{slug}/progress', {
            params: { path: { slug } },
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isQuestProgress,
        signal,
      );
    },
    getChapterProgress(
      slug: string,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<ChapterProgress>> {
      return learningRequest(
        (token) =>
          client.GET('/api/v1/chapters/{slug}/progress', {
            params: { path: { slug } },
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isChapterProgress,
        signal,
      );
    },
    getJourneyProgress(
      slug: string,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<JourneyProgress>> {
      return learningRequest(
        (token) =>
          client.GET('/api/v1/journeys/{slug}/progress', {
            params: { path: { slug } },
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isJourneyProgress,
        signal,
      );
    },
    getCourseProgress(
      slug: string,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<JourneyProgress>> {
      return learningRequest(
        (token) =>
          client.GET('/api/v1/courses/{slug}/progress', {
            params: { path: { slug } },
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isJourneyProgress,
        signal,
      );
    },
    getPublishedCourseProgress(
      slug: string,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<CourseProgress>> {
      return learningRequest(
        (token) =>
          client.GET('/api/v1/catalog/courses/{slug}/progress', {
            params: { path: { slug } },
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }),
        isCourseProgress,
        signal,
      );
    },
  };
}
