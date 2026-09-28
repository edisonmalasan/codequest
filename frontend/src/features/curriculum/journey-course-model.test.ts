import { describe, expect, it } from 'vitest';
import type { JourneyProgress } from '@/lib/api-client';
import { graphFixture } from './journey-course-test-data';
import { buildJourneyCourseMap } from './journey-course-model';

describe('buildJourneyCourseMap', () => {
  it('orders the graph and derives one current quest plus prerequisite locks', () => {
    const model = buildJourneyCourseMap(graphFixture, {
      authority: 'none',
      completedQuestIds: new Set(),
    });

    expect(model.chapters.map(({ chapter }) => chapter.id)).toEqual([
      'CH01',
      'CH02',
    ]);
    expect(
      model.chapters.flatMap(({ quests }) =>
        quests.map(({ quest, status }) => [quest.id, status]),
      ),
    ).toEqual([
      ['Q01', 'current'],
      ['Q02', 'locked'],
      ['Q03', 'locked'],
      ['Q04', 'available'],
    ]);
    expect(model.completedQuests).toBe(0);
    expect(model.totalQuests).toBe(4);
  });

  it('uses only backend progress and availability for authenticated learners', () => {
    const progress: JourneyProgress = {
      journeyId: graphFixture.journey.id,
      status: 'in_progress',
      availability: 'available',
      unmetPrerequisites: [],
      completedQuests: 2,
      totalQuests: 4,
      percentage: 50,
      chapters: graphFixture.chapters.map(({ chapter, quests }) => ({
        chapterId: chapter.id,
        status: chapter.id === 'CH01' ? 'completed' : 'not_started',
        availability: 'available',
        unmetPrerequisites: [],
        completedQuests: chapter.id === 'CH01' ? 2 : 0,
        totalQuests: quests.length,
        percentage: chapter.id === 'CH01' ? 100 : 0,
        quests: quests.map((quest) => ({
          questId: quest.id,
          status: chapter.id === 'CH01' ? 'completed' : 'not_started',
          availability: quest.id === 'Q04' ? 'locked' : 'available',
          unmetPrerequisites:
            quest.id === 'Q04'
              ? [
                  {
                    questId: 'Q02',
                    slug: 'change-state',
                    title: 'Change state',
                  },
                ]
              : [],
          startedAt: null,
          completedAt: null,
          lastActivityAt: null,
          attemptCount: 0,
          hintCount: 0,
        })),
      })),
    };
    const model = buildJourneyCourseMap(graphFixture, {
      authority: 'accepted',
      progress,
    });

    expect(model.completedQuests).toBe(2);
    expect(model.chapters[0]).toMatchObject({
      completedQuests: 2,
      totalQuests: 2,
      status: 'completed',
    });
    expect(model.chapters[1]?.quests.map(({ status }) => status)).toEqual([
      'current',
      'locked',
    ]);
    expect(model.chapters[1]?.quests[1]?.unmetPrerequisites).toEqual([
      { questId: 'Q02', slug: 'change-state', title: 'Change state' },
    ]);
    expect(model.completionAuthority).toBe('accepted');
  });

  it('handles an empty published journey without inventing an active quest', () => {
    const model = buildJourneyCourseMap(
      {
        journey: {
          ...graphFixture.journey,
          chapterCount: 0,
          questCount: 0,
          chapters: [],
        },
        chapters: [],
      },
      { authority: 'none', completedQuestIds: new Set() },
    );

    expect(model.chapters).toEqual([]);
    expect(model.completedQuests).toBe(0);
    expect(model.totalQuests).toBe(0);
  });
});
