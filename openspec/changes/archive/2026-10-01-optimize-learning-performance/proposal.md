# Proposal

## Why

The Phase 36 roadmap calls for a usable learning path on lower-powered devices. The current production build sends about 477 kB of first-load JavaScript to a Quest and 484 kB to offline learning, compared with 107 kB for home, while exact device budgets remain open under F02. A measured, reproducible optimization pass can reduce avoidable startup work without claiming untested device support.

## What Changes

- Record production route, asset, curriculum-payload, worker-start, and service-worker cache baselines with repeatable commands and qualified browser conditions.
- Defer heavy editor code until its workspace is needed while preserving draft, focus, loading, Run/Check, and failure behavior.
- Optimize evidenced font, sprite, and image delivery where it lowers bytes without degrading the approved visual identity or accessibility.
- Keep the public PWA shell bounded and exclude protected data; measure its actual precache cost and prevent accidental growth.
- Add a performance regression gate for deterministic build and asset sizes, plus a repeatable browser startup probe that reports timings without treating development hardware as a supported low-end device.

## Capabilities

### New Capabilities

- `learning-performance`: observable loading, asset, worker-start, cache-budget, and qualified measurement requirements for the core learning path.

### Modified Capabilities

None. Existing editor, runtime, curriculum, accessibility, and PWA contracts remain authoritative.

## Impact

Frontend learning and offline routes, Editor Workspace loading, static assets and font delivery, build/CI measurement scripts, browser coverage, and the performance review. No backend authority rule, API shape, service-worker protected-cache policy, new dependency, or production device-support promise is introduced.
