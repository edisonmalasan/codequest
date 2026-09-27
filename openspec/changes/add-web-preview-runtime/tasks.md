# Tasks

## 1. Static preview boundary

- [ ] 1.1 Add NEXT_PUBLIC_PREVIEW_ORIGIN validation and fixed credential-free preview resources on an origin distinct from app and Phase 14 runner; verify absent, malformed, same-origin, runner-origin, and insecure settings fail closed in unit tests.
- [ ] 1.2 Implement bounded snapshot validation for exactly one HTML file and optional CSS/JavaScript files; verify duplicate, unsupported, missing, and oversized input failures plus immutable capture in unit tests.
- [ ] 1.3 Build a conservative static HTML/CSS document with a real parser, active-markup rejection, safe URLs, and closing-tag escaping; verify useful headings/layout/styles and script/event/refresh/form/embed/URL denial in unit tests.
- [ ] 1.4 Add fixed bootstrap and child CSP, empty learner sandbox, no-referrer and nosniff headers; verify useful static rendering, effective policies, absent DOM/storage authority, and external/authenticated sink denial including links and redirects in Chromium, Firefox, and WebKit. Stop Apply and revise OpenSpec if containment fails.
- [ ] 1.5 Document supported static markup, preview-origin deployment, CSP/sandbox, byte limits, and residual browser-memory limits; verify examples and header claims against tests.

## 2. Private protocol and lifecycle

- [ ] 2.1 Implement exact-origin/window bootstrap handshake, random instance and generation IDs, and a private bounded MessagePort protocol; verify forged, stale, duplicate, malformed, and oversized packets cannot update current state in unit and browser tests.
- [ ] 2.2 Implement explicit Preview/Reload, startup timeout, supersession, cancellation, and disposal of frames/ports/listeners/timers/URLs; verify fresh generation identity, source preservation, and cleanup after failures and repeated reloads in focused tests.
- [ ] 2.3 Integrate optional captured JavaScript through a separate instance of the existing Phase 14 ExecutionAdapter and render only bounded text outside the iframe; verify finite output, DOM/network denial, independent Run/Preview cancellation, timeout, and immediate fresh-run recovery without changing Phase 14 limits.
- [ ] 2.4 Document the adapter/result contract and separate frame/Worker lifecycle, then verify docs match public types and error states.

## 3. Reusable Editor Workspace

- [ ] 3.1 Extend workspace file typing and CodeMirror modes to HTML/CSS/JavaScript while preserving owner-scoped drafts and JavaScript Run/Cancel; verify editing, switching, save, reset, and existing runtime tests.
- [ ] 3.2 Add optional Preview/Reload controls and an accessible named preview/status panel; verify absent-adapter, static ready, computation output, error, timeout, and stale-generation states in component tests.
- [ ] 3.3 Wire representative HTML/CSS/JavaScript files into the development-only workspace review route; verify no production lesson route, backend learning path, or generated API client changes.
- [ ] 3.4 Verify keyboard access, bounded text alternatives, zoom, and 390 CSS-pixel reflow in Playwright; verify no page-level horizontal overflow and source survives failure/reload.
- [ ] 3.5 Update frontend and security docs for the static preview and non-DOM JavaScript boundary; verify terminology against canonical and delta specs.

## 4. Integration verification

- [ ] 4.1 Run pnpm test, pnpm lint, pnpm typecheck, pnpm build, and focused browser containment/recovery flows; record exact results and resolve failures without weakening assertions.
- [ ] 4.2 Review the final diff for origin/header deployment, raw-source logging, backend/generated-client boundaries, and Phase 16+ exclusions; verify no preview result triggers Check, submission, progress, or rewards.
- [ ] 4.3 Update roadmap status and JavaScript runtime docs after verified Apply work, linking evidence and preserving Phase 14 guarantees; verify references and phase status against the final artifacts.
