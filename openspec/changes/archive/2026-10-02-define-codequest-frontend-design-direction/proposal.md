# Proposal

## Why

R01 approved a broad, integrated V1, but the current homepage is a minimal entry page and the lesson and coding workspace are not yet a composed product. R02 needs a concrete, original visual and interaction direction that the founder can review before R03–R07 build production flows.

## What Changes

- Define a CodeQuest-specific design direction for public navigation, home, discovery, course map, and desktop/tablet/mobile learning workspace. Preserve the existing dark-first pixel-game design-system contract while refining its application to complete screens.
- Deliver a development-only, clickable frontend preview of those representative screens with clearly marked demonstrative content and states. Use original visual assets and copy; do not publish incomplete courses or suggest that preview actions create real progress.
- Document screen hierarchy, responsive transitions, typography, color and spacing usage, interaction states, asset provenance, and the handoff to R03–R07.
- Capture browser, accessibility, and founder review evidence. Founder acceptance of the visual direction remains a distinct manual decision; technical checks alone cannot supply it.

## Capabilities

### New Capabilities

- `frontend-design-direction`: Development-only representative screen preview, original visual direction, responsive and interaction contract, and evidence needed for R02 design review.

### Modified Capabilities

None. The existing design system, frontend foundation, and product-readiness boundaries remain in force.

## Impact

R02 may add a development-only route, preview components and original local assets under `frontend/`, plus focused design documentation and browser checks. It does not change production routes, backend APIs, authentication, curriculum publication, runtime/preview permissions, completion authority, telemetry, or Phase 38 readiness. R03–R07 will implement the accepted direction in separate changes.
