# Proposal

## Why

Phase 18 tracks accepted learning but does not award XP. Phase 19 needs a durable, owner-bound reward fact that survives retries and curriculum edits without letting repeated submissions mint XP.

## What Changes

- Award one positive XP event for the first backend-accepted completion of each stable quest per learner, in the same transaction as completion acceptance.
- Derive total XP from the append-only event ledger through a protected self-only API.
- Protect the reward source with a database uniqueness constraint independent of submission event IDs; do not award for failed/local-only/replayed practice.
- Record the published quest reward amount at acceptance time and preserve historical awards across version changes or retirement.
- Keep personal-learning client-report trust limits explicit under ADR 0005.

## Capabilities

### New Capabilities

- `quest-xp`: Owner-bound XP ledger, unique reward source, atomic award, and derived total API.

### Modified Capabilities

- `attempts-and-submissions`: First accepted completion now atomically creates its XP event; other attempt semantics remain.

## Impact

`backend` Learning and Gamification modules, existing Drizzle `xp_events` schema plus forward migration, backend OpenAPI and regenerated frontend schema, focused database/API tests, and XP documentation. No level, streak, achievement, unlock, or frontend reward display.
