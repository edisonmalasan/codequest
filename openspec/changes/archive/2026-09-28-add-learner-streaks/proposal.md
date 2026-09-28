# Proposal

## Why

Phase 21 needs a streak that reflects accepted learning rather than visits or client counters. The existing completion transaction and durable streak-day table provide the foundation, but neither writes qualifying days nor exposes derived streaks or a validated learner timezone.

## What Changes

- Record at most one owner-bound streak day for first accepted quest or capstone completion, atomically with completion and XP, using backend acceptance time and the learner's validated IANA timezone.
- Expose authenticated, self-only current and longest streaks derived from durable day facts; use the current learner-local day to decide whether a streak remains active.
- Allow an authenticated learner to set a validated timezone for future acceptance and show the setting and streak on the account page. Keep historical day dates and timezones unchanged.
- Exclude opens, retries, practice, hints, failed attempts, and guest/offline timestamps; prevent timezone switching or replay from manufacturing an extra credited day.

## Capabilities

### New Capabilities

- `learner-streaks`: qualifying day persistence, timezone-aware streak derivation, owner-only read, and presentation.

### Modified Capabilities

- `attempts-and-submissions`: permit the first accepted completion to atomically create a qualifying streak day while preserving all other attempt boundaries.
- `authentication`: add a protected self-only validated timezone setting for prospective streak acceptance.

## Impact

Backend learning acceptance, identity account settings, gamification read API, frontend generated OpenAPI client and account view, focused database/service/API tests, and canonical specs. The existing `streak_activity_days` relation remains the durable source; no mutable streak counter, new reward type, or backfill is added. Accepted personal-learning completion retains ADR 0005's client-report limitation. Phase 22+ achievements and unlock presentation remain out of scope.
