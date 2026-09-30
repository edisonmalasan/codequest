# Core Learning Testing Specification

## Purpose

Make the existing MVP learning loop repeatably verifiable across domain, persistence, and browser boundaries without treating local assessment reports as independent grading.

## Requirements

### Requirement: Core learning rules have focused deterministic regression coverage

The repository SHALL run deterministic checks of validation outcomes, published content parsing, progress derivation, first-completion XP, acceptance-day streaks, and completion prerequisite unlocks. Tests SHALL use controlled authored content, clocks, and owner identities where needed and SHALL distinguish missing behavior coverage from duplicated assertions that only mirror implementation.

#### Scenario: Domain regression suite runs

- **WHEN** the normal unit test gate runs
- **THEN** passing and failing cases, version and owner boundaries, replay, and first-completion side effects are checked without network access to production services

### Requirement: Acceptance chain is verified against durable backend facts

An integration check SHALL submit a bounded passing personal-learning report through the existing authenticated learning contract and verify the resulting owner-only attempt, derived progress, unique XP event, acceptance-day streak, and next-quest availability in one coherent fixture. It SHALL prove that an exact retry creates no extra completion, XP, streak, or attempt and that another owner cannot see the first owner's accepted state. The check SHALL label the report as client-reported under ADR 0005 and SHALL not claim independent source grading.

#### Scenario: First accepted completion advances learning

- **WHEN** a verified owner explicitly submits a valid report for a published available quest
- **THEN** backend facts show one accepted completion, derived progress and availability advance, and exactly one qualifying XP reward and streak day are recorded

#### Scenario: Replay and other owner are exercised

- **WHEN** the same event is retried or a second owner reads the journey
- **THEN** retry returns the original outcome without duplicate facts and the second owner sees only its own progress, rewards, streaks, and unlocks

### Requirement: Guest-to-account journey has a controlled browser gate

A browser test SHALL exercise a published guest quest from Run and local Check through visible device-local provisional state, UI signup through a controlled test identity provider, explicit import into a verified account, trusted progress/reward/unlock refresh, and completion of the next available quest. It SHALL use a real backend and test database, a test-only signing identity/JWKS fixture, and no production credentials. It SHALL prove local Check alone creates no backend acceptance and that account state comes from backend reads after import and submission.

#### Scenario: Guest becomes an authenticated learner

- **WHEN** a guest completes Q01 locally, signs up, explicitly imports the saved Check, and submits the next available quest
- **THEN** provisional work remains identifiable, accepted account facts are owner-bound, and the next quest is available only after prerequisite acceptance

#### Scenario: The browser fixture is unavailable

- **WHEN** test identity or database services cannot start
- **THEN** the gate fails visibly rather than silently substituting a frontend completion flag or skipping the journey

### Requirement: Browser coverage reports its actual supported scope

The critical browser gate SHALL run in CI on Chromium, Firefox, and WebKit and SHALL include a mobile viewport exercise for guest and account routes. It SHALL record browser results separately from untested physical devices, assistive technologies, installability, and low-power timing obligations under F02.

#### Scenario: CI verifies the journey

- **WHEN** the Phase 34 browser gate runs on a pull request
- **THEN** each configured engine and viewport either passes or reports a failing test, with no unsupported physical-device claim inferred from emulation
