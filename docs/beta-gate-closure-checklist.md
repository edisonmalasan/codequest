# Private-beta gate-closure review worksheet

**Status: NO GO. Review template only.** No owner approval, hosted verification, physical-device result, learner observation, or release decision is recorded by this document. The [Phase 38 readiness record](beta-readiness.md) remains authoritative. Do not invite learners, accept real feedback, enable real PostHog/Sentry delivery, or begin Phase 40 from a filled template alone.

For every row below, record owner/approver, decision date, exact beta release commit and frontend build, curriculum/assessment versions, environment and origin set, sanitized evidence link, result (`open`, `pass`, or `fail`), and retest trigger. A proposed scope reduction or risk exception needs a separate explicit owner decision and does not count as a test pass. Keep credentials, raw learner work, identity details, token-bearing URLs, private responses, and provider payloads out of Git. Reassess affected gates after a release candidate or hosted configuration changes. All fields are **open** until populated and reviewed by the named owner.

## Blocking-gate inventory

| Readiness row | Decision owner | Hosted evidence | Physical evidence | Current result |
| --- | --- | --- | --- | --- |
| Onboarding and guest path | Product confirms supported path | Hosted guest Q01–Q04, signup and explicit import | Target-device navigation and editor | Open |
| Account settings and recovery | Identity/security approve configuration | Live Auth email, providers, recovery, redirect, refresh, sign-out, throttling | Target-device authentication flow | Open |
| Terms, privacy, consent, retention, deletion | **F06 product/security** | Approved text shown and consent/deletion behavior verified | Accessible presentation of consent | Open; blocks real data |
| Feedback | **F06 product/security** | Device-local only until delivery is separately approved; no request contains draft | Target-device draft recovery | Open; no collection |
| Analytics | **F06 product/security; F05 product** | Approved provider configuration, synthetic allowlist and deletion check | Consent interaction where applicable | Open; delivery off |
| Monitoring | **F06 security/operations** | Approved Sentry configuration, synthetic safe event and alert check | No special device claim beyond app error recovery | Open; delivery off |
| Backup and restore | Operations | Hosted backup plus isolated restore and measured recovery | — | Open |
| Security deployment review | Security | Grants, TLS/CORS/proxy, secrets, origin isolation, abuse and cross-account probes | Runtime/preview on target browsers | Open |
| Migration and rollback | Backend/operations | Isolated hosted-schema rehearsal, repeated migrate, restore/forward correction | — | Open |
| Devices and assistive technology | **F02 product/frontend** | Release candidate served on beta host | Real mobile, installed browsers, NVDA/VoiceOver, low-power and restart | Open |
| Learning and XP balance | **F04 product/content** | Reviewed publication/XP configuration matches approved experiment | Observe usability only after GO | Open; owner decision |
| Beta evaluation plan | **F05 product** | Approved measurement/consent configuration | Selected recruitment device coverage | Open; owner decision |

## 1. Owner decisions: explicit approval required

### F04 — learning and XP balance

**Review option, not approval:** Retain the currently authored **10 XP per quest/capstone on the first accepted stable-quest completion** and derived **`provisional-linear-100-v1`**, where level 1 starts at 0 XP and each 100 XP starts the next level. The ledger does not re-award on retry or practice, and level remains derived. Label this an **experimental private-beta baseline** in the owner decision and learner-facing progress; it is not balanced, mastery, certification or a final public-MVP curve. Existing awards keep their recorded amount if policy later changes. Source: [gamification](gamification.md), canonical [XP](../openspec/specs/quest-xp/spec.md) and [levels](../openspec/specs/learner-levels/spec.md).

| Required F04 entry | Owner response |
| --- | --- |
| Product/content decision: use experimental baseline, revise in separate change, or defer | Unset |
| Exact published quest and capstone versions reviewed; XP values checked | Unset |
| Quest timing, difficulty and hint review method and observed limitations | Unset |
| Learner-facing experimental disclosure and correction/review trigger | Unset |
| Approvers, date, evidence link and release candidate | Unset |

### F05 — preregistered beta evaluation

Complete and approve **before** inspecting participant outcomes. The existing analytics contract fixes D1 as a qualified Run, Check or submission/completion **24–48 elapsed hours** after activation, and D7 as **168–192 elapsed hours**. Include only cohorts whose full window has elapsed at the reporting cutoff. Keep guest `client_observed` actions separate from authenticated account observations and backend accepted facts; do not join guest/account identities silently. Report denominators, version, missing-browser-data limits and `client_reported` qualification on accepted completions. App opens and timezone streaks are not D1/D7 return. Source: [analytics](analytics.md) and [study protocol](private-beta-study.md).

