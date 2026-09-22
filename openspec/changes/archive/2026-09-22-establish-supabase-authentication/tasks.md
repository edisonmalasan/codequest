## 1. Dependencies and Configuration

- [x] 1.1 Add pinned, installed-version-compatible Supabase browser/SSR dependencies to the frontend and a maintained JWT/JWKS verification dependency to the backend; verify a frozen workspace install and dependency audit complete without unrelated upgrades.
- [x] 1.2 Define and document validated frontend public Auth URL/key/callback configuration and backend issuer/audience/JWKS configuration, with environment-specific redirect expectations; verify missing, malformed, inconsistent, insecure-production, and credential-like invalid values fail with redacted messages before use.
- [x] 1.3 Add controlled frontend Auth adapters and backend signing/JWKS fixtures for tests; verify the test setup runs without a production Supabase project or live Google/GitHub credentials and no fixture resembles a deployable secret.

## 2. Trusted Frontend Session Boundary

- [x] 2.1 Implement isolated browser and server Supabase Auth client factories plus the installed-Next.js-compatible cookie refresh boundary; verify session cookies refresh, expired/invalid sessions become unauthenticated, and token material does not enter general client state or logs.
- [x] 2.2 Implement and test a local-return-path validator shared by login, registration, and callback flows; verify absolute, protocol-relative, encoded, backslash, control-character, and malformed destinations fall back to `/account`.
- [x] 2.3 Implement the `/auth/callback` code exchange for OAuth and email confirmation, with one-time exchange, safe success redirect, and recoverable failure UI; verify codes/tokens are removed from the destination and excluded from logs and rendered errors.
- [x] 2.4 Implement sign-out and protected-state cleanup through the trusted Auth boundary; verify the session, protected query/request state, and previous principal are unavailable afterward while no local data is silently reassigned to another account.

## 3. Authentication and Account Routes

- [x] 3.1 Build the accessible `/register` email/password form and confirmation-required/immediate-session/error states; verify labels, autocomplete semantics, keyboard submission, focus management, duplicate-submission prevention, safe errors, and both Supabase registration outcomes.
- [x] 3.2 Build the accessible `/login` email/password flow with pending, invalid-credential, network, and successful safe-return states; verify authenticated visitors and successful sign-ins reach only the approved local destination.
- [x] 3.3 Add Google and GitHub controls to the login/register experience using the approved callback and authentication-only scopes; verify each selects the correct provider, carries the safe return path, and does not request/store provider API tokens.
- [x] 3.4 Build the protected `/account` route with minimal verified-session identity, backend account state, bootstrap retry/error handling, and sign-out; verify unauthenticated access redirects to `/login`, protected data is not rendered before authorization, and account UI cannot select a `userId` or role.
- [x] 3.5 Add focused frontend route/component and practical Playwright coverage for registration, login, callback success/failure, protected routing, account bootstrap, sign-out, keyboard/focus, and sensitive-value redaction using controlled Auth fixtures; verify the suite is deterministic without external provider traffic.

## 4. Backend Authentication and Authorization

- [x] 4.1 Implement validated Supabase JWT verification for allowed algorithms, signature, issuer, audience, expiry, not-before, key ID/rotation, and UUID subject; verify valid local tokens pass and every missing/malformed/wrong/expired case fails closed.
- [x] 4.2 Implement strict Bearer extraction and immutable current-principal construction in the Identity module; verify duplicate credentials, alternate schemes, whitespace/malformed headers, provider metadata roles, and frontend identity headers cannot establish or alter a principal.
- [x] 4.3 Add reusable authentication and backend-defined permission enforcement with normalized correlated `401` and `403` errors; verify protected behavior is never invoked on authentication failure or permission denial and public health remains public.
- [x] 4.4 Add adversarial security/logging coverage for token, cookie, code, claim, secret, and verification-error redaction; verify request completion and exception logs retain only allowlisted metadata and generated responses reveal no internals.

## 5. Application Account Ownership

