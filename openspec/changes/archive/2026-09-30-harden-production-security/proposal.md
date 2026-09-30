# Proposal

## Why

Phase 33 is the roadmap security review before real users. The current backend accepts a correctly signed token without an `exp` claim, production CORS configuration permits HTTP origins, and application pages lack a consistent set of defensive response headers. The wider authentication, authorization, API, runtime, database, storage, and secret boundaries need an evidence-based review rather than a launch-readiness claim.

## What Changes

- Require a bounded issued-at and expiration window for protected Bearer tokens, with a validated provider-aligned maximum age and safe `401` failures.
- Reject insecure production CORS origins and add application-origin response headers that do not weaken dedicated runtime or preview origin policies.
- Add focused authorization, request-limit, isolation, database privilege, no-upload, and secret-containment checks where repository evidence can establish them.
- Record the Phase 33 security review, concrete test evidence, unresolved deployment checks, and pre-beta obligations without enabling real learner collection.
- Preserve the existing process-local rate limiter and P11 Worker/static-preview design; document the ingress and role-verification work required in an actual deployment.

## Capabilities

### New Capabilities

- `production-security`: Cross-boundary hardening, security verification evidence, and truthful release-gate reporting for the existing MVP.

### Modified Capabilities

- `authentication`: Require present, current and bounded token time claims during backend Bearer verification.
- `backend-foundation`: Require HTTPS CORS origins in production while retaining explicit local development origins.

## Impact

Backend auth verification and configuration, frontend application headers, focused tests and browser checks, and a security review document are affected. No API schema or database migration is expected. No MFA, privileged-role product surface, uploads, distributed rate-limit store, remote runner, account deletion, consent implementation, or production secret provisioning is added.
