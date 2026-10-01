# Private-beta gate-closure review worksheet

**Status: NO GO. F04/F05 owner decisions recorded; F06 and deployment evidence open.** The project owner's 2026-10-01 instruction approves the private-beta F04 experiment and F05 preregistration below. It supplies no F06 final approval, hosted verification, physical-device result, learner observation, or beta release decision. The [Phase 38 readiness record](beta-readiness.md) remains authoritative. Do not invite learners, accept real feedback, enable real PostHog/Sentry delivery, or begin Phase 40 from this worksheet.

For every row below, record owner/approver, decision date, exact beta release commit and frontend build, curriculum/assessment versions, environment and origin set, sanitized evidence link, result (`open`, `pass`, or `fail`), and retest trigger. A proposed scope reduction or risk exception needs a separate explicit owner decision and does not count as a test pass. Keep credentials, raw learner work, identity details, token-bearing URLs, private responses, and provider payloads out of Git. Reassess affected gates after a release candidate or hosted configuration changes. F04/F05 decision entries are recorded below; all release-evidence results remain **open** until actually tested and reviewed.

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
| Learning and XP balance | **F04 product/content: experimental baseline approved 2026-10-01** | Verify publication/version alignment for the selected release | Observe usability only after GO | Owner decision recorded; release evidence open |
| Beta evaluation plan | **F05 product: preregistration approved 2026-10-01** | Freeze before invitation; consent, contact channel and measurement configuration still require F06/hosted review | Selected recruitment device coverage | Owner decision recorded; operational evidence open |

## 1. Owner decisions: explicit approval required

### F04 — learning and XP balance

**Approved by project-owner instruction on 2026-10-01 for a private-beta experiment only:** Retain **10 XP for the first backend-accepted completion of each stable quest, including CAP01**, and **`provisional-linear-100-v1`**, where level 1 starts at 0 XP and every 100 XP begins the next level. Level remains derived from the XP ledger with no mutable level authority. Repeat/practice completions earn no XP; hints and failures incur no XP penalty. Keep the current published difficulty labels and hints initially. Add no level names or mastery, certification, ability or job-readiness claim; learner-facing UI must continue to identify the curve as provisional. This is **not** an approval that XP, difficulty, quest timing or hints are balanced. Existing XP ledger awards retain their amounts; any later XP, difficulty, hint or curve change needs a separately reviewed decision/change. Source: [gamification](gamification.md), canonical [XP](../openspec/specs/quest-xp/spec.md) and [levels](../openspec/specs/learner-levels/spec.md).

During Phase 39, review by stable quest and content/assessment version: time to first Run and accepted completion; failed Check/attempt distribution; hint use; abandonment/stall points; repeated validation confusion; and qualitative clarity/difficulty observations. No learner outcome has been supplied yet.

| Required F04 entry | Owner response |
| --- | --- |
| Product/content decision | Experimental private-beta baseline above approved by project owner on 2026-10-01; final balancing deferred |
| Exact published quest and capstone versions reviewed; XP values checked | 2026-10-02 repository snapshot audit below; no release candidate selected, so release verification remains open |
| Quest timing, difficulty and hint review method and observed limitations | Phase 39 review categories above approved; no learner timing or observation result exists |
| Learner-facing experimental disclosure and correction/review trigger | Provisional level UI continues; later changes require separate review |
| Approvers, date, evidence link and release candidate | Project-owner instruction in this conversation, 2026-10-01; separate named product/content sign-off and release candidate not supplied |

**Repository-only F04 audit, 2026-10-02 (not release evidence):** At commit `9d4a39ebca476e076e81061b3eb9774aa9393b6a`, `backend/content/publication.yaml` had Git blob `1770c646bec2967f554d739f16b31d0b578ae0df`. It selected Q01 content `1.1.0` / assessment `1.0.0`, Q02–Q24 content/assessment `1.0.0`, and CAP01 content/assessment `1.0.0`. All 25 selected version files declared `xpAward: 10`, the manifest-matching assessment version, a difficulty label, and `question`, `concept`, and `nextStep` hints; there were no mismatches in that inspection. `pnpm --dir backend curriculum:validate` passed for this checkout. The backend awards `snapshot.metadata.xpAward` only after insertion of a first accepted completion, derives levels from owner XP events using `provisional-linear-100-v1` at 100 XP per level, and the account UI labels the curve provisional and says XP is not mastery. These are source and local-command observations, not a frozen frontend build, hosted verification, or learner balance evidence. Repeat the publication, policy, and UI review against the exact selected beta release and record its build and environment before completing task 1.2.

### F05 — preregistered beta evaluation

**Approved by project-owner instruction on 2026-10-01, subject to F06 and release gates:** An exploratory, invitation-only private beta with adult beginners to identify repeated learning, usability, accessibility, reliability and retention patterns. It is not a statistically powered efficacy or public-launch study. Freeze this preregistration before the first real invitation; a later threshold change after outcomes are visible must be labeled post-hoc. The existing [analytics](analytics.md) and [study protocol](private-beta-study.md) measurement definitions remain unchanged.

