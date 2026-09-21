## Why

The archived Phase 4 change delivered an accessible component library, but its CSS-only pixel treatment does not meet the roadmap objective to create a scalable pixel-game identity. This superseding change strengthens CodeQuest's brand and game-world language while preserving the earlier archive as historical evidence and retaining the approved product, architecture, accessibility, and ownership boundaries.

## What Changes

- Replace the current generic dark visual direction with an original "debugger's frontier" identity built around code-as-tool, circuit-like quest paths, explorable chapter worlds, and crafted progression artifacts.
- Establish a CodeQuest mark and wordmark, an explicit pixel grid and scaling system, a disciplined palette and type hierarchy, and coherent languages for game HUDs, maps, avatars, badges, chapters, achievements, and decorative world elements.
- Add a small, purposeful set of original, web-optimized visual assets with documented provenance; external material remains reference-only unless its reuse license is verified and recorded.
- Substantially redesign the existing core and game components while keeping conventional controls familiar, readable, keyboard-operable, responsive, and compatible with their sensible public APIs.
- Turn `/design-system` into a complete development-only review surface for tokens, assets, components, states, map composition, responsive behavior, focus, and reduced motion.
- Add screenshot-led browser review at representative desktop and mobile widths alongside automated behavior, accessibility, contrast, asset, overflow, hydration, and build checks.
- Update Project Status during the change and, after Apply verification, sync the superseding contract into the canonical design-system capability before archiving this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system`: Supersede the CSS-only visual direction with a cohesive hybrid pixel-game/modern-application identity, governed assets, a complete local showcase, stronger responsive/accessibility constraints, and visual verification requirements.

## Impact

- Affects `frontend/src/styles/`, the existing core and game component modules, focused component tests, and the development-only `frontend/src/app/design-system/` route.
- Adds original identity and game-world assets under `frontend/public/assets/design-system/` plus source/license documentation.
- Modifies only the canonical `design-system` capability; it does not alter backend, auth, data, curriculum, execution, analytics, or PWA behavior.
- Does not rewrite `openspec/changes/archive/2026-09-19-design-system/`; that archive remains the record of the original Phase 4 direction.
