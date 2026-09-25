## Context

Phase 13 exposes optional console/runtime presentation props but deliberately owns no execution. ADR 0004 and the completed Phase 1 evidence select a persistent trusted bootstrap on a separate runner origin with a fresh literal-URL Worker per run, private correlated control, two-second execution termination, and one-second recovery. The authenticated application origin cannot itself be the learner compartment. See `proposal.md` and the capability deltas for scope and observable behavior.

## Goals / Non-Goals

**Goals:**

- Turn the selected Phase 1 computation mechanism into a small production frontend adapter.
- Keep lifecycle control responsive when learner code blocks its Worker event loop.
- Make every terminal state explicit, bounded, correlated, and accessible through the existing workspace.
- Allow unit tests to replace browser primitives without weakening the real browser path.

**Non-Goals:**

- General module loading, packages, DOM APIs, multi-file linking, stdin, web preview, tests/checking, remote execution, or tamper-resistant grading.
- Deploying or operating a separate runtime service. The repository defines static runner assets and requires a distinct configured origin at deployment.
- Claiming hard browser process-memory quotas, physical-device support, or an independent security audit.

## Decisions

### 1. Use the selected dedicated runner topology

`NEXT_PUBLIC_RUNTIME_ORIGIN` identifies a public, credential-free origin distinct from the application origin. The adapter creates one sandboxed trusted bootstrap iframe for its lifetime and transfers a `MessagePort` after validating the configured origin. The bootstrap creates a fresh literal-URL Worker for each run. Same-origin execution is rejected.

This preserves the Phase 1 selection and prevents app cookies/storage from becoming ambient learner authority. A direct app-origin Worker was rejected because deleting JavaScript globals cannot prove separation from authenticated-origin capability. A blob Worker was rejected because it does not match the selected literal-URL mechanism and inherits creator-origin policy.

### 2. Apply two response policies

The bootstrap document/script receives a CSP that allows only its own fixed script and Worker while denying connections, frames, objects, forms, and base changes. The learner Worker response receives a stricter CSP denying connections, imports/scripts, and child workers after its trusted bootstrap loads. Both are fixed public assets; neither accepts learner-selected URLs.

The Worker bootstrap also captures its one trusted send function, removes or replaces network/storage/messaging/spawn globals before compiling source, and passes only a captured console object into the learner function. CSP is the capability boundary; global removal reduces accidental exposure and makes denial visible to source.

### 3. Use a bounded double-validated protocol

The app sends `{type, runId, source}` over its private port. The bootstrap sends only allowlisted lifecycle packets. The learner Worker returns a JSON string so both bootstrap and app can validate UTF-8 size, parse shape, active run identity, status, entry count, and aggregate text limits before presentation. The bootstrap terminates the Worker before forwarding a terminal result. Stale identities are ignored.

The fixed limits are: 64 KiB source, 200 entries, 12 KiB combined output/value, 16 KiB packet, 1 KiB error message, two-second deadline, and one-second fresh-run recovery. These are stricter where necessary than the Phase 1 maxima and cannot be raised through the public request.

### 4. Resolve lifecycle outcomes instead of throwing learner failures

`ExecutionAdapter.execute` resolves a discriminated `ExecutionResult`; syntax errors, runtime errors, timeout, output limit, cancellation, and protocol/internal failures are expected outcomes. Construction/programmer misuse may still throw before a run exists. An `AbortSignal` supplies cancellation. Starting a new run cancels the prior run, and `dispose` terminates active work and removes the bootstrap.

Measured duration uses the trusted app clock from dispatch to accepted terminal outcome. It is diagnostic, not an assessment or performance promise.

### 5. Keep workspace integration optional and narrow

`EditorWorkspace` receives an optional adapter. Run snapshots only the active file. Internal run state feeds the existing `ConsolePanel` and `RuntimeStatus`; `WorkspaceActions` gains Run/Cancel only when available. Parent-supplied display states remain supported when no adapter exists. TestResults stays unchanged and inactive.

The workspace owns an `AbortController` and a monotonically increasing presentation token so stale completions cannot replace current output. Editing, file switching, reset, autosave, and drafts remain independent of runtime state.

### 6. Verify the actual browser boundary

Unit tests cover protocol validation, safe serialization, all statuses, cancellation, stale packets, and lifecycle cleanup through injected Worker/port factories. Chromium tests use the real separate loopback origin, inspect CSP headers, attempt network/storage/import/worker/message probes, run infinite loops and floods, cancel, and prove a fresh finite run. Existing editor and repository suites remain required.

## Risks / Trade-offs

- [Runner deployment uses the wrong origin or headers] -> Reject same-origin configuration, publish exact header rules, and gate browser tests on actual response headers and denied requests.
- [A browser allocates memory before message validation] -> Keep source/packet/output bounds and short lifetime, document that browser process memory has no hard quota, and do not claim otherwise.
- [Worker termination leaves a browser target descriptor briefly visible] -> Gate acknowledged termination and fresh-run recovery; do not treat browser-internal descriptor reaping as continuing learner execution.
- [CSP behavior varies across engines] -> Retain Phase 1 engine evidence and run repository Playwright coverage; deferred physical/browser obligations remain explicit rather than inferred.
- [UI completion races with edits or a later run] -> Snapshot source, correlate every run, abort superseded runs, and gate presentation by the latest token.

## Migration Plan

1. Add runtime types/protocol and trusted runner assets without enabling a runtime by default.
2. Add response headers and configuration validation.
3. Integrate the optional adapter into the development workspace route and existing presentation seams.
4. Verify denial, termination, recovery, accessibility, and full repository gates.
5. Deployment may configure the isolated public origin later; absence or same-origin configuration keeps runtime unavailable.

Rollback removes the optional adapter wiring, runtime assets, and headers; Phase 13 editing and drafts continue unchanged.
