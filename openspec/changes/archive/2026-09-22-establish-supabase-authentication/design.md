## Context

See [proposal.md](proposal.md) for motivation. CodeQuest currently has four relevant foundations: a Next.js app with an empty auth feature shell, a NestJS Identity module with no behavior, a backend-owned `codequest.users`/`profiles` schema, and a generated frontend OpenAPI client whose public health transport omits credentials. Approved ADR 0008 selects trusted-client Supabase Auth flows and Bearer identity to NestJS; the backend must verify identity, derive ownership, and keep every CodeQuest table behind its API.

The database design already resolved provider linkage: a verified Supabase subject UUID maps directly to `codequest.users.id`, with no foreign key into provider-owned Auth schemas. Phase 8 must consume that decision, preserve forward-only migrations, and avoid introducing curriculum or account-lifecycle work.

## Goals / Non-Goals

**Goals:**

- Provide usable email/password, Google, and GitHub authentication across the four roadmap routes.
- Establish one trusted session boundary in Next.js and one independently verified principal boundary in NestJS.
- Create or recover the existing application user/profile idempotently from a verified Supabase subject.
- Make authentication, self-ownership, permissions, errors, and token containment testable without production credentials.
- Extend OpenAPI generation and typed frontend transport without cross-application source imports.

**Non-Goals:**

- Implement password reset/recovery, MFA, identity linking, account deletion, operator/admin management, or production provider administration.
- Add direct Supabase access to CodeQuest tables or Storage, Row Level Security as application authorization, or browser service-role credentials.
- Import guest progress, sync offline state, publish curriculum, accept submissions, or implement Phase 9+ behavior.
- Store Google/GitHub provider tokens or call either provider's APIs after authentication.

## Decisions

### 1. Use Supabase's PKCE SSR session pattern inside the trusted Next.js boundary

Use pinned Supabase browser/SSR libraries compatible with the installed Next.js version. Browser and server clients share a cookie-backed PKCE session through a narrow auth module; the callback exchanges a one-time code and the session-refresh boundary updates cookies before protected rendering. `/login` and `/register` initiate Auth operations, `/auth/callback` completes code exchange, and `/account` checks the refreshed server-side identity before rendering protected content.

Only local relative return paths are accepted, with `/account` as the fallback. OAuth and email-confirmation redirects use the same callback boundary. Login/register pages remain available when unauthenticated and redirect an already-authenticated learner to the safe destination. The account page redirects missing/invalid sessions to login.

This cookie is the frontend session mechanism, not NestJS authentication. Protected API calls still use the access token as an explicit Bearer header per ADR 0008. Tokens never enter application URLs, learner execution, generated files, telemetry, or general state stores.

Alternatives considered:

- Browser-only local-storage sessions: simpler, but weaker for protected Next.js routing and inconsistent with the selected callback/server-rendered route behavior.
- A Next.js-owned application session or backend password endpoints: duplicates Supabase Auth and risks turning Next.js into an alternate backend.
- NestJS cookie authentication: changes the approved Bearer transport and its cross-origin/CSRF model, so it requires a separate boundary decision.

### 2. Keep provider operations direct and minimal

Email/password sign-up and sign-in and Google/GitHub OAuth use Supabase Auth from the trusted auth module. Registration handles Supabase's two valid outcomes: an immediate session when allowed or a confirmation-required state when no session is issued. OAuth requests only the provider scopes Supabase needs for authentication. CodeQuest neither stores nor refreshes provider access tokens.

Provider dashboard configuration, secrets, branding, production redirect allowlists, SMTP deliverability, and live-provider smoke tests are deployment concerns. Apply will document required public URL/key and backend verification settings and use fakes or local keys for repeatable tests; it will not commit credentials or provision production infrastructure.

### 3. Verify Supabase access tokens locally at the NestJS boundary

The backend auth configuration validates an expected issuer, audience, and HTTPS JWKS URL derived from or checked against the configured Supabase project. A maintained JWT library verifies allowed asymmetric algorithms, signature, issuer, audience, expiry, not-before, and a UUID `sub`; remote keys are cached within bounded library behavior and unknown key IDs trigger a controlled refresh/fail-closed path. Startup rejects incomplete or internally inconsistent auth configuration without echoing secrets.

The guard accepts exactly one Bearer credential and creates an immutable request principal only after verification. Missing/malformed/invalid tokens produce a normalized `401`; verified principals that fail permission or ownership checks produce `403`. Error details and logs never include tokens, claims, cookies, or verification internals.

This design does not call Supabase Auth on every request and does not use a service-role key to validate user identity. A Supabase project still using a legacy shared signing secret must adopt supported asymmetric signing keys before this verifier can be used; the application will not receive or embed that secret merely to accept the legacy mode.

Alternatives considered:

- Decode JWTs without signature verification: gives the client authority and is prohibited.
- Call the Auth user endpoint on every request: adds latency/availability coupling and needs an extra browser-intended key without improving the selected asymmetric verification path.
- Trust the Supabase `role` or `user_metadata`: those values do not define CodeQuest permissions.

### 4. Derive one minimal application principal and default-deny permissions

The verified `sub` is parsed as a UUID and becomes both `principal.subject` and `principal.userId`; it is the only owner input accepted for self-service operations. The principal also carries a backend-constructed permission set. Phase 8 grants only the minimal authenticated-learner permissions required to establish and read the current account. Provider metadata, request payloads, query parameters, headers, and frontend state cannot add permissions.

