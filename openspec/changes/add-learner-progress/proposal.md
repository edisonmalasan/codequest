# Proposal

## Why

Phase 17 records private attempts and accepted personal-learning completions, but learners cannot read authoritative progress and the Journey map still displays an empty completion snapshot. Phase 18 turns those facts into owner-scoped progress without making percentages or browser state authoritative.

## What Changes

- Record authenticated quest starts and first-use events for the three published hint keys.
- Expose protected quest, chapter, and Journey progress reads with status, timestamps, attempt and hint counts, last activity, and derived completed/total counts and percentages. Course remains a read alias for Journey.
- Derive status and aggregates from published curriculum plus owned start, hint, attempt, and accepted-completion facts, including existing Phase 17 attempts with no explicit start.
- Connect authenticated Journey and lesson views to the protected progress API; keep guest state clearly provisional and never send progress authority from the browser.
- Add focused ownership, derivation, idempotency, API-contract, and frontend tests.

## Capabilities

### New Capabilities

- `learner-progress`: Owner-scoped activity recording and backend-derived quest, chapter, and Journey/Course progress.

### Modified Capabilities

- `journey-course-ui`: Replace the Phase 11 empty authenticated completion snapshot with the accepted progress source while preserving prerequisite-aware map presentation.

## Impact

NestJS ProgressModule, Drizzle schema and forward migration, generated OpenAPI client and frontend API wrapper, lesson hint integration, Journey map, tests, and progress documentation. No XP, levels, rewards, streaks, unlock persistence, independent grading, or new learner execution.
