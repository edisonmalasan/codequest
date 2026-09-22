## Purpose

Establish secure learner authentication and self-owned account access through Supabase Auth while preserving NestJS as the authority for application identity, permissions, and data ownership.

## ADDED Requirements

### Requirement: Learners can register and sign in through the approved methods

The trusted frontend SHALL provide `/register` and `/login` experiences for email/password, Google, and GitHub authentication through Supabase Auth. Forms SHALL be labelled, keyboard operable, report pending and failure states without exposing sensitive provider details, and preserve a safe intended destination when authentication succeeds. Email registration SHALL handle both an immediate session and a confirmation-required result without claiming the learner is signed in prematurely.

#### Scenario: Email registration requires confirmation

- **WHEN** a learner registers with a valid email and password and Supabase requires email confirmation
- **THEN** the registration route presents a confirmation-required state without creating an authenticated CodeQuest account session

#### Scenario: Email and password sign-in succeeds

- **WHEN** a registered learner submits valid email/password credentials on `/login`
- **THEN** the trusted frontend establishes the Supabase session and continues to the safe intended destination or `/account`

#### Scenario: Google or GitHub sign-in begins

- **WHEN** a learner selects Google or GitHub authentication
- **THEN** the frontend starts the corresponding Supabase OAuth flow with the approved callback URL and no extra provider-data scopes beyond authentication identity

### Requirement: Authentication callbacks and sessions are bounded

The frontend SHALL provide `/auth/callback` to complete approved PKCE or email-confirmation code exchanges and establish the trusted application session. Callback destinations SHALL be restricted to local application paths, invalid or failed exchanges SHALL produce a recoverable authentication error, and tokens or authorization codes SHALL NOT remain in the destination URL, logs, telemetry, learner runtime, or application content after processing. Session refresh and sign-out SHALL update the trusted session state and protected application caches consistently.

#### Scenario: Valid callback completes

- **WHEN** Supabase returns a valid one-time authentication code to `/auth/callback`
- **THEN** the code is exchanged once, the resulting trusted session is stored through the approved frontend session boundary, and the learner is redirected to an allowlisted local destination

#### Scenario: External redirect is attempted

- **WHEN** a callback or login return parameter names an external, protocol-relative, or otherwise unapproved destination
- **THEN** the frontend ignores it and uses `/account` without redirecting credentials or the learner off-site

#### Scenario: Learner signs out

- **WHEN** an authenticated learner signs out
- **THEN** the frontend terminates the Supabase session, removes protected in-memory and request-cache state, and prevents retained local data from being treated as another account's data

### Requirement: Account routes reflect authenticated self-service state

The frontend `/account` route SHALL require a current valid Supabase session and SHALL redirect an unauthenticated visitor to `/login` with a safe return path. It SHALL expose the current learner's minimal account state and sign-out control without allowing a user ID, role, or permission supplied by the browser to select or elevate an account. The backend SHALL expose versioned protected operations to idempotently establish the verified learner's application account and retrieve that same account.

#### Scenario: Unauthenticated account visit

- **WHEN** a visitor without a valid session requests `/account`
- **THEN** the frontend sends the visitor to `/login` with a local return destination and reveals no account data

#### Scenario: First authenticated account access

- **WHEN** a verified Supabase principal has no CodeQuest application user or profile yet and invokes the account-establishment operation
- **THEN** the backend creates exactly one user keyed by that principal and at most one default profile, then returns the current learner's account representation

#### Scenario: Account establishment is retried

- **WHEN** the same verified principal repeats or concurrently retries account establishment
- **THEN** the backend returns the same application identity without creating duplicate users or profiles

### Requirement: Protected API requests use the generated client boundary

The frontend SHALL call protected NestJS routes through the existing frontend-local generated OpenAPI contract and trusted API transport. That transport SHALL attach the current Supabase access token as a Bearer credential only to protected requests, SHALL retain cancellation and safe error behavior, and SHALL NOT add credentials to public requests by default. Generated files SHALL be regenerated from backend OpenAPI and SHALL NOT be hand-edited or replaced by backend source imports.

#### Scenario: Protected account request is sent

- **WHEN** trusted frontend code requests the current account with a valid session
- **THEN** the generated-client transport sends the access token in the `Authorization: Bearer` header to the configured backend and derives the response type from OpenAPI

#### Scenario: Public health request is sent

- **WHEN** the frontend requests the public health operation
- **THEN** the transport sends no authentication credential unless that operation is explicitly reclassified as protected by a later specification

### Requirement: Backend verifies every protected request

NestJS SHALL authenticate each protected request by verifying the Bearer token's signature, allowed algorithm, issuer, audience, expiry, not-before state when present, and required subject claim against validated Supabase configuration. Verification SHALL fail closed for absent, malformed, expired, unverifiable, wrong-issuer, wrong-audience, or otherwise invalid tokens and SHALL return the existing safe correlated error envelope without exposing token material or verification internals.

