import type {
  ChapterDetail,
  JourneyDetail,
  QuestDetail,
} from '@/lib/api-client';
import type { JourneyCurriculumGraph } from './journey-course-model';

const journeySummary = {
  id: 'JAVASCRIPT-FOUNDATIONS',
  slug: 'javascript-foundations',
  title: 'JavaScript Foundations',
  position: 1,
  chapterCount: 2,
  questCount: 4,
};

const valuesChapterSummary = {
  id: 'CH01',
  slug: 'values-and-state',
  title: 'Values and state',
  position: 1,
  objectiveSummary: 'Choose values and update state.',
  questCount: 2,
};

const flowChapterSummary = {
  id: 'CH02',
  slug: 'control-flow',
  title: 'Control flow',
  position: 2,
  objectiveSummary: 'Make decisions and repeat work.',
  questCount: 2,
};

const summaries = {
  Q01: {
    id: 'Q01',
    slug: 'first-value',
    title: 'First value',
    position: 1,
    kind: 'instructional' as const,
    guestEligible: true,
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    difficulty: 'introductory' as const,
    xpAward: 10,
  },
  Q02: {
    id: 'Q02',
    slug: 'change-state',
    title: 'Change state',
    position: 2,
    kind: 'instructional' as const,
    guestEligible: true,
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    difficulty: 'introductory' as const,
    xpAward: 10,
  },
  Q03: {
    id: 'Q03',
    slug: 'choose-a-path',
    title: 'Choose a path',
    position: 1,
    kind: 'instructional' as const,
    guestEligible: true,
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    difficulty: 'developing' as const,
    xpAward: 15,
  },
  Q04: {
    id: 'Q04',
    slug: 'repeat-work',
    title: 'Repeat work',
    position: 2,
    kind: 'instructional' as const,
    guestEligible: true,
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    difficulty: 'developing' as const,
    xpAward: 15,
  },
};

export const journeyFixture: JourneyDetail = {
  ...journeySummary,
  entryRequirements: ['Read English and navigate a browser.'],
  outcomes: [
    { id: 'O1', description: 'Choose and predict basic values and state.' },
    { id: 'O2', description: 'Select branches and handle boundaries.' },
  ],
  chapters: [flowChapterSummary, valuesChapterSummary],
};

export const valuesChapterFixture: ChapterDetail = {
  ...valuesChapterSummary,
  journey: journeySummary,
  quests: [summaries.Q02, summaries.Q01],
};

export const flowChapterFixture: ChapterDetail = {
  ...flowChapterSummary,
  journey: journeySummary,
  quests: [summaries.Q04, summaries.Q03],
};

function quest(
  summary: (typeof summaries)[keyof typeof summaries],
  chapter: typeof valuesChapterSummary,
  prerequisites: QuestDetail['prerequisites'],
): QuestDetail {
  return {
    ...summary,
    hierarchy: { journey: journeySummary, chapter },
    objective: `Complete ${summary.title}.`,
    outcomeId: summary.id === 'Q01' || summary.id === 'Q02' ? 'O1' : 'O2',
    concepts: [{ id: 'js-values', title: 'JavaScript values' }],
    prerequisites,
    hints: {
      question: 'What happens next?',
      concept: 'Trace the value.',
      nextStep: 'Try one small change.',
    },
    lesson: `# ${summary.title}`,
    starterCode: 'const value = 1;',
    cases: [
      {
        id: `${summary.id.toLowerCase()}-normal`,
        category: 'normal',
        kind: 'console',
        feedback: 'Match the expected output.',
        expectedOutput: '1',
      },
    ],
  };
}

export const questFixtures: Record<string, QuestDetail> = {
  Q01: quest(summaries.Q01, valuesChapterSummary, []),
  Q02: quest(summaries.Q02, valuesChapterSummary, [
    { id: 'Q01', slug: 'first-value', title: 'First value' },
  ]),
  Q03: quest(summaries.Q03, flowChapterSummary, [
    { id: 'Q02', slug: 'change-state', title: 'Change state' },
  ]),
  Q04: quest(summaries.Q04, flowChapterSummary, []),
};

export const graphFixture: JourneyCurriculumGraph = {
  journey: journeyFixture,
  chapters: [
    {
      chapter: flowChapterFixture,
      quests: [questFixtures.Q04, questFixtures.Q03],
    },
    {
      chapter: valuesChapterFixture,
      quests: [questFixtures.Q02, questFixtures.Q01],
    },
  ],
};
