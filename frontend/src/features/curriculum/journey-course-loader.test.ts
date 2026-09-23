import { describe, expect, it, vi } from 'vitest';
import type { PublicApiResult } from '@/lib/api-client';
import {
  flowChapterFixture,
  journeyFixture,
  questFixtures,
  valuesChapterFixture,
} from './journey-course-test-data';
import {
  type CurriculumApi,
  JourneyLoadError,
  loadJourneyCurriculumGraph,
} from './journey-course-loader';

function success<T>(data: T): PublicApiResult<T> {
  return { ok: true, data, requestId: 'request-id' };
}

function apiFixture(): CurriculumApi {
  const getJourney: CurriculumApi['getJourney'] = async () =>
    success(journeyFixture);
  const getChapter: CurriculumApi['getChapter'] = async (slug) =>
    success(
      slug === valuesChapterFixture.slug
        ? valuesChapterFixture
        : flowChapterFixture,
    );
  const getQuest: CurriculumApi['getQuest'] = async (slug) => {
    const quest = Object.values(questFixtures).find(
      (candidate) => candidate.slug === slug,
    );
    if (quest === undefined) return { ok: false, kind: 'network' };
    return success(quest);
  };
  return {
    getJourney: vi.fn(getJourney),
    getChapter: vi.fn(getChapter),
    getQuest: vi.fn(getQuest),
  };
}

async function expectKind(
  promise: Promise<unknown>,
  kind: JourneyLoadError['kind'],
) {
  await expect(promise).rejects.toMatchObject({
    name: 'JourneyLoadError',
    kind,
  });
}

describe('loadJourneyCurriculumGraph', () => {
  it('loads the full graph through cancellable typed API methods', async () => {
    const api = apiFixture();
    const controller = new AbortController();
    const graph = await loadJourneyCurriculumGraph(
      api,
      journeyFixture.slug,
      controller.signal,
    );

    expect(graph.chapters).toHaveLength(2);
    expect(graph.chapters.flatMap(({ quests }) => quests)).toHaveLength(4);
    expect(api.getJourney).toHaveBeenCalledWith(
      journeyFixture.slug,
      controller.signal,
    );
    expect(api.getChapter).toHaveBeenCalledWith(
      valuesChapterFixture.slug,
      controller.signal,
    );
    expect(api.getQuest).toHaveBeenCalledWith(
      questFixtures.Q01.slug,
      controller.signal,
    );
  });

  it('maps the root not-found response without revealing draft state', async () => {
    const api = apiFixture();
    const result: Awaited<ReturnType<CurriculumApi['getJourney']>> = {
      ok: false,
      kind: 'http',
      status: 404,
      error: {
        code: 'CURRICULUM_NOT_FOUND',
        message: 'Not found',
        status: 404,
        requestId: 'missing-request',
      },
    };
    api.getJourney = vi.fn(async () => result);

    await expectKind(loadJourneyCurriculumGraph(api, 'missing'), 'not-found');
  });

  it.each([
    ['cancelled', { ok: false, kind: 'cancelled' }],
    ['invalid-response', { ok: false, kind: 'invalid-response', status: 200 }],
    ['unavailable', { ok: false, kind: 'network' }],
  ] as const)('maps %s journey failures', async (kind, result) => {
    const api = apiFixture();
    const getJourney: CurriculumApi['getJourney'] = async () => result;
    api.getJourney = vi.fn(getJourney);
    await expectKind(loadJourneyCurriculumGraph(api, 'journey'), kind);
  });

  it('fails closed when a nested request fails', async () => {
    const api = apiFixture();
    const getQuest: CurriculumApi['getQuest'] = async (slug) =>
      slug === questFixtures.Q03.slug
        ? { ok: false, kind: 'network' }
        : success(
            Object.values(questFixtures).find(
              (candidate) => candidate.slug === slug,
            ) ?? questFixtures.Q01,
          );
    api.getQuest = vi.fn(getQuest);

    await expectKind(
      loadJourneyCurriculumGraph(api, journeyFixture.slug),
      'unavailable',
    );
  });

  it('rejects ownership and count inconsistencies as invalid responses', async () => {
    const api = apiFixture();
    api.getChapter = vi.fn(async (slug) =>
      success({
        ...(slug === valuesChapterFixture.slug
          ? valuesChapterFixture
          : flowChapterFixture),
        journey: { ...journeyFixture, id: 'ANOTHER-JOURNEY' },
      }),
    );

    await expectKind(
      loadJourneyCurriculumGraph(api, journeyFixture.slug),
      'invalid-response',
    );
  });
});
