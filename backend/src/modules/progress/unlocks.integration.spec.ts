import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { Test } from '@nestjs/testing';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DatabaseConnectionService } from '../../infrastructure/database/database-connection';
import { createAuthPrincipal } from '../identity/auth-principal';
import {
  CURRICULUM_CATALOG,
  CurriculumCatalog,
  loadCurriculumCatalog,
} from '../curriculum/content/curriculum-catalog';
import { LearningService } from '../learning/learning.service';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

const USER_A = '00000000-0000-4000-8000-000000000001';
const USER_B = '00000000-0000-4000-8000-000000000002';
const REPORT = {
  checkId: '00000000-0000-4000-8000-000000000101',
  status: 'completed',
  passed: true,
  cases: [
    {
      id: 'normal-message',
      label: 'Normal',
      status: 'passed',
      message: 'Passed',
    },
    {
      id: 'boundary-exact-output',
      label: 'Boundary',
      status: 'passed',
      message: 'Passed',
    },
  ],
  failedCaseIds: [],
  feedback: 'All passed',
  durationMs: 12,
};

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'codequest-unlocks-'));
  cpSync(resolve('test/fixtures/curriculum-draft'), root, { recursive: true });
  const journey = join(root, 'journeys/javascript-foundations/journey.yaml');
  writeFileSync(
    journey,
    readFileSync(journey, 'utf8').replace('status: draft', 'status: reviewed'),
  );
  const course = join(
    root,
    'journeys/javascript-foundations/courses/javascript-foundations/course.yaml',
  );
  writeFileSync(
    course,
    readFileSync(course, 'utf8').replace('status: draft', 'status: reviewed'),
  );
  writeFileSync(
    join(root, 'publication.yaml'),
    `schemaVersion: 2
journeys:
  - id: JAVASCRIPT-FOUNDATIONS
    curriculumReview: approved
    technicalReview: approved
    courses:
      - id: COURSE-JS-FOUNDATIONS
        curriculumReview: approved
        technicalReview: approved
        quests:
          - id: Q01
            contentVersion: 1.0.0
            assessmentVersion: 1.0.0
`,
  );
  return root;
}

function twoQuestCatalog(root: string): CurriculumCatalog {
  const base = loadCurriculumCatalog(root);
  const journey = base.journeys[0];
  const firstChapter = journey.chapters[0];
  const first = firstChapter.quests[0];
  const second = {
    ...first,
    metadata: {
      ...first.metadata,
      id: 'Q02',
      chapterId: 'CH02',
      slug: 'second-message',
      position: 1,
    },
    activeSnapshot: {
      ...first.activeSnapshot,
      metadata: {
        ...first.activeSnapshot.metadata,
        title: 'Second message',
        prerequisiteQuestIds: ['Q01'],
      },
    },
  };
  const secondChapter = {
    ...firstChapter,
    metadata: {
      ...firstChapter.metadata,
      id: 'CH02',
      slug: 'next-steps',
      position: 2,
      questIds: ['Q02'],
    },
    quests: [second],
  };
  return {
    ...base,
    journeys: [
      {
        ...journey,
        metadata: {
          ...journey.metadata,
          courseIds: journey.metadata.courseIds,
        },
        courses: journey.courses.map((course) => ({
          ...course,
          metadata: {
            ...course.metadata,
            chapterIds: [...course.metadata.chapterIds, 'CH02'],
          },
          chapters: [firstChapter, secondChapter],
        })),
        chapters: [firstChapter, secondChapter],
      },
    ],
  };
}

function withNewFirstVersion(
  catalog: CurriculumCatalog,
  compatibility: 'compatible' | 'incompatible',
): CurriculumCatalog {
  const journey = catalog.journeys[0];
  const chapter = journey.chapters[0];
  const first = chapter.quests[0];
  const transition = {
    from: '1.0.0',
    to: '2.0.0',
    fromAssessment: '1.0.0',
    toAssessment: '2.0.0',
    compatibility,
    pendingWork: 'retry-current' as const,
    reason: 'Reviewed publication',
    retryGuidance: 'Use current assessment',
    curriculumReview: 'approved' as const,
    technicalReview: 'approved' as const,
  };
  const updated = {
    ...first,
    metadata: {
      ...first.metadata,
      currentVersion: '2.0.0',
      transitions: [transition],
    },
    activeSnapshot: {
      ...first.activeSnapshot,
      metadata: {
        ...first.activeSnapshot.metadata,
        contentVersion: '2.0.0',
        assessmentVersion: '2.0.0',
      },
    },
  };
  return {
    ...catalog,
    journeys: [
      {
        ...journey,
        chapters: [
          { ...chapter, quests: [updated] },
          ...journey.chapters.slice(1),
        ],
      },
    ],
  };
}

