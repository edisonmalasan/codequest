import { describe, expect, it } from 'vitest';
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

  it('derives chapter progression and ignores completion IDs outside the journey', () => {
    const model = buildJourneyCourseMap(graphFixture, {
      authority: 'accepted',
      completedQuestIds: new Set(['Q01', 'Q02', 'OTHER']),
    });

    expect(model.completedQuests).toBe(2);
    expect(model.chapters[0]).toMatchObject({
      completedQuests: 2,
      totalQuests: 2,
      status: 'completed',
    });
    expect(model.chapters[1]?.quests.map(({ status }) => status)).toEqual([
      'current',
      'available',
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