Eligibility: age 18 or older; reads English; self-identifies as a programming/JavaScript beginner; no current professional JavaScript-development role; able to give informed consent; and access to a supported beta browser/device. Recruitment is invitation-only and voluntary: target **30 invitations**, **20 consented starters**, and **at least 15** participants with a complete D7 window before the main retention review. If fewer than **12** have a complete D7 window, report retention descriptively and do not use the numeric result as a launch conclusion.

Contact is for consent/invitation, D1 follow-up inside **24–48 elapsed hours**, and D7 follow-up inside **168–192 elapsed hours**; no repeated unsolicited follow-up after withdrawal or refusal. A contact channel and approved study/contact store were **not supplied** and remain F06 operational inputs. D1/D7 count a new qualified Run, Check or submission/completion; app opens and timezone streaks do not count. Include only learners whose full window elapsed. Do not silently stitch guest `client_observed` and authenticated/backend-fact cohorts, impute missing outcomes, or conflate accepted client-reported completion with independent grading. Report invited, consented, started, eligible, responded, withdrawn and missing counts separately.

| Exploratory measure | Approved target and denominator |
| --- | --- |
| First Run activation | At least 80% of first-quest starters, same cohort and first session |
| First accepted quest | At least 60% of eligible account first-quest starters within the existing 24-hour definition |
| Five distinct accepted quests | At least 35% of activated accounts within 7 elapsed days |
| First completed chapter | At least 25% of chapter starters with a complete existing 7-day window |
| D1 meaningful return | At least 40% of eligible activated learners with complete 24–48h window |
| D7 meaningful return | At least 20% of eligible activated learners with complete 168–192h window |
| Capstone start | Report all eligible learners; if at least 8 reach eligibility, experimental target at least 50% of eligible learners starting CAP01 |
| Capstone completion | Report all eligible learners; if at least 8 reach eligibility, experimental target at least 50% of CAP01 starters whose full existing 14-day window elapsed |

Capstone percentages are **not** a pass/fail beta conclusion if fewer than eight learners reach eligibility. All targets are exploratory, with their existing trust labels, curriculum compatibility rules and incomplete-window exclusions; none are efficacy claims.

**Immediate pause:** privacy or consent breach; cross-account exposure; authentication/authorization bypass; unexpected raw learner source, credentials, tokens or protected payload in analytics/monitoring; unrecoverable CodeQuest-caused source/draft loss; or corrupted/duplicated accepted completion, XP or streak authority.

**Pause and triage recruitment:** the same core-path blocking defect affects three participants or at least 20% of observed participants, whichever occurs first; or the same serious accessibility blocker appears in two independent sessions on a declared supported setup. Review safety/privacy/critical defects after each active study day, repeated patterns weekly using the Phase 39 template, and the final beta after the target D7 sample is available or the recruitment cap is reached.

| Preregistration field | Product-owner value, approval and date |
| --- | --- |
| Research question/hypothesis and eligible adult beginner criteria | Exploratory purpose and six eligibility conditions above approved |
| Recruitment channels, inclusion/exclusion and consent sequence | Invitation-only volunteer recruitment approved; exact invitation channel and F06 consent mechanics open |
| Invited, consented and analyzable sample-size targets; rationale | 30 invitations, 20 consented starters, target 15 complete D7; below 12 complete D7 descriptive only |
| Contact method, frequency, withdrawal route and approved storage | Invitation/consent, D1 and D7 follow-ups approved; no unsolicited repeat after withdrawal/refusal; exact channel, withdrawal route and storage remain F06 inputs |
| Activation definition, D1/D7 reporting cutoffs and follow-up schedule | Existing definitions unchanged; D1 24–48h, D7 168–192h, full-window denominators only |
| Numeric activation, accepted progression, D1, D7 and capstone targets; denominator for each | Approved exploratory targets in table above |
| Qualitative lesson/editor/mobile/validation review rubric | Repeated learning/usability/accessibility/reliability patterns under the existing Phase 39 template; detailed rubric not supplied |
| Stop/pause criteria for safety, privacy, severe defects or poor learning experience | Immediate and recruitment-pause criteria above approved |
| Nonresponse, attrition, missing telemetry and incomplete-window handling | Separate counts; no imputation or guest/account stitching; incomplete windows excluded |
| Review cadence, decision owner, escalation and preregistration freeze/version | Daily active-study safety review, weekly patterns, final after target D7 sample or recruitment cap; project-owner approval 2026-10-01; freeze before first invitation |
| Approved release candidate, curriculum/assessment versions and evidence link | No beta release candidate frozen; owner instruction in this conversation dated 2026-10-01 |

