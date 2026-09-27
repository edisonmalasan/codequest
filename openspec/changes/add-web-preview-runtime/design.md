# Design

## Context

See [proposal.md](proposal.md). The Phase 14 `JavaScriptWorkerAdapter` is a single-file computation adapter with a trusted hidden bootstrap on `NEXT_PUBLIC_RUNTIME_ORIGIN`; it must remain unchanged. `EditorWorkspace` currently owns JavaScript-only file tabs, owner-scoped drafts, and optional Run/Cancel presentation. Its development-only `/editor-workspace` route is a useful integration review surface but is not a learner lesson route. The [Phase 1 evidence](../../../docs/adr/0004-browser-execution-isolation.md) rejected an earlier executable-HTML iframe because tight loops prevented timely recovery; its later Worker-backed, script-disabled preview did not promise DOM-programming JavaScript. Phase 15 proposes that broader behavior with a fresh verification gate, not a claim that the earlier failure is resolved.

## Goals / Non-Goals

**Goals:**
- Render a bounded, captured HTML/CSS/JavaScript workspace in a replaceable iframe without putting learner bytes into the application DOM, app-origin `srcdoc`, server logs, or the Phase 14 Worker.
- Keep trusted transport, lifecycle, error presentation, and cleanup outside the learner document.
- Preserve the existing Editor Workspace draft and execution seams while adding an optional preview seam.

**Non-Goals:**
- General web hosting, external assets/packages, authenticated fetches, cross-document navigation, persistent preview state, guaranteed offline preview, deterministic checking, or backend authority.

## Decisions

### 1. Separate preview origin and nested document

Use a new `NEXT_PUBLIC_PREVIEW_ORIGIN` validated like the existing runner origin, but require it to differ from both the application and `NEXT_PUBLIC_RUNTIME_ORIGIN`. Deploy fixed `/preview/bootstrap.html` and `/preview/bootstrap.js` resources there without cookies, credentialed APIs, service-worker registration, or application routing. The application embeds this trusted bootstrap with a literal URL and `sandbox="allow-scripts allow-same-origin"`; this combination is acceptable only because the bootstrap is a fixed trusted page on its own origin. The bootstrap creates a new nested learner iframe for each snapshot with `sandbox="allow-scripts"` and no `allow-same-origin`. The learner frame therefore has an opaque origin and cannot read or alter the bootstrap or app DOM. No learner string is inserted into the bootstrap DOM or URL.

Alternatives: app-origin `srcdoc` risks same-origin authority if sandboxing regresses; reusing the Phase 14 runner couples an experimental DOM boundary to its validated Worker policy; a dynamic server endpoint would transmit private source to server infrastructure. The nested frame keeps source transport in browser memory and isolates the fixed bridge from learner DOM APIs.

### 2. Fixed policies and a verified no-network gate

Serve the bootstrap with a response CSP that defaults to `none`, allows its fixed same-origin script, inline script/style needed by the nested `srcdoc` inheritance model, and child frame construction, and denies connections, forms, objects, workers, external resources, and base changes. No learner bytes enter the trusted bootstrap DOM, so its inline allowance does not make learner code trusted. The child document begins with a restrictive CSP before learner bytes: only inline scripts and styles, data/blob visual resources where required, and no connections, external scripts/styles, workers, nested frames, forms, objects, or base changes. Browser tests must inspect *effective* policies in Chromium, Firefox, and WebKit, including `srcdoc` inheritance. No CSP relaxation goes on the authenticated app or Phase 14 runner. Set `Referrer-Policy: no-referrer` and `X-Content-Type-Options: nosniff` on fixed preview resources; use a restrictive parent `frame-src` allowlist for the exact preview origin.

The child sandbox denies top navigation and popups; direct child self-navigation is an explicit risk because a script could encode data in a URL. The Apply gate sends controlled sink probes for `location`, links, redirects, images, CSS URLs, fetch/beacon, forms, nested frames, and workers. If any learner-initiated request reaches the sink, do not ship a script-capable preview under this design. Revisit the scope or mechanism in OpenSpec rather than calling best-effort CSP a network guarantee. A script-disabled supplied-shell fallback would not satisfy this spec's JavaScript behavior and needs a separate approved change.

### 3. One captured snapshot and one trusted channel per preview generation

