# ADR 0005: Personal-learning completion trust

## Status and evidence

**Accepted**, product/security risk acceptance recorded. Evidence of approval: [AP01 — explicit user instruction](../decisions.md#ap01-explicit-phase-0-approval). Sources: roadmap local execution/authoritative submission flow/no LLM grading/no NestJS arbitrary execution; exploration identified unresolved verification. Register: [C06/C08/P06/P14](../decisions.md); design D6. Owners: product/security owners; technical owner recommends mechanism. Named assignees unassigned.

## Context

Code runs and is checked in an untrusted browser. NestJS owns account progress but cannot run arbitrary learner code. Remote runners are deferred. The roadmap does not define an independent grading mechanism.

## Decision

Use deterministic local assessment for learning feedback. NestJS accepts authenticated client reports under explicit personal-learning trust after identity/ownership, supported-version, prerequisite, bounds and uniqueness checks. Backend authority concerns acceptance/persistence/consistent rewards, not proof that source passed tests.

Forged passing reports remain possible. A signed browser assertion or repeated local result does not independently prove execution. No LLM grading. Label guest/offline reports provisional until accepted. Accepted completion metrics are qualified; transfer/debug rubric review gives separate understanding evidence. No credentials/certificates/high-stakes claims/verified ranked competition depend on this policy.

## Alternatives

- Independent grading in an isolated runtime: stronger evidence but needs a separate architecture/capability change outside this MVP scope.
- Execute learner source inside NestJS: prohibited.
- Static/source-shape checks only: may validate bounded syntax/objectives but cannot be called general behavioral verification.
- Treat client pass as trustworthy proof: rejected because learner controls browser/result transport.

## Consequences

Personal-learning fraud is a product limitation only after explicit acceptance; auth/authorization/runtime escape risks are not accepted by this ADR. Capstone free-form response presence is not proven reasoning correctness. Reviewed-assessment guarantees would need additional workflow specification. Public competitive/certificate requirements trigger stronger verification first.

## Related records and revisit trigger

[Product](../product.md), [backend](../backend.md), [curriculum](../curriculum.md), [security](../security.md). AP01 confirms this Phase 0 trust policy; it does not authorize implementation. Revisit before any high-stakes/verified competition claim, unacceptable fraud evidence, or approved independent execution requirement. Do not add runners implicitly.
