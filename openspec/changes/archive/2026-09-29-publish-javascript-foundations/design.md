# Design

## Context

See proposal.md for motivation. Git content currently contains draft CH01/Q01 1.0.0 and an empty publication. The Zod authoring validator already enforces numbered-quest allocation, sequential prerequisites, guest eligibility, immutable history and restricted Markdown/data-only cases. The startup catalog selects a complete authored inventory. Existing quest routes map public console/function cases to isolated ValidationStrategy checks and existing guest/account learning flows.

## Goals / Non-Goals

**Goals:** Deliver beginner-readable, executable instructional content using these seams, preserve immutable Q01, and prove publication and behavioral correctness with actual selected content.

**Non-Goals:** New grading modes, source-shape enforcement, explanation grading, capstone, learning-authority changes, deployment, beta data collection or finalized balance.

## Decisions

1. **Author 24 quests in backend/content.** Expand existing chapters/concepts/quest snapshots, keeping stable Qxx/CHxx identity and the approved allocation. Avoid a frontend copy or new authoring engine. Each lesson contains a distinct worked example, concrete task, declared input/output contract, debugging guidance and ungraded reflection. Required knowledge follows the approved sequence; no function implementation is assessed before Q15.
2. **Use existing console/function data cases.** Before functions, complete console output includes explicit normal/boundary examples in the learner program. Cases can repeat that complete contract because the harness cannot inject values into an arbitrary console program; this does not prove generalization. From functions onward, vary arguments and test helpers independently where relevant. Keep at most 10 cases, bounded feedback and JSON-compatible fixtures. Do not add runtime fixture injection or inspect source text. Reference/alternative/defective sources live in test fixtures outside backend/content and are never public lesson payloads.
3. **Q01 editorial upgrade.** Add 1.1.0 content with 1.0.0 assessment, identical original case data and explicit compatible/accept-new reviewed transition. Preserve 1.0.0 files. Other quests start at 1.0.0. First rewards still use stable identity; provisionally retain simple 10-XP awards with F04 balancing disclosed.
4. **Publication after demonstrated review.** Record a per-quest instructional/technical checklist and automated evidence in docs, accurately labeled AI-assisted self-review under this authorized phase; no invented independent or owner-personal approval. Select all 24 only when those checks pass. The course excludes the capstone until Phase 30. Publication is repository/API activation, not deployment or real-learner beta authorization.
5. **Exercise real contracts without crossing boundaries.** Backend tests read the real catalog and public NestJS routes without executing source. Existing malformed-content tests use isolated representative fixtures, decoupling them from the expanding product inventory. Browser tests use real published DTOs delivered through a local NestJS server and run reference/alternative/defective fixtures in the existing workspace/Worker boundary. Add a focused browser gate to CI; no new dependencies or protected response cache. Verify guest durability for Q01–Q04 and authentication requirement beyond it.

## Risks / Trade-offs

- Fixed console programs can be hardcoded → State observable criteria honestly, provide multiple examples and reflection, then introduce varied function inputs as scaffolding fades. Personal-learning checks remain forgeable under ADR 0005.
- Automated success is not learning efficacy → Publish transparent self-review, retain CO learner observation and F04 beta balancing, and label reasoning prompts ungraded.
- Existing tests copy the draft production tree → Freeze a test-only representative tree, preserve meaningful malformed/history/empty-selection checks, and add independent real-course assertions rather than weakening tests.
- Twenty-four snapshots can drift from intended contracts → Verify ordered IDs, allocation, cases, API bounds and isolated positive/negative behavioral fixtures for every quest in CI.

## Migration Plan

No database migration. Merge content and reviewed selection together after verification. Roll back exposure by clearing publication in a reviewed follow-up PR; retain snapshots and accepted history. No deployment is performed. Sync approved spec deltas only after Apply merges, then archive on a separate remote branch.
