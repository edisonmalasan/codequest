## Why

CodeQuest now has database and generated API foundations but no way to establish a real learner identity or protect account-owned data. Phase 8 must add the approved Supabase Auth boundary before later curriculum and learning endpoints can rely on authenticated ownership.

## What Changes

- Add email/password registration and sign-in plus Google and GitHub OAuth through Supabase Auth.
- Add accessible `/login`, `/register`, `/auth/callback`, and protected `/account` frontend routes, including safe callback redirects, session refresh, sign-out, and explicit pending-email-confirmation and failure states.
- Add backend verification for Supabase bearer access tokens, deriving the current principal only from validated token claims and mapping the verified subject UUID to the existing application user key.
- Add idempotent application-account/profile bootstrap and a minimal versioned account contract generated into the existing frontend-local API client.
- Enforce authentication, self-ownership, and backend-assigned permissions at the NestJS boundary; reject missing, invalid, expired, wrong-issuer, wrong-audience, or insufficient tokens with safe correlated errors.
- Keep session and token material inside trusted authentication/API transport code and outside learner execution, URLs, logs, telemetry, generated artifacts, and protected-response caches.
- Add focused frontend, backend, integration, security, OpenAPI drift, and route-flow verification without requiring production credentials.
- Update Phase 8 implementation documentation and roadmap status while leaving later account recovery/deletion policy, guest import, curriculum, learning, and gamification behavior out of scope.

## Capabilities

### New Capabilities

- `authentication`: Supabase sign-up/sign-in/session routes, backend token verification and principal derivation, application-account bootstrap, self-ownership, permission enforcement, secure bearer transport, and authentication verification.

### Modified Capabilities

- `api-contract-generation`: Update the implemented-route scenario so the generated contract includes the new protected current-account operations while continuing to exclude unimplemented curriculum, learning, and gamification operations.

## Impact

- Frontend authentication feature code, trusted Supabase clients/session refresh boundary, four application routes, protected navigation, account UI, and generated API consumption.
- Backend Identity module, authentication/authorization guards and decorators, Supabase JWT/JWKS configuration, application-user/profile persistence, protected account endpoint, OpenAPI security/error schemas, and generated client output.
- New pinned Supabase and JWT-verification dependencies plus documented public/backend configuration; no credentials or production Supabase project configuration are committed.
- Existing `codequest.users.id` and `profiles.user_id` remain the application ownership keys, with the verified Supabase subject UUID used directly and no provider-schema foreign key.
- No direct frontend access to CodeQuest tables, backend-source imports, service-role key in the browser, learner-runtime token exposure, or Phase 9+ curriculum behavior.
