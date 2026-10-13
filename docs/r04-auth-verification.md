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
| Read-only Supabase Management Auth configuration | Management API returned HTTP 200 with the scoped access token. The local callback is allowlisted, the Site URL matches the local app, email is enabled and confirmation is required. Google and GitHub are disabled; neither has a configured client ID or secret. No custom SMTP host is configured. Only boolean checks were output; no configuration values or credentials were retained. | Provider setup needs upstream OAuth application credentials and controlled test identities. Confirmation/recovery delivery still needs a controlled inbox and a successful synthetic run. The management token alone cannot complete either journey. |
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

The public Auth settings endpoint does not expose the redirect allowlist, email template/delivery configuration, or provider credentials. A read-only management check established the local callback allowlist and the absence of configured provider credentials and custom SMTP. It did not prove that a confirmation or recovery message can be received. The local Supabase project was not classified as a hosted beta deployment. No hosted readiness row is closed by this record.

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

## Current-main local smoke — 2026-10-12

| Field | Value |
| --- | --- |
| Tested commit | `8632ea1a8bf35b8c87fb4dd2396e5324b924083e` |
| Environment | Local Windows development; Node `v26.10.0`; root `pnpm dev`; frontend `http://localhost:3000`; backend `http://127.0.0.1:3001`; local environment files were used and no values were recorded. |
| Operator | Repository agent; anonymous routes and health only. |
| Scope | Startup, anonymous route behavior, backend health recovery, and a read-only public Auth settings reachability probe. No account creation, delivered email, OAuth, recovery, protected account read, database write, or founder review. |

| Probe | Observed result | Conclusion |
| --- | --- | --- |
| `pnpm dev` | Next.js became ready. The backend watch restarted twice after detecting changes under installed Fastify files in `node_modules`; it subsequently served health requests. | Frontend and backend start. The dependency-file watch restarts are observable, but did not prevent the later health pass; no startup repair is justified by this smoke alone. |
| `/login`, `/register`, `/recover` | HTTP 200 for all three routes. | Anonymous Auth pages render at the HTTP level; this does not establish working Supabase integration or prove all page configuration states. |
| Anonymous `/account` | HTTP 307 to `/login?next=%2Faccount`. | The anonymous account route redirects as expected. |
| `/api/v1/health` | The first request during startup failed; three subsequent requests returned HTTP 200. | Backend health recovered after startup. The initial failure is not a sustained outage. |
| Public Supabase Auth settings | The read-only request failed with DNS `ENOTFOUND` for the configured project host; no settings response was received. | Provider status, email delivery, and redirect configuration were not verified by this probe. Do not infer provider enablement from the earlier record. |

The repository remained unchanged during the smoke apart from this sanitized evidence record. No credentials, project hostname, account identifiers, provider payloads, or response bodies were retained. R04 tasks 3.1–3.4 remain open: synthetic email delivery and account establishment, Google OAuth, GitHub OAuth, recovery/password update, and founder walkthrough all require their specified evidence on the intended environment. The active R09 Apply preflight therefore remains blocked.

## Resumed-project local probe — 2026-10-13

| Field | Value |
| --- | --- |
| Application revision | `51c109f` on `fix/auth-callback-recovery`; local Windows development, Node `v26.10.0`, application `http://localhost:3000`, backend `http://127.0.0.1:3001`. This is not a beta release candidate. |
| Operator and scope | Repository agent; anonymous reachability and synthetic invalid-code callback only. No learner identity, received email, provider consent, protected account read, or founder walkthrough. |
| Secret handling | Local environment files supplied configuration to the processes. No project reference, access token, publishable key, address, credential, response body, cookie, or authorization code was retained in this record. |

| Probe | Observed result | Meaning |
| --- | --- | --- |
| Project reachability | The configured project host resolved. Auth health, public settings, and JWKS initially returned `502`, then returned `200` on retry; the same frontend publishable key was used for the public endpoint checks. | Supabase Auth became reachable after the reported project resume. The first responses were failed probes, not passes. |
| Public Auth settings | Email enabled, signup allowed, confirmation required; Google and GitHub disabled. | Email configuration shape is usable for a delivered-message test. Neither provider journey is available. |
| Management access | A read-only `GET /v1/projects` with the stored `SUPABASE_ACCESS_TOKEN` returned `401`; the scoped Auth configuration read also returned `401`. | The stored token cannot currently be used for Management API changes or private configuration inspection. A project resume does not establish token validity. |
| Local application | `pnpm dev` reached a ready frontend; `/login`, `/register`, `/recover` returned `200` and anonymous `/account` returned `307` to login. The backend watch repeatedly restarted after detecting installed dependency files, so this run did not establish steady backend health. Separate non-watch `pnpm --dir backend start` eventually served `/api/v1/health` with `200`. | The frontend routes and non-watch backend start are available. Root development startup reliability remains an observed issue; this is not an authenticated account journey. |
| Invalid callback | `/auth/callback` with a synthetic invalid code and safe `/journeys` return path returned `307` to `/login?error=callback&next=%2Fjourneys`; the code was absent from the destination. | The handled-error path is safe on this local build. The new regression also covers a thrown exchange failure, which would otherwise become a `500`. |

The founder directed on 2026-10-13 that work focus on email for now and Google/GitHub verification pause. The provider methods remain open R04 and V1 requirements; this is not acceptance or removal of those paths. No controlled inbox or approved delivery configuration was available to this probe, so signup, delivered confirmation, login/logout, refresh/relogin, recovery/password change, and a verified backend account remain **untested**. No synthetic account was created solely to produce an undeliverable confirmation.

The callback regression passed 6/6 focused tests. Root `pnpm lint`, `pnpm typecheck`, `pnpm api:check`, `pnpm build`, and `openspec validate stabilize-real-authentication --strict` passed on the branch. The frontend portion of root `pnpm test` passed 478/478; the backend `author-cli.spec.ts` preview test failed locally when its child process returned no exit status under concurrent local workload, so the root command did **not** pass. The local run was stopped after that failure. Required PR CI must independently pass before this repair merges; the failed local result is not relabeled as a pass.

## Backend development watch follow-up — 2026-10-13

On implementation commit `e21488f` (`fix/backend-dev-watch-scope`), local Windows with Node `v26.10.0`, the default Node watcher was observed restarting on compiled curriculum and pnpm dependency files before health was available. A watcher scoped to `backend/dist` remained steady for 25 seconds and served health with `200`; the producer of the original Windows file notifications was not proven. The development script now selects that scoped watcher on macOS/Windows and retains Node's default dependency watch on Linux, where `--watch-path` is unavailable.

With the branch script, `pnpm dev` started both applications: `/api/v1/health` and `/login` returned `200`, with no idle backend restart observed in the local probe. Changing the ignored `backend/dist/main.js` timestamp triggered one watcher restart and health returned `200` afterward. This is local startup evidence, not an Auth account journey or hosted release evidence. The probe processes were stopped after testing; the piped terminal's Ctrl+C did not propagate to its child tree, so those identified probe processes were stopped explicitly.

Root `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed. Root `pnpm test` passed 478/478 frontend tests and 224/226 backend assertions, but two backend HTTP tests exceeded their five-second timeouts under the full local run, so the root command failed. Running `pnpm --dir backend exec vitest run src/application.spec.ts --no-file-parallelism` alone then passed 12/12. This does not replace the failed root result; required PR CI remains the merge gate. Real email, paused OAuth methods, and founder acceptance remain open as above.
