## Why

Phase 0 approved CodeQuest's product and architecture policies, but browser execution containment, preview recovery, editor/device usability, and offline persistence remain unverified. Phase 1 must produce reproducible technical evidence before Phase 2 creates a production workspace; a happy-path mock quest alone cannot satisfy the approved security boundaries.

## What Changes

- Define and, only after a later Apply instruction, execute six bounded experiments: E01 CodeMirror usability; E02 Worker lifecycle/limits; E03 execution containment; E04 preview containment/recovery; E05 PWA/local recovery; E06 integrated mock quest.
- Use a Q01-aligned mock quest plus a separate small function/record preview fixture. Preserve desktop-first coding, usable mobile short exercises, supplied DOM plumbing, and provisional local completion.
- Establish physical-device and automated engine coverage, adversarial security probes, predeclared numerical hypotheses, failure criteria, reproducible evidence, and explicit proceed/redesign/inconclusive outcomes.
- Resolve F01/F02 through reviewed evidence, without changing accepted Phase 0 policies or claiming independent grading, production authorization, full mobile parity, or learning efficacy.
- Add a concise Project Status snapshot before the roadmap's Product Goal section. Keep it truthful as planning, experiment execution, and review progress.

## Capabilities

### New Capabilities

- `technical-risk-validation`: Disposable browser prototypes, required experiment behavior, coverage/evidence reporting, and the reviewed gate before production scaffolding.

### Modified Capabilities

None. The current main capability inventory is empty; this change does not introduce production editor, runtime, auth, curriculum, or sync capabilities.

## Impact

Planning now affects this change's proposal, delta spec, design, tasks, and `docs/DEVELOPMENT_ROADMAP.md` status snapshot only. Stop after preparing these artifacts for review; do not implement experiments in the proposal workflow.

Later authorized Apply is limited to a disposable `prototypes/technical-risk-validation/` project and `docs/technical-risk-validation/` charter/evidence, plus evidence-backed updates to the decision register, ADR 0004, and affected frontend/security/architecture documentation. Prototype-only dependencies and local mock/sink servers are permitted within that scope; no root production workspace, application API, database, real Auth providers, hosted services, telemetry SDKs, or infrastructure are created. No applied migrations, generated API client, or generated skills are touched.

Sources: [development roadmap](../../../../docs/DEVELOPMENT_ROADMAP.md), [approved Phase 0 register](../../../../docs/decisions.md), all eight approved Phase 0 documents and eight ADRs, and the completed Phase 1 exploration in the conversation. The design captures that exploration so execution does not depend on conversation access. Phase 0's archived change remains closed. F03 production schemas/publication/sync, F04/F05 balancing and beta targets, F06 operational privacy, and F07–F09 future scope remain deferred.
