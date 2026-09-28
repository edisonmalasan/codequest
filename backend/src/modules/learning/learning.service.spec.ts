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
import { XpService } from '../gamification/xp.service';
import { localDate } from '../gamification/streak-policy';
import { StreakService } from '../gamification/streak.service';

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
  let xp: XpService;
  let streaks: StreakService;
  let root: string;

  beforeEach(async () => {
    root = contentFixture();
    client = await PGlite.create();
    const database = drizzle(client);
    await migrate(database, { migrationsFolder: resolve('drizzle') });
    const module = await Test.createTestingModule({
      providers: [
        LearningService,
        XpService,
        StreakService,
        { provide: DatabaseConnectionService, useValue: { database } },
        { provide: CURRICULUM_CATALOG, useValue: loadCurriculumCatalog(root) },
      ],
    }).compile();
    service = module.get(LearningService);
    xp = module.get(XpService);
    streaks = module.get(StreakService);
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
    expect((await service.history(USER_A, 'first-message')).attemptCount).toBe(
      0,
    );
  });
});
