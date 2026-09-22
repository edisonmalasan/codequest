## Context

See [proposal.md](proposal.md) for motivation. The NestJS/Fastify modular monolith is established but has no database packages, connection lifecycle, schema, or migration commands. Approved architecture assigns all application-table access to the backend, selects PostgreSQL through Supabase with Drizzle, treats Git as curriculum authoring source, and distinguishes durable accepted facts from provisional client state. Authentication, API generation, curriculum publication, sync, and business-rule execution belong to later phases.

The roadmap's initial entity list mixes facts, display vocabulary, aggregates, and deferred product concepts. The schema therefore follows the approved glossary and authority model rather than creating one table per listed noun.

## Goals / Non-Goals

**Goals:**

- Establish a typed backend persistence seam, reproducible forward migrations, and real-PostgreSQL verification.
- Encode ownership, stable curriculum/version identity, immutable learning snapshots, accepted completion uniqueness, and reward/activity fact integrity in the database.
- Make deletion, timestamp, index, and constraint choices reviewable before any endpoint depends on them.
- Leave a schema that later domain repositories can consume without exposing Drizzle outside the backend.

**Non-Goals:**

- Provision or administer a production Supabase project, database role, backups, or secrets.
- Implement Supabase Auth, identity lifecycle, authorization, endpoints, OpenAPI changes, or generated clients.
- Publish curriculum content, accept submissions, calculate progress/rewards, import guest state, or implement offline sync.
- Add derived aggregate, achievement, mastery, analytics, project, or public-sharing persistence.

## Decisions

### 1. Use Drizzle with PostgreSQL and a backend-only application schema

Application relations will live in a dedicated `codequest` PostgreSQL schema and be accessed through a backend connection string validated alongside existing configuration. Drizzle owns TypeScript schema definitions and SQL migration generation; committed SQL remains the deployable history. The runtime driver will be a PostgreSQL-compatible Node driver supported by Drizzle and Supabase connection strings.

No migration grants access to Supabase `anon` or `authenticated` browser roles, and the frontend receives no database package or configuration. Production role creation and secret distribution remain deployment work; the foundation documents the least-privilege expectation without provisioning infrastructure.

Alternatives considered:

- `public` schema: simpler defaults, but easier to expose accidentally through platform APIs.
- Supabase client as ORM: conflicts with backend-only application-table access and does not replace migration ownership.
- SQLite or an in-memory SQL emulator for primary verification: fails to exercise PostgreSQL types, constraints, indexes, and migration behavior selected for production.

### 2. Keep persistence infrastructure inside the backend

Drizzle schema modules, connection construction, migration files, and test helpers will live under `backend/src/infrastructure/database/` and `backend/drizzle/`. Domain modules may later depend on repository interfaces or focused persistence adapters, but Phase 6 will not add speculative repositories or expose a generic database service to the frontend. Root scripts may delegate named database commands to the backend only where required by the repository command contract.

The database connection will be lazily or lifecycle-managed so importing schema metadata and running ordinary unit tests does not contact a database. Configuration errors remain redacted. Application startup wiring may establish and close the pool, but this phase adds no route or business behavior and does not claim production dependency readiness in health output.

Alternatives considered:

- Root shared database package: has only one real consumer and violates the extraction rule.
- Domain-specific repositories now: no approved services consume them yet, so interfaces would be speculative.

### 3. Model durable facts, not every roadmap noun

The initial relational model is:

| Area | Relations | Durable purpose |
| --- | --- | --- |
| Identity | `users`, `profiles` | Application principal key and one-to-one learner settings such as timezone; the future verified Supabase subject maps to the user UUID without a Phase 6 Auth flow or foreign key into provider-owned schemas |
| Curriculum | `journeys`, `chapters`, `quests`, `concepts`, `quest_versions`, `quest_concepts`, `quest_prerequisites`, `quest_version_compatibility` | Stable hierarchy/skill identity, ordered ownership, immutable version identity, explicit dependency and compatibility edges; data remains an eventual projection of Git-authored content |
| Learning | `journey_enrollments`, `quest_starts`, `quest_attempts`, `quest_submissions`, `quest_completions` | Enrollment/start facts, idempotent submitted occurrences, private immutable source/result payloads, and first accepted completion |
| Gamification | `xp_events`, `streak_activity_days` | One completion reward fact and one qualifying learner-local activity-day fact |

`Course` is not stored because it is a Journey display synonym. `QuestProgress`, chapter/journey progress, Level, Unlock, and current/longest Streak are projections of starts, completions, prerequisites, XP facts, and activity days. Concept mastery and achievements are deferred product features, so `ConceptProgress`, `Achievement`, and `UserAchievement` are omitted. Drafts and pending outbox records remain frontend-owned IndexedDB concerns until a separately approved sync capability defines cloud acceptance.

### 4. Use stable keys plus immutable version and event identities

Application users and learner occurrences use UUID primary keys. Curriculum records use durable textual IDs suitable for reviewed Git content, while `quest_versions` use a UUID key plus a unique `(quest_id, content_version)` identity and an explicit assessment-version value. Learning rows reference both the stable quest and exact version so the database can enforce cross-record consistency and preserve historical context.

Each attempt has a client event UUID unique within its user owner. The attempt relation has an additional unique `(id, user_id, quest_id)` key so a completion can use a composite foreign key that proves its accepted attempt belongs to the same user and stable quest. A submission is one-to-one with its attempt and isolates private source/result/explanation payloads from common occurrence metadata.

