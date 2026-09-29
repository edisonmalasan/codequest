# Foundations inventory capstone review

Status: Phase 30 implementation candidate, 2026-09-30. This is AI-assisted instructional and technical self-review under the user's Phase 30 authorization, not an independent audit, observed learner study, product-owner personal test or deployment approval. [Approved brief and rubric](curriculum.md#capstone-brief-quest-inventory-manager) and [OpenSpec change](../openspec/changes/publish-inventory-capstone/proposal.md) define scope.

## Instructional review

CAP01 closes Integration after Q24. A learner chooses and predicts a small collection of inventory records, then implements six named functions: total, availability, identified adjustment, combined report, maximum repair and fresh low-stock transfer. The supplied console calls are textual project presentation; learner HTML, DOM, events, packages and network are not required. Starter comments and signatures leave the assessed algorithms incomplete. The deliberate maximum defect exposes empty first-record access; the rubric asks for a revealing input and explanation. Question, concept and next-step hints guide without supplying a full solution.

Record domains, return shapes, ordering, missing-ID behavior, zero clamping and the inclusive transfer boundary are stated before Check. Ten authored function cases cover normal and empty inputs, changed-record integration and the new threshold. The learner can run additional cases of their own. The checks do not prove all domain behavior or reject a forged browser report.

| Rubric area | Authored evidence and review question |
| --- | --- |
| Values and records | Chosen records and predictions; only the identified record changes. |
| Decisions | Positive availability, zero clamp and inclusive low-stock threshold. |
| Iteration | Finite sum, selection and maximum, including empty data. |
| Functions | Parameter-driven returns and helper responsibilities. |
| Integration | Combined report derives from updated records. |
| Debug/test reasoning | Empty input reveals supplied defect; written expected/observed and correction. |
| Transfer | New low-stock requirement, unfamiliar learner sample and predicted boundary result. |

Required written evidence is presence of nonblank Debug explanation and Transfer response, each bounded to 2000 characters and 4000 UTF-8 bytes. Backend checks presence and normal personal-learning acceptance policy. Neither Check nor the backend grades prose quality; later human review/learner observation is needed for a learning-efficacy claim. There is no arbitrary numerical rubric threshold or LLM grader.

## Technical and authority review

The content validator requires a reviewed journey to publish all authored children. The Apply worktree therefore assembles complete CAP01 content and a local manifest candidate before running the isolated browser suite. Selection is not committed or pushed until reference and valid alternative sources pass, a defective source fails, hostile code times out and a fresh Check recovers. Static curriculum validation parses data-only cases without running source. Production browser tests use the public NestJS API and dedicated credential-free Worker. Private solution fixtures are only in test files, not API DTOs or authored lesson snapshots.

The new optional Editor Workspace fields use existing owner/version-bound device drafts. Explicit Submit captures source, local report and responses into the same private, owner-bound outbox event. The backend verifies principal, current version, prerequisite, strict case coverage, written presence, event uniqueness and normal first-completion reward/streak rules. Exact replay retains original payload; altered responses conflict. Current Check is still unverified personal-learning feedback under [ADR 0005](adr/0005-assessment-trust-and-completion.md). Streaks use backend acceptance time. New code does not run in NestJS or an authenticated origin.

Q01–Q24 snapshots must remain byte-identical. CAP01 has stable ID and 1.0.0 content/assessment identity; publication rollback must preserve accepted account history and never rewrite migrations. Removing its selected manifest entry requires a coherent journey/content edit because the validator rejects incomplete reviewed publication.

## Verification and limits

Local candidate evidence on 2026-09-30: the production Chromium capstone suite passed 3/3 before the selected manifest was committed. The public catalog returned CAP01 after Q24 with versioned prerequisites and ten data-only cases, without private fixtures. A reference and structurally different alternative passed; the inclusive-threshold defect failed; a nonterminating source timed out and a later reference Check recovered. The authenticated workspace retained source and both written fields across reload, captured them in one explicit offline outbox event, and reflowed at 390px. Guest lesson reading did not expose an account workspace. The tracked-publication curriculum suite then passed 28/28, including Q01 through Q24 reference, alternative, and defect checks.

Local gates: `pnpm test` passed on retry (376 frontend tests, 168 backend tests and 3 immutable-history tests); `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm api:check`, `pnpm --dir backend curriculum:validate`, `pnpm --dir frontend test:pwa` (6/6), and `openspec validate --all --strict` (28/28) passed. The first root test attempt hit unrelated five-second HTTP/auth/editor test timeouts under parallel startup; both package suites passed alone and the unchanged root command passed on retry. CI PR results will be reviewed before merge.

F04 XP/difficulty/timing balance remains provisional; CAP01 currently proposes integrative difficulty and 10 XP. CO learner observation and review of actual explanations/transfer quality remain open. F02 physical device, installed browser, assistive technology, low-power, storage quota, background and OS-restart evidence remains open. F06 privacy, retention, consent, operator access and deletion decisions must precede real learner beta collection. No deployment or real learner collection is part of Phase 30.
