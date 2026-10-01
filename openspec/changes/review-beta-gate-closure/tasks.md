# Tasks

The [worksheet](../../../docs/beta-gate-closure-checklist.md) records the project owner's 2026-10-01 F04/F05 decisions. Decision-recording tasks are complete; selected-release, operational, legal, hosted and physical evidence tasks remain open. This change does not authorize real-learner collection or a GO decision.

## 1. Owner decisions

- [x] 1.1 Record the project owner's dated F04 approval of 10 XP, `provisional-linear-100-v1`, current labels/hints and the Phase 39 review plan as a private-beta experiment; verify the worksheet and decision register distinguish experiment from balance.
- [ ] 1.2 Verify the F04 baseline against the exact selected release's published quest/capstone versions, learner-facing provisional disclosure and future timing/difficulty observation plan; record the reviewed release and any mismatch without claiming balance.
- [x] 1.3 Record the project owner's dated F05 exploratory preregistration with eligibility, recruitment/sample, D1/D7 windows, numeric targets and denominators, stop rules, missing-data treatment and cadence; verify the worksheet keeps existing analytics definitions and labels targets as exploratory.
- [ ] 1.4 Resolve the F05 invitation/contact channel, consent/storage/withdrawal mechanics and preregistration freeze for the selected release under approved F06 policy; verify these are recorded before any real invitation.
- [ ] 1.5 Obtain product/security F06 approved policy text and operating decisions for consent, numeric retention, deletion, access, feedback, analytics, monitoring and study data; verify document versions, approvers and jurisdiction/audience scope are recorded without secrets or learner data in Git.

## 2. Hosted evidence on the selected beta release

- [ ] 2.1 Verify hosted Auth, recovery, onboarding and guest import using synthetic accounts and the worksheet matrix; record safe expected/observed outcomes, release ID and provider settings.
- [ ] 2.2 Rehearse hosted backup/isolated restore and clone-only migration/rollback workflow; verify measured recovery, schema/owner facts, migration hashes and repeat migrate without destructive tests on a persistent database.
- [ ] 2.3 Inspect live grants/RLS, TLS/CORS/proxy, ingress, secrets, runtime/preview origins and cross-account boundaries; verify denied direct/cross-owner access and attach sanitized security review evidence.
- [ ] 2.4 After F06/F05 approval, verify approved test PostHog/Sentry projects with synthetic events, scrubbing, deletion and alert checks; verify real learner delivery remains disabled until separately authorized.

## 3. Physical and release decision evidence

- [ ] 3.1 Select exact supported device/OS/browser/AT versions and budgets, then run the real-device matrix, including NVDA/VoiceOver, mobile touch, zoom, low-power, offline and OS restart; verify observed results and failures are dated for the beta build.
- [ ] 3.2 Reconcile every readiness row against dated owner approval and matching release/environment evidence; verify failures and missing cases remain open and `docs/beta-readiness.md` stays NO GO unless all blocking gates are explicitly resolved by product/security/operations owners.
