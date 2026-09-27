# Proposal

## Why

Phase 14 can run isolated JavaScript but cannot display an HTML/CSS/JavaScript page. Phase 15 needs a reusable preview boundary for exercises and future projects without giving learner markup or scripts access to the authenticated application. The earlier executable-iframe prototype failed hostile-loop recovery, so preview support needs an explicit containment and recovery gate before it can be accepted.

## What Changes

- Add a lesson-independent preview adapter that takes a bounded, immutable HTML/CSS/JavaScript file snapshot, builds a fresh preview document, and reports correlated loading, ready, error, timeout, reset, and unavailable states.
- Host a trusted preview bootstrap on a dedicated, credential-free origin. Render learner content only in a restricted sandboxed child iframe with a deny-by-default CSP and no application-origin credentials, storage, network, navigation, popup, form, or embedding authority.
- Define a bounded, validated `postMessage` handshake and result protocol, explicit cleanup and reload behavior, and adversarial recovery tests. Failed containment or loop recovery blocks completion rather than weakening the Phase 14 boundary.
- Add an optional preview surface to the reusable Editor Workspace, including responsive sizing, accessible status and text error feedback, without changing JavaScript Run/Cancel semantics or draft ownership.
- Update the roadmap and frontend/security/runtime documentation to state the Phase 15 integration and deployment contract.
- Keep validation, checking, attempts, submissions, progress, rewards, backend learning behavior, public hosting, packages, and an offline preview guarantee outside this change.

## Capabilities

### New Capabilities

- `web-preview-runtime`: Isolated preview generation, origin and capability boundary, message protocol, lifecycle, recovery, and responsive preview behavior.

### Modified Capabilities

- `editor-workspace`: Permit an optional, independently configured Phase 15 preview surface for HTML/CSS/JavaScript files while preserving the existing Phase 14 execution and learning-authority boundaries.

## Impact

The future Apply stage affects frontend preview runtime and workspace modules, a fixed preview bootstrap and response headers on a dedicated origin, focused unit/browser security tests, and supporting docs. It does not require backend endpoints, generated API client changes, migrations, or dependency upgrades. The proposal does not select the previously failed executable-HTML prototype as production-ready; Apply must produce new evidence for the proposed boundary.
