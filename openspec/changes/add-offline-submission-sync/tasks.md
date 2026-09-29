# Tasks

## 1. Explicit offline submission

- [ ] 1.1 Enable signed-in Submit in downloaded QuestWorkspace through existing durable save/replay; skip transport when known offline. Verify focused workspace tests cover persistence-before-send, offline no-send, no Check auto-submit, storage failure, and originating-owner checks.
- [ ] 1.2 Document explicit offline submission, pending authority, existing envelope field mapping/bounds, exact-version policy, and backend acceptance-time semantics in offline/sync docs; review against code and ADRs.

## 2. In-library recovery

- [ ] 2.1 Mount the existing owner-keyed PendingWorkPanel in both downloaded-library and selected-lesson views, excluding guests. Verify component coverage for both views, owner switching/logout, and no cross-owner source exposure.
- [ ] 2.2 Disable and guard retry while known offline while preserving copy/removal and connected retry. Verify panel tests and existing replay regressions for uncertain responses, stale source, owner isolation, serialization, and stable IDs.
- [ ] 2.3 Document recovery from the offline view, truthful delivery states, source preservation, and device-local draft limitations; review documented UI labels.

## 3. End-to-end integration and verification

- [ ] 3.1 Extend production PWA coverage with authenticated downloaded-lesson offline Check/explicit Submit, durable pending recovery after cold reload, reconnect with uncertain response and identical retry, confirmed delivery, and unchanged cached accepted facts. Run Chromium test:pwa; qualify backend acceptance fixtures and retain existing database idempotency coverage.
- [ ] 3.2 Run root test, lint, typecheck, build, API drift and strict OpenSpec validation; review final diff and record actual evidence and F02/F06 limits before Apply PR merge.
- [ ] 3.3 Update roadmap implementation status and evidence without marking Phase 29 started; verify approved task coverage and prepare canonical spec sync and CLI archive only after Apply merge.
