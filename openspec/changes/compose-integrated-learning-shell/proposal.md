# Proposal

## Why

The published Quest route still separates lesson reading from the coding workspace vertically. Learners must leave the instruction context to edit or inspect results, so the current screen does not meet the approved V1 learning-shell contract.

## What Changes

- Compose the existing lesson renderer and reusable Editor Workspace into one persistent desktop lesson | editor | output/results experience on published Quest routes.
- Define intentional tablet and mobile panel modes, a clear exercise context/action area, and source-preserving switches between lesson, code, and results.
- Preserve current Run, Check, hint, draft, submission, guest, offline, and backend-accepted completion behavior while changing where those controls and states appear.
- Establish responsive, keyboard, zoom, reduced-motion, loading, and failure evidence for the real local Quest route; record founder visual/workflow acceptance separately.
- Keep R05 founder acceptance as an entry gate for R06 Apply. The R04 real-provider gate remains open and is not reclassified by this presentation work.

## Capabilities

### New Capabilities

- `integrated-learning-shell`: Persistent three-region learning composition, responsive panel strategy, source-safe navigation, action placement, and R06 acceptance behavior.

### Modified Capabilities

- `lesson-renderer`: Allow the approved Quest lesson content to participate in the integrated shell while retaining inert Markdown, hint, loading, and asset safety; make the completed Phase 12 scope statement historical.
- `editor-workspace`: Permit external shell composition of the existing editor and result surfaces without coupling the reusable workspace to curriculum or moving its state authority.

## Impact

Primarily `frontend/src/features/curriculum/lesson-page-client.tsx`, `quest-workspace.tsx`, and reusable `frontend/src/features/editor/` presentation seams. Existing typed public curriculum and protected progress/submission APIs remain unchanged. No backend migration, new runtime permission, telemetry activation, or release-readiness claim is part of R06.