Define a `PreviewAdapter` separate from `ExecutionAdapter`. It accepts a typed ordered set of HTML/CSS/JavaScript files and an abort signal, owns fixed aggregate and per-file UTF-8 limits, and returns a generation ID plus bounded status/error text. Require a single HTML entry, optional CSS and JavaScript entries, stable unique IDs, and explicit ordering; no package imports or file-system-like relative asset loading. Build a complete document with escaped closing-tag sequences so learner strings cannot escape their intended HTML/CSS/JS placement. Avoid interpolating learner data into trusted bootstrap script or attributes. The child receives only generated document bytes; no owner ID, token, origin URL, or API client.

The parent waits for a `bootstrap-ready` window message from the exact expected `contentWindow` and preview origin, matching a random bootstrap ID, then transfers a private `MessagePort` using an exact `targetOrigin`. The bootstrap validates the parent origin and source before accepting the port. Commands and terminal reports carry random generation IDs, use an allowlisted schema, and are byte bounded before trusted rendering. The port never reaches the learner iframe. Any child `postMessage` is ignored by the parent; optional child error reporting is treated as untrusted text, bounded in the bootstrap, and cannot mark a preview as authoritative success. Closing-tag escaping and packet limits require adversarial tests rather than string-level assertions alone.

Alternatives: `window.postMessage(..., '*')` lacks target binding; relying only on an ID permits same-frame stale traffic; sending source through URL leaks to navigation/history/logs. The Phase 14 bootstrap-channel *pattern* can inform this code, but its message types, IDs, and validated runtime policy stay separate.

### 4. Lifecycle and UI integration

The host owns loading timeout, frame replacement, abort/supersession, and disposal. Reload discards the previous child and creates a fresh document from the last captured snapshot; a new Preview action captures the current workspace sources. The host closes ports and revokes any object URLs, removes iframe nodes/listeners/timers, and ignores late packets after generation change or unmount. Surface unavailable, loading, ready, error, timeout, and reset states as text; render any learner error with `textContent`/React text only. Preserve source and drafts through failures.

Extend `WorkspaceFile.language` to HTML/CSS/JavaScript and reuse the current tab/draft machinery. Add an optional preview adapter and panel beside existing console/status; keep `ExecutionAdapter` wired only to compatible JavaScript Run requests. The parent controls whether Preview is offered. The internal review route can supply representative files, but production lesson mounting remains out of scope. At narrow widths stack the panel; on desktop offer a bounded resizable viewport preset without page-level overflow. Name the iframe/region and keep controls keyboard accessible; do not derive correctness from pixels.

Alternatives: auto-preview every keystroke increases resource churn and makes snapshot identity unclear. Explicit Preview/Reload is the Phase 15 baseline.

### 5. Recovery is an acceptance gate

Keep the Phase 14 two-second execution and one-second recovery constants untouched. For the preview, define an independent bounded startup and teardown budget in implementation from measured browser evidence; test a hostile tight loop followed immediately by a finite preview with the application remaining responsive. Repeat resets and failure/reload cycles and verify source persistence. Because iframe removal may not interrupt a script that occupies a browser renderer thread, the proposal cannot promise recovery from architecture alone. If the loop/recovery gate fails in a supported browser, stop Apply, retain the failure evidence, and revise the design. Do not weaken the P11 no-authority boundary or claim a fallback is equivalent.

## Risks / Trade-offs

- **Script loop blocks teardown** → Real-browser watchdog and finite-next-preview gate; failed gate blocks Phase 15 completion.
- **Self-navigation bypasses fetch CSP** → Controlled external and authenticated sink probes; any outgoing request blocks this design.
- **CSP inheritance differs by engine** → Assert enforced policies and useful inline HTML/CSS/JS behavior in each targeted engine before accepting the build.
- **Browser memory has no hard iframe quota** → Fixed source/packet/output limits, one active generation, prompt node disposal, and explicit residual-limit documentation; no high-assurance claim.
- **Learner can forge its own error events** → Treat all learner error text as untrusted display data and never as a Check or success signal.
- **Dedicated-origin deployment is absent** → Fail closed and show an accessible unavailable state; do not silently serve preview from the app origin.

## Migration Plan

1. Add and verify the fixed preview-origin resources, headers, and exact origin configuration independently of the Phase 14 runner deployment.
2. Integrate the optional adapter into the development-only workspace review surface, then verify functional, security, recovery, accessibility, and responsive behavior before enabling it for any later lesson caller.
3. Roll back by removing the optional adapter/configuration or disabling the preview origin; the existing editor, drafts, and Phase 14 runtime remain usable.
