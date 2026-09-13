# ADR 0002: REST/OpenAPI and frontend-local generated client

## Status and evidence

Accepted documented commitment. Approval evidence: AGENTS.md Architecture boundaries/Boundaries and roadmap Architectural Principles. Register: [C03/C04/F03/F09](../decisions.md). Owner: technical owner; named assignee unassigned.

## Context

The roadmap's API generation flow points to `packages/api-client`, but AGENTS.md specifies `frontend/src/lib/api/generated/` and forbids unjustified root shared packages. No API or client exists yet and frontend is the only planned consuming application.

## Decision

Backend exposes the documented REST/OpenAPI application contract. Generate frontend code under `frontend/src/lib/api/generated/`; never hand-edit it or import backend DTO/source files into frontend. Backend likewise cannot import frontend source. AGENTS.md's path supersedes conflicting roadmap trees explicitly.

## Alternatives

- Root `packages/api-client`: not justified without at least two independent consumers.
- Direct shared DTO imports: violate application/API boundaries and couple frontend to backend source.
- GraphQL/tRPC: excluded absent an active approved requirement; no current need changes the documented choice.

## Consequences

Backend contract generation will be its own later capability/tooling task. Generator, DTO/error schema and detailed compatibility/version policy are deferred F03; this ADR does not create or freeze them. Frontend API consumption remains strongly typed through generation rather than source sharing.

## Related records and revisit trigger

[Architecture](../architecture.md), [ADR 0001](0001-frontend-backend-separation.md). Revisit package placement only with two real independent consumers and an approved extraction rationale; revisit transport only through explicit architecture approval. No current API/client code changes occur here.
