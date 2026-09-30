# Tasks

## 1. Domain and acceptance chain

- [x] 1.1 Inventory existing validation, content, progress, XP, streak, and unlock tests; add focused deterministic cases only for observed gaps and verify them with targeted Vitest runs.
- [ ] 1.2 Add a migration-backed PostgreSQL integration case that submits a client-reported passing Q01 attempt and checks owner-only attempt, progress, XP, acceptance-day streak, and Q02 unlock facts; verify exact replay and another owner in the same test run.

## 2. Controlled browser journey

- [ ] 2.1 Add a test-only local Auth/JWKS fixture with ephemeral signing key, registration/session responses, and failure-on-unavailable behavior; repair the existing signup form's public environment lookup and fixture CORS preflight as needed; verify a signed token is accepted by the real backend and wrong ownership is denied.
- [ ] 2.2 Add a dedicated Playwright config and guest-to-account journey using real API/PostgreSQL state: guest Run/Check, signup UI, explicit import, trusted fact refresh, Q02 Check/Submit, and preserved source; verify locally or in CI with fixture services.
- [ ] 2.3 Run the journey on Chromium, Firefox, WebKit and a mobile viewport; keep shared database execution serial, add the named command to CI, and verify engine-specific results with no skips.

## 3. Evidence and integration

- [ ] 3.1 Document the test command, fixture limits, ADR 0005 trust qualification, actual browser results, and F02 physical-device gaps; verify the written commands match package scripts.
- [ ] 3.2 Run root test/lint/typecheck/build, API/content drift, existing browser gates, the new browser gate, strict OpenSpec validation and final diff checks; record failures and resolutions before completing the task.
