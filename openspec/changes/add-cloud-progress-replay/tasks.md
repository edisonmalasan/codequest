# Tasks

## 1. Protected stable-quest replay

- [x] 1.1 Add stable-quest replay to the existing learning module and resolve recorded events before publication checks; verify protected HTTP/DTO/permission and PostgreSQL integration tests for duplicate/altered events, retirement, versions, prerequisites, owner isolation, XP uniqueness, and acceptance-day streaks.
- [x] 1.2 Regenerate OpenAPI/client, add trusted replay transport, and document API/learning replay policy; verify API drift and token-bound transport tests.

## 2. Durable owner replay

- [x] 2.1 Extend existing outbox with bounded delivery metadata and implement immutable save/bounded sequential replay; verify reopen, duplicate, guest/legacy exclusion, storage failure, uncertain response, blocked source retention, retry, owner switch, and overlapping passes.
- [x] 2.2 Document outbox retention, exact-version admission, device-only recovery, and no raw protected cache in frontend/security/progress docs; review scope against ADRs 0006/0007 and F07.

## 3. Trusted application integration

- [x] 3.1 Integrate authenticated Submit and session/online/foreground replay, owner changes, and account source-recovery/retry/removal UI; verify UI/provider tests for durable pending states, no auto-submit/import, account switching, and truthful storage/offline errors.
- [x] 3.2 Refresh backend progress/unlock/XP/streak views after confirmed delivery and reconnect on a device without pending work; verify query ownership and account refresh tests without persisted protected responses or locally derived accepted totals.

## 4. Integration verification

- [x] 4.1 Run root test/lint/typecheck/build, API drift, and strict OpenSpec validation; review final diff, mark verified tasks, push and merge Apply only after required CI checks pass.
