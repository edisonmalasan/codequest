# Spec Delta

## MODIFIED Requirements

### Requirement: Backend verifies every protected request

NestJS SHALL authenticate each protected request by verifying the Bearer token's signature, allowed algorithm, issuer, audience, required expiration and issued-at claims, not-before state when present, and required subject claim against validated Supabase configuration. The token's issued-at and expiration window SHALL be positive, current, and no longer than a validated provider-aligned maximum age. Verification SHALL fail closed for absent, malformed, expired, timeless, overlong, unverifiable, wrong-issuer, wrong-audience, or otherwise invalid tokens and SHALL return the existing safe correlated error envelope without exposing token material or verification internals.

#### Scenario: Valid access token is accepted

- **WHEN** a protected request carries a correctly signed, current token from the configured Supabase issuer and audience with a valid UUID subject and bounded time claims
- **THEN** NestJS establishes an authenticated principal for that subject before invoking protected behavior

#### Scenario: Invalid token is rejected

- **WHEN** a protected request has no Bearer token or carries a malformed, expired, wrong-signature, wrong-issuer, wrong-audience, disallowed-algorithm, or missing-subject token
- **THEN** NestJS returns a normalized `401` response and invokes no protected account or persistence behavior

#### Scenario: Missing or overlong token lifetime

- **WHEN** a correctly signed token omits `exp` or `iat`, has an expiration not after issuance, has a future issuance, or exceeds the configured maximum age
- **THEN** protected behavior is denied with the normalized `401` response and neither token claims nor verifier internals appear in logs or the response
