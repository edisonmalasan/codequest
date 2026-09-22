# database-foundation Specification

## Purpose

Defines CodeQuest's authoritative backend-owned PostgreSQL persistence boundary, migration discipline, relational integrity, ownership guarantees, and durable foundational domain facts.

## Requirements

### Requirement: Application persistence is backend-owned PostgreSQL

The system SHALL persist CodeQuest application records in PostgreSQL through the NestJS backend's data-access boundary. The schema SHALL be compatible with Supabase-hosted PostgreSQL, SHALL NOT grant the frontend direct application-table access, and SHALL keep database credentials and privileged connection details outside source, client bundles, logs, and learner-controlled data.

#### Scenario: Browser cannot become a database client

- **WHEN** the database foundation is reviewed
- **THEN** application tables have no frontend integration or anonymous/authenticated browser grant, and only backend-owned persistence code is able to consume the connection configuration

### Requirement: Migrations are reproducible and immutable after application

The backend SHALL define its schema through ordered, committed migrations generated from the reviewed Drizzle schema. A fresh supported PostgreSQL database SHALL migrate deterministically to the current schema, repeated application SHALL be safe, and an already-applied migration SHALL never be edited to change deployed history.

#### Scenario: Empty database reaches the current schema

- **WHEN** the committed migration command runs against an empty supported PostgreSQL database
- **THEN** all application relations, constraints, and indexes are created in order and a second run reports no pending migration rather than altering history

#### Scenario: Schema change follows an applied migration

- **WHEN** a later approved change needs to alter a schema represented by an applied migration
- **THEN** it adds a new forward migration and leaves the applied migration content unchanged

### Requirement: Identity records have one explicit application owner

The schema SHALL represent one application user identity and at most one profile for that identity. Every learner-owned cloud record SHALL resolve by foreign key to exactly one application user, and no payload-supplied owner identifier SHALL be sufficient to bypass the future backend authorization boundary. The foundation SHALL NOT implement token verification, account creation, login, or other authentication behavior.

#### Scenario: Orphaned learner record is rejected

- **WHEN** a learner-owned record references an application user that does not exist
- **THEN** PostgreSQL rejects the write through a foreign-key constraint

### Requirement: Curriculum persistence preserves stable identity and version history

The schema SHALL represent the approved `Journey > Chapter > Quest` hierarchy, Concept relationships, quest completion prerequisites, immutable quest-version identity, and explicit compatibility relationships between quest versions. Course SHALL remain a display synonym for Journey rather than a separate persistence entity. Curriculum ordering and stable identifiers SHALL be unique within their owning scope, and historical versions referenced by learning records SHALL not be destructively removed.

#### Scenario: Quest editorial version does not replace stable identity

- **WHEN** a quest receives a new content or assessment version
- **THEN** the new version remains associated with the same stable quest while prior referenced versions remain addressable

#### Scenario: Duplicate hierarchy position is rejected

- **WHEN** two chapters claim the same position in one journey or two quests claim the same position in one chapter
- **THEN** PostgreSQL rejects the conflicting record

### Requirement: Learning occurrences and submitted snapshots remain auditable

The schema SHALL distinguish journey enrollment, first quest start, a submitted assessment attempt, its private immutable source/result snapshot, and accepted quest completion. An attempt SHALL carry a stable client event identity unique for its owner, SHALL reference the exact quest version assessed, and SHALL not be duplicated by replay of the same owner/event identity. A completion SHALL reference an eligible attempt owned by the same user for the same stable quest.

#### Scenario: Idempotent event replay reaches one attempt

- **WHEN** the same learner event identity is inserted more than once for one application user
- **THEN** the uniqueness constraint prevents a second attempt occurrence

#### Scenario: Completion cannot cross owner or quest

- **WHEN** a completion references an attempt belonging to another user or another quest
- **THEN** PostgreSQL rejects the relationship

### Requirement: Completion and gamification facts are unique and append-only

The schema SHALL allow at most one accepted completion and one completion XP award per user and stable quest. It SHALL persist qualifying streak activity as a learner-local calendar-day fact with the timezone used at acceptance. XP totals, levels, current/longest streaks, prerequisite availability, learning status, and chapter/journey percentages SHALL be derived from durable facts rather than stored as mutable aggregate authority.

#### Scenario: Retry cannot duplicate completion reward

- **WHEN** retries, imports, replays, or content-version changes refer to a quest already completed by the learner
- **THEN** database uniqueness prevents an additional accepted completion or completion XP award for that stable quest

#### Scenario: Current level is requested

- **WHEN** a later backend capability needs the learner's level
- **THEN** it derives the value from authoritative XP facts and the approved level curve rather than reading a stored level row

### Requirement: Deferred domain concepts do not become premature tables

The foundation SHALL NOT create stored Course, chapter-progress, journey-progress, percentage, Level, Unlock, current-streak, ConceptProgress, Achievement, UserAchievement, leaderboard, analytics, source-draft, or public-project authority. Future capabilities MAY add new durable facts only through separately reviewed migrations and specifications when their ownership and non-derived purpose are established.

#### Scenario: Foundation schema is audited for scope

- **WHEN** the schema inventory is compared with the approved product glossary and deferrals
- **THEN** it contains no duplicate Course hierarchy, stored progress aggregate, derived gamification state, mastery claim, achievement system, or later-phase product table

### Requirement: Constraints, indexes, timestamps, and deletion behavior are explicit

Every relation SHALL have a primary key; required relationships SHALL have foreign keys with deliberate update/delete actions; natural or idempotency identities SHALL have unique constraints; and foreign-key and expected ownership/time lookup paths SHALL have indexes. Database timestamps SHALL use timezone-aware values with database-generated creation defaults. Mutable records SHALL expose an explicit update timestamp, immutable facts SHALL not imply mutation through a generic update timestamp, learner deletion SHALL remove that learner's private dependent records consistently, and referenced curriculum/history SHALL use restrictive deletion rather than silent cascade.

#### Scenario: Relational contract inspection

- **WHEN** schema metadata is inspected in a migrated database
- **THEN** every relation has its documented key, ownership and relationship constraints, indexes, timestamp semantics, and deliberate delete action

### Requirement: Database verification uses a real PostgreSQL engine

The backend SHALL verify schema generation, fresh migration, repeat migration, key relationships, uniqueness, ownership consistency, deletion behavior, and representative query indexes against an isolated PostgreSQL database. Backend and root lint, typecheck, tests, and builds plus strict OpenSpec validation SHALL remain passing.

#### Scenario: Database foundation verification runs

- **WHEN** the approved verification commands run with an isolated test database
- **THEN** migrations and relational probes pass on PostgreSQL without requiring production Supabase credentials or infrastructure

### Requirement: Later-phase behavior remains excluded

The database foundation SHALL NOT add REST endpoints, generated API clients, Supabase Auth flows, token verification, authorization middleware, curriculum content/publication, submission acceptance services, guest import or offline sync behavior, XP/level/streak/unlock computation, analytics, production data, or learner execution.

#### Scenario: Phase boundary review

- **WHEN** the completed database-foundation diff is reviewed
- **THEN** it contains only persistence configuration, schema, migrations, verification, and directly required documentation with no Phase 7 or later behavior
