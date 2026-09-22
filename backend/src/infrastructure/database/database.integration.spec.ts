import { PGlite } from '@electric-sql/pglite';
import { SQL } from 'drizzle-orm';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import { resolve } from 'node:path';
import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  orderedStreakActivityDaysQuery,
  questAvailabilityInputsQuery,
  questLearningStatusQuery,
  totalXpQuery,
} from './derived-state-queries';
import { DATABASE_TABLE_NAMES, FORBIDDEN_DERIVED_TABLE_NAMES } from './schema';

interface DatabaseRow {
  readonly [column: string]: unknown;
}

interface TestDatabase {
  readonly engine: 'pglite' | 'postgres-server';
  query(statement: string): Promise<readonly DatabaseRow[]>;
  exec(statement: string): Promise<void>;
  execute(statement: SQL): Promise<unknown>;
  migrateAgain(): Promise<void>;
  close(): Promise<void>;
}

const migrationsFolder = resolve('drizzle');
const USER_A = '00000000-0000-4000-8000-000000000001';
const USER_B = '00000000-0000-4000-8000-000000000002';
const USER_C = '00000000-0000-4000-8000-000000000003';
const USER_D = '00000000-0000-4000-8000-000000000004';
const VERSION_Q1_V1 = '00000000-0000-4000-8000-000000000101';
const VERSION_Q1_V2 = '00000000-0000-4000-8000-000000000102';
const VERSION_Q2_V1 = '00000000-0000-4000-8000-000000000103';
const ATTEMPT_A_Q1 = '00000000-0000-4000-8000-000000000201';
const ATTEMPT_A_Q2 = '00000000-0000-4000-8000-000000000202';
const ATTEMPT_B_Q2 = '00000000-0000-4000-8000-000000000203';
const EVENT_A_Q1 = '00000000-0000-4000-8000-000000000301';
const EVENT_A_Q2 = '00000000-0000-4000-8000-000000000302';
const EVENT_B_Q2 = '00000000-0000-4000-8000-000000000303';

async function createTestDatabase(): Promise<TestDatabase> {
  const serverUrl = process.env.DATABASE_TEST_URL;
  if (serverUrl !== undefined && serverUrl !== '') {
    const client = postgres(serverUrl, {
      max: 1,
      prepare: false,
      onnotice: () => undefined,
    });
    await client.unsafe(
      'drop schema if exists codequest cascade; drop schema if exists drizzle cascade;',
    );
    const database = drizzlePostgres(client);
    await migratePostgres(database, { migrationsFolder });
    return {
      engine: 'postgres-server',
      async query(statement) {
        const rows = await client.unsafe<DatabaseRow[]>(statement);
        return [...rows];
      },
      async exec(statement) {
        await client.unsafe(statement, [], { prepare: false });
      },
      async execute(statement) {
        return database.execute(statement);
      },
      async migrateAgain() {
        await migratePostgres(database, { migrationsFolder });
      },
      async close() {
        await client.end({ timeout: 5 });
      },
    };
  }

  const client = await PGlite.create();
  const database = drizzlePglite(client);
  await migratePglite(database, { migrationsFolder });
  return {
    engine: 'pglite',
    async query(statement) {
      const result = await client.query<DatabaseRow>(statement);
      return result.rows;
    },
    async exec(statement) {
      await client.exec(statement);
    },
    async execute(statement) {
      return database.execute(statement);
    },
    async migrateAgain() {
      await migratePglite(database, { migrationsFolder });
    },
    async close() {
      await client.close();
    },
  };
}

function rowsFromExecution(result: unknown): readonly DatabaseRow[] {
  if (Array.isArray(result)) {
    return result.filter(
      (row): row is DatabaseRow => typeof row === 'object' && row !== null,
    );
  }
  if (
    typeof result === 'object' &&
    result !== null &&
    'rows' in result &&
    Array.isArray(result.rows)
  ) {
    return result.rows.filter(
      (row): row is DatabaseRow => typeof row === 'object' && row !== null,
    );
  }
  throw new Error('Unexpected database result shape');
}

