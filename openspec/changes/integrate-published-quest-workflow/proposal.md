# Proposal

## Why

R06 gives published lessons a coherent reading, editor, and results shell, but the published Quest still constructs one JavaScript file and does not use the reusable web preview modes or provide a complete Back/Next flow. R07 must make the authored exercise mode and its local feedback explicit while keeping accepted learning facts in the backend and the R07A interactive capability gated by evidence for the exact published integration.

## What Changes

- Give published Quest snapshots a versioned, bounded exercise descriptor with stable file identities, starter files, and an explicit JavaScript, static-web, or supported interactive-web mode. Existing JavaScript snapshots remain compatible; unsupported or unreviewed modes fail closed.
- Compose the existing Editor Workspace, JavaScript Worker, static preview, and optional R07A interactive adapter in the published three-region lesson shell. Preserve draft ownership, source across navigation/failure, accessible output, and clear local Run/Preview/Check states.
- Bind deterministic local Check to the selected published assessment and an immutable source snapshot. Provide declarative, bounded checks for approved web exercises without evaluating learner code or test programs in the application, display frame, or NestJS.
- Keep Submit explicit and authenticated. Extend the private source-snapshot contract for identified multi-file exercises without changing the current single-file payload or ADR 0005 personal-learning acceptance semantics. Refresh trusted progress, rewards, and unlock views only after backend acceptance.
- Add ordered Back/Next Quest navigation with truthful locked/unavailable states, guest eligibility, and recovery from stale versions, failed saves, offline replay, and submission errors.
- Require exact-build browser containment/recovery and curriculum/security review before a published Quest may select interactive mode. Local development evidence alone does not enable it.

## Capabilities

### New Capabilities

- `published-quest-workflow`: Authoritative orchestration contract for a published lesson's editing, local execution/checking, explicit submission, navigation, and recovery.

### Modified Capabilities

- `curriculum-api`: Return a reviewed, bounded exercise descriptor for the selected Quest snapshot while preserving legacy JavaScript reads.
- `validation-engine`: Support an explicit bounded declarative web-check subset for eligible HTML/CSS exercises, still local and non-authoritative.
- `attempts-and-submissions`: Accept a versioned identified multi-file source snapshot under existing owner, version, size, idempotency, and personal-learning rules.
- `interactive-web-execution`: Make the published-use review gate specific to the integrated build and authored exercise subset.

## Impact

Apply will affect backend curriculum authoring/schema/DTO/OpenAPI, the generated frontend API client, the published Quest host, reusable Editor Workspace adapters, local validation, private submission snapshots, and focused unit/browser/API verification. No new course is published by this change; original HTML/CSS/DOM course authoring remains R08. R04 real-provider authentication and Phase 38 hosted/device gates remain open. This proposal contains no application implementation.
