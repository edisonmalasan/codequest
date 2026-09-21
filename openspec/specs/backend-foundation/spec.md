# backend-foundation Specification

## Purpose

Define the stable modular, HTTP, operational, and security baseline that every later CodeQuest backend capability must use before persistence or domain behavior is introduced.

## Requirements

### Requirement: Backend boots as a modular monolith

The backend SHALL boot as one NestJS application on Fastify and SHALL expose separate Identity, Curriculum, Learning, Progress, Gamification, and Health module boundaries. The initial domain modules SHALL be loadable but SHALL NOT implement database access, authentication, curriculum, learner progress, rewards, or other later capability behavior.

#### Scenario: Foundation application starts

- **WHEN** the backend starts with valid configuration
- **THEN** one Fastify-backed NestJS process loads all six initial modules and becomes ready to accept HTTP requests

#### Scenario: Domain placeholders remain inert

- **WHEN** the initial domain modules are inspected or loaded
- **THEN** they expose no business endpoints, persistence adapters, external connections, or cross-application source imports

### Requirement: REST endpoints use the versioned API boundary

Application REST endpoints SHALL use URI versioning beneath `/api`, with version 1 resources addressed under `/api/v1`. Unknown routes and unsupported API versions SHALL return normalized JSON errors rather than HTML or framework-specific payloads.

#### Scenario: Versioned health request

- **WHEN** a client requests `GET /api/v1/health`
- **THEN** the backend returns `200` with the documented health representation

#### Scenario: Unsupported route

- **WHEN** a client requests an unknown path or unsupported version
- **THEN** the backend returns a normalized `404` JSON error carrying the request ID

### Requirement: Request input is validated and errors are stable

The backend SHALL apply global request transformation, allowlisted-property validation, rejection of unknown properties, and type validation to endpoint DTOs. HTTP and unexpected failures SHALL use a stable error envelope containing a machine-readable code, safe message, HTTP status, and request ID; validation failures SHALL include bounded field-level details and no stack trace, secret, or raw request body.

#### Scenario: Invalid request is rejected

- **WHEN** an endpoint receives an invalid or non-allowlisted property
- **THEN** it returns `400` with the normalized validation envelope and does not invoke endpoint business behavior

#### Scenario: Unexpected failure is contained

- **WHEN** an unhandled application error reaches the HTTP boundary
- **THEN** the client receives a safe `500` envelope with a request ID and no internal stack or sensitive value

### Requirement: Requests are correlated and logged safely

Every request SHALL have a request ID. A syntactically valid bounded `x-request-id` supplied by the caller SHALL be retained; otherwise the backend SHALL generate one. The ID SHALL be returned in the response header and error envelope. Request-completion logs SHALL be structured and limited to request ID, method, path without query values, response status, duration, and service context; request bodies, authorization values, cookies, learner source, and query values SHALL NOT be logged.

#### Scenario: Caller request ID is propagated

- **WHEN** a client sends a valid `x-request-id`
- **THEN** the response and structured completion log contain that same ID

#### Scenario: Sensitive request data is excluded

- **WHEN** a request contains query values or sensitive headers
- **THEN** the completion log records only the allowlisted metadata and contains none of those values

### Requirement: Runtime configuration is validated before listening

The backend SHALL validate host, port, environment, CORS origins, request-body limit, and rate-limit settings before opening a listener. Invalid, unsafe, or out-of-range values SHALL fail startup with an actionable configuration error. Defaults SHALL be safe for local development and production configuration SHALL require explicit allowed origins rather than a wildcard.

#### Scenario: Invalid configuration blocks startup

- **WHEN** a configured port, origin, body limit, or rate-limit value is malformed or outside its allowed range
- **THEN** startup fails before the network listener opens and identifies the invalid setting without exposing secrets

#### Scenario: Allowed origin receives CORS headers

- **WHEN** a request supplies an origin listed by validated configuration
- **THEN** the backend emits the appropriate CORS response headers, while an unlisted origin receives no access grant

### Requirement: OpenAPI describes the implemented HTTP surface

The backend SHALL generate an OpenAPI 3 document from the running application and expose interactive documentation at `/api/docs` plus JSON at `/api/openapi.json`. The document SHALL identify the version-1 server boundary and include only implemented routes and safe schemas.

#### Scenario: OpenAPI document is available

- **WHEN** a client requests `/api/openapi.json`
- **THEN** it receives a valid OpenAPI 3 document containing `/api/v1/health` and its response contract

### Requirement: Rate limiting has a reusable global foundation

The backend SHALL provide a configurable global fixed-window request limit and SHALL return a normalized `429` error with request correlation when the configured limit is exceeded. The foundation SHALL be process-local and SHALL make no distributed or production-scale guarantee before an explicit later requirement.

#### Scenario: Request limit is exceeded

- **WHEN** one client exceeds the configured request count within the configured window
- **THEN** the backend returns `429` using the stable error envelope and request ID

### Requirement: Health reports process readiness without false dependency claims

The health endpoint SHALL return a bounded response identifying the service, API version, and process status. Until database or external integrations exist, it SHALL report process readiness only and SHALL NOT imply database, Supabase, authentication-provider, storage, or curriculum readiness.

#### Scenario: Process is healthy

- **WHEN** the initialized application handles `GET /api/v1/health`
- **THEN** it returns `200` with `status: "ok"`, the CodeQuest API service identity, and API version 1

### Requirement: Lifecycle and architecture boundaries remain enforceable

The backend SHALL enable graceful shutdown hooks, SHALL keep frontend and backend source imports separate, and SHALL never execute arbitrary learner code. This foundation SHALL add no database, migration, authentication, business-rule, generated-client, analytics, PWA, or deployment behavior.

#### Scenario: Foundation boundary review

- **WHEN** the completed change is reviewed
- **THEN** all implementation stays within the backend foundation and repository metadata, no later capability is implemented, and learner-provided code has no execution path in the NestJS process