Reusable authentication, current-principal, and permission boundaries live in the backend Identity module. Protected handlers declare the permission they need. Repositories receive the derived user ID from the service layer rather than accepting an arbitrary owner field from account DTOs. There is no admin fallback and no privileged endpoint in this phase.

### 5. Bootstrap the existing application identity through an idempotent protected contract

Add a versioned current-account contract with an idempotent establish operation and a read operation. Establishment inserts `codequest.users.id = principal.userId` and its default UTC profile in one logical transaction using conflict-safe semantics, then returns the existing or created account. Concurrent retries converge on one user and one profile. Read uses only `principal.userId`; the public contract has no owner selector.

The direct UUID mapping implements the Phase 6 design without a new provider-link table, Auth-schema foreign key, email column, provider column, or trigger. Email remains Supabase identity data displayed from the trusted session when needed; the CodeQuest account representation stays limited to application ID, profile timezone, and application timestamps. Existing forward migrations are not edited. A new migration is added only if Apply reveals a necessary schema constraint change; none is currently expected.

The callback/account flow calls establishment after it has a valid session. Repeating it for an existing Supabase user repairs a missing application row safely. Deleting or disabling the provider account does not silently delete CodeQuest records; full deletion/retention orchestration remains deferred.

Alternatives considered:

- Database trigger from provider-owned Auth tables: couples schemas, bypasses the NestJS ownership boundary, and complicates local verification.
- Store a separate provider-subject column: duplicates the already approved one-to-one UUID mapping without a multi-provider application-identity requirement.
- Mutate state during account GET: hides provisioning behind a nominal read and makes failure/retry semantics less clear.

### 6. Extend the generated API client through generation only

Document the protected account operations and Bearer security scheme in backend OpenAPI, export the document, and regenerate `frontend/src/lib/api/generated/`. A trusted API transport obtains the current access token at call time and attaches it only for protected operations. The existing health operation continues to omit credentials by default. HTTP, invalid-response, network, cancellation, request-ID, and safe-error distinctions remain intact.

The account feature consumes this frontend-local generated contract. It does not import NestJS DTOs, Drizzle schema, backend content, or a new root shared package. API drift remains a CI gate.

### 7. Test identity boundaries with controlled providers and keys

Frontend tests use an injected Supabase adapter/session fixture to cover all form states, confirmation-required registration, OAuth selection, callback errors, safe return paths, protected routing, sign-out, keyboard use, focus, and sensitive-value redaction. They do not make live Google/GitHub requests.

Backend tests use locally controlled asymmetric keys and a test JWKS endpoint or verifier seam to cover valid tokens, algorithm/signature/issuer/audience/time/subject failures, key rotation behavior, `401`/`403` separation, log redaction, principal immutability, permission denial, and attempted owner spoofing. PostgreSQL integration tests cover first bootstrap, concurrent/repeated bootstrap, profile ownership, and self-read. HTTP/OpenAPI tests prove account routes are protected and generated types drift when the contract changes.

Playwright covers the application route transitions with a controlled Auth test seam where practical. A live-provider manual result is not fabricated and is not required for deterministic CI; deployment readiness still requires configured provider redirect/secret checks before real users.

## Risks / Trade-offs

- **[`@supabase/ssr` APIs can change]** → Pin compatible versions, isolate the dependency behind auth client factories, and cover cookie/callback behavior with focused tests.
- **[Cookie-backed tokens remain sensitive browser material]** → Apply secure production cookie attributes through the supported library boundary, prevent token propagation to untrusted compartments/caches/logs, and keep NestJS on explicit Bearer verification.
- **[JWKS outage or rotation can reject requests]** → Use bounded cached keys, refresh on unknown key IDs, fail closed, and test rotation/failure behavior without logging claims.
- **[Lazy application bootstrap can partially fail]** → Use one database transaction and idempotent conflict handling; keep the valid Supabase session so the learner can retry safely.
- **[OAuth providers require external setup]** → Separate deterministic implementation checks from provider-console readiness and document every required redirect/configuration value without storing secrets.
- **[Account lifecycle remains incomplete]** → State password recovery, deletion/retention, identity linking, and provider disablement behavior as deferred and do not collect real learner data until later beta obligations are resolved.

## Migration Plan

1. Add pinned frontend Supabase and backend JWT-verification dependencies plus validated/redacted configuration contracts and examples.
2. Implement the isolated frontend Auth clients, refresh boundary, routes, forms, callback, protected navigation, and sign-out behavior with focused tests.
3. Implement backend token verification, immutable principal construction, authentication/permission enforcement, and safe `401`/`403` behavior with adversarial tests.
4. Add the idempotent account repository/service and protected current-account operations against the existing schema; add only a new forward migration if a reviewed constraint change proves necessary.
5. Export the updated OpenAPI contract, regenerate the frontend-local client, and wire authenticated account transport without changing public health credentials.
6. Run frontend/backend/PostgreSQL/HTTP/Playwright tests, generation and negative drift probes, lint/typecheck/build, strict OpenSpec validation, credential/boundary scans, and diff checks.

Rollback before merge removes the unmerged dependency, route, verifier, account, generated-client, and documentation changes. After deployment, application rollback may leave idempotently created user/profile rows; they are compatible with the existing Phase 6 schema and must not be deleted automatically. Any applied migration remains immutable and requires a forward corrective migration or approved restore.
