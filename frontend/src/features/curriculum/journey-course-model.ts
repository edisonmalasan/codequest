import type {
  ChapterDetail,
  JourneyDetail,
  JourneyProgress,
  QuestDetail,
} from '@/lib/api-client';
import type { QuestStatus } from '@/components/game/quest-node';

export type CompletionAuthority = 'none' | 'provisional' | 'accepted';

export type JourneyCompletionSnapshot =
  | {
      readonly authority: 'none' | 'provisional';
      readonly completedQuestIds: ReadonlySet<string>;
    }
  | { readonly authority: 'accepted'; readonly progress: JourneyProgress };

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
  readonly unmetPrerequisites: readonly {
    readonly questId: string;
    readonly slug: string;
    readonly title: string;
  }[];
}

export type ChapterProgressStatus =
  'not_started' | 'in_progress' | 'completed' | 'locked';

export interface CourseMapChapter {
  readonly chapter: ChapterDetail;
  readonly quests: readonly CourseMapQuest[];
  readonly completedQuests: number;
  readonly totalQuests: number;
  readonly status: ChapterProgressStatus;
  readonly availability: 'available' | 'locked';
  readonly unmetPrerequisites: readonly {
    readonly questId: string;
    readonly slug: string;
    readonly title: string;
  }[];
}

export interface JourneyCourseMap {
  readonly journey: JourneyDetail;
  readonly chapters: readonly CourseMapChapter[];
  readonly completedQuests: number;
  readonly totalQuests: number;
  readonly completionAuthority: CompletionAuthority;
  readonly availability: 'available' | 'locked';
  readonly unmetPrerequisites: readonly {
    readonly questId: string;
    readonly slug: string;
    readonly title: string;
  }[];
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
  const completedQuestIds =
    completion.authority === 'accepted'
      ? new Set(
          completion.progress.chapters.flatMap((chapter) =>
            chapter.quests
              .filter((quest) => quest.status === 'completed')
              .map((quest) => quest.questId),
          ),
        )
      : new Set(
          [...completion.completedQuestIds].filter((id) =>
            knownQuestIds.has(id),
          ),
        );
  const acceptedChapters =
    completion.authority === 'accepted'
      ? new Map(
          completion.progress.chapters.map((chapter) => [
            chapter.chapterId,
            chapter,
          ]),
        )
      : undefined;
  const acceptedQuests =
    completion.authority === 'accepted'
      ? new Map(
          completion.progress.chapters
            .flatMap((chapter) => chapter.quests)
            .map((quest) => [quest.questId, quest]),
        )
      : undefined;

  let activeAssigned = false;
  const chapters = [...graph.chapters]
    .sort((left, right) => byPosition(left.chapter, right.chapter))
    .map(({ chapter, quests }) => {
      const mappedQuests = [...quests]
        .sort(byPosition)
        .map((quest): CourseMapQuest => {
          if (completion.authority === 'accepted') {
            const accepted = acceptedQuests?.get(quest.id);
            if (!accepted)
              throw new Error('Backend availability is incomplete');
            if (accepted.status === 'completed')
              return { quest, status: 'completed', unmetPrerequisites: [] };
            if (accepted.availability === 'locked')
              return {
                quest,
                status: 'locked',
                unmetPrerequisites: accepted.unmetPrerequisites,
              };
            const status = activeAssigned ? 'available' : 'current';
            activeAssigned = true;
            return { quest, status, unmetPrerequisites: [] };
          }
          if (completedQuestIds.has(quest.id)) {
            return { quest, status: 'completed', unmetPrerequisites: [] };
          }

          const unmetPrerequisites = quest.prerequisites
            .filter(({ id }) => !completedQuestIds.has(id))
            .map(({ id, slug, title }) => ({ questId: id, slug, title }));
          if (unmetPrerequisites.length || !quest.guestEligible)
            return { quest, status: 'locked', unmetPrerequisites };
          if (!activeAssigned) {
            activeAssigned = true;
            return { quest, status: 'current', unmetPrerequisites: [] };
          }
          return { quest, status: 'available', unmetPrerequisites: [] };
        });

      const provisionalCompletedQuests = mappedQuests.filter(
        ({ status }) => status === 'completed',
      ).length;
      const acceptedChapter = acceptedChapters?.get(chapter.id);
      const completedQuests =
        acceptedChapter?.completedQuests ?? provisionalCompletedQuests;
      const totalQuests = acceptedChapter?.totalQuests ?? mappedQuests.length;
      let status: ChapterProgressStatus = 'not_started';
      if (acceptedChapter?.availability === 'locked') {
        status = 'locked';
      } else if (acceptedChapter) {
        status = acceptedChapter.status;
      } else if (totalQuests > 0 && completedQuests === totalQuests) {
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
        availability:
          acceptedChapter?.availability ??
          (status === 'locked' ? 'locked' : 'available'),
        unmetPrerequisites:
          acceptedChapter?.unmetPrerequisites ??
          (status === 'locked'
            ? (mappedQuests[0]?.unmetPrerequisites ?? [])
            : []),
      };
    });

  return {
    journey: graph.journey,
    chapters,
    completedQuests:
      completion.authority === 'accepted'
        ? completion.progress.completedQuests
        : chapters.reduce(
            (total, chapter) => total + chapter.completedQuests,
            0,
          ),
    totalQuests:
      completion.authority === 'accepted'
        ? completion.progress.totalQuests
        : chapters.reduce((total, chapter) => total + chapter.totalQuests, 0),
    completionAuthority: completion.authority,
    availability:
      completion.authority === 'accepted'
        ? completion.progress.availability
        : chapters.length > 0 &&
            chapters.every((chapter) => chapter.status === 'locked')
          ? 'locked'
          : 'available',
    unmetPrerequisites:
      completion.authority === 'accepted'
        ? completion.progress.unmetPrerequisites
        : (chapters[0]?.quests[0]?.unmetPrerequisites ?? []),
  };
}

export function hasCompleteAcceptedAvailability(
  graph: JourneyCurriculumGraph,
  progress: JourneyProgress,
): boolean {
  if (progress.journeyId !== graph.journey.id) return false;
  if (progress.chapters.length !== graph.chapters.length) return false;
  const chapters = new Map(
    progress.chapters.map((chapter) => [chapter.chapterId, chapter]),
  );
  if (chapters.size !== graph.chapters.length) return false;
  return graph.chapters.every(({ chapter, quests }) => {
    const accepted = chapters.get(chapter.id);
    if (!accepted || accepted.quests.length !== quests.length) return false;
    const ids = new Set(accepted.quests.map((quest) => quest.questId));
    if (ids.size !== quests.length) return false;
    return quests.every((quest) => ids.has(quest.id));
  });
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
