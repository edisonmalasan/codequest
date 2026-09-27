# Proposal

## Why

Phase 14 provides isolated JavaScript computation but no reusable HTML/CSS preview. The prior executable-HTML iframe failed hostile-loop recovery, while the approved Phase 1 Worker-backed supplied-shell pattern preserves the learner authority boundary. Phase 15 adapts that narrower pattern for a reusable Editor Workspace preview.

## What Changes

- Add an optional preview adapter that captures bounded HTML, CSS, and JavaScript files. HTML/CSS render as a static page in a script-disabled sandboxed iframe; JavaScript runs separately through the existing isolated Worker and returns bounded text.
- Use a dedicated credential-free preview origin for a fixed bootstrap and script-disabled learner document, distinct from the authenticated app and Phase 14 runner origins.
- Restrict sandbox permissions and CSP, validate exact-origin and correlated postMessage traffic, reject stale or malformed packets, and clean up frames, ports, listeners, and timers on reload, cancellation, or unmount.
- Preserve responsive, accessible Editor Workspace editing, local drafts, and Phase 14 Run/Cancel behavior. Show JavaScript computation output as text; do not execute it against the preview DOM.
- Require real-browser sink, containment, loop-recovery, repeated-reload, and cross-engine evidence before accepting the capability.
- Keep DOM scripting, external assets/packages, validation/checking, submissions, progress, rewards, backend learning behavior, public hosting, and an offline preview guarantee outside this change.

## Capabilities

### New Capabilities

- web-preview-runtime: Static HTML/CSS display, separately isolated JavaScript computation, preview-origin messaging, lifecycle, security, and responsive presentation.

### Modified Capabilities

- editor-workspace: Permit an optional Phase 15 static preview and separate JavaScript computation surface without changing draft ownership, Phase 14 execution, or learning authority.

## Impact

The Apply stage affects frontend preview/runtime integration, fixed preview-origin resources and headers, Editor Workspace components, focused unit/browser tests, and supporting docs. It does not require backend endpoints, generated API client changes, migrations, or dependency upgrades. The previously failed executable-HTML iframe is excluded; Phase 14 Worker guarantees remain intact.
