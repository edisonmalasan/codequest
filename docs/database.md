# Database foundation

CodeQuest application persistence is owned by the NestJS backend. Drizzle defines a dedicated `codequest` PostgreSQL schema, committed SQL migrations preserve its history, and Supabase is the intended PostgreSQL host. The frontend has no database dependency or application-table grants.

This foundation defines persistence and relational integrity only. It does not implement authentication, authorization, APIs, generated clients, curriculum publication, submission acceptance, offline sync, or progress and gamification rules.

## Durable data model

The schema stores facts that later backend capabilities can authorize and use:

| Area                  | Relations                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Identity              | `users`, `profiles`                                                                                                                    |
| Curriculum projection | `journeys`, `chapters`, `quests`, `concepts`, `quest_versions`, `quest_concepts`, `quest_prerequisites`, `quest_version_compatibility` |
| Learning              | `journey_enrollments`, `quest_starts`, `quest_attempts`, `quest_submissions`, `quest_completions`                                      |
| Gamification facts    | `xp_events`, `streak_activity_days`                                                                                                    |

Git-authored curriculum under `backend/content/` remains the intended source. These curriculum relations are the future validated publication projection; do not seed or edit them as a competing authoring system before that workflow is specified.

Course is a display synonym for Journey. Chapter/journey percentages, learning status, availability, XP totals, levels, current/longest streaks, and unlock state are derived. Concept mastery, achievements, analytics, cloud source drafts, projects, and public sharing remain outside this schema.

## Configuration and credentials

The backend requires `DATABASE_URL` in PostgreSQL URL form. Keep it in the process environment or an approved secret store. Never commit it, pass it to the browser, add it to generated clients, or write it to logs. Configuration failures use redacted messages.

Local example values below are placeholders for a disposable developer database:

```powershell
$env:DATABASE_URL = "postgresql://codequest:local-password@127.0.0.1:5432/codequest"
```

```bash
export DATABASE_URL='postgresql://codequest:local-password@127.0.0.1:5432/codequest'
```

Production Supabase project creation, role provisioning, credentials, backup schedules, and networking are deployment work and are not created by this foundation. Application tables receive no `anon` or `authenticated` browser grants from the migrations.

## Migration workflow

Run database commands from the repository root:

```bash
pnpm --dir backend db:generate  # generate a reviewed forward migration from schema changes
pnpm --dir backend db:check     # validate migration history consistency
pnpm --dir backend db:drift     # generate/check and fail if schema and committed migrations differ
pnpm --dir backend db:migrate   # apply pending migrations to DATABASE_URL
```

Review generated SQL before committing it. Once a migration has been applied outside a disposable database, never edit or reorder it. Add a corrective forward migration for later changes. Application rollback is safe only while the migrated schema remains compatible; destructive database recovery uses a verified backup restore or a new corrective migration.

## Verification databases

Backend tests use an isolated in-memory PGlite PostgreSQL engine when `DATABASE_TEST_URL` is absent, so local tests need no production service or credentials. CI supplies a disposable PostgreSQL 17 service through `DATABASE_TEST_URL`; the same migration and relational suite runs against that server. Neither path connects to Supabase.

The suite verifies fresh and repeated migration, relation inventory, keys, foreign keys, unique constraints, indexes, timezone-aware timestamps, owner consistency, event idempotency, curriculum history restrictions, learner-data cascades, completion/reward uniqueness, and derived query inputs.

```bash
pnpm --dir backend test
```

To run the suite against another disposable PostgreSQL server, set `DATABASE_TEST_URL` for that test process. Never point destructive integration tests at a persistent or shared database; the harness drops its `codequest` and Drizzle migration schemas before applying migrations.
