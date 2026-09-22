## MODIFIED Requirements

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
