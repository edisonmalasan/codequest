## Why

CodeQuest now exposes reviewed curriculum through a generated frontend client, but learners still have no product surface for understanding a Journey, its chapters, or the ordered route through its quests. Phase 11 adds that primary navigation while preserving the backend's ownership of accepted progress and unlock decisions and leaving lesson rendering and execution to later changes.

## What Changes

- Add a canonical `/journeys/[slug]` page that loads published Journey, Chapter, and prerequisite metadata through the existing typed curriculum client.
- Present a concise Journey overview from existing API metadata, including outcomes, entry requirements, chapter and quest totals, and overall completion progress.
- Compose the existing `ChapterCard`, `QuestPath`, `QuestNode`, and `Progress` components into a responsive, keyboard-readable Course map with completed, active/current, available, and locked states.
- Add a pure frontend course-map model that derives display progress and provisional prerequisite availability from delivered curriculum plus a supplied completion snapshot. The current page supplies an empty snapshot because no accepted-progress API or Phase 12 completion flow exists yet.
- Distinguish map emphasis from authoritative learning state: the first eligible incomplete quest may be presented as active/current, while completed IDs and accepted authority must come from a later approved progress integration.
- Add accessible loading, empty, not-found, malformed-response, network-error, and retry experiences without exposing transport internals.
- Verify ordering, prerequisite derivation, state labels, keyboard flow, responsive layout, reduced motion, and API failure handling with focused frontend and Playwright coverage.
- Update the roadmap Project Status for the proposal and Apply lifecycle.
- Keep the production publication manifest empty and do not add curriculum, progress, authentication, lesson, editor, runtime, or backend behavior.

## Capabilities

### New Capabilities

- `journey-course-ui`: Defines the learner-facing Journey overview and Course map, typed curriculum loading, bounded provisional state derivation, accessibility, responsive behavior, and Phase 11 failure states.

### Modified Capabilities

None. The existing curriculum API, generated-client, design-system, authentication, and frontend-foundation contracts are consumed without changing their requirements.

## Impact

- Affected frontend areas: a dynamic Journey route, curriculum feature components/model/query code, focused tests, and a Playwright Journey flow.
- Existing interfaces used: `createCodequestApi()` public curriculum reads and the generated `JourneyDetail`, `ChapterDetail`, and `QuestDetail` response types.
- Existing visual system used: CodeQuest logo, Foundations Valley artwork, core progress/badge/card primitives, and display-only Chapter/Quest map components.
- Backend endpoints, OpenAPI output, generated client files, database schema, authentication policy, and curriculum publication remain unchanged.
- No new runtime dependency or production infrastructure is required.
