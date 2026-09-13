## 1. Decision Register and Product Definition

- [x] 1.1 Create `docs/decisions.md` using D1's status/evidence/owner/blocking-stage fields; verify every D1–D10 topic and exploration conflict has a traceable entry with no invented approval (R8).
- [x] 1.2 Draft `docs/product.md` persona, positioning, educational promise, and audience/device/language/age alternatives; verify D2 proposals are labeled and approval gates are registered (R1).
- [x] 1.3 Add the canonical required/optional/deferred MVP matrix and explicit non-goals to `docs/product.md`; verify all pre-launch roadmap capabilities, D3 reconciliations, login methods, guest/sync/preview scope, and Phase 0 versus P0 labels are accounted for (R1).
- [x] 1.4 Add the glossary and normal/failure/hint/reset/replay/guest/offline learning paths to `docs/product.md`; verify hierarchy, capstone/count interpretation, Run/Check/Submit, attempts, completion, and lock-state meanings are explicit (R1, D4).
- [x] 1.5 Add the success-measurement plan to `docs/product.md`; verify each metric specifies cohort, denominator, window, source/trust, target status/owner, guest/account identity treatment, and independent understanding evidence without claimed results (R1, D8).

## 2. Curriculum Definition

- [x] 2.1 Draft `docs/curriculum.md` entry requirements, observable exit outcomes, chapter outline, and 20–30 quest briefs; verify each brief maps to an outcome/prerequisite and the approved-or-proposed capstone count is explicit (R6, D5).
- [x] 2.2 Define the capstone brief and rubric in `docs/curriculum.md`; verify learner choices, required concepts, allowed scaffold, deterministic assessment descriptions, debugging/transfer evidence, and assessed/excluded web concepts are coherent (R6).
- [x] 2.3 Document curriculum feedback/hints, equivalent solutions, review/accessibility standards, Git/API ownership, stable IDs and content-change/retirement/stale-submission policies; verify every policy has a register reference and no executable course content is created (R6).

## 3. Architecture and Application Ownership

- [x] 3.1 Create `docs/architecture.md` with current-versus-intended state, conceptual diagram, state/system ownership matrix, trust crossings, and ADR links; verify backend content/generated-client paths and no unjustified shared packages or cross-app imports (R2, D6).
- [x] 3.2 Create `docs/frontend.md` covering editor/runtime feedback, drafts, device/accessibility expectations, caching, account separation, Auth/API boundaries, guest/offline provisional state, import/reconnect/reset/rejection recovery; verify client responsibilities agree with the canonical matrix (R3).
- [x] 3.3 Create `docs/backend.md` covering verified identity/ownership, curriculum versions, bounded submission acceptance, account progress/capstone records, XP/streak/unlock rules, idempotent sync and telemetry; verify it neither executes learner code nor claims independent verification under the proposed trust policy (R4).
- [x] 3.4 Document completion-trust alternatives and the proposed client-report policy across architecture/backend/product documents; verify limitations, metric qualification, high-stakes exclusions, and stronger-verification gate are explicit and approval status is preserved (R2, R4, D6).
- [x] 3.5 Document guest subset, import/merge, outbox/replay, stale versions, local-only drafts, account switching, offline reward/unlock display, and timezone/streak-date policy across frontend/backend/register; verify duplicate requests/imports cannot be defined to grant duplicate rewards and no pending state silently changes account ownership (R3, R4, D7).

## 4. Security and Gamification Principles

- [x] 4.1 Create `docs/security.md` threat model and conceptual Auth/session/data-access policy; verify assets/actors/trust boundaries cover unauthorized records, forged completion, code/privacy/telemetry, curriculum rendering, cache leakage, replay, least privilege, and Storage/upload scope (R5, D9).
- [x] 4.2 Add untrusted-execution requirements and Phase 1 validation gates to `docs/security.md`; verify capability/origin isolation, no session/secrets access, message validation, resource limits/termination, and iframe constraints are specified as requirements without claiming prototype evidence (R5).
- [x] 4.3 Add baseline testing/accessibility/mobile/low-end expectations and beta privacy/data-handling gates to the owning documents; verify late roadmap phases mean verification/hardening, numeric/legal deferrals have owners/triggers, and no infrastructure is provisioned (R3, R5).
- [x] 4.4 Create `docs/gamification.md` meaningful activity, XP uniqueness/replay/content-edit/hint/failure policy, derived levels, streak/timezone dates, and completion-prerequisite unlocks; verify mastery/achievements/competitive mechanics and numerical curves are correctly deferred (R7, D8).

## 5. Architecture Decision Records

- [x] 5.1 Create `docs/adr/0001-frontend-backend-separation.md` and `0002-api-contract-and-client-ownership.md`; verify documented commitments, alternatives, consequences, path conflict resolution, and extraction triggers agree with AGENTS/architecture (R9).
- [x] 5.2 Create `docs/adr/0003-curriculum-source-and-publication.md` and `0007-curriculum-identity-and-versioning.md`; verify Git/backend/API ownership and version/progress/reward compatibility policies match curriculum/backend/register (R9).
- [x] 5.3 Create `docs/adr/0004-browser-execution-isolation.md` and `0005-assessment-trust-and-completion.md`; verify isolation feasibility remains unverified, client-grading limitations/risk approval are explicit, and no remote runner or NestJS execution is introduced (R9).
- [x] 5.4 Create `docs/adr/0006-local-guest-and-cloud-state.md` and `0008-authentication-and-data-access.md`; verify provisional/accepted state, replay/import/account ownership, streak dates, Auth/Storage/table boundaries, and status agree with specialist documents (R9).
- [x] 5.5 Review all eight ADRs for status/context/source/alternatives/consequences/decision IDs/approval evidence/revisit triggers; verify proposed choices are not marked accepted without evidence (R8, R9).

## 6. Policy Review and Phase 0 Acceptance

- [x] 6.1 Present the register's Phase 0 approval gates to the product owner for persona/device/age, MVP inventory, hierarchy, capstone/outcomes/count, completion risk, guest/offline/streak rules, and security promises; verify explicit decisions are recorded or remaining blockers stay labeled and prevent a Phase 0 readiness claim (R1–R9).
- [x] 6.2 Reconcile approved decisions across all eight docs and eight ADRs; verify R1–R10 with a cross-document review of scope, glossary, outcomes/runtime, authority, privacy, rewards, and versioning rather than marking drafts automatically complete.
- [x] 6.3 Add a Phase 0 completion assessment to `docs/decisions.md` with R1–R11 coverage, unresolved blockers, deferred owners/triggers, and Phase 1 evidence gates; verify it answers the roadmap's four completion questions and distinguishes documentation completeness from approved readiness (R10).
- [x] 6.4 Run `git diff --check`, review `git diff` and untracked deliverables, and run `openspec validate define-codequest-product-and-architecture --strict`; verify changes stay within documentation scope, validation passes, and no source/config/infrastructure/generated skill files changed (R11).
- [x] 6.5 Run required `pnpm test`, `pnpm lint`, and `pnpm typecheck` when available and record exact outcomes; if the workspace remains absent, report each command's missing-manifest/tool reason without creating a workspace or claiming success (R11).
- [x] 6.6 Present the reviewed documentation/ADR diff and completion assessment; verify no Phase 1 prototype, application implementation, production infrastructure, automatic sync, or archive work has started (R10, R11).