Quest-version compatibility is an explicit directed relation reviewed by later curriculum publication work. Database checks reject self-edges; application validation will later enforce semantic validity and cycle policy.

Alternatives considered:

- Slug/title as identity: editorial changes would break history and reward uniqueness.
- One mutable quest row containing current content: cannot retain exact submitted version.
- One combined attempt/source table: makes common progress queries touch private, potentially large source payloads and complicates retention boundaries.

### 5. Enforce single-source completion and reward integrity relationally

`quest_completions` has one row per `(user_id, quest_id)` and references the matching accepted attempt. `xp_events` references that completion and has the same owner/quest uniqueness, making retries, imports, and editorial versions unable to mint another completion reward. XP amount remains a recorded award fact; the numeric value and level curve are deferred balancing decisions.

`streak_activity_days` records `(user_id, activity_date)` once, the IANA timezone identifier used when the day was accepted, and one qualifying completion. This preserves the approved prospective timezone rule. Current streak and longest streak are queries over these day facts, not mutable counters. A single day can have many completions but only its first qualifying completion establishes the activity-day row.

No trigger will implement acceptance or gamification rules in Phase 6. Later application services will execute those rules transactionally; the database constraints provide the final duplicate and ownership guard.

### 6. Make time, mutation, indexing, and deletion semantics explicit

All instants use PostgreSQL `timestamptz` with database `now()` defaults. Mutable identity/profile and curriculum projection records carry `created_at` and `updated_at`; immutable versions, attempts, submissions, completions, XP events, and activity days carry fact-specific creation/acceptance timestamps without a misleading generic update path. Calendar activity uses PostgreSQL `date`, accompanied by the timezone snapshot.

Unique ordering constraints cover chapter position within a journey and quest position within a chapter. PostgreSQL does not automatically index referencing columns, so every foreign-key path receives an explicit index unless a primary/unique key already supplies it. Expected owner/time paths include attempts, completions, XP facts, activity days, and enrollment/start lookups. Migration verification will inspect names and query plans for representative owner/history queries.

User deletion cascades through that user's profile and private learning/reward facts as one internally consistent graph, without defining the future account-deletion workflow. Curriculum deletion is restrictive once referenced; future publication retires/deactivates stable records rather than erasing history. Hierarchy-owned unpublished children may cascade only where no historical reference prevents deletion. Provider-owned Supabase Auth tables are not part of this migration graph.

### 7. Verify migrations on disposable PostgreSQL

Local and CI database checks will run against an isolated supported PostgreSQL instance, apply all migrations from empty, rerun the migrator, inspect schema metadata, and probe representative constraint failures and cascades inside resettable databases. CI may use a PostgreSQL service container; local developers may use an equivalent disposable instance. Neither path uses production Supabase credentials.

Tests will cover at minimum hierarchy/order uniqueness, version identity, prerequisite/compatibility edges, missing owners, owner/event idempotency, cross-owner completion rejection, one completion/reward per quest, streak-day uniqueness, timestamp defaults, restrictive curriculum deletion, and user-owned cascade behavior. A migration drift check will fail when reviewed schema changes lack a committed migration.

### 8. Treat migrations as forward-only history

Applied migration files are immutable. Normal deployment applies pending migrations before starting code that requires them. Additive changes should remain compatible with the immediately previous application version when practical. Rollback of application code is allowed only while the migrated schema remains compatible; database rollback uses backup restore for destructive incidents or a new corrective forward migration, never editing an applied file.

## Risks / Trade-offs

- **[Schema precedes domain services]** Some fields may prove unnecessary when later APIs are designed. → Keep this foundation to approved facts and constraints; add fields through new reviewed migrations rather than speculative nullable columns.
- **[Provider identity lifecycle is deferred]** A user UUID exists before Auth provisioning behavior is specified. → Do not add provider triggers or cross-schema foreign keys; Phase 8 must define verified creation/linking and deletion orchestration against this stable application key.
- **[Git source and database projection can drift]** Curriculum tables exist before publication tooling. → Seed no production curriculum and add no manual mutation workflow; Phase 9 must define validated projection and drift handling.
- **[Cascading learner deletion can be irreversible]** Database cascades are consistent but operational retention/backups remain undecided. → No real learner collection begins under this phase; F06 and beta work must define deletion, retention, recovery, and backup policy.
- **[JSON snapshot payloads can become unbounded or opaque]** Source/result shapes are defined later. → Keep payloads private and immutable, require later DTO bounds, and do not add JSON indexes or business queries in the foundation.
- **[Generic timestamps do not enforce immutability]** PostgreSQL permissions alone do not express every fact rule. → Expose later writes through narrow repositories/services and cover prohibited update paths when those consumers exist; Phase 6 avoids unapproved triggers.

## Migration Plan

1. Add pinned Drizzle, migration-tool, and PostgreSQL-driver dependencies plus redacted backend database configuration.
2. Add the dedicated schema definitions, relationship metadata, and named constraints/indexes.
3. Generate and review the initial SQL migration; add migration and drift commands.
4. Add isolated PostgreSQL test setup and run fresh/repeat migration plus relational probes.
5. Wire connection lifecycle only as required for a clean backend start/stop boundary, with no endpoint or domain behavior.
6. Run backend/root checks, strict OpenSpec validation, credential/boundary review, and migration-history checks before the Apply PR can merge.

For an Apply rollback before merge, revert the unmerged implementation and discard only its disposable test database. After a migration has been applied outside disposable environments, preserve it and use a corrective migration or restore an approved backup; never rewrite migration history.
