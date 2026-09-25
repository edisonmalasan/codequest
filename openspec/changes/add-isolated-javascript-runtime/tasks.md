## 1. Runtime Contract and Protocol

- [ ] 1.1 Define the lesson-independent `ExecutionAdapter`, request/result status model, fixed limits, and safe protocol decoders; verify focused tests cover every terminal status, UTF-8/shape bounds, and stale or malformed packets.
- [ ] 1.2 Implement safe console/return-value formatting that avoids getters and `toJSON`; verify focused tests cover primitives, nested objects, accessors, cycles, proxies, depth/width, entry count, and byte limits.

## 2. Isolated Runner

- [ ] 2.1 Add fixed bootstrap and learner Worker assets plus exact response CSP headers; verify header tests distinguish the bootstrap policy from the stricter learner policy.
- [ ] 2.2 Implement the trusted bootstrap lifecycle with private-channel handshake, fresh Worker per run, correlation, termination-before-delivery, deadline, cancellation, and disposal; verify focused lifecycle tests cover success and every cleanup path.
- [ ] 2.3 Implement `JavaScriptWorkerAdapter` with distinct-origin validation, load/handshake failure recovery, cancellation, superseding runs, duration, double validation, and dependency-injected browser primitives; verify unit tests cover unavailable, stale, duplicate, malformed, timeout, cancel, and restart behavior.
- [ ] 2.4 Deny learner network, storage, import, nested/shared Worker, broadcast, DOM, and trusted-message capabilities without passing secrets; verify real-browser probes produce no target request or application value.

## 3. Editor Workspace Integration

- [ ] 3.1 Extend WorkspaceActions with optional accessible Run/Cancel controls and discoverable scoped Run shortcut; verify component tests cover availability, busy state, keyboard activation, and the unchanged no-adapter baseline.
- [ ] 3.2 Integrate an optional adapter into EditorWorkspace using immutable active-file snapshots, abort/dispose lifecycle, latest-run presentation correlation, existing ConsolePanel/RuntimeStatus seams, and preserved drafts/source; verify focused tests cover success, each failure class, cancel, edit-during-run, stale completion, and fresh rerun.
- [ ] 3.3 Enable the development-only workspace review route through validated public runner-origin configuration; verify missing, malformed, or same-origin configuration stays unavailable without evaluating source.

## 4. Browser Security and Recovery Evidence

- [ ] 4.1 Add Chromium coverage for successful output/value/duration, syntax/runtime errors, infinite-loop timeout, output flood, cancellation, global freshness, and post-failure recovery within approved limits.
- [ ] 4.2 Add Chromium authority probes for network/import/storage/worker/broadcast/DOM/message access, CSP headers, request absence, source preservation, and no console/hydration errors.
- [ ] 4.3 Verify keyboard Run/Cancel, status announcements, responsive workspace composition, and absence of Check/Submit/preview/progress/reward behavior in the real browser flow.

## 5. Documentation and Gates

- [ ] 5.1 Document runtime configuration, adapter/result contract, limits, security boundary, known browser-memory limitation, and Phase 15 integration boundary; verify terminology against ADR 0004, security, frontend, and architecture docs.
- [ ] 5.2 Update the roadmap to record Phase 14 Apply completion without claiming Sync/Archive or Phase 15 work; verify status and evidence links match the active change.
- [ ] 5.3 Run frontend and root lint/typecheck/tests/build, Chromium Playwright, API drift, strict OpenSpec validation, boundary/credential scans, and `git diff --check`; record exact evidence and repair all failures before marking Apply complete.
