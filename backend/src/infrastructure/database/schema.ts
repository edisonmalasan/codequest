import { sql } from 'drizzle-orm';
import {
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const codequestSchema = pgSchema('codequest');

const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull();

export const users = codequestSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const profiles = codequestSchema.table(
  'profiles',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    timezone: text('timezone').default('UTC').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check('profiles_timezone_nonempty', sql`length(${table.timezone}) > 0`),
  ],
);

export const journeys = codequestSchema.table(
  'journeys',
  {
    id: text('id').primaryKey(),
    position: integer('position').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    unique('journeys_position_unique').on(table.position),
    check('journeys_id_nonempty', sql`length(${table.id}) > 0`),
    check('journeys_position_positive', sql`${table.position} > 0`),
  ],
);

export const chapters = codequestSchema.table(
  'chapters',
  {
    id: text('id').primaryKey(),
    journeyId: text('journey_id')
      .notNull()
      .references(() => journeys.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    position: integer('position').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    unique('chapters_journey_position_unique').on(
      table.journeyId,
      table.position,
    ),
    check('chapters_id_nonempty', sql`length(${table.id}) > 0`),
    check('chapters_position_positive', sql`${table.position} > 0`),
  ],
);

export const quests = codequestSchema.table(
  'quests',
  {
    id: text('id').primaryKey(),
    chapterId: text('chapter_id')
      .notNull()
      .references(() => chapters.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    position: integer('position').notNull(),
    kind: text('kind').default('instructional').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    unique('quests_chapter_position_unique').on(
      table.chapterId,
      table.position,
    ),
    check('quests_id_nonempty', sql`length(${table.id}) > 0`),
    check('quests_position_positive', sql`${table.position} > 0`),
    check(
      'quests_kind_allowed',
      sql`${table.kind} in ('instructional', 'capstone')`,
    ),
  ],
);

export const concepts = codequestSchema.table(
  'concepts',
  {
    id: text('id').primaryKey(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [check('concepts_id_nonempty', sql`length(${table.id}) > 0`)],
);

export const questVersions = codequestSchema.table(
  'quest_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    questId: text('quest_id')
      .notNull()
      .references(() => quests.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    contentVersion: text('content_version').notNull(),
    assessmentVersion: text('assessment_version').notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    unique('quest_versions_quest_content_unique').on(
      table.questId,
      table.contentVersion,
    ),
    unique('quest_versions_id_quest_unique').on(table.id, table.questId),
    check(
      'quest_versions_content_nonempty',
      sql`length(${table.contentVersion}) > 0`,
    ),
    check(
      'quest_versions_assessment_nonempty',
      sql`length(${table.assessmentVersion}) > 0`,
    ),
  ],
);

export const questConcepts = codequestSchema.table(
  'quest_concepts',
  {
    questId: text('quest_id')
      .notNull()
      .references(() => quests.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    conceptId: text('concept_id')
      .notNull()
      .references(() => concepts.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
  },
  (table) => [
    primaryKey({
      name: 'quest_concepts_primary',
      columns: [table.questId, table.conceptId],
    }),
    index('quest_concepts_concept_idx').on(table.conceptId),
  ],
);

export const questPrerequisites = codequestSchema.table(
  'quest_prerequisites',
  {
    questId: text('quest_id')
      .notNull()
      .references(() => quests.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    prerequisiteQuestId: text('prerequisite_quest_id')
      .notNull()
      .references(() => quests.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
  },
  (table) => [
    primaryKey({
      name: 'quest_prerequisites_primary',
      columns: [table.questId, table.prerequisiteQuestId],
    }),
    index('quest_prerequisites_prerequisite_idx').on(table.prerequisiteQuestId),
    check(
      'quest_prerequisites_not_self',
      sql`${table.questId} <> ${table.prerequisiteQuestId}`,
    ),
  ],
);

export const questVersionCompatibility = codequestSchema.table(
  'quest_version_compatibility',
  {
    questId: text('quest_id')
      .notNull()
      .references(() => quests.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    fromVersionId: uuid('from_version_id').notNull(),
    toVersionId: uuid('to_version_id').notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      name: 'quest_version_compatibility_primary',
      columns: [table.fromVersionId, table.toVersionId],
    }),
    foreignKey({
      name: 'quest_version_compatibility_from_fk',
      columns: [table.fromVersionId, table.questId],
      foreignColumns: [questVersions.id, questVersions.questId],
    })
      .onDelete('restrict')
      .onUpdate('cascade'),
    foreignKey({
      name: 'quest_version_compatibility_to_fk',
      columns: [table.toVersionId, table.questId],
      foreignColumns: [questVersions.id, questVersions.questId],
    })
      .onDelete('restrict')
      .onUpdate('cascade'),
    index('quest_version_compatibility_to_idx').on(
      table.toVersionId,
      table.questId,
    ),
    index('quest_version_compatibility_quest_idx').on(table.questId),
    check(
      'quest_version_compatibility_not_self',
      sql`${table.fromVersionId} <> ${table.toVersionId}`,
    ),
  ],
);

export const journeyEnrollments = codequestSchema.table(
  'journey_enrollments',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    journeyId: text('journey_id')
      .notNull()
      .references(() => journeys.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: 'journey_enrollments_primary',
      columns: [table.userId, table.journeyId],
    }),
    index('journey_enrollments_journey_idx').on(table.journeyId),
  ],
);

export const questStarts = codequestSchema.table(
  'quest_starts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    questId: text('quest_id').notNull(),
    questVersionId: uuid('quest_version_id').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: 'quest_starts_primary',
      columns: [table.userId, table.questId],
    }),
    foreignKey({
      name: 'quest_starts_version_fk',
      columns: [table.questVersionId, table.questId],
      foreignColumns: [questVersions.id, questVersions.questId],
    })
      .onDelete('restrict')
      .onUpdate('cascade'),
    index('quest_starts_quest_idx').on(table.questId),
    index('quest_starts_version_idx').on(table.questVersionId, table.questId),
  ],
);

export const questAttempts = codequestSchema.table(
  'quest_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    questId: text('quest_id').notNull(),
    questVersionId: uuid('quest_version_id').notNull(),
    clientEventId: uuid('client_event_id').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('quest_attempts_owner_event_unique').on(
      table.userId,
      table.clientEventId,
    ),
    unique('quest_attempts_id_owner_quest_unique').on(
      table.id,
      table.userId,
      table.questId,
    ),
    foreignKey({
      name: 'quest_attempts_version_fk',
      columns: [table.questVersionId, table.questId],
      foreignColumns: [questVersions.id, questVersions.questId],
    })
      .onDelete('restrict')
      .onUpdate('cascade'),
    index('quest_attempts_owner_time_idx').on(table.userId, table.submittedAt),
    index('quest_attempts_quest_time_idx').on(table.questId, table.submittedAt),
    index('quest_attempts_version_idx').on(table.questVersionId, table.questId),
  ],
);

export const questSubmissions = codequestSchema.table('quest_submissions', {
  attemptId: uuid('attempt_id')
    .primaryKey()
    .references(() => questAttempts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  source: text('source').notNull(),
  reportedResult: jsonb('reported_result').notNull(),
  explanation: jsonb('explanation'),
  createdAt: createdAt(),
});

export const questCompletions = codequestSchema.table(
  'quest_completions',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    questId: text('quest_id')
      .notNull()
      .references(() => quests.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    acceptedAttemptId: uuid('accepted_attempt_id').notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: 'quest_completions_primary',
      columns: [table.userId, table.questId],
    }),
    unique('quest_completions_attempt_unique').on(table.acceptedAttemptId),
    foreignKey({
      name: 'quest_completions_attempt_owner_quest_fk',
      columns: [table.acceptedAttemptId, table.userId, table.questId],
      foreignColumns: [
        questAttempts.id,
        questAttempts.userId,
        questAttempts.questId,
      ],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('quest_completions_quest_idx').on(table.questId),
    index('quest_completions_owner_time_idx').on(
      table.userId,
      table.acceptedAt,
    ),
  ],
);

export const xpEvents = codequestSchema.table(
  'xp_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    questId: text('quest_id').notNull(),
    amount: integer('amount').notNull(),
    awardedAt: timestamp('awarded_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('xp_events_owner_quest_unique').on(table.userId, table.questId),
    foreignKey({
      name: 'xp_events_completion_fk',
      columns: [table.userId, table.questId],
      foreignColumns: [questCompletions.userId, questCompletions.questId],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('xp_events_quest_idx').on(table.questId),
    index('xp_events_owner_time_idx').on(table.userId, table.awardedAt),
    check('xp_events_amount_positive', sql`${table.amount} > 0`),
  ],
);

export const streakActivityDays = codequestSchema.table(
  'streak_activity_days',
  {
    userId: uuid('user_id').notNull(),
    activityDate: date('activity_date', { mode: 'string' }).notNull(),
    timezone: text('timezone').notNull(),
    qualifyingQuestId: text('qualifying_quest_id').notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: 'streak_activity_days_primary',
      columns: [table.userId, table.activityDate],
    }),
    unique('streak_activity_days_completion_unique').on(
      table.userId,
      table.qualifyingQuestId,
    ),
    foreignKey({
      name: 'streak_activity_days_completion_fk',
      columns: [table.userId, table.qualifyingQuestId],
      foreignColumns: [questCompletions.userId, questCompletions.questId],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    index('streak_activity_days_quest_idx').on(table.qualifyingQuestId),
    check(
      'streak_activity_days_timezone_nonempty',
      sql`length(${table.timezone}) > 0`,
    ),
  ],
);

export const databaseSchema = {
  users,
  profiles,
  journeys,
  chapters,
  quests,
  concepts,
  questVersions,
  questConcepts,
  questPrerequisites,
  questVersionCompatibility,
  journeyEnrollments,
  questStarts,
  questAttempts,
  questSubmissions,
  questCompletions,
  xpEvents,
  streakActivityDays,
} as const;

export const DATABASE_TABLE_NAMES = Object.freeze([
  'users',
  'profiles',
  'journeys',
  'chapters',
  'quests',
  'concepts',
  'quest_versions',
  'quest_concepts',
  'quest_prerequisites',
  'quest_version_compatibility',
  'journey_enrollments',
  'quest_starts',
  'quest_attempts',
  'quest_submissions',
  'quest_completions',
  'xp_events',
  'streak_activity_days',
] as const);

export const FORBIDDEN_DERIVED_TABLE_NAMES = Object.freeze([
  'courses',
  'quest_progress',
  'chapter_progress',
  'journey_progress',
  'concept_progress',
  'levels',
  'unlocks',
  'streaks',
  'achievements',
  'user_achievements',
  'analytics',
  'drafts',
  'projects',
] as const);
