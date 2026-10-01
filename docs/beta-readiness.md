# Phase 38 private-beta readiness

**Decision: NO GO.** This repository prepares technical flows, but it does not authorize private-beta invitations or collection of real learner data. The product/security owners must close F06 before any real account, submission, feedback or telemetry collection. A passing CI build is not hosted or legal evidence.

Record the reviewer, date, environment and link to the actual evidence beside each gate before changing this decision. Never put credentials, raw learner code or private response payloads in the record. Reassess all gates after a release candidate changes.

| Gate | Owner | Current evidence / verification action | Status |
| --- | --- | --- | --- |
| Onboarding and guest path | Product / frontend | `/onboarding` explains Q01–Q04, provisional device work and explicit account import; focused UI test and existing guest import tests. Observe on target devices before invitation. | Repository prepared; hosted check open |
| Account settings and recovery | Identity / security | Timezone and sign out on `/account`; `/recover` and `/account/password` use Supabase Auth. Verify live email delivery, redirect allowlist, expired/reused link, provider login, session refresh and recovery throttling on the beta host. | Repository prepared; hosted check open |
| Terms, privacy, consent, retention, deletion | Product / security (F06) | Approve actual audience/jurisdiction-specific terms and privacy notice, collection consent, numeric retention, operator access, account deletion and backup/telemetry deletion process. Publish approved text and verify presentation before collection. No placeholder terms count. | **Open — blocks real data** |
| Feedback | Product / security (F06) | `/feedback` saves an unsent device-local draft only. Approve collection purpose, recipient, retention, deletion and consent before implementing delivery. | **Open — no collection** |
| Analytics | Product / security (F06, F05) | [Analytics spec](../openspec/specs/learning-analytics/spec.md) has a disabled default and bounded event allowlist. Approve consent and numeric evaluation plan, configure a real project, inspect a synthetic event and deletion flow before enabling. | **Open — delivery off** |
| Monitoring | Security / operations (F06) | [Monitoring guide](monitoring.md) defines a disabled default, safe event allowlist and synthetic verification. Configure Sentry access/retention, alert recipients and live signal inspection only after F06. | **Open — delivery off** |
| Backup and restore | Operations | Provision a hosted PostgreSQL backup schedule, encrypted access and retention. Restore an isolated copy, verify schema and owner-bound records, and record recovery time and data-loss window. No production database or schedule is provisioned by this repo. | **Open — hosted restore required** |
| Security deployment review | Security | Revisit [Phase 33 review](security-review.md): live Supabase grants/RLS, least-privileged database role, TLS/CORS/proxy, session cookies/headers, separate runner/preview hosts and CSP, secrets, ingress limits and cross-account probes. Record results for the actual beta deployment. | **Open — hosted review required** |
| Migration and rollback | Backend / operations | On an isolated clone of the hosted schema, run `pnpm --dir backend db:check`, `pnpm --dir backend db:drift`, review pending SQL, then `pnpm --dir backend db:migrate` with a scoped `DATABASE_URL`. Repeat migration to check idempotence. Test backup restore or forward correction; never rewrite applied migration. See [database guide](database.md). | **Open — hosted rehearsal required** |
| Devices and assistive technology | Product / frontend (F02) | [Accessibility review](accessibility-review.md) and [performance review](performance-review.md) record browser tests and unresolved physical mobile, screen reader, low-power and offline OS restart checks. Select supported devices/budgets and test them. | **Open — physical evidence required** |
| Learning and XP balance | Product / content (F04) | Review provisional XP/level curve, quest timing, difficulty and hints with the final curriculum; record approved beta values or a clearly disclosed experiment. | **Open — owner decision required** |
| Beta evaluation plan | Product (F05) | Choose recruitment/sample plan, baseline, metric thresholds and stop criteria before interpreting Phase 39 outcomes. Use client-observed and accepted backend cohorts distinctly. | **Open — owner decision required** |

## Operator sequence

1. Resolve F06 first and record approved text, numeric policies, consent mechanics and deletion/retention ownership. Do not turn on analytics or monitoring with real learners before this step.
2. Provision a separate beta environment and verify Auth email templates and redirect origins. Use synthetic accounts and data during checks. Inspect runtime and preview host separation on the deployed origin.
3. Rehearse migrations and restore from an isolated backup. Record commands, migration hashes, rollback/forward-fix decision, restore result and operator.
4. Exercise signup, recovery, account settings, guest import, submissions and error handling across the supported browsers and devices. Run the [learning gate](learning-test-gate.md) and security checks on the release candidate.
5. Approve F04/F05 beta balancing and evaluation plan. Configure approved analytics/monitoring with synthetic events and inspect provider-side payloads and alert routing.
6. Review the evidence matrix with product and security owners. Change **NO GO** only when every blocking row is closed with dated evidence; record the release candidate and invitation decision.

Rollback of the technical frontend routes is a normal application deploy. Keep telemetry approval flags unset until their gates close. A database migration applied to a persistent environment is corrected forward or restored from a verified backup; it is never edited in place.
