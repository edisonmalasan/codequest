## Why

CodeQuest can preserve JavaScript source but cannot yet run it safely or show truthful runtime feedback. Phase 14 introduces the approved browser-only computation boundary so learners can execute beginner JavaScript without giving their code application authority or coupling execution to lessons, checking, or progress.

## What Changes

- Add a reusable `ExecutionAdapter` contract and a `JavaScriptWorkerAdapter` that executes one source snapshot in a fresh Worker for every run.
- Use the Phase 1 selected dedicated-runner pattern: a separately configured runner origin, persistent trusted bootstrap, private correlated channel, literal-URL Worker, strict CSP, and independent trusted timeout/termination.
- Capture bounded console output and returned values as text, distinguish syntax/runtime/timeout/output-limit/cancelled/protocol failures, and report measured execution duration.
- Terminate the active Worker on every terminal result, cancellation, timeout, protocol failure, adapter disposal, and superseding run; prove a fresh run succeeds after hostile code.
- Deny learner access to session material, application origin/storage, authenticated APIs, network primitives, worker spawning/imports, and trusted messaging controls.
- Integrate Run and Cancel only through the existing Editor Workspace actions, console, and runtime-status presentation seams, with accessible status announcements and preserved source/drafts.
- Keep web preview, deterministic checking, submissions, progress acceptance, rewards, backend execution, analytics, and Phase 15+ behavior outside this change.

## Capabilities

### New Capabilities

- `javascript-runtime`: Defines the reusable execution contract, isolated Worker lifecycle, bounded result protocol, failure taxonomy, cancellation, duration reporting, and security boundary.

### Modified Capabilities

- `editor-workspace`: Permits an optional execution adapter to drive Run/Cancel and the existing console/runtime surfaces while preserving lesson independence and excluding checking or learning authority.

## Impact

- Frontend runtime modules, isolated public runner assets, response security headers, and focused unit/browser tests are added.
- The existing Editor Workspace receives an optional adapter integration; without an adapter it retains the current unavailable runtime state.
- A public runtime-origin configuration value identifies a separate browser origin but carries no credential or secret.
- No backend module, API contract, generated client, database migration, authentication behavior, curriculum behavior, service worker, preview renderer, validation rule, submission, progress, or reward path changes.