| Preregistration field | Product-owner value, approval and date |
| --- | --- |
| Research question/hypothesis and eligible adult beginner criteria | Unset |
| Recruitment channels, inclusion/exclusion and consent sequence | Unset |
| Invited, consented and analyzable sample-size targets; rationale | Unset |
| Contact method, frequency, withdrawal route and approved storage | Unset |
| Activation definition, D1/D7 reporting cutoffs and follow-up schedule | Existing windows above; operational schedule unset |
| Numeric activation, accepted progression, D1, D7 and capstone targets; denominator for each | Unset |
| Qualitative lesson/editor/mobile/validation review rubric | Unset |
| Stop/pause criteria for safety, privacy, severe defects or poor learning experience | Unset |
| Nonresponse, attrition, missing telemetry and incomplete-window handling | Unset |
| Review cadence, decision owner, escalation and preregistration freeze/version | Unset |
| Approved release candidate, curriculum/assessment versions and evidence link | Unset |

### F06 — externally supplied policy and operations decisions

Product/security must supply and approve actual audience/jurisdiction-specific material; this worksheet contains no legal terms or invented retention periods. Record document versions, approvers, dates, processor agreements/configuration and proof of presentation. If account deletion or feedback delivery requires new code, scope that separately and verify it before real collection.

| Decision and required external input | Owner-approved value/evidence |
| --- | --- |
| Intended beta audience/jurisdictions, age basis and lawful collection basis; approved terms and privacy notice text/version | Unset |
| Consent UI/version, purposes, optional versus required collection, withdrawal and refusal behavior | Unset |
| Data inventory: Auth identity, code snapshots/submissions, local drafts, feedback, analytics, monitoring, backups and observation notes | Unset |
| Numeric retention per store and backup; deletion/expiry schedule and processor propagation | Unset |
| Account deletion request/verification, accepted progress and backup deletion policy, timing and exception handling | Unset |
| Operator access roles, least privilege, audit, escalation and periodic review | Unset |
| Feedback purpose, recipient, delivery channel, moderation/access, consent, retention, deletion and abuse handling | Unset; current `/feedback` remains unsent device-local draft |
| PostHog project/region, IP/cookie/identity policy, event allowlist, consent gate, retention, deletion test and access | Unset; capture flags remain unset |
| Sentry project/region, inbound/IP scrubbing, filters, alert recipients, retention, deletion test and access | Unset; capture flags remain unset |
| Observation/session notes, contact records and study storage, access, retention, withdrawal and deletion | Unset |
| Policy display and change-notice verification on the actual beta host, including keyboard/AT access | Unset |
| Product/security approvers, policy version, date and evidence link | Unset |

## 2. Hosted-environment evidence: verify the actual beta release

Use only **synthetic accounts and records** before a GO decision. Operators must record the exact hostnames, release commit/build, configuration version, date, browser, redacted request IDs, expected/observed result and evidence link for every probe. A local fixture, CI pass or unstaged deployment does not close a hosted row. Do not run destructive test harnesses against a persistent database.

