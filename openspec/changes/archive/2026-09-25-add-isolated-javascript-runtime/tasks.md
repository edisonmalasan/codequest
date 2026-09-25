## 1. Runtime Contract and Protocol

- [x] 1.1 Define the lesson-independent `ExecutionAdapter`, request/result status model, fixed limits, and safe protocol decoders; verify focused tests cover every terminal status, UTF-8/shape bounds, and stale or malformed packets.
- [x] 1.2 Implement safe console/return-value formatting that avoids getters and `toJSON`; verify focused tests cover primitives, nested objects, accessors, cycles, proxies, depth/width, entry count, and byte limits.

## 2. Isolated Runner

- [x] 2.1 Add fixed bootstrap and learner Worker assets plus exact response CSP headers; verify header tests distinguish the bootstrap policy from the stricter learner policy.
- [x] 2.2 Implement the trusted bootstrap lifecycle with private-channel handshake, fresh Worker per run, correlation, termination-before-delivery, deadline, cancellation, and disposal; verify focused lifecycle tests cover success and every cleanup path.
- [x] 2.3 Implement `JavaScriptWorkerAdapter` with distinct-origin validation, load/handshake failure recovery, cancellation, superseding runs, duration, double validation, and dependency-injected browser primitives; verify unit tests cover unavailable, stale, duplicate, malformed, timeout, cancel, and restart behavior.
- [x] 2.4 Deny learner network, storage, import, nested/shared Worker, broadcast, DOM, and trusted-message capabilities without passing secrets; verify real-browser probes produce no target request or application value.

## 3. Editor Workspace Integration

- [x] 3.1 Extend WorkspaceActions with optional accessible Run/Cancel controls and discoverable scoped Run shortcut; verify component tests cover availability, busy state, keyboard activation, and the unchanged no-adapter baseline.
- [x] 3.2 Integrate an optional adapter into EditorWorkspace using immutable active-file snapshots, abort/dispose lifecycle, latest-run presentation correlation, existing ConsolePanel/RuntimeStatus seams, and preserved drafts/source; verify focused tests cover success, each failure class, cancel, edit-during-run, stale completion, and fresh rerun.
- [x] 3.3 Enable the development-only workspace review route through validated public runner-origin configuration; verify missing, malformed, or same-origin configuration stays unavailable without evaluating source.

## 4. Browser Security and Recovery Evidence

- [x] 4.1 Add Chromium coverage for successful output/value/duration, syntax/runtime errors, infinite-loop timeout, output flood, cancellation, global freshness, and post-failure recovery within approved limits.
- [x] 4.2 Add Chromium authority probes for network/import/storage/worker/broadcast/DOM/message access, CSP headers, request absence, source preservation, and no console/hydration errors.
- [x] 4.3 Verify keyboard Run/Cancel, status announcements, responsive workspace composition, and absence of Check/Submit/preview/progress/reward behavior in the real browser flow.

## 5. Documentation and Gates

- [x] 5.1 Document runtime configuration, adapter/result contract, limits, security boundary, known browser-memory limitation, and Phase 15 integration boundary; verify terminology against ADR 0004, security, frontend, and architecture docs.
- [x] 5.2 Update the roadmap to record Phase 14 Apply completion without claiming Sync/Archive or Phase 15 work; verify status and evidence links match the active change.
- [x] 5.3 Run frontend and root lint/typecheck/tests/build, Chromium Playwright, API drift, strict OpenSpec validation, boundary/credential scans, and `git diff --check`; record exact evidence and repair all failures before marking Apply complete.

## Verification evidence — 2026-09-25

- Focused runtime protocol, Worker-asset, adapter lifecycle, and Editor Workspace suites passed 40 tests. Coverage includes every terminal status, malformed/stale/duplicate packets, handshake recovery, safe formatting, fixed bounds, cancellation, supersession, immutable source snapshots, stale presentation suppression, and the no-adapter baseline.
- `pnpm --dir frontend lint`, `pnpm --dir frontend typecheck`, `pnpm --dir frontend test`, and `pnpm --dir frontend build` passed. The final frontend Vitest run completed 207 tests across 48 files. An earlier four-command concurrent run caused `.next` contention and one route-test timeout; sequential reruns passed and no criterion was weakened.
- `pnpm --dir frontend test:e2e` passed all 6 Chromium flows. The runtime flow verifies actual distinct-host execution, exact bootstrap/Worker CSP, output/value/duration, syntax and runtime errors, tight-loop and hostile-proxy timeout, output flood, cancellation, fresh globals, sub-second recovery, restricted capabilities, zero forbidden target requests, no application storage/cookie sentinel, source preservation, keyboard Run/Cancel, reduced motion, responsive reflow, and no hydration/console failures. An initial `0.0.0.0` test binding produced an invalid callback redirect and one unrelated Journey navigation timeout; the runner fixture moved to the distinct `localhost` host while the app retained `127.0.0.1`, and the repeated full suite passed.
- Root `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` passed. The root test run completed 207 frontend Vitest tests, 111 backend Vitest tests, and 3 backend history-script tests.
- `pnpm api:check` passed without generated-client drift.
- `openspec validate add-isolated-javascript-runtime --strict` and `openspec validate --all --strict` passed.
- The changed-file architecture scan found no backend or generated API-client changes, and the changed-diff credential-pattern scan found no credential material.
- `git diff --check` passed.
