# Authentication

Status: Phase 8 implementation complete; canonical [authentication specification](../openspec/specs/authentication/spec.md) synced and [change archived](../openspec/changes/archive/2026-09-22-establish-supabase-authentication/proposal.md).

CodeQuest uses Supabase Auth for email/password, Google, and GitHub identity. Next.js owns the cookie-backed PKCE session boundary and passes a current access token only to protected NestJS requests. NestJS verifies the token against the configured asymmetric JWKS, derives the application user ID from the verified UUID `sub`, assigns backend-defined permissions, and alone reads or writes CodeQuest application tables.

## Local and test configuration

Frontend public configuration:

```text
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local publishable key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://127.0.0.1:3001
```

Backend verification configuration:

```text
SUPABASE_AUTH_ISSUER=http://127.0.0.1:54321/auth/v1
SUPABASE_AUTH_AUDIENCE=authenticated
SUPABASE_AUTH_JWKS_URL=http://127.0.0.1:54321/auth/v1/.well-known/jwks.json
SUPABASE_AUTH_MAX_TOKEN_AGE_SECONDS=3600
```

Production origins must use HTTPS. The JWKS URL must share the issuer origin and equal `<issuer>/.well-known/jwks.json`. Only asymmetric `RS256` and `ES256` access tokens are accepted. Never place a Supabase secret or service-role key in a `NEXT_PUBLIC_*` variable, committed file, browser bundle, test fixture, or log.

Production `CORS_ORIGINS` must also use HTTPS. Verified access tokens must carry `iat` and `exp` with a positive signed lifetime no longer than `SUPABASE_AUTH_MAX_TOKEN_AGE_SECONDS`. This setting defaults to 3600 seconds and accepts 300–86400 seconds; match it to the reviewed Supabase access-token lifetime before deployment.

Configure these allowed redirect URLs in Supabase Auth for each environment:

```text
http://localhost:3000/auth/callback
https://<production-origin>/auth/callback
```

Enable email/password, Google, and GitHub in the Supabase dashboard. Google and GitHub provider credentials stay in Supabase. CodeQuest requests authentication only and does not request, retain, or expose provider API tokens.

The frontend checks the public Supabase Auth settings before starting Google or GitHub sign-in. If a provider is disabled in the configured project, the learner stays on the CodeQuest sign-in page and can use email or retry later. A passing settings check is only an availability hint; it does not prove a provider redirect, callback, session, or backend account. Configure each provider in Supabase and its upstream provider console, then verify the complete synthetic flow separately. Provider client secrets must remain in those consoles or their protected secret stores.

### Local integration troubleshooting

1. Start both apps with `pnpm dev` and wait for the frontend ready message and `http://127.0.0.1:3001/api/v1/health` to return HTTP 200. A health request during the initial backend watch startup can fail before the process is ready. Do not change the watch script based only on that early result.
2. Check that `http://localhost:3000/login`, `/register`, and `/recover` load. If they report missing public configuration, check only the presence and shape of values in `frontend/.env.local`; keep the backend connection, token-verification values, and secrets in `backend/.env.local`.
3. Confirm the selected Supabase project has email sign-in enabled and the application callback `http://localhost:3000/auth/callback` in its redirect allowlist. For Google and GitHub, enable and configure each provider there and register the Supabase Auth callback in the corresponding provider console. A disabled provider now yields a safe email alternative on the login page; no frontend change can substitute for provider setup.
4. For confirmation and recovery, inspect the project's approved email delivery/template configuration and test with an inbox controlled for synthetic verification. A registration confirmation message means there is no signed-in session yet. Recovery intentionally shows the same acknowledgement whether an address is eligible or delivery fails; investigate delivery through approved operator tools without exposing account existence to the learner.
5. If sign-in succeeds but `/account` reports that account data could not be loaded, check backend availability, the configured issuer/JWKS/token lifetime, and the protected account request. Retry on the account page after the underlying issue is resolved. Never paste bearer tokens, cookies, full provider responses, learner source, or credentials into an issue or verification record.

The [R04 verification record](r04-auth-verification.md) tracks which local checks have actually run. It does not replace per-method synthetic integration or founder acceptance.

## Routes and account establishment

- `/register` supports email/password registration, confirmation-required registration, and Google/GitHub redirects.
- `/login` supports email/password and Google/GitHub sign-in.
- `/auth/callback` exchanges a one-time code and redirects only to a validated local path.
- `/recover` requests email password recovery with the same generic acknowledgement for eligible, unknown, and provider-failed addresses. Supabase sends the one-time code to `/auth/callback?next=/account/password`; the callback exchanges it and strips it from the destination URL.
- `/account/password` requires a trusted current session, then changes an email password through Supabase Auth. Google and GitHub sign-in remain available for provider accounts. Provider errors are not rendered verbatim.
- `/account` requires a verified session, idempotently establishes the matching application user/profile through `PUT /api/v1/account`, and supports sign-out.
- `PUT /api/v1/account/timezone` validates an authenticated learner's IANA timezone and updates only that principal's profile. It affects future accepted streak days; past days retain their recorded timezone and local date. The account page explains this and the 24-hour changed-zone credit guard.

Sign-out clears Supabase session state and protected TanStack Query state. Owner identity never comes from a request body, query, route parameter, role claim, or frontend header. The protected account API has no owner selector.

## Verification and limitations

Unit and integration tests use local generated signing keys, controlled Supabase adapters, PGlite/PostgreSQL migrations, and browser fixtures. They require no production Supabase project or live Google/GitHub credentials. Run the normal repository commands plus `pnpm --dir frontend test:e2e` for the practical Chromium route checks.

Before exposing recovery to real learners, allowlist the deployed `/auth/callback` origin in Supabase Auth, configure the recovery email template and delivery, then test valid, expired, reused and malformed links, session refresh and rate limiting on the hosted environment. Local tests use controlled Auth adapters and do not prove email delivery. F06 still blocks real learner collection. Production provider provisioning, MFA, account linking/deletion and hosted recovery verification remain open. The project dependency audit currently reports existing advisories through Next.js/PostCSS and Fastify; Phase 8 did not upgrade unrelated packages.
