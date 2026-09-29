# Proposal

## Why

The installed shell currently explains an offline failure but cannot open a saved lesson after a cold launch. Phase 27 makes deliberately downloaded learning material usable without a connection while retaining backend learning authority and the dedicated JavaScript runner boundary.

## What Changes

- Add an explicit download and removal flow for bounded, version-pinned public lesson material, with a device-local offline library and recovery states for missing, stale, or evicted data.
- Add a credential-free static offline-learning document to the public PWA cache. It reads only owner-scoped local snapshots; authenticated pages, API responses, and dynamic navigation remain network-only.
- Prepare a separate, tightly scoped fixed-resource cache on the credential-free runtime origin so the existing Worker-based Run and Check paths can work offline. A download is declared exercise-ready only after browser evidence confirms that both the lesson shell and runner resources are available.
- Reuse Editor Workspace drafts and deterministic validation for offline editing and feedback. Local Check and any offline work remain provisional; no offline action awards accepted completion, XP, streak, or unlocks.
- Persist a minimal owner-scoped accepted-progress view for offline display, clearly labeled with its capture time, and clear it on logout or account switch without touching retained drafts or pending work.
- Keep AI, remote sandboxes, leaderboards, community, account changes, publishing, expanded sync protocol, and cloud draft merging unavailable offline.

## Capabilities

### New Capabilities

- `offline-learning`: Explicit downloaded-lesson readiness, offline reading/editing/local exercises, cached-progress presentation, and truthful failure states.

### Modified Capabilities

- `pwa-shell`: Permit one explicitly public static offline-learning document while retaining the ban on caching authenticated and dynamic navigation responses.
- `javascript-runtime`: Permit the same isolated fixed-byte runtime resources to be prepared for offline use without changing execution limits or authority.
- `local-persistence`: Add bounded owner-scoped lookup and minimal accepted-progress snapshot primitives needed by the offline library.

## Impact

Frontend curriculum, local persistence, Editor Workspace integration, PWA and runtime-origin resources, middleware/CSP, and focused unit/production-browser tests. No new backend authority or API endpoint is planned. Physical/mobile, native storage, and assistive-technology support obligations remain pre-beta evidence work under F02.
