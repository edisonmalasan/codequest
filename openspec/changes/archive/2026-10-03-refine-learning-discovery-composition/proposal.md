# Proposal

## Why

The merged frontend visual refresh is technically sound, but its Home and learning-discovery pages still rely on sparse, contained cards and subdued artwork. The founder's visual acceptance is conditional on a richer, more cohesive public learning experience, so the R05 gate remains open before R06 Apply.

## What Changes

- Recompose the existing Home, catalog, Journey, and Course routes around a more immersive original CodeQuest world: a stronger illustrated entry, denser yet readable course discovery, and a clear chapter path with a distinct truthful learner-status area.
- Give the one currently published Course substantial visual presence without implying that unreviewed courses, practice, projects, or rewards are available.
- Align navigation, action hierarchy, illustration placement, typography, and responsive rhythm across these routes while preserving keyboard access, reduced motion, and existing route destinations.
- Capture exact-build desktop, tablet, and mobile browser evidence and retain the founder gate until the revised build is explicitly accepted.

This change uses general public-product information architecture and visual principles. All shipped art, copy, components, and implementation remain original CodeQuest work. No external screenshots or proprietary assets enter the repository.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frontend-visual-experience`: require a coherent illustrated learning world and visual evidence for the revised discovery surfaces while retaining truthful states.
- `production-shell-homepage`: refine the Home entry and shared navigation composition around the first usable learning action.
- `course-discovery`: require a useful, visually complete single-Course catalog that scales to a broader reviewed publication.
- `journey-course-ui`: refine the Course map and Journey overview hierarchy without changing published order or unlock authority.

## Impact

Frontend presentation in `frontend/src/app/`, `frontend/src/features/home/`, `frontend/src/features/curriculum/`, and the shared shell; original assets and provenance; focused component/browser tests; frontend design and verification records. No backend, OpenAPI, database, auth, runtime, grading, submission, or Phase 38 behavior changes. The active R06 learning-shell proposal stays separate and its R05 acceptance entry gate remains open.
