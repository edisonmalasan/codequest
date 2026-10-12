# Proposal

## Why

CodeQuest already has backend progress, XP, provisional levels, streaks, and prerequisite availability, but these systems do not yet form a complete learner-facing progression and private profile experience. R09 will connect those trusted facts to a personal profile and deterministic achievements while keeping experimental XP values and the personal-learning trust boundary intact.

## What Changes

- Add an owner-only profile with a bounded display name and an allowlisted original avatar selection.
- Add a deterministic achievement catalog and self-only earned-achievement view derived from backend-accepted learning facts.
- Present existing progress, XP, provisional level, streak, and availability facts coherently in the private profile and relevant learning maps.
- Refresh profile and achievement views after backend acceptance and after successful reconnect replay.
- Describe all achievements and rewards as personal-learning recognition; do not imply mastery or verified competition.

## Capabilities

### New Capabilities

- `learner-profile`: Private owner profile, original avatar preference, and integrated presentation of existing backend-authoritative learner state.
- `learner-achievements`: Stable achievement definitions and deterministic owner-only earned state derived from accepted learning facts.

### Modified Capabilities

None. Existing progress, XP, level, streak, unlock, authentication, and product-readiness contracts remain the source of authority and are reused as written.

## Impact

- Backend identity/profile persistence, authenticated profile APIs, achievement derivation, generated OpenAPI client, and database migrations if needed.
- Frontend account/profile and learning-map presentation, cache refresh on accepted completion and replay, and original avatar/badge assets.
- No change to 10 XP per first accepted stable quest, `provisional-linear-100-v1`, streak qualification, unlock prerequisites, or ADR 0005 acceptance semantics.
- Apply depends on the R08 core-course acceptance gate and remains subject to R04 real-auth integration evidence. Competitive ranking remains in R10C; public profiles and portfolios remain in R11C.