| Gate | Exact beta-host verification and passing result | Evidence to attach |
| --- | --- | --- |
| Auth and onboarding | On the beta app, exercise guest Q01–Q04, signup and explicit import with a synthetic account; verify provisional versus accepted labels. Exercise email confirmation, email/password, Google and GitHub with approved callback origins; `/auth/callback` removes codes from the final URL and rejects external return paths. Exercise `/recover` and `/account/password` with valid, expired and reused links; recovery request stays account-enumeration neutral. Verify refresh, sign-out/cache clearing, wrong/expired bearer `401`, safe account return and provider throttling. No token appears in logs/telemetry. | Provider settings and email template versions; redacted route outcomes/request IDs; signup/recovery/redirect result matrix. |
| Backup and restore | Document hosted PostgreSQL backup schedule, encryption, access and numeric retention (after F06). Create a synthetic marker on an isolated beta dataset, capture a backup, restore to a **separate isolated database**, run schema/owner-bound record checks, measure actual recovery duration and data-loss interval. No persistent beta database is dropped or overwritten. | Backup job/configuration reference, isolated restore ID, schema/marker checks, measured recovery time/data-loss window, operator sign-off. |
| Migrations and rollback | Clone the hosted schema to isolation. With a scoped `DATABASE_URL` pointing only at that clone, run `pnpm --dir backend db:check`, `pnpm --dir backend db:drift`, inspect pending SQL, run `pnpm --dir backend db:migrate` twice, and verify the second run is idempotent. Test a documented forward correction or isolated backup restore; never rewrite an applied migration. | Redacted commands/results, migration hashes, pending SQL review, repeat result, correction/restore outcome. |
| Database grants/RLS | Inspect actual `codequest` schema/table privileges and RLS for `anon`, `authenticated`, app and service roles using read-only catalog queries. Confirm browser roles have no direct application-table read/write; use synthetic anon/authenticated clients to attempt direct table access and expect denial. Confirm backend uses a least-privileged application credential and owner queries cannot cross account. | Sanitized grant/RLS inventory, role names without secrets, denied direct-access outcomes, app-role review. |
| TLS, CORS, proxy and ingress | From outside the host, verify HTTPS and trusted certificate on app/API/runtime/preview origins, HTTP redirect policy, defensive app headers, and no mixed content. Send API preflights from the approved app origin and an unapproved origin; only the approved origin receives CORS permission. Verify body/rate limits, proxy trust/real client IP without arbitrary forwarded-header spoofing, and ingress protection across instances. | Header/preflight captures without cookies, ingress/proxy config review, rate/body-limit outcomes. |
| Secrets and storage | Review deployed secret manager, access grants, rotation and logs; inspect production browser bundles, generated client and public runtime assets for provider/service-role/database secrets. Verify no protected response or learner source enters static/PWA caches and no account's local pending work appears under another account. | Redacted configuration inventory, bundle/cache scan result, rotation owner/date. |
| Runtime and preview isolation | Confirm app, `NEXT_PUBLIC_RUNTIME_ORIGIN`, and `NEXT_PUBLIC_PREVIEW_ORIGIN` are distinct HTTPS origins with correct routing; app-origin `/runtime/*` and `/preview/*` return `404`, dedicated hosts expose only fixed allowlisted assets, and neither host receives app cookies. Inspect effective CSP and response headers on both origins. The trusted bootstrap may run fixed scripts, while the **learner HTML/CSS frame** has an empty sandbox and script-disabled policy; preview JavaScript executes only in the separate bounded Worker. Probe network/storage/parent DOM denial, exact-origin message rejection, timeout then fresh-run recovery, and source preservation using synthetic code. | Origin/header/CSP snapshots, routing/cookie and controlled-sink results, recovery trace on beta build. |
| Cross-account and abuse | With synthetic owners A and B, submit/read attempts, progress, XP, streaks, unlocks and guest import/replay under A, then try B's stable IDs, forged owner fields and replay IDs under A/B. Expect `401` without auth, safe `403` or non-disclosing not-found for forbidden records, no B data or mutation, no double XP/completion, and server acceptance timestamps. Verify request bounds and rate behavior under normal multi-instance ingress. | Redacted request IDs, status/result matrix, post-probe owner-bound facts, no raw source or private response. |
| Analytics | **Only after F06/F05 approval and before learner traffic**, configure an approved test PostHog project with consent gate and bounded flags. Emit synthetic allowlisted events; inspect provider-side schema, no raw code/identity/token/query, no automatic capture/replay, cohort/trust separation, deduplication and deletion. Verify opt-out and provider failure do not affect learning. Keep live capture flags unset until separately authorized. | Owner approval, synthetic event IDs, sanitized provider view, deletion/opt-out result, project/retention/access config. |
| Monitoring | **Only after F06 approval and before learner traffic**, configure an approved test Sentry project with scrubbing, filters, retention/access and alert recipient. Trigger synthetic API 4xx/5xx and frontend recovery error; correlate safe `x-request-id`, route template, release/environment and bounded class. Verify no source/token/private payload, alert delivery, deletion and adapter-failure noninterference. Keep live capture flags unset until separately authorized. | Owner approval, sanitized event/alert/deletion result, scrubber/access config, rollback-by-flag result. |

### Repeatable operator probes

Run these against the **named beta release**, from a controlled operator machine, with synthetic identities. Replace placeholders locally; never paste secrets, bearer tokens or raw output into Git.

