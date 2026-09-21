## Why

CodeQuest has a bootable NestJS/Fastify shell, but it does not yet provide the modular boundaries or cross-cutting HTTP controls required before database and domain capabilities are added. Establishing those controls now gives later backend work one versioned, observable, validated, and documented application boundary without prematurely implementing persistence, authentication, or business rules.

## What Changes

- Establish the NestJS modular-monolith directory structure with empty Identity, Curriculum, Learning, Progress, and Gamification domain modules plus an operational Health module.
- Serve the REST application under `/api/v1` with URI versioning and publish a generated OpenAPI document for the implemented surface.
- Add global request validation and a stable error envelope without exposing stack traces or sensitive request data.
- Add request IDs, structured request-completion logging with redaction, constrained environment-driven CORS, validated configuration, and graceful startup/shutdown behavior.
- Add a reusable rate-limit foundation with deterministic `429` responses while keeping policy conservative for the current health-only surface.
- Expand health reporting and focused tests for configuration, API bootstrapping, validation/error behavior, request correlation, CORS, OpenAPI, rate limiting, and module boundaries.
- Update roadmap status while retaining all approved frontend/backend, security, and learner-execution boundaries.

This change does not add a database, migrations, Supabase connectivity, authentication flows or token verification, generated frontend clients, curriculum content, progress/XP rules, learner execution, analytics, PWA behavior, or production deployment infrastructure.

## Capabilities

### New Capabilities

- `backend-foundation`: The modular NestJS/Fastify application shell, versioned REST bootstrap, configuration and HTTP safety controls, operational health surface, OpenAPI document, and verification contract.

### Modified Capabilities

None.

## Impact

- Affected code: `backend/src/`, backend tests/configuration, and `backend/package.json`.
- Dependencies: focused NestJS-compatible packages for configuration, validation, OpenAPI, CORS, and throttling; exact versions remain locked in the workspace.
- API: the existing health surface moves into the documented `/api/v1` contract and gains a stable response/error contract.
- Operations: startup rejects invalid configuration, requests receive correlation IDs and bounded logs, and the application supports graceful shutdown.
- Documentation: the roadmap records this change as the active backend-foundation work. No canonical spec changes occur until the later Sync stage.
