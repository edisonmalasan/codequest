# Proposal

## Why

JavaScript Foundations is technically published, but its Phase 29/30 reviews were AI-assisted self-reviews and automated checks, not a full product-quality acceptance of the current integrated course. R08 needs an exact-version, learner-facing quality pass before the course can be called feature complete or presented for founder acceptance.

## What Changes

- Audit all 24 instructional Quests and CAP01 in published order against the approved outcomes, prerequisites, task clarity, worked examples, hints, starter behavior, declared checks, feedback, accessibility, and final-project transfer. Record specific findings and unchanged snapshots; do not invent learner observations.
- Improve only snapshots with documented quality findings. Give each edit a new immutable content version, and a new assessment version only when criteria change. Record compatibility decisions, preserve stable Quest IDs and accepted history, and select reviewed replacements atomically.
- Verify every changed snapshot with reference, valid alternative, and deliberate-defect candidates in the existing isolated browser Check. Traverse the selected Course on desktop and mobile with synthetic learner state, including Run, Check, hints, Submit, Next, refresh, source recovery, and trusted progress.
- Record exact selected versions, build, review method, pass/fail results, remaining founder and real-environment gates, and the separate private-beta balancing obligation. A clean automated result is not a claim of learning efficacy or founder acceptance.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `javascript-foundations`: Add an exact-version course-quality review and publication contract for the already selected 24 instructional Quests plus CAP01.

## Impact

The existing Git curriculum under `backend/content/`, its reviewed `publication.yaml` selection, browser authoring fixtures and checks, and the R08 review record may change during Apply. The Course/Journey/Quest identities, guest Q01–Q04 boundary, isolated Worker runtime, personal-learning submission authority, XP and streak policies, and account history remain unchanged. This proposal adds no database migration, real-provider claim, interactive DOM Quest, or Phase 38 release approval.
