# Design

## Context

See proposal.md for motivation. The reviewed catalog contains Q01–Q24; the existing schema supports a CH07 position-3 capstone, Q24 prerequisite and explanation/transfer prompts. Public DTOs already expose these prompts. Local checks accept at most ten data-only cases. Reports are strict, bounded JSON stored privately in the submission table; the existing outbox preserves arbitrary report fields. Editor Workspace already owns serialized revision-aware Dexie autosave, lifecycle flush, unload warning and owner isolation.

## Goals / Non-Goals

**Goals:** complete the approved project using existing isolated checks and learning authority; capture required response presence without a second persistence architecture.

**Non-Goals:** a project IDE, assessed DOM/events, numerical rubric score, automatic reasoning grading, manual review queues, source-shape grading, analytics, deployment, or changes to reward/streak policy.

## Decisions

1. **One stable capstone identity, CAP01.** Add `inventory-manager` under Integration at position 3, content/assessment 1.0.0, kind capstone, prerequisite Q24, no guest eligibility. Preserve all instructional snapshots. Use provisional integrative difficulty and 10 XP consistent with F04. Course navigation/progress derives 25 total required quests, with 24 instructional quests counted separately. Do not rewrite earlier content to adjust denominators.
2. **Console supplied shell.** Use the existing named Console panel and author-supplied example calls to display learner-selected record data and summaries. This is permitted by the approved console-or-read-only-preview scaffold; no learner HTML, event or DOM algorithm is required. Additional iframe integration would add presentation machinery without improving the assessed contract.
3. **Explicit bounded behavioral contracts.** Records have unique string IDs, names and nonnegative integer quantities; examples define bounded arrays and safe integer arithmetic. Functions total quantities, select available records, adjust an identified record with zero clamping, combine an updated inventory report, repair a supplied maximum-count defect, and solve a fresh low-stock threshold requirement. Declare exact shapes, ordering, missing ID and empty/boundary behavior. Ten varied named-function cases fit existing limits; private browser fixtures check references, alternatives, deliberately defective sources and timeout recovery. No source-shape or LLM tests.
4. **Reusable written fields inside Editor Workspace.** Optional parent-defined response fields use stable draft keys alongside file sources in the same workspace save queue. Render labeled bounded textareas with prompts and reuse 600ms idle save, explicit Save, visibility/navigation best-effort flush, revision ordering and error retention. They never enter Run, Check or Preview snapshots. An explicit submission callback receives source, local validation and current written responses. Field changes do not claim functional correctness; the curriculum parent requires bounded nonblank explanation and transfer responses before enabling capstone Submit.
5. **Responses in the private normalized report.** Add optional `capstoneResponses: { explanation, transfer }`, each 1–2000 characters, nonblank, at most 4000 UTF-8 bytes, strict keys and no automatic trimming that would change replay identity. Keep total report 16 KiB and source 64 KiB limits. Passing new capstone submissions must contain both; instructional reports with these fields are rejected. Failed capstone reports may omit responses. Stored pre-capstone reports remain parseable. Exact existing owner/event/payload replay resolves before current curriculum policy, and altered responses conflict because they are part of the report. JSON storage needs no migration. Update OpenAPI report description and regenerate if its artifact changes.
6. **Same acceptance path.** Validate response presence after current version/report normalization and before any new learning record is committed. Existing authenticated principal, Q24 eligibility, event uniqueness, accepted completion, XP ledger and backend-time streak rules remain unchanged. Written presence is required evidence, not reviewed quality. No new client authority or trusted grading proof exists.
7. **Recoverable immutable envelopes.** Keep written responses inside the existing outbox report and show bounded text for owner-only viewing/copying along with saved source. Unsupported versions/rejections retain all work. Drafts remain device-local; only explicit submitted snapshots travel to the backend. No raw protected response cache or telemetry.

## Risks / Trade-offs

- Client reports and arbitrary response text can be forged → retain ADR 0005 personal-learning disclosure; do not claim certified mastery or evaluated reasoning.
- Ten cases cannot prove every behavior → clearly declare input domains and examples, compare valid alternatives, include learner-designed edge cases in reflection and retain CO observation before efficacy claims.
- Local storage can fail or disappear → preserve editable fields/source and previous saved work, expose failure/retry, share established unload limits.
- Auth/version changes can strand pending work → retain owner-bound original report, source and versions; no relabeling or silent merge.
- AI-assisted review is not independent review → document self-review evidence and F04/F02/F06 and learner-observation obligations explicitly.

## Migration Plan

Merge proposal before Apply. Implement report and workspace extensions with compatibility tests; author capstone unselected. Run candidate reference/alternative/defect checks in the isolated production browser before selecting reviewed publication; then rerun the normal publication suite. Existing 24 quest snapshots remain byte-identical. Update documented counts/current contracts. Run root tests/lint/typecheck/build, API/content/history gates and PWA/curriculum browsers before merging Apply. Sync exact approved deltas on a separate PR, then archive via CLI on its own PR. No deployment is included. Rollback removes CAP01 from publication and authored current hierarchy consistently while preserving its immutable snapshots and accepted history; do not remove report parsing needed to read recorded submissions.
