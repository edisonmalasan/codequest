# api-contract-generation Specification

## Purpose

Provide a reproducible, strongly typed REST contract between the implemented NestJS API and its Next.js consumer without sharing application source or creating premature domain endpoints.

## Requirements

### Requirement: Implemented backend routes are the sole client contract source

The system SHALL derive its frontend API types from the backend's OpenAPI 3 document for implemented routes. The generated contract SHALL retain versioned paths, HTTP methods, request and response schemas, status codes, authentication requirements, and the existing safe error envelope where those responses are implemented. It SHALL NOT describe planned but unimplemented domain operations as callable endpoints.

#### Scenario: Current contract is generated

- **WHEN** the contract is generated after the curriculum API capability is implemented
- **THEN** it includes the public health and read-only curriculum operations plus the implemented protected current-account operations, with Bearer security only where required and no invented learning, progress, submission, or gamification operations

#### Scenario: Error is documented

- **WHEN** an implemented route returns a documented non-success status
- **THEN** the client contract identifies the HTTP status and the safe `error` envelope with code, message, status, and request ID rather than treating the response as a success payload

### Requirement: Frontend client is generated and owned locally

The frontend SHALL consume the backend through a typed client based on generated OpenAPI types stored under `frontend/src/lib/api/generated/`. Generated files SHALL be reproducible from the backend contract and SHALL NOT be hand-edited. Frontend source SHALL NOT import backend source, database schema, or authored backend content, and the change SHALL NOT create a root shared API-client package without an approved second independent consumer.

#### Scenario: Typed health request

- **WHEN** frontend code requests the implemented health operation through the typed client
- **THEN** its route, method, and success payload types are derived from the generated contract and it uses the configured API base URL

#### Scenario: Typed curriculum request

- **WHEN** frontend code requests an implemented curriculum operation through the typed client
- **THEN** its route, method, success payload, and documented error types are derived from the generated contract and it uses the configured API base URL without credentials by default

#### Scenario: Source boundary inspection

- **WHEN** frontend API imports and generated artifacts are reviewed
- **THEN** they contain no backend source import, privileged database credential, authentication token, learner source, or manually maintained copy of backend DTOs

### Requirement: Contract regeneration and drift are enforced

The repository SHALL provide documented, repeatable commands to export the backend OpenAPI contract, regenerate the frontend client, and verify that checked-in generated output matches the current backend. Verification SHALL fail when an implemented route or DTO changes without corresponding regeneration; it SHALL run without production credentials or a listening production service.

#### Scenario: Unchanged contract is stable

- **WHEN** generation runs twice against the same backend source and pinned tooling
- **THEN** the generated output is identical and the drift check passes

#### Scenario: Backend contract changes without regeneration

- **WHEN** a documented route or response shape changes while generated artifacts remain stale
- **THEN** the contract drift check fails with a non-zero result before the change can merge

### Requirement: Transport preserves existing HTTP and security boundaries

The client SHALL distinguish success from non-success HTTP responses and transport failures, expose the existing safe error/request-correlation information when present, and support request cancellation without reinterpreting backend business rules. It SHALL NOT send credentials by default, embed secrets, call CodeQuest application tables directly, or expose an API client to the learner execution compartment.

#### Scenario: Health succeeds

- **WHEN** the versioned health endpoint returns its documented success response
- **THEN** the typed client exposes the health representation to its caller

#### Scenario: HTTP or network failure

- **WHEN** the backend returns a documented error or the request cannot complete
- **THEN** the client reports a distinguishable failure without converting it to successful data or leaking sensitive request material

### Requirement: Later domain behavior stays outside the contract-generation change

The change SHALL NOT add authentication, session refresh, token verification, authorization, curriculum publication, submissions, progress, rewards, guest import, offline sync, database migrations, or new product endpoints. Future operations SHALL enter the generated client only after their backend capability defines and implements them.

#### Scenario: Scope review

- **WHEN** the completed change is reviewed
- **THEN** only contract export, client generation/transport, documentation, and focused verification are present, with no Phase 8 or later business behavior
