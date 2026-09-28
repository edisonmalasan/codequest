# Tasks

## 1. Protected stable-ID import boundary

- [x] 1.1 Add the authenticated Q01–Q04 stable-ID import operation that delegates to normal `LearningService.submit`; verify 401/403, forged fields, unpublished/non-guest IDs, version/prerequisite failures, replay, and first-completion XP/streak behavior with focused backend tests.
- [x] 1.2 Export OpenAPI, regenerate the frontend client, and add a typed protected wrapper; verify API drift and wrapper auth/error tests.
- [x] 1.3 Document the import route, backend ownership, and acceptance-day streak policy in learning/API/security docs; verify documentation matches tests.

## 2. Guest-local progression

- [x] 2.1 Build a bounded Q01–Q04 guest repository on Phase 23 guest state and pending envelopes; test reopen, original versions, duplicate events, owner isolation, malformed/oversize storage, and source retention.
- [x] 2.2 Add current-token immutable Check snapshot callback and guest quest UI for provisional start/pass, save failure, signup action, and non-guest gating; verify focused editor/quest interaction tests.
- [x] 2.3 Document the device-only provisional status and absent-published-content behavior in frontend/curriculum docs; verify copy against the UI.

## 3. Explicit account import

- [x] 3.1 Add account import review/action for locally saved Q01–Q04 snapshots, sequential stable-ID submission, verified target, per-quest outcomes, retry and source recovery; test no auto-import, account switch, stale/unpublished/prerequisite rejection, uncertain response replay, and accepted-state refresh.
- [x] 3.2 Document import and recovery UX, no backdated guest streak, and Phase 25 sync exclusion; verify the route and account copy.

## 4. Integration verification

- [x] 4.1 Run focused guest/backend tests, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, API contract check, strict OpenSpec validation, and final diff review; inspect PR CI before merge.
