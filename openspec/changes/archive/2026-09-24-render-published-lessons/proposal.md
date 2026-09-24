## Why

CodeQuest can browse published Journeys and fetch a complete published Quest, but it has no learner-facing route that safely turns the delivered lesson markup and graduated hints into readable instructional content. Phase 12 establishes that reading experience before editor or execution behavior is introduced.

## What Changes

- Add a `/quests/[slug]` lesson route that loads one published Quest through the generated curriculum client and presents its context, objective, concepts, lesson, and graduated hints.
- Render the approved static Markdown subset as semantic text, headings, examples, fenced and inline code, blockquote callouts, lists/instructions, safe links, and accessible illustrations without evaluating raw HTML, MDX components, expressions, or scripts.
- Add a bounded, public, version-pinned curriculum asset read so validated `./assets/` lesson illustrations can be delivered from the published backend snapshot; do not expose repository paths, arbitrary files, or unpublished assets.
- Make eligible and completed Course-map quest nodes link to their published lesson while locked nodes remain inert and no client-side state is promoted into authorization or completion authority.
- Provide truthful loading, not-found, malformed-response, image-failure, and retry states plus comfortable responsive reading, keyboard access, visible focus, sufficient contrast, localized code scrolling, and reduced-motion behavior.
- Keep editor, runtime, learner execution, local checks, validation, submissions, progress acceptance, XP awarding, and all Phase 13+ behavior out of scope.

## Capabilities

### New Capabilities

- `lesson-renderer`: Published Quest loading, restricted Markdown presentation, lesson metadata and hints, responsive reading, accessibility, and failure behavior.

### Modified Capabilities

- `curriculum-api`: Add safe delivery of image assets belonging to the currently published, versioned Quest snapshot.
- `journey-course-ui`: Replace the Phase 11 no-lesson navigation boundary with links from non-locked published quest nodes to the Phase 12 lesson route.

## Impact

Apply affects the frontend Quest route, curriculum feature components and tests, Course-map navigation, a task-specific static-Markdown rendering dependency, the backend Curriculum module's published-asset read and tests, OpenAPI plus the regenerated frontend schema, Phase 12 end-to-end coverage, and roadmap status. It does not publish draft curriculum, alter database or authentication ownership, or add any learning-state or execution capability.
