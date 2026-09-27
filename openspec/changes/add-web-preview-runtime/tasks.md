# Tasks

## 1. Preview origin and containment proof

- [ ] 1.1 Add strict `NEXT_PUBLIC_PREVIEW_ORIGIN` validation and fixed preview bootstrap resources on a credential-free distinct origin; verify absent, same-origin, runner-origin, malformed, and insecure settings fail closed in focused tests.
- [ ] 1.2 Add response CSP and sandbox configuration for trusted bootstrap and opaque learner frame; verify effective policy, useful inline HTML/CSS/JavaScript rendering, and denied parent/storage access in Chromium, Firefox, and WebKit browser tests.
- [ ] 1.3 Probe fetch, beacon, image, CSS URL, external script, form, child frame/worker, popup, top navigation, direct self-navigation, and link navigation against controlled sinks; verify no request carrying learner data reaches external or authenticated targets. Stop Apply and revise OpenSpec if this gate fails.
- [ ] 1.4 Probe a tight infinite loop followed by an immediate finite preview, repeated reset, and host responsiveness in targeted browsers; record the independent preview timeout/recovery budget from measured evidence. Stop Apply and revise OpenSpec if recovery fails.

## 2. Snapshot and messaging contract

- [ ] 2.1 Implement typed HTML/CSS/JavaScript snapshot validation, deterministic document generation, escaping, and fixed byte limits; verify valid multi-file output plus malformed, duplicate, closing-tag, and oversized cases in unit tests.
- [ ] 2.2 Implement exact-origin/window bootstrap handshake and private correlated port protocol with bounded allowlisted packets; verify forged, stale, duplicate, malformed, and oversized packets cannot change active state in unit and browser tests.
- [ ] 2.3 Implement preview start, reload, supersession, timeout, error, abort, and dispose; verify fresh-document identity, source preservation, and iframe/port/listener/timer/object-URL cleanup after each terminal path in focused tests.
- [ ] 2.4 Document the preview configuration, source/packet limits, CSP/sandbox contract, recovery evidence, and residual browser-memory limitation; verify documentation matches deployed headers and test fixtures.

## 3. Reusable workspace integration

- [ ] 3.1 Extend workspace file typing and syntax support to HTML/CSS/JavaScript without changing JavaScript Run/Cancel or owner-scoped draft behavior; verify file switching, editing, save, reset, and existing execution tests.
- [ ] 3.2 Add optional Preview/Reload actions and an accessible named preview/status panel that captures current multi-file source only on explicit Preview; verify absent-adapter, loading, ready, error, timeout, and stale-generation behavior in component tests.
- [ ] 3.3 Wire representative HTML/CSS/JavaScript files into the development-only workspace review route; verify no production lesson route or backend integration is introduced and existing JavaScript review behavior remains testable.
- [ ] 3.4 Test responsive preview/editor reflow, keyboard access, text error alternatives, zoom, and 390 CSS-pixel layout in Playwright; verify no page-level horizontal overflow and source survives reload/failure.
- [ ] 3.5 Update `docs/frontend.md` and `docs/security.md` for the optional preview boundary and inaccessible learning authority; verify terminology against the canonical editor, JavaScript runtime, and preview delta specs.

## 4. Integration verification

- [ ] 4.1 Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`, plus frontend browser security/recovery flows; record exact results and resolve failures without weakening containment assertions.
- [ ] 4.2 Review final diff, origin/header deployment behavior, secret/source logging, generated-client and backend boundaries, and Phase 16+ exclusions; verify no preview result triggers Check, submission, progress, or rewards.
- [ ] 4.3 Update the roadmap status and `docs/javascript-runtime.md` after verified Apply work, linking evidence and keeping Phase 14 guarantees intact; verify references and phase status against the final change artifacts.