describe('owner completion prerequisite unlocks', () => {
  let client: PGlite;
  let root: string;
  let database: ReturnType<typeof drizzle>;
  let catalog: CurriculumCatalog;

  beforeEach(async () => {
    root = fixture();
    client = await PGlite.create();
    database = drizzle(client);
    await migrate(database, { migrationsFolder: resolve('drizzle') });
    catalog = twoQuestCatalog(root);
  });
  afterEach(async () => {
    await client.close();
    rmSync(root, { recursive: true, force: true });
  });

  async function services(published = catalog) {
    const module = await Test.createTestingModule({
      providers: [
        ProgressService,
        LearningService,
        { provide: DatabaseConnectionService, useValue: { database } },
        { provide: CURRICULUM_CATALOG, useValue: published },
      ],
    }).compile();
    return {
      progress: module.get(ProgressService),
      learning: module.get(LearningService),
    };
  }

  function body(eventId: string) {
    return {
      clientEventId: eventId,
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'console.log(1)',
      report: REPORT,
    };
  }

  it('derives quest, chapter, and Journey availability and gates new activity', async () => {
    const { progress, learning } = await services();
    expect(await progress.quest(USER_A, 'first-message')).toMatchObject({
      availability: 'available',
      unmetPrerequisites: [],
    });
    expect(await progress.quest(USER_A, 'second-message')).toMatchObject({
      availability: 'locked',
      status: 'not_started',
      unmetPrerequisites: [{ questId: 'Q01', slug: 'first-message' }],
    });
    expect(await progress.chapter(USER_A, 'next-steps')).toMatchObject({
      availability: 'locked',
      unmetPrerequisites: [{ questId: 'Q01' }],
    });
    expect(
      await progress.journey(USER_A, 'javascript-foundations'),
    ).toMatchObject({ availability: 'available' });
    expect(
      await new ProgressController(progress).course(
        createAuthPrincipal(USER_A),
        'javascript-foundations',
      ),
    ).toEqual(await progress.journey(USER_A, 'javascript-foundations'));
    await expect(
      progress.start(USER_A, 'second-message', { contentVersion: '1.0.0' }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      progress.useHint(USER_A, 'second-message', {
        contentVersion: '1.0.0',
        hintKey: 'question',
      }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      learning.submit(
        USER_A,
        'second-message',
        body('00000000-0000-4000-8000-000000000201'),
      ),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      learning.submit(USER_A, 'second-message', {
        ...body('00000000-0000-4000-8000-000000000204'),
        report: {
          ...REPORT,
          passed: false,
          cases: [REPORT.cases[0], { ...REPORT.cases[1], status: 'failed' }],
          failedCaseIds: ['boundary-exact-output'],
        },
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(
      (await client.query('select * from codequest.quest_attempts')).rows,
    ).toHaveLength(0);

    const first = await learning.submit(
      USER_A,
      'first-message',
      body('00000000-0000-4000-8000-000000000202'),
    );
    expect(first.accepted).toBe(true);
    expect(await progress.quest(USER_A, 'second-message')).toMatchObject({
      availability: 'available',
      unmetPrerequisites: [],
    });
    expect(await progress.chapter(USER_A, 'next-steps')).toMatchObject({
      availability: 'available',
    });
    expect(await progress.quest(USER_B, 'second-message')).toMatchObject({
      availability: 'locked',
    });
    await progress.start(USER_A, 'second-message', { contentVersion: '1.0.0' });
    await progress.useHint(USER_A, 'second-message', {
      contentVersion: '1.0.0',
      hintKey: 'question',
    });
    const second = await learning.submit(
      USER_A,
      'second-message',
      body('00000000-0000-4000-8000-000000000203'),
    );
    expect(second.accepted).toBe(true);
    expect(await progress.quest(USER_A, 'second-message')).toMatchObject({
      status: 'completed',
      availability: 'available',
    });
  });

  it('uses reviewed compatibility and rejects incompatible old prerequisites', async () => {
    const { learning } = await services();
    await learning.submit(
      USER_A,
      'first-message',
      body('00000000-0000-4000-8000-000000000210'),
    );
    const compatible = await services(
      withNewFirstVersion(catalog, 'compatible'),
    );
    expect(
      await compatible.progress.quest(USER_A, 'second-message'),
    ).toMatchObject({ availability: 'available' });
    const incompatible = await services(
      withNewFirstVersion(catalog, 'incompatible'),
    );
    expect(
      await incompatible.progress.quest(USER_A, 'second-message'),
    ).toMatchObject({ availability: 'locked' });
    await expect(
      incompatible.learning.submit(
        USER_A,
        'second-message',
        body('00000000-0000-4000-8000-000000000211'),
      ),
    ).rejects.toMatchObject({ status: 409 });
    expect(
      (await incompatible.progress.quest(USER_A, 'first-message')).status,
    ).toBe('in_progress');
    expect(
      (await learning.history(USER_A, 'first-message')).attempts,
    ).toHaveLength(1);
  });

  it('returns the original failed event after a publication locks its quest', async () => {
    const { learning } = await services();
    await learning.submit(
      USER_A,
      'first-message',
      body('00000000-0000-4000-8000-000000000220'),
    );
    const failed = {
      ...body('00000000-0000-4000-8000-000000000221'),
      report: {
        ...REPORT,
        passed: false,
        cases: [REPORT.cases[0], { ...REPORT.cases[1], status: 'failed' }],
        failedCaseIds: ['boundary-exact-output'],
      },
    };
    const original = await learning.submit(USER_A, 'second-message', failed);
    expect(original.accepted).toBe(false);
    const changed = await services(
      withNewFirstVersion(catalog, 'incompatible'),
    );
    expect(
      await changed.progress.quest(USER_A, 'second-message'),
    ).toMatchObject({ availability: 'locked' });
    expect(
      await changed.learning.submit(USER_A, 'second-message', failed),
    ).toEqual(original);
    await expect(
      changed.learning.submit(USER_A, 'second-message', {
        ...failed,
        clientEventId: '00000000-0000-4000-8000-000000000222',
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(
      (await changed.learning.history(USER_A, 'second-message')).attempts,
    ).toHaveLength(1);
  });

  it('keeps an empty published Journey browseable without a playable quest', async () => {
    const empty = {
      ...catalog,
      journeys: catalog.journeys.map((journey) => ({
        ...journey,
        chapters: [],
      })),
    };
    const { progress } = await services(empty);
    expect(
      await progress.journey(USER_A, 'javascript-foundations'),
    ).toMatchObject({
      status: 'not_started',
      availability: 'available',
      unmetPrerequisites: [],
      completedQuests: 0,
      totalQuests: 0,
      chapters: [],
    });
  });
});
