# Design

## Context

See [proposal.md](proposal.md). NestJS already verifies asymmetric Supabase JWTs, derives owner identity, validates DTOs, bounds request bodies, and applies a process-local request limit. The frontend refreshes its Supabase cookie session and uses separate runtime and preview hosts with restrictive CSP. Migration SQL creates the `codequest` schema without browser-role grants; no MVP upload endpoint exists. Existing Playwright and unit suites exercise many of these boundaries. Phase 33 strengthens concrete gaps and records what remains deployment-dependent.

## Goals / Non-Goals

**Goals:** Close timeless/overlong JWT acceptance, plaintext production CORS, and missing trusted-app response headers. Make the current security posture reviewable with repeatable tests and a dated evidence matrix.

**Non-Goals:** Define F06 privacy policy, provision Supabase or ingress infrastructure, claim an independent audit, add product permissions or uploads, replace the process-local throttler, change learner execution architecture, or assert physical-device/browser support that has not been tested.

## Decisions

### Bound access-token lifetime at the existing verifier

Add `SUPABASE_AUTH_MAX_TOKEN_AGE_SECONDS` to validated backend auth configuration, defaulting to 3600 seconds with a 300–86400 second allowed range. The deployment value must match the provider's configured access-token lifetime. Require signed `exp` and `iat`, reject future `iat`, nonpositive `exp - iat`, and lifetimes beyond this maximum; retain issuer, audience, algorithm, key and UUID checks. Use the existing normalized guard response and never log token text or verifier details. Supabase's documented one-hour default motivates the default; allowing an explicit bounded override avoids silently changing a provider with a reviewed custom setting. Accepting every signed token until `exp` without requiring `exp` was considered and rejected because it leaves a timeless-token path.

### Fail closed on production CORS configuration

Pass runtime environment into the existing origin parser and reject plaintext HTTP origins in production before listening. Development/test behavior stays compatible with local browser fixtures. A deployment proxy may terminate TLS, but its public browser origin must still be HTTPS. Do not infer trusted proxy IPs from untrusted `X-Forwarded-For`; the current throttler is process-local and requires an external ingress policy before beta.

### Add headers only at the trusted application boundary

Use the existing Next middleware path split to attach `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, a restrictive `Permissions-Policy`, and `X-Frame-Options: DENY` to normal application responses. Runtime and preview host branches return before this helper so their bootstrap frames remain embeddable only under their current isolation policy. Avoid a blanket app CSP here: Next's current script/style delivery needs a separately tested nonce or hash design, and a superficial policy could break the editor. Browser and middleware tests check both app headers and compartment headers.

### Review evidence without inventing deployment facts

Add a dated `docs/security-review.md` with one row per roadmap area: observed control, executed test, residual/untested condition, and owner action. Reuse auth, ownership, throttling, Worker/preview, migration, PWA and API tests; add focused regression cases for new behavior and any untested route metadata or no-upload invariants discovered during Apply. Migration source inspection can establish the absence of grants in this repo, but it cannot prove a hosted Supabase project's role grants. The review must say that. No-upload policy is verified by route inventory; future Storage work requires its own spec.

## Risks / Trade-offs

- [Provider JWT lifetime differs from 3600 seconds] → Make the bound explicit and configurable within a safe range; document the deployment match and test a custom setting.
- [Header middleware accidentally blocks runtime iframe] → Keep host branches separate and test bootstrap loading in browser, including preview and Worker recovery.
- [Local security tests are mistaken for production verification] → Record exact commands and deployment-only checks separately; retain F06 and physical-device obligations.
- [Process-local rate limiting gives a false distributed guarantee] → Keep its documented limit and require ingress protection/review before beta; do not introduce Redis without an approved requirement.

## Migration Plan

No schema or API migration. Deploy backend with a reviewed token-age value that matches Supabase Auth, HTTPS-only public CORS origins, and the existing secret store. Confirm frontend header behavior on the actual application and isolated hosts before enabling learners. Roll back by reverting the release; do not weaken time claims or origin checks through a hidden fallback. The review document is evidence, not deployment approval.
