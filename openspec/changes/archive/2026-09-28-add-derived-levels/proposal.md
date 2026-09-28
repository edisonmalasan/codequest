# Proposal

## Why

Phase 19 records authoritative XP but learners cannot see what that total means for level progression. Phase 20 adds a deterministic interpretation of ledger XP while F04 still reserves final curve and names for beta balancing.

## What Changes

- Derive a learner's current level and progress toward the next level from their existing owner-scoped XP total, without a level table or client-written level.
- Extend the protected XP read with level boundaries and a visible provisional curve identifier.
- Present the authenticated learner's XP and provisional level on the account page, with truthful loading/failure handling and no mastery claim.
- Document the curve's provisional status and the F04 balancing obligation.

## Capabilities

### New Capabilities

- `learner-levels`: Deterministic XP-based level derivation, protected read contract, and provisional account presentation.

### Modified Capabilities

None. The existing `quest-xp` ledger and total requirements remain intact; the read response gains derived level fields.

## Impact

Backend Gamification read DTO/service, OpenAPI and regenerated frontend schema, trusted frontend API wrapper and account view, focused tests, and gamification/roadmap documentation. No migration or new reward source. Phase 21+ streaks, achievements, unlocks, and broader rewards remain excluded.
