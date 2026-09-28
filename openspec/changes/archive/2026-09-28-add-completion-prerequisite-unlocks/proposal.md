# Proposal

## Why

Phase 22 needs one backend-owned answer to whether a learner can enter the next published learning step. Submission currently checks raw prerequisite completion, progress checks current-version equivalence, and the authenticated Journey map recomputes locks in the browser; these can disagree after a publication change.

## What Changes

- Derive quest, chapter, and Journey/Course availability from current published completion prerequisites and the authenticated learner's accepted, version-compatible completions. Return ordered unmet-prerequisite explanations with self-only progress reads.
- Use the same compatibility and prerequisite policy when accepting new attempts and recording quest start or hints. Exact idempotent replay keeps its original outcome.
- Drive authenticated Journey map lock and link presentation from backend availability; keep guest visibility clearly provisional and never treat a browser-supplied unlock state as authority.
- Preserve distinct progress status, public curriculum reading, accepted historical facts, and current lesson access boundaries.

## Capabilities

### New Capabilities

- `learner-unlocks`: backend-derived prerequisite availability, explanations, and mutation enforcement for published quest, chapter, and Journey/Course scopes.

### Modified Capabilities

- `learner-progress`: protected progress reads include backend-derived availability and prerequisite explanations without storing unlock counters or changing progress status.
- `attempts-and-submissions`: new attempts obey current published, version-compatible prerequisite availability; replay preserves its original accepted outcome.
- `journey-course-ui`: authenticated map uses backend availability rather than recomputing accepted locks from client completion IDs, while guest presentation remains provisional.

## Impact

Backend curriculum compatibility policy, learning/progress services and DTOs, generated OpenAPI client, authenticated Journey map, focused tests, and curriculum/gamification docs. No new database table or mutable unlock authority is required. P09 authorizes completion prerequisites; F08 keeps mastery, XP gates, achievements, and P1+ mechanics out of scope. Phase 23+ work is excluded.
