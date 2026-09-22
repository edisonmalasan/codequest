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
```

Production origins must use HTTPS. The JWKS URL must share the issuer origin and equal `<issuer>/.well-known/jwks.json`. Only asymmetric `RS256` and `ES256` access tokens are accepted. Never place a Supabase secret or service-role key in a `NEXT_PUBLIC_*` variable, committed file, browser bundle, test fixture, or log.

Configure these allowed redirect URLs in Supabase Auth for each environment:

```text
http://localhost:3000/auth/callback
https://<production-origin>/auth/callback
```

Enable email/password, Google, and GitHub in the Supabase dashboard. Google and GitHub provider credentials stay in Supabase. CodeQuest requests authentication only and does not request, retain, or expose provider API tokens.

## Routes and account establishment

- `/register` supports email/password registration, confirmation-required registration, and Google/GitHub redirects.
- `/login` supports email/password and Google/GitHub sign-in.
- `/auth/callback` exchanges a one-time code and redirects only to a validated local path.
- `/account` requires a verified session, idempotently establishes the matching application user/profile through `PUT /api/v1/account`, and supports sign-out.

Sign-out clears Supabase session state and protected TanStack Query state. Owner identity never comes from a request body, query, route parameter, role claim, or frontend header. The protected account API has no owner selector.

## Verification and limitations

Unit and integration tests use local generated signing keys, controlled Supabase adapters, PGlite/PostgreSQL migrations, and browser fixtures. They require no production Supabase project or live Google/GitHub credentials. Run the normal repository commands plus `pnpm --dir frontend test:e2e` for the practical Chromium route checks.

Production provider provisioning, email delivery, password recovery, MFA, account linking/deletion, guest-data import, and curriculum behavior remain deferred. The project dependency audit currently reports existing advisories through Next.js/PostCSS and Fastify; Phase 8 did not upgrade unrelated packages.
