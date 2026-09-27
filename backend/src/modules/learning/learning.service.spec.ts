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
import { LearningService } from './learning.service';

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

function contentFixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'codequest-learning-'));
  cpSync(resolve('content'), root, { recursive: true });
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

describe('authoritative attempt persistence', () => {
  let client: PGlite;
  let service: LearningService;
  let root: string;

  beforeEach(async () => {
    root = contentFixture();
    client = await PGlite.create();
    const database = drizzle(client);
    await migrate(database, { migrationsFolder: resolve('drizzle') });
    const module = await Test.createTestingModule({
      providers: [
        LearningService,
        { provide: DatabaseConnectionService, useValue: { database } },
        { provide: CURRICULUM_CATALOG, useValue: loadCurriculumCatalog(root) },
      ],
    }).compile();
    service = module.get(LearningService);
  });

  afterEach(async () => {
    await client.close();
    rmSync(root, { recursive: true, force: true });
  });

  it('stores private source, returns owner-only history, and accepts once', async () => {
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000201',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: "console.log('I am ready to code!')",
      report: REPORT,
    };
    const first = await service.submit(USER_A, 'first-message', body);
    expect(first).toMatchObject({
      questId: 'Q01',
      attemptCount: 1,
      reportedPassed: true,
      accepted: true,
      clientReported: true,
    });
    expect(first.submittedAt).toMatch(/^20\d\d-/);
    expect(await service.submit(USER_A, 'first-message', body)).toEqual(first);
    const second = await service.submit(USER_A, 'first-message', {
      ...body,
      clientEventId: '00000000-0000-4000-8000-000000000202',
      report: {
        ...REPORT,
        passed: false,
        cases: [REPORT.cases[0], { ...REPORT.cases[1], status: 'failed' }],
        failedCaseIds: ['boundary-exact-output'],
      },
    });
    expect(second).toMatchObject({
      attemptCount: 2,
      reportedPassed: false,
      accepted: false,
    });
    expect(
      (await service.history(USER_A, 'first-message')).attempts.map(
        (attempt) => attempt.source,
      ),
    ).toEqual([body.source, body.source]);
    expect(await service.history(USER_B, 'first-message')).toEqual({
      attemptCount: 0,
      attempts: [],
    });
  });

  it('rejects conflicting replay, wrong version, and forged pass before persistence', async () => {
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000203',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'one',
      report: REPORT,
    };
    await service.submit(USER_A, 'first-message', body);
    await expect(
      service.submit(USER_A, 'first-message', { ...body, source: 'two' }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      service.submit(USER_A, 'first-message', {
        ...body,
        contentVersion: '2.0.0',
      }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      service.submit(USER_A, 'first-message', {
        ...body,
        clientEventId: '00000000-0000-4000-8000-000000000204',
        report: { ...REPORT, cases: REPORT.cases.slice(0, 1) },
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect((await service.history(USER_A, 'first-message')).attemptCount).toBe(
      1,
    );
  });

  it('replays an existing event after the published version changes', async () => {
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000208',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'source',
      report: REPORT,
    };
    const original = await service.submit(USER_A, 'first-message', body);
    const catalog = loadCurriculumCatalog(root);
    const journey = catalog.journeys[0];
    const chapter = journey.chapters[0];
    const quest = chapter.quests[0];
    const newerCatalog = {
      ...catalog,
      journeys: [
        {
          ...journey,
          chapters: [
            {
              ...chapter,
              quests: [
                {
                  ...quest,
                  activeSnapshot: {
                    ...quest.activeSnapshot,
                    metadata: {
                      ...quest.activeSnapshot.metadata,
                      contentVersion: '2.0.0',
                      assessmentVersion: '2.0.0',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    const module = await Test.createTestingModule({
      providers: [
        LearningService,
        {
          provide: DatabaseConnectionService,
          useValue: { database: drizzle(client) },
        },
        { provide: CURRICULUM_CATALOG, useValue: newerCatalog },
      ],
    }).compile();
    const newerService = module.get(LearningService);
    expect(await newerService.submit(USER_A, 'first-message', body)).toEqual(
      original,
    );
    await expect(
      newerService.submit(USER_A, 'first-message', {
        ...body,
        clientEventId: '00000000-0000-4000-8000-000000000209',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('serializes concurrent owner attempts and accepts only one completion', async () => {
    const base = {
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'source',
      report: REPORT,
    };
    const [one, two] = await Promise.all([
      service.submit(USER_A, 'first-message', {
        ...base,
        clientEventId: '00000000-0000-4000-8000-000000000205',
      }),
      service.submit(USER_A, 'first-message', {
        ...base,
        clientEventId: '00000000-0000-4000-8000-000000000206',
      }),
    ]);
    expect([one.attemptCount, two.attemptCount].sort()).toEqual([1, 2]);
    expect(Number(one.accepted) + Number(two.accepted)).toBe(1);
    expect((await service.history(USER_A, 'first-message')).attemptCount).toBe(
      2,
    );
  });

  it('denies unpublished quests and missing prerequisites', async () => {
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000207',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'source',
      report: REPORT,
    };
    await expect(
      service.submit(USER_A, 'unpublished', body),
    ).rejects.toMatchObject({ status: 404 });
    const catalog = loadCurriculumCatalog(root);
    const journey = catalog.journeys[0];
    const chapter = journey.chapters[0];
    const quest = chapter.quests[0];
    const withPrerequisite = {
      ...catalog,
      journeys: [
        {
          ...journey,
          chapters: [
            {
              ...chapter,
              quests: [
                {
                  ...quest,
                  activeSnapshot: {
                    ...quest.activeSnapshot,
                    metadata: {
                      ...quest.activeSnapshot.metadata,
                      prerequisiteQuestIds: ['Q-PREV'],
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    const database = drizzle(client);
    const module = await Test.createTestingModule({
      providers: [
        LearningService,
        { provide: DatabaseConnectionService, useValue: { database } },
        { provide: CURRICULUM_CATALOG, useValue: withPrerequisite },
      ],
    }).compile();
    const guarded = module.get(LearningService);
    await expect(
      guarded.submit(USER_A, 'first-message', body),
    ).rejects.toMatchObject({ status: 409 });
    expect((await service.history(USER_A, 'first-message')).attemptCount).toBe(
      0,
    );
  });
});
