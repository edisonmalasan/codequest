# production-security Specification

## Purpose

Keep existing CodeQuest learning and account boundaries defensible through focused security controls, repeatable evidence, and an honest pre-beta release review.

## Requirements

### Requirement: Authenticated application pages use defensive response headers

Trusted application pages SHALL prevent framing, limit referrer disclosure and unnecessary browser features, and disable content-type sniffing through explicit response headers. These headers SHALL apply only to the application surface; dedicated runtime and preview origins SHALL retain their separate CSP and sandbox behavior and SHALL not gain application session or route access.

#### Scenario: Account page is delivered

- **WHEN** a browser receives an application-origin account or learning page
- **THEN** its response carries framing, referrer, browser-feature, and content-type protections without including learner source, identity, or credentials

#### Scenario: Isolated runtime is delivered

- **WHEN** a browser loads a dedicated Worker bootstrap or static preview asset
- **THEN** its existing restrictive CSP and required iframe behavior remain intact and it cannot reach authenticated application routes through that host

### Requirement: Phase 33 security evidence covers existing trust boundaries

The repository SHALL include repeatable checks and a dated security review for backend token verification, owner and permission enforcement, API request validation and rate limits, Worker and preview isolation, database access policy, no learner upload surface, and secret handling. The review SHALL distinguish observed code or test evidence from deployment-only checks and SHALL retain failing or untested evidence rather than claiming a launch pass.

#### Scenario: Repository security review runs

- **WHEN** the Phase 33 verification is performed
- **THEN** it records the exact commands and results for the tested boundaries, names unresolved deployment checks, and does not infer production safety from local fixtures alone

#### Scenario: Deferred surface is inspected

- **WHEN** roles, Storage uploads, distributed rate limiting, or account deletion are assessed
- **THEN** the review states the current MVP boundary and the missing external policy or infrastructure rather than introducing those features implicitly

### Requirement: Security hardening preserves privacy and learning authority

Security changes SHALL not expose bearer credentials, learner source, protected responses, or account identity to telemetry, runtime/preview origins, static caches, or public routes. Backend identity and completion authority SHALL remain unchanged, and live learner collection SHALL remain gated by F06 consent, retention, deletion, and operator-access decisions.

#### Scenario: Hostile learner code and forged identity are exercised

- **WHEN** existing isolated execution and protected API regression checks run after hardening
- **THEN** learner code cannot obtain authenticated application capabilities and a frontend-supplied identity or role cannot select protected account data
