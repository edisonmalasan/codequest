# Proposal

## Why

The production frontend has working routes and guarded learning flows, but its visual hierarchy is still uneven: large pixel headings compete with task content, published Courses occupy sparse catalog space, and exercise labels become hard to scan in the long Course map. The founder has withdrawn the prior R05 visual acceptance and requested a creative revision across the frontend before the R06 learning shell proceeds.

## What Changes

- Establish one original, accessible CodeQuest visual direction across Home, global navigation, onboarding, discovery, Journey, Course, authentication, account, published and offline learning, feedback, and shared error states. Retain the existing mark and URL structure.
- Recompose Home and discovery around useful learning choices, original world art, clear course metadata, and responsive content density. Show only published curriculum; do not fill empty space with invented courses.
- Make Journey and Course hierarchy readable at a glance: meaningful chapter grouping, large exercise targets, state and prerequisite explanations, a clear next eligible action, and comfortable mobile scanning.
- Give auth and account routes the same visual language without changing fields, providers, account authority, or security behavior.
- Define the visual contract for R06's persistent lesson/editor/results shell so its later Apply can integrate the new direction. The present change does not claim R06 founder acceptance or implement its composition.
- Capture exact-build desktop, tablet, and mobile browser evidence and keep founder visual acceptance open until the founder reviews the revised real routes.

## Capabilities

### New Capabilities

- `frontend-visual-experience`: Cross-route visual hierarchy, original art direction, responsive composition, and verification for the revised production frontend.

### Modified Capabilities

- `design-system`: Refine token and typography roles for the production visual direction while preserving semantic states, accessible controls, and original asset provenance.
- `production-shell-homepage`: Replace the earlier accepted Home presentation with the founder-requested revised production presentation and reopen its visual acceptance gate.
- `course-discovery`: Require a useful, readable published-course catalog at sparse and future multi-course densities.
- `journey-course-ui`: Require legible chapter/exercise map composition and responsive scanning without changing unlock authority.

## Impact

This is frontend presentation and planning work in `frontend/src/styles`, the shared shell, Home, onboarding, curriculum, auth, account, offline learning, feedback, and published lesson presentation, plus original assets and review documentation. Existing API routes, curriculum identities, learner-code isolation, local Check, backend completion/progress/XP authority, guest labels, telemetry gates, and Phase 38 `NO GO` stay intact. R04 real-provider verification remains open. R05 founder acceptance remains open; R06 Apply remains gated until the revised Home-to-Course path is explicitly accepted.
