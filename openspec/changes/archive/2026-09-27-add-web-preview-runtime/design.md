# Design

## Context

See proposal.md. Phase 14 already supplies a lesson-independent ExecutionAdapter backed by a fresh Worker on a distinct runner origin, with fixed limits, cancellation, and timeout recovery. EditorWorkspace currently supports JavaScript files, owner-scoped local drafts, and an optional execution adapter. Phase 1 rejected executable-HTML iframe recovery and selected a Worker-backed, script-disabled supplied-shell presentation as its recommended mechanism. This revision follows that boundary while adding static HTML/CSS editing and display.

## Goals / Non-Goals

**Goals:**

- Display useful static HTML/CSS without placing learner markup in the authenticated app DOM or running it as script.
- Run the one optional JavaScript file only through the existing Phase 14 Worker contract and show its result as bounded text.
- Preserve distinct-origin transport, exact correlation, cleanup, and responsive Editor Workspace seams.

**Non-Goals:**

- DOM scripting, event handlers, document APIs in learner JavaScript, packages/imports, external assets, public hosting, assessed DOM behavior, or offline preview guarantees.

## Decisions

### 1. Fixed preview origin and script-disabled learner frame

Validate NEXT_PUBLIC_PREVIEW_ORIGIN as an HTTPS origin distinct from both the application and NEXT_PUBLIC_RUNTIME_ORIGIN; loopback HTTP is a local-development exception. Host fixed preview bootstrap HTML/JavaScript on that credential-free origin, with no app session, application routing, service-worker registration, or source-bearing URLs. Embed the trusted fixed bootstrap with sandbox permissions for scripts and same-origin, because it needs to run its fixed bridge script on its separate origin. The bootstrap creates a nested learner iframe with an empty sandbox permission set. No learner code or markup is inserted into the bootstrap DOM. The child is opaque-origin and script-disabled.

Alternative: app-origin srcdoc would put the containment failure next to the authenticated app; a script-capable child repeats the failed Phase 1 recovery mechanism. A separate preview origin and empty child sandbox preserve the selected Worker-backed boundary.

### 2. Conservative static document generation and effective CSP

Require one HTML file, at most one CSS file, and at most one JavaScript file in a captured ordered snapshot. Bound each and aggregate UTF-8 bytes. Build a complete child document from a conservative static HTML subset: preserve ordinary structural/text elements, safe static attributes, inline CSS from the CSS file, and bounded data images if supported. Reject or strip active constructs before transfer using a real HTML parser rather than regex: script, event-handler and navigation attributes, meta refresh, forms, embeds, nested frames, active SVG, external resource references, and unsafe URLs. If a parser dependency is needed, add it directly for this security requirement rather than relying on a transitive dependency. Escape CSS closing tags before embedding; source never enters trusted script or URL contexts. Give the learner a bounded explanation when content is rejected.

The bootstrap response CSP defaults to none, permits only its fixed same-origin script, the child frame, and the inline style needed by the child inheritance model; deny connections, workers, forms, objects, and external resources. The child begins with an additional restrictive policy: script-src none, connect-src none, frame-src none, worker-src none, form-action none, base-uri none, style-src unsafe-inline, and a narrow image/data allowance. Referrer policy is no-referrer; fixed resources use nosniff. The authenticated app frame policy allows only the exact preview origin. Browser tests must confirm effective inherited policies and controlled-sink denial, including links and redirects. If a browser sends learner data to any sink, stop Apply and revise this design.

Alternative: rendering raw HTML directly relies on CSP alone to neutralize navigation and active markup. The conservative subset and CSP are independent layers; the browser tests validate their combination.

### 3. Keep JavaScript computation in Phase 14

The preview adapter optionally calls a separate instance of the existing ExecutionAdapter with the captured JavaScript source, so Preview does not cancel an independent Run action. It does not alter JavaScriptWorkerAdapter, its bootstrap, its fixed limits, or the Run/Cancel UI contract. A missing JavaScript file leaves the computation panel idle. A missing/unavailable runner leaves the static page available with a truthful computation error. Worker output, return value, and errors are rendered only as text in the trusted workspace; no value is interpreted as HTML/CSS or sent to the learner frame. HTML and CSS cannot observe computation results. This is an explicit non-DOM JavaScript model, matching the user's revised scope.

Alternative: executing JavaScript in the child iframe would give it document/navigation APIs and restore the failed tight-loop boundary. A custom Worker duplicates Phase 14 controls and could diverge from its verified limits.

### 4. Correlated private transport and lifecycle

The app creates one fixed bootstrap frame per preview adapter instance. Wait for a bootstrap-ready message from the exact expected frame window and preview origin, with a random bootstrap ID; transfer a private MessagePort using an exact target origin. The bootstrap validates parent source and origin before accepting it. Every preview command and report carries an unpredictable generation ID and bounded allowlisted shape. The learner child gets no port. Ignore stale, forged, duplicate, malformed, and oversized packets; malformed active traffic fails closed and resets the channel. The bootstrap reports child load/errors only as bounded state, not assessment evidence.

Preview captures current sources on explicit Preview; Reload recreates a child from the last captured snapshot. New Preview, cancellation, owner change, navigation, and unmount invalidate the old generation, remove the child, close ports, revoke any URLs, and clear timers/listeners. The host independently bounds startup and shell response time. A separately running Worker is aborted and terminated through its existing adapter contract. The status model distinguishes unavailable, loading, ready, error, timeout, and reset without erasing source or drafts.

Alternative: automatic every-keystroke refresh makes snapshot identity and cleanup harder to reason about; explicit Preview/Reload is the baseline.

### 5. Optional workspace surface

Extend WorkspaceFile.language to HTML/CSS/JavaScript and CodeMirror language support. Keep existing tabs, draft repository, Save/Reset, and Phase 14 Run/Cancel. Add optional Preview/Reload actions and a named panel; the parent controls whether it is mounted. At narrow widths stack it with the editor, and provide a fixed-size or bounded responsive viewport that cannot widen the whole page. Show a text equivalent of Worker output and status, and never treat visual content as correctness.

## Risks / Trade-offs

- **Static subset surprises learners** -> Explain rejected active content and document supported markup; do not silently claim full browser-app behavior.
- **Markup navigation or CSS requests leak source** -> Parser neutralization plus CSP and controlled-sink browser gates; any leak blocks completion.
- **CSP differs across engines** -> Test actual useful rendering and denial in Chromium, Firefox, and WebKit before claiming coverage.
- **Preview bootstrap unavailable** -> Fail closed and keep editing/drafts available; do not serve preview from app origin.
- **Worker and frame lifecycles race** -> Correlate each generation, abort old Worker runs, discard stale frame reports, and test repeated reloads.
- **No hard browser memory quota** -> Fixed source/result limits, one active child, prompt teardown, and an explicit residual limitation.

## Migration Plan

1. Deploy the fixed credential-free preview resources and response headers on a separate origin; validate origin and browser containment before workspace wiring.
2. Integrate the optional adapter into the development-only workspace review route and verify static output plus separate Worker computation, lifecycle, accessibility, and reflow.
3. Disable the optional preview adapter or origin to roll back; Phase 14 Run/Cancel and local drafts remain usable.
