# R04 authentication verification

This record separates local configuration observations from completed learner journeys. It contains no account identifiers, credentials, tokens, provider payloads, or private response bodies. Every result below is a synthetic or anonymous probe, not founder acceptance or hosted beta evidence.

## Local diagnostic probe — 2026-10-02

| Field | Value |
| --- | --- |
| Tested commit | `f32000df6ecf9a6a1335b647a96f92d76e499b01` |
| Environment | Local Windows development; Node `v26.10.0`; `pnpm dev`; application `http://localhost:3000`; backend `http://127.0.0.1:3001`; configured Supabase project identity omitted |
| Operator | Repository agent, anonymous/synthetic probes only |
| Scope | Startup, public Auth configuration and unauthenticated route behavior; no delivered email or completed sign-in |

| Probe | Observed result | Conclusion / next check |
| --- | --- | --- |
| Root `pnpm dev` | Login and registration returned HTTP 200; backend health eventually returned HTTP 200. Backend watch printed eight startup restarts and no further restarts in a 12-second stability sample. | The first health probe was premature. No startup repair is justified by this observation. Retest after application changes. |
| Public Supabase Auth health and settings | Both returned HTTP 200. Frontend URL/key fields were present and non-placeholder; backend issuer and JWKS matched the configured frontend Auth origin; public JWKS returned HTTP 200. | Reachability and configuration shape pass. These checks do not prove token acceptance or account establishment. |
| Auth provider settings | Email enabled, signups allowed, email auto-confirmation disabled. Google and GitHub reported disabled; both anonymous authorize probes returned HTTP 400. | Provider sign-in is blocked by external project configuration. Do not claim provider integration or founder acceptance. |
| Anonymous app routes | `/login`, `/register`, `/recover` returned HTTP 200. `/account` and `/account/password` redirected to `/login`; a callback with no code redirected to `/login`. | The anonymous route boundary behaves as expected. Real callback, cookie, recovery and session flows remain untested. |
| Protected backend account without bearer | HTTP 401. | The anonymous boundary rejects the request; owner-scoped accepted-account behavior remains untested. |

### Application-side repair and controlled verification

The Apply branch adds a provider-availability check against public Auth settings, a safe local retry message for disabled providers, confirmation that password sign-in returned a session before navigation, preservation of a safe return path after callback failure, and a retryable sign-out error that keeps the visible account state. No backend identity code or API contract changed: focused backend verifier, guard, account-service and owner-scoped repository tests passed. One PGlite repository run exceeded its default 10-second setup hook under local load and passed when rerun alone with a 30-second hook limit; this is not evidence of a production account handshake.

Focused frontend component/session/callback tests passed 19/19, and the controlled Chromium Auth route suite passed 3/3. A separate browser check against the configured local project observed public settings HTTP 200, the disabled-provider message, and the learner remaining on `/login`. These checks verify the fallback behavior only. The release candidate is not selected; the code checks must be repeated or tied to a committed Apply revision before final classification.

| Apply verification command | Observed result on 2026-10-02 |
| --- | --- |
| `pnpm lint`, `pnpm typecheck`, `pnpm build` | Passed. |
| `pnpm --dir frontend exec playwright test e2e/auth.spec.ts --project=chromium` | 3/3 passed after correcting a strict locator in the new fixture test. |
| Focused frontend Auth/session/callback unit tests | 19/19 passed. |
| Focused backend JWT, guard, account service and repository tests | JWT/guard/service passed 29/29. The PGlite repository test exceeded its default 10-second hook twice under local load; it passed in isolation with `--hookTimeout=30000`. No backend code changed. |
| `pnpm test` | Failed locally: 5/420 timed out in the default parallel frontend run. A serial run with a 20-second command-line timeout had 1/420 failure. A limited-worker rerun with the same command-line timeout passed 420/420. No repository test timeout was changed. The standard command remains an open local gate unless CI passes it. |
| `pnpm api:check` | Passed; no OpenAPI contract changed. |
| `openspec validate stabilize-real-authentication --strict` | Passed. |

The required [PR #192 CI run](https://github.com/edisonmalasan/codequest/actions/runs/37004979431) passed on application commit `7d69e8294329a49cc65db70d6b41b42805af9420`, including the standard root lint, typecheck, tests, build, and browser gates. This closes the repository verification task for that code revision. It does not verify real Supabase email delivery, OAuth callbacks, or a protected signed-in account.

The public Auth settings endpoint does not expose the redirect allowlist, email template/delivery configuration, or provider credentials. Those settings require a dashboard review or a completed synthetic flow. The local Supabase project was not classified as a hosted beta deployment. No hosted readiness row is closed by this record.

## Required journey evidence still open

| Journey | Current state | Evidence needed on the exact candidate build |
| --- | --- | --- |
| Email signup and delivered confirmation | Untested; email enabled but a controlled test inbox and delivery/configuration check are not available in this probe. | Synthetic registration, received message, callback, trusted session, backend self-account and safe retry/expiry result. |
| Email login, refresh, logout and relogin | Untested. | Synthetic confirmed account across browser reload and a protected backend read; logout clears trusted state. |
| Google OAuth | Blocked by disabled provider setting. | Enabled provider, approved callback allowlist and synthetic real redirect/callback into a backend self-account. |
| GitHub OAuth | Blocked by disabled provider setting. | Enabled provider, approved callback allowlist and synthetic real redirect/callback into a backend self-account. |
| Recovery and password update | Untested; delivery and callback not exercised. | Controlled synthetic email, one-time recovery callback, update, old-password rejection and new-password login. |
| Founder walkthrough | Not requested or performed for this build. | Separate dated review of each required method on the intended environment, with defects and retests. |

These observations must be repeated against the implementation candidate. R04 remains below integrated and founder accepted; Phase 38 remains PAUSED and NO GO.
