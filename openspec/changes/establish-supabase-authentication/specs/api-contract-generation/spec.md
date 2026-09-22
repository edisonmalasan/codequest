## MODIFIED Requirements

### Requirement: Implemented backend routes are the sole client contract source

The system SHALL derive its frontend API types from the backend's OpenAPI 3 document for implemented routes. The generated contract SHALL retain versioned paths, HTTP methods, request and response schemas, status codes, authentication requirements, and the existing safe error envelope where those responses are implemented. It SHALL NOT describe planned but unimplemented domain operations as callable endpoints.

#### Scenario: Current contract is generated

- **WHEN** the contract is generated after the authentication capability is implemented
- **THEN** it includes the public `GET /api/v1/health` operation and the implemented protected current-account operations with their Bearer security and response contracts, with no invented curriculum, learning, or gamification operations

#### Scenario: Error is documented

- **WHEN** an implemented route returns a documented non-success status
- **THEN** the client contract identifies the HTTP status and the safe `error` envelope with code, message, status, and request ID rather than treating the response as a success payload
