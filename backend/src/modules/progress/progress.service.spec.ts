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
import {
  CURRICULUM_CATALOG,
  loadCurriculumCatalog,
} from '../curriculum/content/curriculum-catalog';
import { LearningService } from '../learning/learning.service';
import { ProgressService } from './progress.service';
import {
  AnalyticsService,
  type AnalyticsFact,
} from '../analytics/analytics.service';

const USER_A = '00000000-0000-4000-8000-000000000001';
const USER_B = '00000000-0000-4000-8000-000000000002';

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'codequest-progress-'));
  cpSync(resolve('test/fixtures/curriculum-draft'), root, { recursive: true });
  const journey = join(root, 'journeys/javascript-foundations/journey.yaml');
  writeFileSync(
    journey,
    readFileSync(journey, 'utf8').replace('status: draft', 'status: reviewed'),
  );
  writeFileSync(
    join(root, 'publication.yaml'),
    `schemaVersion: 1
journeys:
  - id: JAVASCRIPT-FOUNDATIONS
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

describe('derived owner progress', () => {
  let client: PGlite;
  let root: string;
  let progress: ProgressService;
  let learning: LearningService;
  let analyticsFacts: AnalyticsFact[];

  beforeEach(async () => {
    analyticsFacts = [];
    root = fixture();
    client = await PGlite.create();
    const database = drizzle(client);
    await migrate(database, { migrationsFolder: resolve('drizzle') });
    const module = await Test.createTestingModule({
      providers: [
        ProgressService,
        LearningService,
        {
          provide: AnalyticsService,
          useValue: {
            capture: async (fact: AnalyticsFact) => {
              analyticsFacts.push(fact);
            },
          },
        },
        { provide: DatabaseConnectionService, useValue: { database } },
        { provide: CURRICULUM_CATALOG, useValue: loadCurriculumCatalog(root) },
      ],
    }).compile();
    progress = module.get(ProgressService);
    learning = module.get(LearningService);
  });

  afterEach(async () => {
    await client.close();
    rmSync(root, { recursive: true, force: true });
  });

  it('records first start and distinct hints without duplicates or cross-owner effects', async () => {
    expect(await progress.quest(USER_A, 'first-message')).toMatchObject({
      status: 'not_started',
      attemptCount: 0,
      hintCount: 0,
      startedAt: null,
      completedAt: null,
    });
    const first = await progress.start(USER_A, 'first-message', {
      contentVersion: '1.0.0',
    });
    expect(
      await progress.start(USER_A, 'first-message', {
        contentVersion: '1.0.0',
      }),
    ).toEqual(first);
    const concurrentStarts = await Promise.all(
      Array.from({ length: 3 }, () =>
        progress.start(USER_A, 'first-message', { contentVersion: '1.0.0' }),
      ),
    );
    expect(
      concurrentStarts.every((item) => item.occurredAt === first.occurredAt),
    ).toBe(true);
    expect(
      analyticsFacts.filter((fact) => fact.name === 'first_quest_started'),
    ).toHaveLength(1);
    expect(
      analyticsFacts.filter((fact) => fact.name === 'signup_completed'),
    ).toHaveLength(1);
    const hint = await progress.useHint(USER_A, 'first-message', {
      contentVersion: '1.0.0',
      hintKey: 'question',
    });
    expect(
      await progress.useHint(USER_A, 'first-message', {
        contentVersion: '1.0.0',
        hintKey: 'question',
      }),
    ).toEqual(hint);
    const concurrentHints = await Promise.all(
      Array.from({ length: 3 }, () =>
        progress.useHint(USER_A, 'first-message', {
          contentVersion: '1.0.0',
          hintKey: 'question',
        }),
      ),
    );
    expect(
      concurrentHints.every((item) => item.occurredAt === hint.occurredAt),
    ).toBe(true);
    expect(
      analyticsFacts.filter((fact) => fact.name === 'hint_used'),
    ).toHaveLength(1);
    await progress.useHint(USER_A, 'first-message', {
      contentVersion: '1.0.0',
      hintKey: 'concept',
    });
    const own = await progress.quest(USER_A, 'first-message');
    expect(own).toMatchObject({
      status: 'in_progress',
      hintCount: 2,
      attemptCount: 0,
      startedAt: first.occurredAt,
    });
    expect(own.lastActivityAt).toMatch(/^20\d\d-/);
    expect((await progress.quest(USER_B, 'first-message')).status).toBe(
      'not_started',
    );
    await expect(
      progress.start(USER_A, 'missing', { contentVersion: '1.0.0' }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      progress.start(USER_A, 'first-message', { contentVersion: '2.0.0' }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('emits a capstone start only after a new eligible owner start commits', async () => {
    const catalog = loadCurriculumCatalog(root);
    const chapter = catalog.journeys[0].chapters[0];
    const base = chapter.quests[0];
    const capstone = {
      ...base,
      metadata: {
        ...base.metadata,
        id: 'CAP01',
        slug: 'inventory-manager',
        kind: 'capstone' as const,
        guestEligible: false,
        position: 3,
      },
      activeSnapshot: {
        ...base.activeSnapshot,
        metadata: {
          ...base.activeSnapshot.metadata,
          prerequisiteQuestIds: ['Q01'],
        },
      },
    };
    const capstoneCatalog = {
      ...catalog,
      journeys: [
        {
          ...catalog.journeys[0],
          chapters: [{ ...chapter, quests: [...chapter.quests, capstone] }],
        },
      ],
    };
    const module = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: DatabaseConnectionService,
          useValue: { database: drizzle(client) },
        },
        { provide: CURRICULUM_CATALOG, useValue: capstoneCatalog },
        {
          provide: AnalyticsService,
          useValue: {
            capture: async (fact: AnalyticsFact) => {
              analyticsFacts.push(fact);
            },
          },
        },
      ],
    }).compile();
    const capstoneProgress = module.get(ProgressService);
    await expect(
      capstoneProgress.start(USER_B, 'inventory-manager', {
        contentVersion: '1.0.0',
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(analyticsFacts).toHaveLength(0);
    await learning.submit(USER_A, 'first-message', {
      clientEventId: '00000000-0000-4000-8000-000000000501',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'fixture',
      report: {
        checkId: '00000000-0000-4000-8000-000000000502',
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
        feedback: 'Passed',
        durationMs: 1,
      },
    });
    const started = await capstoneProgress.start(USER_A, 'inventory-manager', {
      contentVersion: '1.0.0',
    });
    expect(
      await capstoneProgress.start(USER_A, 'inventory-manager', {
        contentVersion: '1.0.0',
      }),
    ).toEqual(started);
    expect(
      analyticsFacts.filter((fact) => fact.name === 'capstone_started'),
    ).toEqual([
      expect.objectContaining({
        ownerId: USER_A,
        factId: 'CAP01',
        properties: expect.objectContaining({ quest_id: 'CAP01' }),
      }),
    ]);
  });

  it('derives legacy attempt, accepted completion, and identical Course alias data', async () => {
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000201',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: "console.log('I am ready to code!')",
      report: {
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
      },
    };
    await learning.submit(USER_A, 'first-message', {
      ...body,
      report: {
        ...body.report,
        passed: false,
        cases: [
          body.report.cases[0],
          { ...body.report.cases[1], status: 'failed' },
        ],
        failedCaseIds: ['boundary-exact-output'],
      },
    });
    const inProgress = await progress.quest(USER_A, 'first-message');
    expect(inProgress).toMatchObject({
      status: 'in_progress',
      attemptCount: 1,
      hintCount: 0,
      completedAt: null,
    });
    expect(inProgress.startedAt).toBeTruthy();
    await learning.submit(USER_A, 'first-message', {
      ...body,
      clientEventId: '00000000-0000-4000-8000-000000000202',
    });
    const completed = await progress.quest(USER_A, 'first-message');
    expect(completed).toMatchObject({ status: 'completed', attemptCount: 2 });
    expect(completed.completedAt).toMatch(/^20\d\d-/);
    const journey = await progress.journey(USER_A, 'javascript-foundations');
    expect(journey).toMatchObject({
      completedQuests: 1,
      totalQuests: 1,
      percentage: 100,
      status: 'completed',
    });
    expect(journey.chapters[0]).toMatchObject({
      completedQuests: 1,
      totalQuests: 1,
      percentage: 100,
    });
    expect(await progress.chapter(USER_A, 'variables')).toEqual(
      journey.chapters[0],
    );
    expect(
      (await progress.journey(USER_B, 'javascript-foundations'))
        .completedQuests,
    ).toBe(0);
  });

  it('uses only current published quests for partial, empty, and retired denominators', async () => {
    const catalog = loadCurriculumCatalog(root);
    const journey = catalog.journeys[0];
    const chapter = journey.chapters[0];
    const original = chapter.quests[0];
    const added = {
      ...original,
      metadata: {
        ...original.metadata,
        id: 'Q02',
        slug: 'second-message',
        position: 2,
      },
    };
    const database = drizzle(client);
    async function serviceFor(quests: typeof chapter.quests, empty = false) {
      const selected = {
        ...catalog,
        journeys: [
          { ...journey, chapters: empty ? [] : [{ ...chapter, quests }] },
        ],
      };
      const module = await Test.createTestingModule({
        providers: [
          ProgressService,
          { provide: DatabaseConnectionService, useValue: { database } },
          { provide: CURRICULUM_CATALOG, useValue: selected },
        ],
      }).compile();
      return module.get(ProgressService);
    }
    await progress.start(USER_A, 'first-message', { contentVersion: '1.0.0' });
    await client.exec(`insert into codequest.quest_attempts (id, user_id, quest_id, quest_version_id, client_event_id)
      select '00000000-0000-4000-8000-000000000301', '${USER_A}', 'Q01', id, '00000000-0000-4000-8000-000000000302'
      from codequest.quest_versions where quest_id = 'Q01' and content_version = '1.0.0';
      insert into codequest.quest_completions (user_id, quest_id, accepted_attempt_id)
      values ('${USER_A}', 'Q01', '00000000-0000-4000-8000-000000000301');`);
    const partial = await (
      await serviceFor([original, added])
    ).journey(USER_A, journey.metadata.slug);
    expect(partial).toMatchObject({
      status: 'in_progress',
      completedQuests: 1,
      totalQuests: 2,
      percentage: 50,
    });
    const empty = await (
      await serviceFor([], true)
    ).journey(USER_A, journey.metadata.slug);
    expect(empty).toMatchObject({
      status: 'not_started',
      completedQuests: 0,
      totalQuests: 0,
      percentage: 0,
    });
    const retired = await (
      await serviceFor([added])
    ).journey(USER_A, journey.metadata.slug);
    expect(retired).toMatchObject({
      status: 'not_started',
      completedQuests: 0,
      totalQuests: 1,
      percentage: 0,
    });
    const transition = {
      from: '1.0.0',
      to: '2.0.0',
      fromAssessment: '1.0.0',
      toAssessment: '2.0.0',
      compatibility: 'compatible' as const,
      pendingWork: 'accept-new' as const,
      reason: 'Equivalent assessment',
      curriculumReview: 'approved' as const,
      technicalReview: 'approved' as const,
    };
    const versioned = {
      ...original,
      metadata: {
        ...original.metadata,
        currentVersion: '2.0.0',
        transitions: [transition],
      },
      activeSnapshot: {
        ...original.activeSnapshot,
        metadata: {
          ...original.activeSnapshot.metadata,
          contentVersion: '2.0.0',
          assessmentVersion: '2.0.0',
        },
      },
    };
    expect(
      (await (await serviceFor([versioned])).quest(USER_A, 'first-message'))
        .status,
    ).toBe('completed');
    const incompatible = {
      ...versioned,
      metadata: {
        ...versioned.metadata,
        transitions: [
          {
            ...transition,
            compatibility: 'incompatible' as const,
            pendingWork: 'retry-current' as const,
            retryGuidance: 'Retry current quest',
          },
        ],
      },
    };
    const obsolete = await (
      await serviceFor([incompatible])
    ).quest(USER_A, 'first-message');
    expect(obsolete).toMatchObject({
      status: 'in_progress',
      completedAt: null,
      attemptCount: 1,
    });
    expect(
      (
        await (
          await serviceFor([incompatible])
        ).journey(USER_A, journey.metadata.slug)
      ).completedQuests,
    ).toBe(0);
    const unmapped = {
      ...versioned,
      metadata: { ...versioned.metadata, transitions: [] },
    };
    expect(
      (await (await serviceFor([unmapped])).quest(USER_A, 'first-message'))
        .status,
    ).toBe('in_progress');
  });
});
