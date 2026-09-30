# Proposal

## Why

Phase 34 calls for confidence in the full learning loop, including guest entry, signup import, submission, progress, XP, and unlocks across browsers. Existing domain suites cover these boundaries separately, while the published Q01–Q04 browser test stops before a verified account import and CI does not run a cross-boundary browser journey or Firefox/WebKit/mobile viewport gates for that journey.

## What Changes

- Add focused deterministic tests for validation, content publication/parsing, progression, XP, streaks, and unlocks where the existing suites leave a behavior gap, without duplicating their implementation line by line.
- Add a PostgreSQL-backed integration test of an explicit reported passing attempt through backend acceptance, derived progress, first-completion XP, acceptance-day streak, and prerequisite availability; prove idempotent replay and another owner's isolation. Keep the client report's personal-learning trust label under ADR 0005.
- Add a controlled local Auth/JWKS fixture and a browser journey that starts as a guest, Runs and Checks a published quest, signs up through the UI, explicitly imports saved guest work, confirms trusted account state, and completes the next available quest.
- Run the critical browser journey in Chromium, Firefox, and WebKit and repeat its usable guest/account route at a mobile viewport. Keep the F02 physical-device and assistive-technology gaps explicit.
- Add the focused browser gate to CI and document exact evidence and limitations.

## Capabilities

### New Capabilities

- `core-learning-testing`: Repeatable unit, integration, and browser verification of the existing MVP learning and authority boundaries.

### Modified Capabilities

None. The change verifies current behavior and does not change product contracts.

## Impact

Backend and frontend test fixtures, Playwright configuration, CI, and testing documentation are affected. The local Auth fixture uses generated test keys and no production credentials. No REST schema, migration, learner runtime, independent grading, production Auth integration, or Phase 35 accessibility implementation is added.