async function expectRejected(
  database: TestDatabase,
  statement: string,
): Promise<void> {
  await expect(database.query(statement)).rejects.toBeDefined();
}

describe('database foundation migrations and relational contract', () => {
  let database: TestDatabase;

  beforeAll(async () => {
    database = await createTestDatabase();
    await database.migrateAgain();
    await database.exec(`
      insert into codequest.users (id) values ('${USER_A}'), ('${USER_B}');
      insert into codequest.profiles (user_id, timezone)
        values ('${USER_A}', 'Asia/Singapore');
      insert into codequest.journeys (id, position) values ('js-foundations', 1);
      insert into codequest.chapters (id, journey_id, position)
        values ('variables', 'js-foundations', 1);
      insert into codequest.quests (id, chapter_id, position)
        values ('q01', 'variables', 1), ('q02', 'variables', 2);
      insert into codequest.concepts (id) values ('variables'), ('state');
      insert into codequest.quest_versions
        (id, quest_id, content_version, assessment_version)
        values
          ('${VERSION_Q1_V1}', 'q01', '1.0.0', '1'),
          ('${VERSION_Q1_V2}', 'q01', '1.1.0', '1'),
          ('${VERSION_Q2_V1}', 'q02', '1.0.0', '1');
    `);
  }, 30_000);

  afterAll(async () => {
    await database.close();
  });

  it('applies and reapplies migrations with the exact bounded table inventory', async () => {
    const tableRows = await database.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'codequest' and table_type = 'BASE TABLE'
      order by table_name;
    `);
    const tableNames = tableRows.map((row) => row.table_name);
    const expectedNames = [...DATABASE_TABLE_NAMES].sort();

    expect(tableNames).toEqual(expectedNames);
    expect(
      tableNames.filter((name) =>
        new Set<string>(FORBIDDEN_DERIVED_TABLE_NAMES).has(String(name)),
      ),
    ).toEqual([]);

    const timestampRows = await database.query(`
      select data_type
      from information_schema.columns
      where table_schema = 'codequest'
        and table_name = 'quest_completions'
        and column_name = 'accepted_at';
    `);
    expect(timestampRows).toEqual([{ data_type: 'timestamp with time zone' }]);

    const indexRows = await database.query(`
      select indexname
      from pg_indexes
      where schemaname = 'codequest';
    `);
    const indexNames = indexRows.map((row) => row.indexname);
    expect(indexNames).toContain('quest_attempts_owner_time_idx');
    expect(indexNames).toContain('quest_completions_owner_time_idx');
    expect(indexNames).toContain('xp_events_owner_time_idx');
  });

  it('enforces hierarchy, version, concept, and prerequisite integrity', async () => {
    await expectRejected(
      database,
      `insert into codequest.profiles (user_id) values
        ('00000000-0000-4000-8000-000000000099');`,
    );
    await expectRejected(
      database,
      `insert into codequest.profiles (user_id) values ('${USER_A}');`,
    );
    await expectRejected(
      database,
      `insert into codequest.chapters (id, journey_id, position)
        values ('duplicate-position', 'js-foundations', 1);`,
    );
    await expectRejected(
      database,
      `insert into codequest.quests (id, chapter_id, position)
        values ('duplicate-quest-position', 'variables', 2);`,
    );
    await database.exec(`
      insert into codequest.quest_concepts (quest_id, concept_id)
        values ('q01', 'variables'), ('q01', 'state');
      insert into codequest.quest_prerequisites (quest_id, prerequisite_quest_id)
        values ('q02', 'q01');
      insert into codequest.quest_version_compatibility
        (quest_id, from_version_id, to_version_id)
        values ('q01', '${VERSION_Q1_V1}', '${VERSION_Q1_V2}');
    `);
    await expectRejected(
      database,
      `insert into codequest.quest_prerequisites (quest_id, prerequisite_quest_id)
        values ('q01', 'q01');`,
    );
    await expectRejected(
      database,
      `insert into codequest.quest_version_compatibility
        (quest_id, from_version_id, to_version_id)
        values ('q01', '${VERSION_Q1_V1}', '${VERSION_Q1_V1}');`,
    );
    await expectRejected(
      database,
      `insert into codequest.quest_version_compatibility
        (quest_id, from_version_id, to_version_id)
        values ('q01', '${VERSION_Q1_V1}', '${VERSION_Q2_V1}');`,
    );
  });

  it('enforces owned idempotent learning, completion, and reward facts', async () => {
    await database.exec(`
      insert into codequest.journey_enrollments (user_id, journey_id)
        values ('${USER_A}', 'js-foundations');
      insert into codequest.quest_starts (user_id, quest_id, quest_version_id)
        values ('${USER_A}', 'q01', '${VERSION_Q1_V1}');
      insert into codequest.quest_attempts
        (id, user_id, quest_id, quest_version_id, client_event_id)
        values
          ('${ATTEMPT_A_Q1}', '${USER_A}', 'q01', '${VERSION_Q1_V1}', '${EVENT_A_Q1}'),
          ('${ATTEMPT_A_Q2}', '${USER_A}', 'q02', '${VERSION_Q2_V1}', '${EVENT_A_Q2}'),
          ('${ATTEMPT_B_Q2}', '${USER_B}', 'q02', '${VERSION_Q2_V1}', '${EVENT_B_Q2}');
      insert into codequest.quest_submissions
        (attempt_id, source, reported_result, explanation)
        values ('${ATTEMPT_A_Q1}', 'const answer = 42;', '{"passed":true}', '{"reason":"bounded"}');
    `);

    await expectRejected(
      database,
      `insert into codequest.journey_enrollments (user_id, journey_id)
        values ('${USER_A}', 'js-foundations');`,
    );
    await expectRejected(
      database,
      `insert into codequest.quest_starts (user_id, quest_id, quest_version_id)
        values ('${USER_A}', 'q01', '${VERSION_Q1_V1}');`,
    );
    await expectRejected(
      database,
      `insert into codequest.quest_attempts
        (user_id, quest_id, quest_version_id, client_event_id)
        values ('${USER_A}', 'q01', '${VERSION_Q1_V1}', '${EVENT_A_Q1}');`,
    );
    await expectRejected(
      database,
      `insert into codequest.quest_attempts
        (user_id, quest_id, quest_version_id, client_event_id)
        values ('${USER_A}', 'q01', '${VERSION_Q2_V1}',
          '00000000-0000-4000-8000-000000000399');`,
    );
    await expectRejected(
      database,
      `insert into codequest.quest_submissions
        (attempt_id, source, reported_result)
        values ('00000000-0000-4000-8000-000000000299', 'source', '{}');`,
    );
    await expectRejected(
      database,
      `insert into codequest.quest_completions
        (user_id, quest_id, accepted_attempt_id)
        values ('${USER_A}', 'q02', '${ATTEMPT_B_Q2}');`,
    );

    await database.exec(`
      insert into codequest.quest_completions
        (user_id, quest_id, accepted_attempt_id)
        values
          ('${USER_A}', 'q01', '${ATTEMPT_A_Q1}'),
          ('${USER_A}', 'q02', '${ATTEMPT_A_Q2}');
      insert into codequest.xp_events (user_id, quest_id, amount)
        values ('${USER_A}', 'q01', 10), ('${USER_A}', 'q02', 15);
      insert into codequest.streak_activity_days
        (user_id, activity_date, timezone, qualifying_quest_id)
        values
          ('${USER_A}', '2026-09-21', 'Asia/Singapore', 'q01'),
          ('${USER_A}', '2026-09-22', 'Asia/Singapore', 'q02');
    `);

    await expectRejected(
      database,
      `insert into codequest.quest_completions
        (user_id, quest_id, accepted_attempt_id)
        values ('${USER_A}', 'q01', '${ATTEMPT_A_Q1}');`,
    );
    await expectRejected(
      database,
      `insert into codequest.xp_events (user_id, quest_id, amount)
        values ('${USER_A}', 'q01', 10);`,
    );
    await expectRejected(
      database,
      `insert into codequest.streak_activity_days
        (user_id, activity_date, timezone, qualifying_quest_id)
        values ('${USER_B}', '2026-09-21', 'UTC', 'q01');`,
    );

    const totalXp = rowsFromExecution(
      await database.execute(totalXpQuery(USER_A)),
    );
    expect(totalXp).toEqual([{ total_xp: 25 }]);

    const learningStatus = rowsFromExecution(
      await database.execute(questLearningStatusQuery(USER_A, 'q01')),
    );
    expect(learningStatus).toEqual([{ learning_status: 'completed' }]);

    const availability = rowsFromExecution(
      await database.execute(questAvailabilityInputsQuery(USER_A, 'q02')),
    );
    expect(availability).toEqual([
      { prerequisite_quest_id: 'q01', completed: true },
    ]);

    const activityDays = rowsFromExecution(
      await database.execute(orderedStreakActivityDaysQuery(USER_A)),
    );
    expect(activityDays).toEqual([
      { activity_date: '2026-09-21', timezone: 'Asia/Singapore' },
      { activity_date: '2026-09-22', timezone: 'Asia/Singapore' },
    ]);
  });

  it('cascades private learner data and restricts referenced curriculum deletion', async () => {
    await expectRejected(
      database,
      `delete from codequest.quest_versions where id = '${VERSION_Q1_V1}';`,
    );
    await expectRejected(
      database,
      "delete from codequest.quests where id = 'q01';",
    );

    await database.exec(`delete from codequest.users where id = '${USER_A}';`);
    const ownedCounts = await database.query(`
      select
        (select count(*)::integer from codequest.profiles where user_id = '${USER_A}') as profiles,
        (select count(*)::integer from codequest.quest_attempts where user_id = '${USER_A}') as attempts,
        (select count(*)::integer from codequest.quest_completions where user_id = '${USER_A}') as completions,
        (select count(*)::integer from codequest.xp_events where user_id = '${USER_A}') as xp_events,
        (select count(*)::integer from codequest.streak_activity_days where user_id = '${USER_A}') as activity_days;
    `);
    expect(ownedCounts).toEqual([
      {
        profiles: 0,
        attempts: 0,
        completions: 0,
        xp_events: 0,
        activity_days: 0,
      },
    ]);

    expect(database.engine).toBe(
      process.env.DATABASE_TEST_URL === undefined
        ? 'pglite'
        : 'postgres-server',
    );
  });

  it('supports idempotent account establishment from the verified subject UUID', async () => {
    await database.exec(
      `insert into codequest.users (id) values ('${USER_C}');`,
    );
    const establish = () =>
      database.exec(`
        insert into codequest.users (id) values ('${USER_C}') on conflict do nothing;
        insert into codequest.profiles (user_id) values ('${USER_C}') on conflict do nothing;
      `);
    await Promise.all([establish(), establish()]);
    expect(
      await database.query(`
        select users.id, profiles.timezone
        from codequest.users
        inner join codequest.profiles on profiles.user_id = users.id
        where users.id = '${USER_C}';
      `),
    ).toEqual([{ id: USER_C, timezone: 'UTC' }]);
    expect(
      await database.query(`
        select count(*)::integer as count
        from codequest.profiles where user_id = '${USER_A}';
      `),
    ).toEqual([{ count: 0 }]);

    await expectRejected(
      database,
      `begin;
       insert into codequest.users (id) values ('${USER_D}');
       insert into codequest.profiles (user_id, timezone) values ('${USER_D}', '');
       commit;`,
    );
    await database.exec('rollback;');
    expect(
      await database.query(
        `select count(*)::integer as count from codequest.users where id = '${USER_D}';`,
      ),
    ).toEqual([{ count: 0 }]);
  });
});
