# Tasks

## 1. Durable reward source

- [x] 1.1 Add explicit source type/ID and unique owner/source protection to the existing XP schema in a forward migration; verify `db:check`, `db:drift`, and database constraint tests.
- [x] 1.2 Insert one immutable XP event inside first accepted completion transaction using published snapshot amount; verify focused failure, retry, concurrent, owner, practice, and version cases in LearningService tests.

## 2. XP read contract

- [x] 2.1 Add protected owner-only `GET /api/v1/xp` deriving total from events; verify service/controller tests for zero, multi-event sum, owner isolation, and authentication/permission.
- [x] 2.2 Regenerate frontend OpenAPI schema and document ledger/rollout semantics in `docs/gamification.md`; verify `api:check` and docs against actual response.

## 3. Integration verification

- [x] 3.1 Run root test, lint, typecheck, build, strict OpenSpec validation, and relevant database checks; review final diff for Phase 20+ exclusions.