- [x] 5.1 Add a narrow backend account repository/service that derives every owner from the verified principal and transactionally establishes `users` plus the default `profiles` row; verify first use, repeated use, concurrent retries, partial-existing state, and rollback all converge on exactly one owned account/profile.
- [x] 5.2 Add versioned protected account-establishment and current-account read operations with no client owner selector; verify another `userId` in body, query, header, or route cannot select, create, read, or persist another learner's account.
- [x] 5.3 Add PostgreSQL integration coverage for verified-subject UUID mapping, self-read, profile ownership, duplicate prevention, and cross-account denial; verify existing migration history is unchanged unless a separately reviewed new forward migration is demonstrably required.
- [x] 5.4 Document the minimal account response and security scheme in OpenAPI with safe `401`/`403` envelopes and request correlation; verify the document exposes only implemented account operations and contains no provider token, secret, backend schema, or Phase 9 endpoint.

## 6. Generated Client and Authenticated Transport

- [x] 6.1 Regenerate `frontend/src/lib/api/generated/` from the backend OpenAPI document after account operations are implemented; verify generation is deterministic, the drift check passes, and no generated file was hand-edited or imports backend source.
- [x] 6.2 Extend the frontend API wrapper to obtain the current access token at call time for protected account operations while preserving typed success/HTTP/invalid-response/network/cancelled outcomes; verify account requests carry one Bearer header and public health requests still omit credentials by default.
- [x] 6.3 Add positive and negative transport/contract tests covering missing session, refreshed session, `401`, `403`, request correlation, cancellation, network failure, stale generated output, and credential containment; verify a controlled backend contract edit makes `pnpm api:check` fail without rewriting the checked-in artifact.

## 7. Documentation, Boundaries, and Final Gates

- [x] 7.1 Document local/test Auth configuration, Supabase email/Google/GitHub redirect/provider prerequisites, asymmetric signing-key requirement, callback URLs, test strategy, and production-readiness limitations without real secrets; verify every documented repository command is runnable in the development environment.
- [x] 7.2 Update relevant implementation documentation and Project Status with Apply evidence while leaving canonical OpenSpec synchronization to the later Sync stage; verify links and status distinguish implemented authentication from deferred recovery, deletion, live-provider provisioning, and Phase 9 work.
- [x] 7.3 Review the final diff for direct frontend application-table access, service-role/browser secrets, backend-source imports, tokens in learner runtime/cache/logs, trusted frontend `userId`/role, provider API access, password recovery/MFA/linking/deletion, guest sync, curriculum, and later-phase behavior; verify none are introduced.
- [x] 7.4 Run frontend lint/typecheck/tests/build, backend lint/typecheck/tests/build, PostgreSQL integration checks, root API generation/drift/lint/typecheck/tests/build, applicable Playwright tests, strict OpenSpec validation, credential/boundary/link scans, and `git diff --check`; record exact results before the Apply PR is eligible to merge.

## Apply verification — 2026-09-22

- Frozen `pnpm install --frozen-lockfile`, frontend/backend lint and typecheck, frontend build, backend build, root lint/typecheck/build, `pnpm api:check`, `db:check`, `db:drift`, strict OpenSpec validation, documentation link scan, boundary/credential scans, and `git diff --check`: passed.
- Root tests: 189 passed (132 frontend and 57 backend), including five PostgreSQL-compatible relational integration cases and asymmetric JWT key-rotation coverage.
- Playwright Chromium Auth routes: 2 passed, covering keyboard-accessible login/register UI, callback failure redaction, safe redirect behavior, and unauthenticated account routing without external provider traffic.
- Controlled API drift: a temporary stale generated-client marker made `pnpm api:check` exit 1; restoring the checked-in artifact made the check pass.
- `pnpm audit --prod`: completed with exit 1 for six pre-existing transitive advisories (two high PostCSS advisories through Next.js and four moderate PostCSS/Fastify advisories). No finding is introduced through the new Supabase or JOSE dependencies; unrelated framework upgrades remain outside this Apply change.
- Production Supabase project creation, live Google/GitHub provider credentials, and email delivery remain intentionally untested and deferred; no production-readiness claim depends on them.
