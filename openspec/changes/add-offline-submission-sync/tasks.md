# Tasks

## 1. Explicit offline submission

- [x] 1.1 Enable signed-in Submit in downloaded QuestWorkspace through existing durable save/replay; skip transport when known offline. Verify focused workspace tests cover persistence-before-send, offline no-send, no Check auto-submit, storage failure, and originating-owner checks.
- [x] 1.2 Document explicit offline submission, pending authority, existing envelope field mapping/bounds, exact-version policy, and backend acceptance-time semantics in offline/sync docs; review against code and ADRs.

## 2. In-library recovery

- [x] 2.1 Mount the existing owner-keyed PendingWorkPanel in both downloaded-library and selected-lesson views, excluding guests. Verify component coverage for both views, owner switching/logout, and no cross-owner source exposure.
- [x] 2.2 Disable and guard retry while known offline while preserving copy/removal and connected retry. Verify panel tests and existing replay regressions for uncertain responses, stale source, owner isolation, serialization, and stable IDs.
- [x] 2.3 Document recovery from the offline view, truthful delivery states, source preservation, and device-local draft limitations; review documented UI labels.

## 3. End-to-end integration and verification

- [x] 3.1 Extend production PWA coverage with authenticated downloaded-lesson offline Check/explicit Submit, durable pending recovery after cold reload, reconnect with uncertain response and identical retry, confirmed delivery, and unchanged cached accepted facts. Run Chromium test:pwa; qualify backend acceptance fixtures and retain existing database idempotency coverage.
- [x] 3.2 Run root test, lint, typecheck, build, API drift and strict OpenSpec validation; review final diff and record actual evidence and F02/F06 limits before Apply PR merge.
- [x] 3.3 Update roadmap implementation status and evidence without marking Phase 29 started; verify approved task coverage and prepare canonical spec sync and CLI archive only after Apply merge.

## Verification evidence (2026-09-29)

- Focused workspace/library/panel/replay suite: 21/21 passed. Root frontend suite: 370/370 across 75 files. Backend 161 tests and 3 migration-history checks reused verified Turbo cache locally; required CI independently reruns the backend.
- `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm api:check`, strict change validation and all 26 canonical specs passed locally.
- `pnpm --dir frontend test:pwa`: production Chromium 6/6 passed, including offline explicit saving, cold reload recovery, uncertain response and identical reconnect retry, confirmed metadata, unchanged accepted projection, and public cache exclusions. Auth/API acceptance uses explicit browser fixtures; existing backend database tests verify real event/completion/XP/streak uniqueness and acceptance time. Current publication has no live quests.
- Proposal #122 and pre-existing draft-test durability repair #123 merged after required CI. The first proposal run exposed a stale Saved-label race; the repair waits for exact durable source and selects the draft label exactly. Apply evidence is reviewed before its PR merge.
- F02 physical mobile/Safari/Firefox installation, spoken assistive technology, low-power/native quota/background/OS restart remain untested; F06 operational privacy/retention/consent/deletion gates remain open. No support/compliance claim or Phase 29 work.
