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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseConnectionService } from '../../infrastructure/database/database-connection';
import {
  CURRICULUM_CATALOG,
  loadCurriculumCatalog,
} from '../curriculum/content/curriculum-catalog';
import { LearningService } from './learning.service';
import { XpService } from '../gamification/xp.service';
import { localDate } from '../gamification/streak-policy';
import { StreakService } from '../gamification/streak.service';
import {
  AnalyticsService,
  type AnalyticsFact,
} from '../analytics/analytics.service';

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

describe('authoritative attempt persistence', () => {
  let client: PGlite;
  let service: LearningService;
  let xp: XpService;
  let streaks: StreakService;
  let root: string;
  let analyticsFacts: AnalyticsFact[];

  beforeEach(async () => {
    analyticsFacts = [];
    root = contentFixture();
    client = await PGlite.create();
    const database = drizzle(client);
    await migrate(database, { migrationsFolder: resolve('drizzle') });
    const module = await Test.createTestingModule({
      providers: [
        LearningService,
        XpService,
        StreakService,
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
    service = module.get(LearningService);
    xp = module.get(XpService);
    streaks = module.get(StreakService);
  }, 45_000);

  afterEach(async () => {
    await client.close();
    rmSync(root, { recursive: true, force: true });
  });

  it('requires private capstone responses, settles replay and awards only once', async () => {
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
          explanationPrompt: 'Explain the defect',
          transferPrompt: 'Explain transfer',
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
        LearningService,
        {
          provide: AnalyticsService,
          useValue: {
            capture: async (fact: AnalyticsFact) => {
              analyticsFacts.push(fact);
            },
          },
        },
        {
          provide: DatabaseConnectionService,
          useValue: { database: drizzle(client) },
        },
        { provide: CURRICULUM_CATALOG, useValue: capstoneCatalog },
      ],
    }).compile();
    const capstones = module.get(LearningService);
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000301',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'private project',
      report: REPORT,
    };
    await expect(
      capstones.submit(USER_A, 'inventory-manager', body),
    ).rejects.toMatchObject({ status: 400 });
    expect(
      (await client.query('select * from codequest.quest_attempts')).rows,
    ).toHaveLength(0);
    const responses = {
      explanation: 'Empty records expose first-item access.',
      transfer: 'An inclusive threshold includes equal and zero counts.',
    };
    const complete = {
      ...body,
      report: { ...REPORT, capstoneResponses: responses },
    };
    await expect(
      capstones.submit(USER_A, 'inventory-manager', complete),
    ).rejects.toMatchObject({ status: 409 });
    await service.submit(USER_A, 'first-message', {
      ...body,
      clientEventId: '00000000-0000-4000-8000-000000000302',
    });
    const accepted = await capstones.submit(
      USER_A,
      'inventory-manager',
      complete,
    );
    expect(accepted.accepted).toBe(true);
    expect(
      analyticsFacts.filter((fact) => fact.name === 'capstone_completed'),
    ).toEqual([
      {
        name: 'capstone_completed',
        ownerId: USER_A,
        factId: accepted.id,
        occurredAt: new Date(accepted.submittedAt),
        properties: {
          quest_id: 'CAP01',
          chapter_id: chapter.metadata.id,
          content_version: '1.0.0',
          assessment_version: '1.0.0',
        },
      },
    ]);
    expect(accepted.report.capstoneResponses).toEqual(responses);
    expect(await capstones.replay(USER_A, 'CAP01', complete)).toEqual(accepted);
    await expect(
      capstones.replay(USER_A, 'CAP01', {
        ...complete,
        report: {
          ...complete.report,
          capstoneResponses: { ...responses, transfer: 'Changed answer' },
        },
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(
      (
        await capstones.submit(USER_A, 'inventory-manager', {
          ...complete,
          clientEventId: '00000000-0000-4000-8000-000000000303',
        })
      ).accepted,
    ).toBe(false);
    expect(
      (await capstones.history(USER_A, 'inventory-manager')).attempts[0].report
        .capstoneResponses,
    ).toEqual(responses);
    expect(
      (await capstones.history(USER_B, 'inventory-manager')).attemptCount,
    ).toBe(0);
    expect(
      (await client.query('select * from codequest.quest_attempts')).rows,
    ).toHaveLength(3);
    expect(
      (await client.query('select * from codequest.quest_completions')).rows,
    ).toHaveLength(2);
    expect((await xp.total(USER_A)).totalXp).toBe(20);
    expect(
      (await client.query('select * from codequest.streak_activity_days')).rows,
    ).toHaveLength(1);
    await expect(
      service.submit(USER_A, 'first-message', {
        ...complete,
        clientEventId: '00000000-0000-4000-8000-000000000304',
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('replays stable events after retirement without rewards or backdated streaks', async () => {
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000290',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'saved offline source',
      report: REPORT,
    };
    const accepted = await service.replay(USER_A, 'Q01', body);
    const module = await Test.createTestingModule({
      providers: [
        LearningService,
        {
          provide: DatabaseConnectionService,
          useValue: { database: drizzle(client) },
        },
        {
          provide: CURRICULUM_CATALOG,
          useValue: { ...loadCurriculumCatalog(root), journeys: [] },
        },
      ],
    }).compile();
    const retired = module.get(LearningService);
    expect(await retired.replay(USER_A, 'Q01', body)).toEqual(accepted);
    await expect(
      retired.replay(USER_A, 'Q01', { ...body, source: 'altered' }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(retired.replay(USER_A, 'Q02', body)).rejects.toMatchObject({
      status: 409,
    });
    await expect(retired.replay(USER_B, 'Q01', body)).rejects.toMatchObject({
      status: 404,
    });
    await expect(
      retired.replay(USER_A, 'Q01', {
        ...body,
        clientEventId: '00000000-0000-4000-8000-000000000291',
      }),
    ).rejects.toMatchObject({ status: 404 });
    expect(
      (await client.query('select * from codequest.quest_attempts')).rows,
    ).toHaveLength(1);
    expect(
      (await client.query('select * from codequest.xp_events')).rows,
    ).toHaveLength(1);
    const days = await client.query<{ accepted_at: Date }>(
      'select accepted_at from codequest.streak_activity_days',
    );
    expect(days.rows).toHaveLength(1);
    expect(days.rows[0].accepted_at.toISOString()).toBe(accepted.submittedAt);
  });

  it('settles duplicate device events and new practice events by stable identity', async () => {
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000292',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'source',
      report: REPORT,
    };
    const first = await service.replay(USER_A, 'Q01', body);
    expect(await service.replay(USER_A, 'Q01', body)).toEqual(first);
    expect(
      await service.replay(USER_A, 'Q01', {
        ...body,
        clientEventId: '00000000-0000-4000-8000-000000000293',
      }),
    ).toMatchObject({ accepted: false, attemptCount: 2 });
    await expect(
      service.replay(USER_A, 'Q01', {
        ...body,
        clientEventId: '00000000-0000-4000-8000-000000000294',
        assessmentVersion: '2.0.0',
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(
      (await client.query('select * from codequest.xp_events')).rows,
    ).toHaveLength(1);
    expect(
      (await client.query('select * from codequest.streak_activity_days')).rows,
    ).toHaveLength(1);
  });

  it('emits only committed owner facts with stable IDs across replay and practice', async () => {
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000401',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'private source never sent to analytics',
      report: REPORT,
    };
    const first = await service.submit(USER_A, 'first-message', body);
    expect(first.accepted).toBe(true);
    expect(analyticsFacts.map((fact) => fact.name)).toEqual([
      'quest_attempted',
      'quest_completed',
      'first_quest_completed',
    ]);
    expect(new Set(analyticsFacts.map((fact) => fact.factId))).toEqual(
      new Set([first.id]),
    );
    expect(JSON.stringify(analyticsFacts)).not.toContain(body.source);
    expect(JSON.stringify(analyticsFacts)).not.toContain(REPORT.feedback);
    await service.submit(USER_A, 'first-message', body);
    expect(analyticsFacts).toHaveLength(3);
    await service.submit(USER_A, 'first-message', {
      ...body,
      clientEventId: '00000000-0000-4000-8000-000000000402',
    });
    expect(analyticsFacts.map((fact) => fact.name)).toEqual([
      'quest_attempted',
      'quest_completed',
      'first_quest_completed',
      'quest_attempted',
    ]);
    const failed = {
      ...REPORT,
      passed: false,
      cases: [REPORT.cases[0], { ...REPORT.cases[1], status: 'failed' }],
      failedCaseIds: ['boundary-exact-output'],
      feedback: 'Private failure',
    };
    await service.submit(USER_B, 'first-message', {
      ...body,
      clientEventId: '00000000-0000-4000-8000-000000000403',
      report: failed,
    });
    expect(analyticsFacts.slice(-2).map((fact) => fact.name)).toEqual([
      'quest_attempted',
      'quest_failed',
    ]);
    expect(analyticsFacts.at(-1)?.ownerId).toBe(USER_B);
    expect(JSON.stringify(analyticsFacts)).not.toContain('Private failure');
    await expect(
      service.submit(USER_B, 'first-message', {
        ...body,
        clientEventId: '00000000-0000-4000-8000-000000000404',
        contentVersion: '9.9.9',
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(analyticsFacts).toHaveLength(6);
  });

  it('emits a continued streak only for a newly credited next day', async () => {
    const firstBody = {
      clientEventId: '00000000-0000-4000-8000-000000000601',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'first fixture',
      report: REPORT,
    };
    await service.submit(USER_A, 'first-message', firstBody);
    const yesterday = new Date(Date.now() - 86_400_000);
    await client.query(
      'update codequest.streak_activity_days set activity_date = $1, accepted_at = $2 where user_id = $3',
      [yesterday.toISOString().slice(0, 10), yesterday.toISOString(), USER_A],
    );
    const catalog = loadCurriculumCatalog(root);
    const chapter = catalog.journeys[0].chapters[0];
    const base = chapter.quests[0];
    const second = {
      ...base,
      metadata: {
        ...base.metadata,
        id: 'Q02',
        slug: 'second-message',
        position: 2,
      },
      activeSnapshot: {
        ...base.activeSnapshot,
        metadata: {
          ...base.activeSnapshot.metadata,
          prerequisiteQuestIds: ['Q01'],
        },
      },
    };
    const secondCatalog = {
      ...catalog,
      journeys: [
        {
          ...catalog.journeys[0],
          chapters: [{ ...chapter, quests: [...chapter.quests, second] }],
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
        { provide: CURRICULUM_CATALOG, useValue: secondCatalog },
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
    const secondService = module.get(LearningService);
    const body = {
      ...firstBody,
      clientEventId: '00000000-0000-4000-8000-000000000602',
    };
    const accepted = await secondService.submit(USER_A, 'second-message', body);
    expect(accepted.accepted).toBe(true);
    expect(
      analyticsFacts.filter((fact) => fact.name === 'streak_continued'),
    ).toEqual([
      expect.objectContaining({ ownerId: USER_A, factId: accepted.id }),
    ]);
    expect(await secondService.submit(USER_A, 'second-message', body)).toEqual(
      accepted,
    );
    expect(
      analyticsFacts.filter((fact) => fact.name === 'streak_continued'),
    ).toHaveLength(1);
    expect(
      (await client.query('select * from codequest.streak_activity_days')).rows,
    ).toHaveLength(2);
  });

  it('keeps accepted facts when the analytics provider fails', async () => {
    const transport = vi.fn().mockRejectedValue(new Error('fixture outage'));
    const module = await Test.createTestingModule({
      providers: [
        LearningService,
        {
          provide: DatabaseConnectionService,
          useValue: { database: drizzle(client) },
        },
        { provide: CURRICULUM_CATALOG, useValue: loadCurriculumCatalog(root) },
        {
          provide: AnalyticsService,
          useValue: new AnalyticsService(
            {
              approved: 'true',
              projectKey: 'local_fixture_key',
              host: 'https://capture.example.test',
            },
            transport,
          ),
        },
      ],
    }).compile();
    const failingAnalytics = module.get(LearningService);
    const accepted = await failingAnalytics.submit(USER_A, 'first-message', {
      clientEventId: '00000000-0000-4000-8000-000000000603',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'private fixture',
      report: REPORT,
    });
    expect(accepted.accepted).toBe(true);
    expect(transport).toHaveBeenCalled();
    expect(
      (await client.query('select * from codequest.quest_completions')).rows,
    ).toHaveLength(1);
    expect(
      (await client.query('select * from codequest.xp_events')).rows,
    ).toHaveLength(1);
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
    const initialAwards = await client.query<{
      user_id: string;
      quest_id: string;
      source_type: string;
      source_id: string;
      amount: number;
    }>(
      'select user_id, quest_id, source_type, source_id, amount from codequest.xp_events',
    );
    expect(initialAwards.rows).toEqual([
      {
        user_id: USER_A,
        quest_id: 'Q01',
        source_type: 'quest_completion',
        source_id: 'Q01',
        amount: 10,
      },
    ]);
    const days = await client.query<{
      user_id: string;
      activity_date: Date;
      timezone: string;
      accepted_at: Date;
    }>(
      'select user_id, activity_date, timezone, accepted_at from codequest.streak_activity_days',
    );
    expect(days.rows).toHaveLength(1);
    expect(days.rows[0].user_id).toBe(USER_A);
    expect(days.rows[0].timezone).toBe('UTC');
    expect(days.rows[0].activity_date.toISOString().slice(0, 10)).toBe(
      first.submittedAt.slice(0, 10),
    );
    expect(
      await streaks.current(USER_A, new Date(first.submittedAt)),
    ).toMatchObject({
      currentStreak: 1,
      longestStreak: 1,
      timezone: 'UTC',
      clientReported: true,
    });
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
    const repeat = await service.submit(USER_A, 'first-message', {
      ...body,
      clientEventId: '00000000-0000-4000-8000-000000000210',
    });
    expect(repeat.accepted).toBe(false);
    expect(
      (await client.query('select id from codequest.xp_events')).rows,
    ).toHaveLength(1);
    expect(
      (await client.query('select * from codequest.streak_activity_days')).rows,
    ).toHaveLength(1);
    expect(
      (await service.history(USER_A, 'first-message')).attempts.map(
        (attempt) => attempt.source,
      ),
    ).toEqual([body.source, body.source, body.source]);
    expect(await service.history(USER_B, 'first-message')).toEqual({
      attemptCount: 0,
      attempts: [],
    });
    await expect(streaks.current(USER_B)).rejects.toMatchObject({
      status: 404,
    });
  });

  it('imports only the published guest stable ID through normal acceptance and replay', async () => {
    const body = {
      clientEventId: '00000000-0000-4000-8000-000000000299',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: "console.log('guest')",
      report: REPORT,
    };
    await expect(
      service.importGuest(USER_A, 'Q02', body),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      service.importGuest(USER_A, 'Q05', body),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      service.importGuest(USER_A, 'Q01', {
        ...body,
        assessmentVersion: '0.9.0',
      }),
    ).rejects.toMatchObject({ status: 409 });
    const first = await service.importGuest(USER_A, 'Q01', body);
    expect(first).toMatchObject({
      questId: 'Q01',
      accepted: true,
      attemptCount: 1,
    });
    expect(await service.importGuest(USER_A, 'Q01', body)).toEqual(first);
    expect(
      (await client.query('select id from codequest.xp_events')).rows,
    ).toHaveLength(1);
    expect(
      (await client.query('select user_id from codequest.streak_activity_days'))
        .rows,
    ).toHaveLength(1);
    const repeat = await service.importGuest(USER_A, 'Q01', {
      ...body,
      clientEventId: '00000000-0000-4000-8000-000000000298',
    });
    expect(repeat.accepted).toBe(false);
    expect(
      (await client.query('select id from codequest.xp_events')).rows,
    ).toHaveLength(1);
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
    expect(
      (await client.query('select id from codequest.xp_events')).rows,
    ).toHaveLength(1);
  });

  it('uses a configured timezone and the backend acceptance instant', async () => {
    await client.exec(`insert into codequest.users (id) values ('${USER_A}');
      insert into codequest.profiles (user_id, timezone) values ('${USER_A}', 'Asia/Manila');`);
    const result = await service.submit(USER_A, 'first-message', {
      clientEventId: '00000000-0000-4000-8000-000000000270',
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'source',
      report: REPORT,
    });
    const days = await client.query<{ activity_date: Date; timezone: string }>(
      'select activity_date, timezone from codequest.streak_activity_days',
    );
    expect(days.rows).toEqual([
      {
        activity_date: new Date(
          `${localDate(new Date(result.submittedAt), 'Asia/Manila')}T00:00:00.000Z`,
        ),
        timezone: 'Asia/Manila',
      },
    ]);
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
    expect(await xp.total(USER_A)).toMatchObject({
      totalXp: 10,
      clientReported: true,
      level: 1,
      xpIntoLevel: 10,
    });
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
    expect(
      (await client.query('select id from codequest.xp_events')).rows,
    ).toHaveLength(1);
    expect((await service.history(USER_A, 'first-message')).attemptCount).toBe(
      2,
    );
  });

  it('rolls back completion and attempt if its XP award cannot commit', async () => {
    await client.exec(`
      create function codequest.reject_xp() returns trigger language plpgsql as $$
      begin raise exception 'award rejected'; end $$;
      create trigger reject_xp before insert on codequest.xp_events
      for each row execute function codequest.reject_xp();
    `);
    await expect(
      service.submit(USER_A, 'first-message', {
        clientEventId: '00000000-0000-4000-8000-000000000211',
        contentVersion: '1.0.0',
        assessmentVersion: '1.0.0',
        source: 'source',
        report: REPORT,
      }),
    ).rejects.toThrow('Failed query');
    expect(
      (await client.query('select id from codequest.quest_attempts')).rows,
    ).toHaveLength(0);
    expect(
      (await client.query('select quest_id from codequest.quest_completions'))
        .rows,
    ).toHaveLength(0);
  });

  it('rolls back completion and XP when the qualifying day cannot commit', async () => {
    await client.exec(`
      create function codequest.reject_streak_day() returns trigger language plpgsql as $$
      begin raise exception 'day rejected'; end $$;
      create trigger reject_streak_day before insert on codequest.streak_activity_days
      for each row execute function codequest.reject_streak_day();
    `);
    await expect(
      service.submit(USER_A, 'first-message', {
        clientEventId: '00000000-0000-4000-8000-000000000271',
        contentVersion: '1.0.0',
        assessmentVersion: '1.0.0',
        source: 'source',
        report: REPORT,
      }),
    ).rejects.toThrow('Failed query');
    expect(
      (await client.query('select id from codequest.quest_attempts')).rows,
    ).toHaveLength(0);
    expect(
      (await client.query('select id from codequest.xp_events')).rows,
    ).toHaveLength(0);
  });

  it('keeps distinct owners and rejects a duplicate reward source', async () => {
    const body = {
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      source: 'source',
      report: REPORT,
    };
    await service.submit(USER_A, 'first-message', {
      ...body,
      clientEventId: '00000000-0000-4000-8000-000000000212',
    });
    await service.submit(USER_B, 'first-message', {
      ...body,
      clientEventId: '00000000-0000-4000-8000-000000000213',
    });
    expect(
      (await client.query('select id from codequest.xp_events')).rows,
    ).toHaveLength(2);
    expect(await xp.total(USER_A)).toMatchObject({
      totalXp: 10,
      clientReported: true,
    });
    expect(await xp.total(USER_B)).toMatchObject({
      totalXp: 10,
      clientReported: true,
    });
    expect(await streaks.current(USER_A)).toMatchObject({
      currentStreak: 1,
      longestStreak: 1,
    });
    expect(await streaks.current(USER_B)).toMatchObject({
      currentStreak: 1,
      longestStreak: 1,
    });
    expect(
      (await client.query('select * from codequest.streak_activity_days')).rows,
    ).toHaveLength(2);
    expect(
      await xp.total('00000000-0000-4000-8000-000000000003'),
    ).toMatchObject({
      totalXp: 0,
      clientReported: true,
      level: 1,
      xpToNextLevel: 100,
    });
    await client.exec(`
      insert into codequest.quests (id, chapter_id, position) values ('Q02', 'CH01', 2);
      insert into codequest.quest_versions (quest_id, content_version, assessment_version)
      values ('Q02', '1.0.0', '1.0.0');
      insert into codequest.quest_attempts (user_id, quest_id, quest_version_id, client_event_id)
      select '${USER_A}', 'Q02', id, '00000000-0000-4000-8000-000000000214'
      from codequest.quest_versions where quest_id = 'Q02';
      insert into codequest.quest_completions (user_id, quest_id, accepted_attempt_id)
      select '${USER_A}', 'Q02', id from codequest.quest_attempts where quest_id = 'Q02';
      insert into codequest.xp_events (user_id, quest_id, source_type, source_id, amount)
      values ('${USER_A}', 'Q02', 'quest_completion', 'Q02', 25);
    `);
    expect(await xp.total(USER_A)).toMatchObject({
      totalXp: 35,
      clientReported: true,
      level: 1,
      xpIntoLevel: 35,
      xpToNextLevel: 65,
    });
    expect(await xp.total(USER_B)).toMatchObject({
      totalXp: 10,
      clientReported: true,
    });
    await expect(
      client.query(`
      insert into codequest.xp_events (user_id, quest_id, source_type, source_id, amount)
      values ('${USER_A}', 'Q01', 'quest_completion', 'Q01', 10)
    `),
    ).rejects.toThrow();
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
    await expect(guarded.replay(USER_A, 'Q01', body)).rejects.toMatchObject({
      status: 409,
    });
    expect((await service.history(USER_A, 'first-message')).attemptCount).toBe(
      0,
    );
  });
});
