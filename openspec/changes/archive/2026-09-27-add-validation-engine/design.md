# Design

## Context

See proposal.md. Phase 14 owns `ExecutionAdapter`, a fresh Worker per run, the distinct runner origin, private channel, two-second deadline, one-second recovery, and bounded text results. That contract explicitly excludes assessment. Phase 15 shares it for computation while keeping static preview separate. The curriculum API already publishes bounded data-only console and named-function cases, but the reading-only quest route does not mount an editor. `EditorWorkspace` has a display-only TestResults seam.

## Goals / Non-Goals

**Goals:** Keep validation reusable outside quests, preserve Phase 14's existing Run contract, allow exact console/value/function checks and a small reviewed declarative matcher set, expose local feedback through the workspace, and prove timeout/authority boundaries in real browsers.

**Non-Goals:** No production quest editing route, authored curriculum format change, executable custom grader, hidden cases, certified proof of correctness, or Phase 17+ learning state.

## Decisions

### Separate validation contract and runner resources

Create `frontend/src/features/validation` with `ValidationStrategy`, definition/result types, a validator, and `JavaScriptValidationStrategy`. Reuse the existing runner origin, bootstrap-channel handshake pattern, CSP constants, and fixed Worker limits, but use dedicated fixed validation bootstrap/Worker resources and protocol so the Phase 14 `ExecutionAdapter` does not begin evaluating assessment cases. Extend the channel factory to select a fixed allowlisted bootstrap path. The runner host must expose only fixed `/runtime/` resources without auth/session middleware. No generated API file is edited.

### One Worker per case with a bounded total check

The trusted bootstrap creates a new literal-URL Worker for each case and terminates it before forwarding a result. The application sends one immutable source/definition snapshot with an unpredictable check ID; the bootstrap serializes cases and enforces the Phase 14 two-second deadline per case, bounded case count, and a fixed total deadline. Cancellation/supersession terminates the active Worker and channel; subsequent checks establish fresh state. Correlation includes check and case IDs. Time is measured by trusted control, not learner code. A timed-out case fails the check explicitly; no timed-out Worker is reused. Later finite checks must meet the existing one-second recovery bound.

### Safe comparison, not source-shape grading

The trusted Worker captures bounded console text and converts returned data using own property descriptors, cycle/depth/width checks, and a JSON-compatible value subset; it never calls learner getters or `toJSON`. It compares strict ordered console lines or structurally compares JSON-compatible values. Function tests compile learner source in the Worker and call a named function with cloned bounded arguments; cases do not share Worker globals. The frontend validates every definition before sending it, and the bootstrap/Worker independently enforce bounds. `custom-test` is a reviewed finite predicate union: `output-contains` checks a bounded substring in captured output, and `number-range` checks a finite numeric return within inclusive bounds. No callback or regex is accepted. Published curriculum `console` and `function` cases can be mapped by a future route; Phase 16's development fixture exercises all four modes without importing backend content.

### Fail-closed results and UI

The adapter validates exact-origin handshake, private-port packets, check/case correlation, allowlisted statuses, case count/order, and packet/feedback limits. It returns a terminal status separate from assertion pass. Input errors, syntax/runtime errors, output limits, timeout, cancellation, and protocol failures cannot appear as an ordinary pass. The workspace takes an optional strategy and definition, shows Check/Cancel Check only for JavaScript, clears stale results on edit/owner change, and renders text-only case feedback with local/unverified labeling and duration. Run and Preview retain their current controls.

## Risks / Trade-offs

- Browser-reported checks can be forged → Label them local/unverified and leave acceptance to Phase 17's personal-learning trust policy.
- Several cases can extend total checking time → Bound case count and total deadline; fail remaining cases explicitly when budget is exhausted.
- Learner code can attempt to spoof a function result or disrupt a harness → Keep the harness in the isolated Worker, never treat a local pass as proof, and test common hostile inputs.
- Runner policy changes could weaken Phase 14 → Add only fixed validation paths with the same CSP pattern and rerun Phase 14 security/recovery tests.
- Rich custom checks could become executable test programs → Limit MVP to the two finite data-only predicates above and reject extra fields/functions.

## Migration Plan

No data migration. Deploy fixed validation resources and response headers on the existing credential-free runner origin with the frontend change. If the runner resources or origin are unavailable, Check stays unavailable or fails closed; Run and Preview continue through their existing adapters. Rollback removes the optional validation adapter and fixed resources without changing saved drafts or backend state.
