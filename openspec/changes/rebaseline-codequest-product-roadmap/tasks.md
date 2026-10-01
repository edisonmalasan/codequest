# Tasks

This change's Apply stage completes the planning rebaseline and founder scope selection. It does not implement R03–R19 product features or close `review-beta-gate-closure`; each selected product phase needs its own OpenSpec change.

## 1. V1 boundary and reference decisions

- [x] 1.1 Obtain and record explicit founder `required`, `conditional`, or `deferred` decisions for separate courses, HTML/CSS/DOM, practice, challenges, badges, ranks, avatars, Builds, public profiles, community, extra tracks, AI/help, certificates, mentors, notifications and commercial surfaces; verify every advertised V1 category has a decision ID and acceptance owner, with no assumed Codédex parity.
- [x] 1.2 Reconcile P04/P05/P06/P11 and F07/F08/F09 only where an explicit founder choice requires a superseding decision; verify historical decisions and ADR evidence remain readable and unchanged in meaning.

## 2. Product readiness contract

- [x] 2.1 Apply the eight readiness states to the V1 capability inventory, distinguishing current implementation evidence from feature completeness, integration and founder verification; verify no archived engineering phase or CI result alone is labeled product ready.
- [x] 2.2 Deliver a founder-acceptance worksheet covering the core home-to-account journey and each approved V1 extension, with exact build, environment, tester, expected/observed result, defect and retest fields; verify a founder-critical failure blocks the acceptance state.
- [x] 2.3 Confirm the R01–R19 roadmap entries each name objective, user-visible scope, architecture/specs, dependencies, deliverables, automated and integrated checks, manual/founder acceptance, non-goals and exit criteria; verify dependency order and relative size are explicit.

## 3. Beta transition and consistency

- [x] 3.1 Reconcile product, roadmap, decisions and directly affected ADR/planning references with the approved V1 boundary; verify Phases 0–37 remain historical, Phase 38 stays `NO GO` and paused, and Phase 39 synthetic preparation is not described as real recruitment.
- [x] 3.2 Verify the active `review-beta-gate-closure` tasks and evidence are preserved; F04/F05 remain experimental/preregistered as approved, F06 and hosted/physical rows remain open, and no release candidate or learner outcome is invented.
- [x] 3.3 Run strict OpenSpec validation and repository-required documentation checks, review the exact planning diff, and verify no application code, provider flags, real telemetry or beta status was changed.
