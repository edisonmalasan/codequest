# Proposal

## Why

Local Check now gives deterministic feedback, but it has no durable learning record. Phase 17 adds the authenticated backend submission boundary and makes NestJS the sole authority for accepting personal-learning completion.

## What Changes

- Add protected, versioned attempt submission and owner-only attempt history to `LearningModule`.
- Persist immutable bounded source and normalized validation snapshots against the published stable quest and assessed version, with server timestamps, idempotency, and attempt counts.
- Accept completion only through backend policy checks of identity, published quest context, version, prerequisite eligibility, bounded case coverage, and uniqueness. Client reports remain forgeable and never prove source correctness; acceptance follows ADR 0005's personal-learning policy.
- Connect the published quest workspace to local Run/Check and authenticated Submit through the generated REST contract, keeping local feedback explicitly unverified.
- Keep progress aggregates, XP, rewards, streaks, and unlocks for later phases.

## Capabilities

### New Capabilities

- `attempts-and-submissions`: authenticated attempt records, private snapshots, backend acceptance, and idempotent history.

### Modified Capabilities

- `editor-workspace`: optional submission seam using a captured source and current local result without granting the workspace learning authority.

## Impact

NestJS LearningModule, backend-owned relational persistence, published curriculum lookup, OpenAPI and generated frontend client, published lesson workspace, focused backend/frontend tests, and learning/security documentation. No learner code runs in NestJS and no new execution infrastructure is introduced.
