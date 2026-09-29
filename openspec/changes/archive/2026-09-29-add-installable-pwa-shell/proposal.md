# Phase 26 — Installable PWA Shell

## Why

CodeQuest has durable local work and authenticated replay but no production installation or offline navigation foundation. Phase 26 supplies a safe public application shell before Phase 27 introduces downloaded offline learning.

## What Changes

- Add a standalone manifest, existing-brand installation icons, and browser metadata.
- Build and register a Serwist service worker on the application origin in production only.
- Precache an explicit bounded public static asset allowlist and an accessible offline landing page; use network-first navigation without caching page responses.
- Exclude authentication, protected data, API traffic, Next.js data responses, and runtime/preview compartments from caching.
- Show network availability, registration failures, and waiting updates truthfully. Updates never force activation or reload; learners save and close all tabs before reopening.
- Verify production service-worker behavior and document install/device evidence limits.

## Capabilities

### New Capabilities

- `pwa-shell`: installation metadata, safe public shell caching, offline fallback, network state, and non-disruptive updates.

### Modified Capabilities

None. Historical phase exclusions remain scoped to those phases; existing auth, local persistence, runtime, and replay behavior is preserved.

## Impact

Frontend configuration, middleware public-asset routing, root providers/metadata, `src/pwa`, public shell/icon assets, tests, lockfile, and documentation. Add compatible Serwist build/runtime dependencies without upgrading unrelated packages. No backend endpoint, schema, completion policy, source sync, downloaded-lesson UI, offline progress cache, background sync, or Phase 27+ behavior.
