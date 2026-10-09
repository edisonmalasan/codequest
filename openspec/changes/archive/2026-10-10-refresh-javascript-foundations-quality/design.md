# Design

## Context

See [the proposal](proposal.md) for motivation. The published `COURSE-JS-FOUNDATIONS` already contains Q01–Q24 in seven chapters and CAP01 after Q24. `publication.yaml` pins each content and assessment version. Q01 uses a historical 1.0.0 snapshot and a selected editorial 1.1.0 snapshot; the other selected Quests and capstone are 1.0.0. The existing self-review, curriculum validator, authoring candidate command, production browser curriculum suite, and ADR 0007 compatibility policy are reusable. The current local Check is unverified personal-learning feedback under ADR 0005.

## Goals / Non-Goals

**Goals:** Determine which published snapshots actually need revision, improve the learner-facing course where findings justify it, and provide traceable exact-version evidence for the complete selected Course. Keep the course continuously coherent for existing learners and preserve authored history and backend learning facts.

**Non-Goals:** A new JavaScript Course identity, a new subject sequence, DOM or asynchronous JavaScript assessment, backend code execution, independent grading, new XP amounts, mastery claims, real learner observation, founder acceptance by proxy, or Phase 38 release approval.

## Decisions

### 1. Audit the complete selected inventory before changing snapshots

Create a review matrix keyed by stable Quest ID and selected content/assessment versions. Examine each lesson beside its starter, cases, hints, outcome, prerequisites, and rendered workspace. Record `pass`, `revise`, or `blocked` with a specific observation for each Quest; inspect CAP01's written explanation and transfer prompts separately from its deterministic cases. Check chapter handoffs, first Run guidance, increasing scaffold independence, and the course-to-capstone transition. This makes a quality claim reviewable without assuming that earlier self-review proved a polished experience. An unchanged Quest keeps its selected version.

### 2. Change immutable snapshots, not selected history

For a real finding, create a new version directory and update that Quest's `currentVersion`, reviewed transition, and selected manifest entry. Pure wording, hint, or example changes keep the assessment version only if the criterion and expected behavior truly remain identical. Changed criteria require a new assessment version, explicit compatibility and pending-work decision, and focused backend version/replay tests. Do not change older files, IDs, prerequisites, XP metadata, or guest eligibility as incidental cleanup. If a finding actually needs a changed objective or sequence, update this change's scope/spec first; the existing plan does not silently authorize a new rewarded learning objective.

### 3. Use the real local Check boundary for technical review

Run the existing `content:test` authoring command against exact changed versions with independent reference and equivalent alternative solutions and at least one deliberate defect. Reuse the published curriculum browser suite for unchanged Quests and add focused candidate coverage for revised cases. Candidate files stay outside `backend/content/` and outside public DTOs. The runner remains the dedicated credential-free Worker; Node/NestJS do not evaluate candidate or learner source. Inspect feedback for actionable explanation and bounded text, not merely pass/fail.

### 4. Select and verify as one Course

After instructional and technical review, update `publication.yaml` with the complete 25-Quest selected set in one change. Verify the resulting API versions and full desktop/mobile journey with synthetic session facts. Check guest Q01–Q04 and sign-in boundary at Q05, Run/Check/hints, explicit Submit, backend-accepted progress/reward state, Back/Next, source preservation, refresh/revisit, and capstone written response behavior. Record the exact commit/build, environment, browser projects, observed results and defects in a new R08 review document. A selected-version change invalidates affected evidence and triggers retest. The real-provider Auth gate and founder review remain separate.

## Risks / Trade-offs

- **Editorial polish can strand pending device work.** → Version every changed snapshot, declare compatibility, verify existing source-preserving retry behavior, and keep accepted history unchanged.
- **A course-wide rewrite would create needless churn.** → Audit first; retain clean snapshots byte-for-byte and record why each edited one changed.
- **Passing fixtures can miss beginner confusion.** → Record the limits of AI-assisted and synthetic review, reserve observation and founder acceptance as distinct gates, and do not invent learner outcomes.
- **A changed assessment may alter prerequisites and rewards indirectly.** → Review compatibility with accepted history and stable-ID XP before selection; reject any unintended identity, prerequisite, or reward change.

## Migration Plan

No database migration is planned. Keep the current complete selection live while new snapshots are authored and tested as drafts. Select reviewed replacements atomically after the audit and candidate gates pass. Rollback may restore the prior complete manifest selection in a reviewed PR, leaving merged historical snapshots and accepted learner facts intact; stale pending source remains available through the existing retry path.
