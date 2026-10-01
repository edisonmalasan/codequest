# Design

## Context

See [proposal.md](proposal.md). The canonical `beta-preparation` specification requires unresolved legal, hosted, device, balancing, and evaluation gates to remain open until actual evidence exists. `docs/beta-readiness.md` is the release-decision record; `docs/private-beta-study.md` is a synthetic study protocol, not evidence that learners participated. The F04/F05/F06 register entries leave their numeric and policy choices to named owners.

## Goals / Non-Goals

**Goals:** Give owners a fill-in worksheet with traceable gate IDs, evidence requirements, explicit pass criteria, and a place to reject or defer a gate. Keep source evidence, approver identity, date, release candidate, environment, and policy version together so a later decision can be audited.

**Non-Goals:** Choose owner values, write legal text, operate infrastructure, run probes against a live system, alter code or specs, accept a test pass without logs/results, invite learners, or change the NO GO decision.

## Decisions

1. **One worksheet, three evidence classes.** The worksheet groups F04/F05/F06 approval, deployed-environment probes, and physical-device/AT sessions while mapping each Phase 38 readiness row. A gate closes only when its named owner reviews dated evidence for the exact release candidate. Existing CI evidence remains background, not a substitute.
2. **F04 baseline is an experiment.** The project owner approved the current 10 XP per stable quest's first accepted completion and `provisional-linear-100-v1` (100 cumulative XP per level step) for private beta only on 2026-10-01. This does not imply learning balance, mastery, or certification. Changing historical ledger awards requires separate review; release/version alignment and learning observations remain open.
3. **F05 is preregistered before outcome review.** The project owner approved the exploratory recruitment, numeric targets, sample, stop rules, nonresponse treatment and cadence on 2026-10-01. The existing D1 24–48h and D7 168–192h elapsed definitions and trust/cohort split remain unchanged. Contact channel, storage and consent mechanics depend on F06; changing measurement definitions needs a separate spec change.
4. **F06 and telemetry remain external decisions.** Product/security direction and proposed retention values were supplied, but jurisdiction-specific policy text, final numeric retention, consent mechanics, deletion/backup handling, named operator roles and provider configurations were not approved. PostHog/Sentry approval flags remain unset until final approvals and synthetic provider checks are recorded.
5. **Hosted and device verification use synthetic identities and safe records.** Probes name expected pass/fail and evidence, but operators supply actual release/build IDs and redacted results. Database migration and restore work uses an isolated clone. Physical sessions use selected real devices, installed browsers, NVDA/VoiceOver, and offline/OS-restart cases; emulation does not close F02.

## Risks / Trade-offs

- A detailed checklist may be mistaken for completion → Every field starts `Open`, and the top-level decision remains NO GO until a separate owner-signed readiness update.
- Placeholder examples may be misread as F04/F05 policy → F04 has only a clearly labeled candidate; F05 numeric values are blank.
- Hosted proof can leak secrets or learner work → Record sanitized evidence locations and outcomes, never raw credentials, token-bearing URLs, private responses, or source in the repository.
- A release candidate can change after testing → Evidence is bound to release, curriculum/assessment versions, environment and date; recheck affected gates after changes.

## Migration Plan

This proposal includes the documentation worksheet so owners can review it before any gate-closure Apply stage. A later authorized stage may record owner decisions and actual evidence, then update `docs/beta-readiness.md` only after every required gate is reviewed for the same release candidate. Removal of this worksheet is a normal documentation revert; live deployment and owner decisions are separate future work.

## Open Questions

The project owner's 2026-10-01 instruction approved the F04 experimental baseline and F05 exploratory preregistration; the [worksheet](../../../docs/beta-gate-closure-checklist.md) now records them. F06 final policy, named operational approvers, consent/contact-storage details, the actual beta release candidate/environment, hosted evidence and physical/AT results remain open. Recording F04/F05 does not close a readiness row or change this documentation proposal's scope.
