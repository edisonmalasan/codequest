import type {
  ChapterDetail,
  JourneyDetail,
  QuestDetail,
} from '@/lib/api-client';
import type { QuestStatus } from '@/components/game/quest-node';

export type CompletionAuthority = 'none' | 'provisional' | 'accepted';

export interface JourneyCompletionSnapshot {
  readonly authority: CompletionAuthority;
  readonly completedQuestIds: ReadonlySet<string>;
}

export interface JourneyGraphChapter {
  readonly chapter: ChapterDetail;
  readonly quests: readonly QuestDetail[];
}

export interface JourneyCurriculumGraph {
  readonly journey: JourneyDetail;
  readonly chapters: readonly JourneyGraphChapter[];
}

export interface CourseMapQuest {
  readonly quest: QuestDetail;
  readonly status: QuestStatus;
}

export type ChapterProgressStatus =
  'not_started' | 'in_progress' | 'completed' | 'locked';

export interface CourseMapChapter {
  readonly chapter: ChapterDetail;
  readonly quests: readonly CourseMapQuest[];
  readonly completedQuests: number;
  readonly totalQuests: number;
  readonly status: ChapterProgressStatus;
}

export interface JourneyCourseMap {
  readonly journey: JourneyDetail;
  readonly chapters: readonly CourseMapChapter[];
  readonly completedQuests: number;
  readonly totalQuests: number;
  readonly completionAuthority: CompletionAuthority;
}

export const emptyCompletionSnapshot: JourneyCompletionSnapshot = {
  authority: 'none',
  completedQuestIds: new Set<string>(),
};

function byPosition<T extends { readonly position: number }>(a: T, b: T) {
  return a.position - b.position;
}

export function buildJourneyCourseMap(
  graph: JourneyCurriculumGraph,
  completion: JourneyCompletionSnapshot,
): JourneyCourseMap {
  const knownQuestIds = new Set(
    graph.chapters.flatMap(({ quests }) => quests.map(({ id }) => id)),
  );
  const completedQuestIds = new Set(
    [...completion.completedQuestIds].filter((id) => knownQuestIds.has(id)),
  );

  let activeAssigned = false;
  const chapters = [...graph.chapters]
    .sort((left, right) => byPosition(left.chapter, right.chapter))
    .map(({ chapter, quests }) => {
      const mappedQuests = [...quests]
        .sort(byPosition)
        .map((quest): CourseMapQuest => {
          if (completedQuestIds.has(quest.id)) {
            return { quest, status: 'completed' };
          }

          const isEligible = quest.prerequisites.every(({ id }) =>
            completedQuestIds.has(id),
          );
          if (!isEligible) return { quest, status: 'locked' };
          if (!activeAssigned) {
            activeAssigned = true;
            return { quest, status: 'current' };
          }
          return { quest, status: 'available' };
        });

      const completedQuests = mappedQuests.filter(
        ({ status }) => status === 'completed',
      ).length;
      const totalQuests = mappedQuests.length;
      let status: ChapterProgressStatus = 'not_started';
      if (totalQuests > 0 && completedQuests === totalQuests) {
        status = 'completed';
      } else if (
        completedQuests > 0 ||
        mappedQuests.some(
          ({ status: questStatus }) => questStatus === 'current',
        )
      ) {
        status = 'in_progress';
      } else if (
        totalQuests > 0 &&
        mappedQuests.every(
          ({ status: questStatus }) => questStatus === 'locked',
        )
      ) {
        status = 'locked';
      }

      return {
        chapter,
        quests: mappedQuests,
        completedQuests,
        totalQuests,
        status,
      };
    });

  return {
    journey: graph.journey,
    chapters,
    completedQuests: chapters.reduce(
      (total, chapter) => total + chapter.completedQuests,
      0,
    ),
    totalQuests: chapters.reduce(
      (total, chapter) => total + chapter.totalQuests,
      0,
    ),
    completionAuthority: completion.authority,
  };
}

export function chapterStatusLabel(status: ChapterProgressStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In progress';
    case 'locked':
      return 'Locked';
    case 'not_started':
      return 'Not started';
  }
}
