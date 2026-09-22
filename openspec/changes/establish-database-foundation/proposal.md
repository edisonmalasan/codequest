## Why

CodeQuest now has an authoritative NestJS boundary but no durable application persistence. The next bounded step is to establish a migration-controlled PostgreSQL schema that can preserve approved identity, curriculum-version, learning, completion, and reward facts without prematurely implementing API, authentication, sync, or curriculum behavior.

## What Changes

- Add a backend-owned Drizzle/PostgreSQL persistence foundation compatible with Supabase-hosted PostgreSQL, including configuration validation, connection lifecycle, migration generation/application commands, and isolated database verification.
- Define application identity and profile records without implementing Supabase Auth token handling or direct frontend table access.
- Define stable Journey, Chapter, Quest, Concept, quest-version, concept-link, prerequisite, and compatibility records as a database projection boundary for future Git-authored curriculum work; Course remains a display synonym rather than a table.
- Define learner enrollment, immutable attempt/submission snapshots, quest-start, and accepted-completion facts with explicit ownership, version references, event identity, and duplicate protection.
- Define append-only XP and streak-activity facts while deriving totals, levels, streak summaries, availability, and chapter/journey progress instead of storing redundant aggregates.
- Apply foreign keys, uniqueness constraints, indexes, bounded timestamps, and deletion behavior that preserve accepted history and prevent cross-owner or orphaned records.
- Add schema and migration tests plus documented local/test migration procedures without provisioning production Supabase infrastructure or committing credentials.
- Update Project Status to show the database-foundation proposal under review while Phase 6 implementation remains unstarted.
- Exclude generated API clients, endpoints, authentication behavior, authorization middleware, direct Supabase client data access, curriculum publication/content, sync/import behavior, progress/XP business-rule execution, analytics, and all later-phase product work.

## Capabilities

### New Capabilities

- `database-foundation`: Backend-owned PostgreSQL/Drizzle schema, migration discipline, relational integrity, ownership, and persistence verification for approved foundational domain facts.

### Modified Capabilities

None.

## Impact

- Affected areas: `backend/` persistence infrastructure, database schema and migrations, backend configuration and tests, root command documentation where needed, and roadmap status.
- Expected dependencies: Drizzle ORM, Drizzle migration tooling, a PostgreSQL driver, and test-only database support chosen in the design without adding another production datastore.
- System boundary: CodeQuest application tables remain accessible only through the NestJS backend. Supabase is the PostgreSQL host direction, not permission for browser table access or Phase 8 authentication work.
- Compatibility: no existing API contract or frontend behavior changes in this phase; later capabilities consume the schema through separately approved backend modules.