#### Scenario: Valid access token is accepted

- **WHEN** a protected request carries a correctly signed, current token from the configured Supabase issuer and audience with a valid UUID subject
- **THEN** NestJS establishes an authenticated principal for that subject before invoking protected behavior

#### Scenario: Invalid token is rejected

- **WHEN** a protected request has no Bearer token or carries a malformed, expired, wrong-signature, wrong-issuer, wrong-audience, disallowed-algorithm, or missing-subject token
- **THEN** NestJS returns a normalized `401` response and invokes no protected account or persistence behavior

### Requirement: Backend derives application identity from the verified subject

The backend SHALL map the verified Supabase `sub` UUID directly to the existing `codequest.users.id` application key and SHALL use that derived ID for application persistence and ownership checks. It SHALL NOT trust an email, provider identifier, frontend-supplied `userId`, request path owner, request-body owner, query owner, token metadata role, or Supabase database role as CodeQuest ownership or permission authority.

#### Scenario: Frontend supplies another owner

- **WHEN** an authenticated request includes a different user ID in a body, query, header, or route value for a self-owned account operation
- **THEN** the value cannot change the derived principal, access the other account, or become a persisted owner

#### Scenario: Provider metadata claims privilege

- **WHEN** a valid token contains provider-controlled metadata or a platform role claim that suggests elevated access
- **THEN** the backend ignores it for CodeQuest permissions unless a separately approved backend policy explicitly maps that claim

### Requirement: Ownership and permissions are enforced in the backend

Every protected handler and persistence operation SHALL require an authenticated principal plus the backend-defined permission needed for that action. Self-service account operations SHALL resolve ownership from the principal rather than an arbitrary resource owner supplied by the client. Missing authentication SHALL return `401`; an authenticated principal lacking a required permission or ownership relationship SHALL receive a safe `403`; and frontend visibility checks SHALL NOT substitute for backend enforcement.

#### Scenario: Self-owned account is read

- **WHEN** an authenticated learner with the account self-read permission requests the current account
- **THEN** the backend queries and returns only the account identified by that learner's derived application ID

#### Scenario: Permission is absent

- **WHEN** an authenticated principal invokes a protected operation without its backend-defined permission
- **THEN** the backend returns a normalized `403` and performs no protected read or mutation

### Requirement: Authentication secrets and privileged provider data remain contained

Public frontend configuration SHALL contain only values intended for browser use. Provider secrets, service-role keys, private signing material, refresh tokens, access tokens, authorization codes, and provider tokens SHALL NOT be committed, emitted in generated clients, sent to learner execution, recorded in request/error logs or telemetry, or persisted in CodeQuest application tables. The application SHALL request no Google or GitHub API access beyond identity authentication and SHALL NOT retain provider access tokens.

#### Scenario: Authentication traffic is logged

- **WHEN** login, callback, refresh, protected API, or sign-out traffic is observed by application logging and error handling
- **THEN** logs contain only allowlisted operational metadata and no credential, code, cookie, authorization value, provider token, or raw sensitive payload

#### Scenario: Repository is scanned

- **WHEN** tracked source, generated output, fixtures, and documentation examples are inspected
- **THEN** they contain no real Supabase, Google, or GitHub secret and no service-role credential exposed to the frontend

### Requirement: Authentication is verifiable without production credentials

The change SHALL include deterministic automated coverage for frontend auth states and accessibility, callback redirect safety, session-aware routing, bearer attachment boundaries, JWT validation failures, principal derivation, idempotent account establishment, cross-account resistance, permission denial, safe errors/logging, OpenAPI regeneration, and contract drift. Verification SHALL run with controlled local test keys, provider adapters, or fixtures and SHALL NOT require a production Supabase project or live Google/GitHub credentials.

#### Scenario: Authentication verification runs

- **WHEN** the approved frontend, backend, integration, API drift, repository, and strict OpenSpec checks run in the development or CI environment
- **THEN** the authentication behaviors and security boundaries pass without contacting production identity infrastructure

### Requirement: Later account and product capabilities remain excluded

The change SHALL NOT add password recovery, MFA, provider-account linking or merging, account deletion and retention orchestration, admin/author management, direct application-table access from the frontend, direct Storage uploads, guest-progress import, offline sync, curriculum publication, submissions, progress, rewards, learner execution, analytics, or production identity-provider provisioning. Those behaviors require their later roadmap phase or a separately approved specification.

#### Scenario: Scope is reviewed

- **WHEN** the completed Phase 8 diff is reviewed
- **THEN** it contains only authentication, minimal current-account identity, generated-contract updates, documentation, and focused verification with no Phase 9 or later product behavior