**Repository-only F05 audit, 2026-10-02:** The approved exploratory targets and denominators above follow the existing [analytics definitions](analytics.md#query-definitions): first Run uses first-quest starters in the same cohort/session; first accepted quest uses the completed 24-hour starter window; five distinct accepted quests uses activated accounts over seven elapsed days; chapter and capstone windows, D1/D7 full-window eligibility, source-trust split, deduplication, and missing-data treatment remain unchanged. The [study protocol](private-beta-study.md) points to this preregistration without duplicating target values. This checks document consistency at the repository snapshot above. It does not freeze a release preregistration, approve a contact channel or consent store, verify provider reporting, or close task 1.4.

### F06 — externally supplied policy and operations decisions

**F06 is not complete.** The project owner's 2026-10-01 instruction supplies product/security direction, but expressly withholds jurisdiction-specific legal/privacy approval and final retention approval. Product/security must supply actual audience/jurisdiction-specific material, document versions, named approvers, dates, processor agreements/configuration and proof of presentation. If account deletion or feedback delivery requires new code, scope that separately and verify it before real collection.

Owner-supplied F06 direction, **not F06 approval or collection authorization**: adults 18+ and invitation-only; collect only what account learning, explicitly approved study measurement, security/reliability and consented observations require. No advertising, sale of learner data or unrelated profiling. No raw learner source, validation output, credentials, tokens, protected response bodies or private capstone text in analytics/monitoring. Analytics and monitoring remain disabled until their separate consent/policy/provider or scrubbing checks pass; `/feedback` remains device-local and unsent. Operator access must be named, least-privileged, MFA-protected, non-shared and reviewed during beta. Withdrawal stops optional study/analytics collection. A verified-request account-deletion and propagation procedure is required before real collection.

The following are **proposals for legal/security review, not approved retention policy**: PostHog beta analytics **30 days**; Sentry beta monitoring **14 days**; submitted beta feedback/study notes **90 days after study close**; recruitment/contact records **30 days after final scheduled follow-up or withdrawal**; hosted backups **30-day rolling retention**. Primary account/learning records would remain during beta participation, then be deleted on a verified request under an approved deletion process or handled under the final approved beta retention policy. Backup deletion may occur through normal expiry rather than historical-backup rewriting; after a restore, deletion obligations must be reapplied before use. None of these values closes F06.

| Decision and required external input | Recorded direction / still-required approval and evidence |
| --- | --- |
| Intended beta audience/jurisdictions, age basis and lawful collection basis; approved terms and privacy notice text/version | Adults 18+ invitation-only direction approved; jurisdictions, lawful basis and approved Terms/Privacy versions **unset** |
| Consent UI/version, purposes, optional versus required collection, withdrawal and refusal behavior | Data minimization and withdrawal direction above; actual consent model/UI/version **unset** |
| Data inventory: Auth identity, code snapshots/submissions, local drafts, feedback, analytics, monitoring, backups and observation notes | Minimization direction above; store-by-store approved inventory **unset** |
| Numeric retention per store and backup; deletion/expiry schedule and processor propagation | Proposed values above **not approved**; final schedule and processor treatment **unset** |
| Account deletion request/verification, accepted progress and backup deletion policy, timing and exception handling | Verified-request and propagation required; procedure, timing and final backup treatment **unset** |
| Operator access roles, least privilege, audit, escalation and periodic review | Named, least-privileged, MFA-protected, non-shared and beta-reviewed direction supplied; actual roster/access proof **unset** |
| Feedback purpose, recipient, delivery channel, moderation/access, consent, retention, deletion and abuse handling | `/feedback` remains unsent device-local; delivery/collection decisions **unset** |
| PostHog project/region, IP/cookie/identity policy, event allowlist, consent gate, retention, deletion test and access | Disabled; 30-day retention is **proposed only**; processor/configuration approval **unset** |
| Sentry project/region, inbound/IP scrubbing, filters, alert recipients, retention, deletion test and access | Disabled; 14-day retention is **proposed only**; processor/configuration approval **unset** |
| Observation/session notes, contact records and study storage, access, retention, withdrawal and deletion | Consented/minimized direction; 90-day notes and 30-day contact retention **proposed only**; approved storage/policy **unset** |
| Policy display and change-notice verification on the actual beta host, including keyboard/AT access | **Unset**; no final policy text or hosted result supplied |
| Product/security approvers, policy version, date and evidence link | Project-owner direction dated 2026-10-01; named product/security final approvers and versions **unset** |

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
| F04 product/content decision and evidence | Experimental private-beta baseline approved by project-owner instruction, 2026-10-01; release/version evidence and balance observation open |
| F05 product preregistration version and approval | Preregistration above approved by project-owner instruction, 2026-10-01; contact/storage mechanics and pre-invitation freeze open |
| F06 product/security policies, consent and operation approval | **Open**; direction recorded, proposed retention values unapproved |
| Hosted gate results and operations/security sign-off | Open |
| F02 supported matrix and physical/AT result | Open |
| Outstanding failures, waived risks and retest triggers | Open |
| Final product/security/operations reviewers and dated decision | **NO GO — no decision recorded** |

Only after owners supply and review the evidence may they update [beta readiness](beta-readiness.md) for the exact release candidate. This worksheet does not make that update.
