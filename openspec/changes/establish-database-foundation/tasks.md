## 1. Persistence Setup

- [ ] 1.1 Add pinned Drizzle ORM, migration tooling, and PostgreSQL driver dependencies to the backend and verify the frozen workspace install succeeds.
- [ ] 1.2 Add backend database scripts and Drizzle configuration scoped to the `codequest` schema, then verify schema generation and migration commands resolve without contacting a production service.
- [ ] 1.3 Add required database configuration validation with redacted failures and verify tests prove connection values or credential-like input never appear in thrown or startup-log text.
- [ ] 1.4 Add a lifecycle-managed backend database connection boundary that closes cleanly and verify imports and ordinary unit tests do not establish an implicit connection.

## 2. Identity and Curriculum Schema

- [ ] 2.1 Define `users` and one-to-one `profiles` with UUID identity, timezone-aware timestamps, ownership constraints, and user-dependent cascade behavior; verify missing-owner and duplicate-profile probes fail.
- [ ] 2.2 Define stable `journeys`, `chapters`, `quests`, and `concepts` with explicit hierarchy foreign keys, scoped ordering uniqueness, timestamps, and indexes; verify duplicate positions and orphaned hierarchy writes fail.
- [ ] 2.3 Define immutable quest versions with unique stable-quest/content-version identity and assessment-version metadata; verify prior referenced versions cannot be destructively removed.
- [ ] 2.4 Define quest-concept, quest-prerequisite, and quest-version-compatibility relationships with composite keys, indexes, self-edge checks where applicable, and restrictive historical deletion; verify valid and invalid relationship probes.
- [ ] 2.5 Audit the schema inventory to prove no separate Course, progress aggregate, level, unlock, current-streak, mastery, achievement, analytics, draft, or project table exists.

## 3. Learning Fact Schema

- [ ] 3.1 Define journey enrollment and quest-start facts with explicit user ownership and stable journey/quest uniqueness, then verify replay creates no duplicate fact.
- [ ] 3.2 Define quest attempts with exact quest-version references, owner-scoped client-event uniqueness, immutable occurrence timestamps, and composite owner/quest identity; verify duplicate event and mismatched-version probes fail.
- [ ] 3.3 Define one-to-one private quest submission snapshots for source, reported result, and optional explanation data; verify a snapshot cannot exist without exactly one owning attempt.
- [ ] 3.4 Define accepted quest completions with one row per user/stable quest and a composite foreign key to the same owner's same-quest attempt; verify cross-owner, cross-quest, and duplicate completion writes fail.

## 4. Reward and Activity Fact Schema

- [ ] 4.1 Define append-only XP events sourced by accepted quest completion with one award per user/stable quest and positive-value constraints, then verify retries and content-version changes cannot create another award.
- [ ] 4.2 Define streak activity-day facts with user-local date, acceptance-time timezone snapshot, and qualifying completion identity; verify one day is recorded once and mismatched owners/completions fail.
- [ ] 4.3 Add and test representative derivation queries for total XP, completion-based learning/availability inputs, and current/longest streak inputs without persisting their aggregate results.

## 5. Migrations and PostgreSQL Verification

- [ ] 5.1 Generate and review the initial committed SQL migration for the full schema, confirming it grants no browser roles and contains every named key, constraint, index, timestamp default, and delete action from the design.
- [ ] 5.2 Add an isolated real-PostgreSQL test harness for local and CI use with no production Supabase dependency, and verify it can create and dispose a clean database deterministically.
- [ ] 5.3 Add migration integration coverage that applies all migrations to an empty database, reapplies with no pending changes, and inspects the resulting relations, constraints, indexes, and timestamp types.
- [ ] 5.4 Add relational integration coverage for ownership, idempotency, hierarchy/version history, completion/reward uniqueness, user cascade, and curriculum restriction scenarios; verify every database-foundation spec scenario has evidence.
- [ ] 5.5 Add a migration drift/history check that detects uncommitted schema changes and document that applied migrations are forward-only; verify the check passes on the committed schema and fails in a controlled drift test.

## 6. Boundaries, Documentation, and Final Gates

- [ ] 6.1 Document local/test database setup, migration generation/application, credential handling, corrective migration/restore expectations, and the Git-authored curriculum projection boundary; verify every documented command is runnable without production credentials.
- [ ] 6.2 Update implementation documentation and Project Status with Apply evidence while leaving canonical OpenSpec synchronization to the later Sync stage, keeping API generation and authentication explicitly unstarted; verify links and status statements match repository state.
- [ ] 6.3 Review the final diff for frontend database access, provider Auth behavior, endpoints, generated clients, curriculum content/publication, sync/import, business-rule execution, production infrastructure, secrets, and later-phase tables; verify none were introduced.
- [ ] 6.4 Run backend lint, typecheck, tests, and build; root lint, typecheck, tests, and build; strict OpenSpec validation; migration verification; credential and boundary scans; and `git diff --check`, recording exact results before the Apply PR is eligible to merge.