1. Capture response headers for the app, API, Worker and preview URLs with `curl -sSI https://<host>/<allowlisted-path>`. Record TLS certificate validation and the effective CSP, frame, referrer, content-type and permissions headers. Request `/runtime/bootstrap.html` and `/preview/bootstrap.html` on the **app** host and expect `404`; request an account/API path on each dedicated host and expect no protected route. Inspect browser network storage to confirm no app cookie is sent to the dedicated hosts.
2. Compare API CORS preflights with `curl -i -X OPTIONS 'https://<api-host>/<protected-route>' -H 'Origin: https://<approved-app-host>' -H 'Access-Control-Request-Method: GET'` and repeat with an unapproved origin. Record that only the approved origin receives the expected allow-origin response. Independently probe malformed/oversized bodies, forwarded-header spoofing and ingress throttling with the operations-approved non-disruptive limits; do not infer a distributed guarantee from the process-local throttler.
3. On the isolated database clone, run the migration commands listed above with a scoped `DATABASE_URL`, then run read-only grant queries such as `SELECT nspname, has_schema_privilege('anon', oid, 'USAGE'), has_schema_privilege('authenticated', oid, 'USAGE') FROM pg_namespace WHERE nspname = 'codequest';` and `SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'codequest';`. Enumerate table privileges with `information_schema.role_table_grants` for the same schema. Check `anon`/`authenticated` direct table reads and writes through synthetic Supabase clients; denied browser-role access is required even when a backend account exists. RLS state alone is not proof of safe grants.
4. Record the production build's actual `NEXT_PUBLIC_RUNTIME_ORIGIN` and `NEXT_PUBLIC_PREVIEW_ORIGIN`, compare both to the authenticated app origin, then exercise finite code, tight-loop recovery, active HTML/CSS sink probes and forged/stale message probes. Inspect the nested learner frame's sandbox and enforced policy separately from the fixed trusted bootstrap. Verify a new finite Run/Preview works after timeout and source remains intact.
5. In the approved **test** provider projects only, send synthetic allowlisted analytics and fixed monitoring categories, inspect stored payloads and alert routing, then exercise deletion/opt-out and rollback by disabling capture flags. Do not flip live learner capture switches as part of this probe.

## 3. Physical-device and assistive-technology evidence

F02 still needs the product/frontend owner to select supported **exact device, OS and installed browser versions**, network/performance budgets and accessibility combinations. The following is the minimum review matrix implied by the [accessibility](accessibility-review.md), [performance](performance-review.md) and [readiness](beta-readiness.md) records; it is a test plan, not a support promise. Record device model, OS/browser/AT versions, release candidate, network condition, date, tester, steps, result, defects and retest. Use synthetic learning accounts and source.

| Real setup | Minimum tasks and observations | Result |
| --- | --- | --- |
| Installed Windows Chrome, keyboard and actual 200%/400% browser zoom | Home → auth → Journey → Quest; tab through CodeMirror and exit, hints/dialog focus, Run/Check/Submit, preview, draft recovery; verify reading order, no page overflow, visible focus. | Untested on beta host |
| Installed Windows Firefox and NVDA with keyboard | Repeat core path with spoken names, headings, result/live-region announcements, local versus accepted status, errors, hints and editor escape. Verify actual installed browser behavior. | Untested |
| Physical macOS Safari with VoiceOver | Repeat reading/navigation, auth, editor, Run/Check, preview and reduced motion using installed Safari/VoiceOver; test keyboard Tab preference explicitly. | Untested |
| Physical iPhone Safari with VoiceOver and touch | Read short lesson, use primary actions, zoom/reflow, spoken status and focus, text entry, rotate/background/resume, guest draft recovery. Record whether coding is usable or needs an explicit limitation. | Untested |
| Physical Android Chrome with touch and screen reader where available | Same mobile lesson/editor path, touch targets, virtual keyboard, rotate/background/resume and offline cached lesson/JS. Record actual screen reader/version used. | Untested |
| Selected low-power target device and real slow-network profile | Cold route/editor load, cold Run and Check, long session, storage quota denial, offline transition and OS/browser restart; verify bounded recovery and draft persistence without asserting CI timings as device budgets. | Untested |

Include direct visual review of gradient/artwork contrast and comprehension, not only token ratios. Test native install/offline restart and storage pressure where the product intends a PWA support claim. A missing device or AT combination remains `untested`; an owner may explicitly narrow the published support scope, but must record that choice and avoid implying parity from emulation.

## Closure record — leave blank until independent evidence exists

| Field | Owner entry |
| --- | --- |
| Release commit/build, curriculum/assessment versions and beta environment | Unset |
| F04 product/content decision and evidence | Open |
| F05 product preregistration version and approval | Open |
| F06 product/security policies, consent and operation approval | Open |
| Hosted gate results and operations/security sign-off | Open |
| F02 supported matrix and physical/AT result | Open |
| Outstanding failures, waived risks and retest triggers | Open |
| Final product/security/operations reviewers and dated decision | **NO GO — no decision recorded** |

Only after owners supply and review the evidence may they update [beta readiness](beta-readiness.md) for the exact release candidate. This worksheet does not make that update.
