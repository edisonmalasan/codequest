## Why

The backend already publishes OpenAPI for its implemented versioned health endpoint, while the frontend has only a base-URL helper. Phase 7 needs a reproducible, strongly typed contract boundary so frontend work can consume backend behavior without importing backend source or inventing domain APIs ahead of their phases.

## What Changes

- Generate a frontend-local TypeScript API client from the backend's live OpenAPI document, with a repeatable command and a CI drift check.
- Establish a small typed transport boundary using the existing API base URL and the implemented health operation as an end-to-end contract proof. Keep request/response and error handling consistent with the existing backend HTTP contract.
- Document how future backend DTO/route changes regenerate the client and how contract mismatches fail verification.
- Resolve the roadmap's `packages/api-client` example in favor of `frontend/src/lib/api/generated/`: `AGENTS.md`, approved decision C04, ADR 0002, and the architecture docs take precedence. There is one real client consumer, so no root shared package is created.
- Update Project Status to show the Phase 7 proposal under review while implementation remains unstarted.

## Capabilities

### New Capabilities

- `api-contract-generation`: Reproducible OpenAPI-derived frontend client, typed consumption of implemented backend operations, and drift/boundary verification.

### Modified Capabilities

None. The existing backend-foundation OpenAPI/health contract remains in force; this change adds consumer generation and integration without changing its requirements.

## Impact

Apply would affect backend contract export/tooling and documented response schemas, frontend-local generated artifacts and a thin transport wrapper, workspace scripts/CI, and focused contract tests. It would add only task-justified generator dependencies. It excludes new domain endpoints or DTOs, authentication/session/token handling, authorization, curriculum publishing, submission/progress/reward behavior, database schema changes, and other Phase 8+ work.
