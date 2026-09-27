# Tasks

## 1. Validation contract and deterministic matching

- [ ] 1.1 Add typed `ValidationStrategy` definitions/results and strict bounded definition validation for all four modes; verify malformed, duplicate, oversized, callback, and unsupported predicate unit cases reject before execution.
- [ ] 1.2 Implement exact console/value/function and finite custom predicate matching with descriptor-safe JSON-compatible values; verify normal, boundary, alternate implementation, mismatch, getter, cycle, and output-limit unit cases.
- [ ] 1.3 Document the strategy contract, case bounds, data-only custom predicates, and local/unverified meaning in `docs/validation-engine.md`; verify documented examples match exported types.

## 2. Isolated runner and lifecycle

- [ ] 2.1 Add fixed validation bootstrap/Worker resources, runner-origin path policy, and strict CSP using the existing isolated channel pattern; verify response headers and host allowlists plus Phase 14 origin tests.
- [ ] 2.2 Implement correlated check/case messaging and strict packet validation with one fresh Worker per case; verify forged, stale, duplicate, malformed, and oversized packet tests.
- [ ] 2.3 Enforce per-case and total deadlines, termination-before-result, cancellation, supersession, disposal, and one-second recovery; verify tight-loop, output flood, late-packet, and fresh-run tests in unit and Playwright coverage.
- [ ] 2.4 Verify denied network, storage, DOM, nested worker, import, and authenticated access in real browsers; update `docs/javascript-runtime.md` and `docs/security.md` with the distinct validation boundary and residual local-trust limit.

## 3. Editor Workspace integration

- [ ] 3.1 Add optional Check/Cancel Check state and per-case TestResults display with local/unverified label and elapsed time; verify accessible unit interactions and unchanged Run/Preview behavior.
- [ ] 3.2 Invalidate old results on edit, reset, owner change, navigation/unmount, and superseding checks while preserving drafts; verify source persistence and stale-result tests.
- [ ] 3.3 Exercise all four strategies on the development-only workspace and responsive keyboard/browser flow; update `docs/frontend.md` and verify no production lesson-route or backend learning changes.

## 4. Integration gates

- [ ] 4.1 Run focused validation, existing runtime/preview, frontend/backend, Playwright, root test/lint/typecheck/build, strict OpenSpec validation, and final diff/boundary review; record actual command outcomes and mark the roadmap Apply status accurately.
