import {
  createCodequestApi,
  type ChapterDetail,
  type JourneyDetail,
  type PublicApiResult,
  type QuestDetail,
} from '@/lib/api-client';
import type {
  JourneyCurriculumGraph,
  JourneyGraphChapter,
} from './journey-course-model';

export type CurriculumApi = Pick<
  ReturnType<typeof createCodequestApi>,
  'getJourney' | 'getChapter' | 'getQuest'
>;

export type JourneyLoadErrorKind =
  'not-found' | 'unavailable' | 'invalid-response' | 'cancelled';

export class JourneyLoadError extends Error {
  constructor(readonly kind: JourneyLoadErrorKind) {
    super('Journey could not be loaded');
    this.name = 'JourneyLoadError';
  }
}

function unwrap<T>(result: PublicApiResult<T>, rootJourneyRequest = false): T {
  if (result.ok) return result.data;
  if (result.kind === 'cancelled') throw new JourneyLoadError('cancelled');
  if (result.kind === 'invalid-response') {
    throw new JourneyLoadError('invalid-response');
  }
  if (rootJourneyRequest && result.kind === 'http' && result.status === 404) {
    throw new JourneyLoadError('not-found');
  }
  throw new JourneyLoadError('unavailable');
}

function matchesChapter(
  journey: JourneyDetail,
  expected: JourneyDetail['chapters'][number],
  actual: ChapterDetail,
): boolean {
  return (
    expected.id === actual.id &&
    expected.slug === actual.slug &&
    expected.position === actual.position &&
    expected.questCount === actual.questCount &&
    actual.journey.id === journey.id
  );
}

function matchesQuest(
  chapter: ChapterDetail,
  expected: ChapterDetail['quests'][number],
  actual: QuestDetail,
): boolean {
  return (
    expected.id === actual.id &&
    expected.slug === actual.slug &&
    expected.position === actual.position &&
    actual.hierarchy.journey.id === chapter.journey.id &&
    actual.hierarchy.chapter.id === chapter.id
  );
}

function assertConsistentGraph(graph: JourneyCurriculumGraph): void {
  const questIds = new Set<string>();
  let questCount = 0;
  for (const { chapter, quests } of graph.chapters) {
    if (quests.length !== chapter.questCount) {
      throw new JourneyLoadError('invalid-response');
    }
    questCount += quests.length;
    for (const quest of quests) {
      if (questIds.has(quest.id)) {
        throw new JourneyLoadError('invalid-response');
      }
      questIds.add(quest.id);
    }
  }
  if (
    graph.chapters.length !== graph.journey.chapterCount ||
    questCount !== graph.journey.questCount
  ) {
    throw new JourneyLoadError('invalid-response');
  }
  for (const { quests } of graph.chapters) {
    for (const quest of quests) {
      if (quest.prerequisites.some(({ id }) => !questIds.has(id))) {
        throw new JourneyLoadError('invalid-response');
      }
    }
  }
}

export async function loadJourneyCurriculumGraph(
  api: CurriculumApi,
  slug: string,
  signal?: AbortSignal,
): Promise<JourneyCurriculumGraph> {
  const journey = unwrap(await api.getJourney(slug, signal), true);
  const chapters = await Promise.all(
    journey.chapters.map(async (expectedChapter) => {
      const chapter = unwrap(
        await api.getChapter(expectedChapter.slug, signal),
      );
      if (!matchesChapter(journey, expectedChapter, chapter)) {
        throw new JourneyLoadError('invalid-response');
      }
      const quests = await Promise.all(
        chapter.quests.map(async (expectedQuest) => {
          const quest = unwrap(await api.getQuest(expectedQuest.slug, signal));
          if (!matchesQuest(chapter, expectedQuest, quest)) {
            throw new JourneyLoadError('invalid-response');
          }
          return quest;
        }),
      );
      return { chapter, quests } satisfies JourneyGraphChapter;
    }),
  );
  const graph = { journey, chapters } satisfies JourneyCurriculumGraph;
  assertConsistentGraph(graph);
  return graph;
}
