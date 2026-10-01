# Tasks

The [proposal-stage worksheet](../../../docs/beta-gate-closure-checklist.md) is ready for owner input. These tasks remain open; this proposal does not authorize real-learner collection or a GO decision.

## 1. Owner decisions

- [ ] 1.1 Obtain product/content F04 approval or rejection of the experimental 10 XP and `provisional-linear-100-v1` baseline, with publication versions, timing/difficulty review and dated evidence; verify the signed decision distinguishes experiment from balance.
- [ ] 1.2 Obtain product F05 preregistration before outcome review, filling recruitment, sample, contact, D1/D7 operational cutoffs, numeric targets, stop rules, nonresponse and cadence; verify every target has a cohort and denominator.
- [ ] 1.3 Obtain product/security F06 approved policy text and operating decisions for consent, numeric retention, deletion, access, feedback, analytics and monitoring; verify document versions, approvers and jurisdiction/audience scope are recorded without secrets or learner data in Git.

## 2. Hosted evidence on the selected beta release

- [ ] 2.1 Verify hosted Auth, recovery, onboarding and guest import using synthetic accounts and the worksheet matrix; record safe expected/observed outcomes, release ID and provider settings.
- [ ] 2.2 Rehearse hosted backup/isolated restore and clone-only migration/rollback workflow; verify measured recovery, schema/owner facts, migration hashes and repeat migrate without destructive tests on a persistent database.
- [ ] 2.3 Inspect live grants/RLS, TLS/CORS/proxy, ingress, secrets, runtime/preview origins and cross-account boundaries; verify denied direct/cross-owner access and attach sanitized security review evidence.
- [ ] 2.4 After F06/F05 approval, verify approved test PostHog/Sentry projects with synthetic events, scrubbing, deletion and alert checks; verify real learner delivery remains disabled until separately authorized.

## 3. Physical and release decision evidence

- [ ] 3.1 Select exact supported device/OS/browser/AT versions and budgets, then run the real-device matrix, including NVDA/VoiceOver, mobile touch, zoom, low-power, offline and OS restart; verify observed results and failures are dated for the beta build.
- [ ] 3.2 Reconcile every readiness row against dated owner approval and matching release/environment evidence; verify failures and missing cases remain open and `docs/beta-readiness.md` stays NO GO unless all blocking gates are explicitly resolved by product/security/operations owners.
