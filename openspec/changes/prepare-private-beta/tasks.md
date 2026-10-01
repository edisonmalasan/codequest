# Tasks

## 1. First-use guidance

- [ ] 1.1 Add onboarding route and public navigation that accurately explain guest Q01–Q04, device-local provisional state, account signup and explicit import; verify route content and navigation with focused frontend tests.

## 2. Account recovery

- [ ] 2.1 Add a generic email recovery request using configured callback origin; verify account enumeration resistance, safe errors and redirect target with frontend tests.
- [ ] 2.2 Add a session-protected password update page for recovery and signed-in account use; verify no code/credential exposure, invalid session behavior and provider failure with frontend tests.
- [ ] 2.3 Link password self-service from account and recovery from login, and document hosted Auth redirect/email prerequisites; verify links and provider-neutral wording.

## 3. Feedback preparation

- [ ] 3.1 Add a bounded device-local feedback draft form with save, reload, clear and storage-failure behavior and no network delivery; verify with focused frontend tests.

## 4. Release record

- [ ] 4.1 Write a beta readiness matrix covering onboarding, account, F06 terms/privacy/consent/retention/deletion, feedback, analytics, monitoring, backups/restore, security, migrations, F02, F04 and F05, with owners, evidence and no-go status; verify links and referenced commands.
- [ ] 4.2 Update roadmap status and release notes truthfully; verify no live beta or hosted success claim without evidence.

## 5. Integration verification

- [ ] 5.1 Run focused frontend tests, root `pnpm test`, `pnpm lint`, `pnpm typecheck`, and strict OpenSpec validation; review failures and final diff.
