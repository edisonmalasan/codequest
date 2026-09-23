## 1. Course-map model

- [x] 1.1 Add typed frontend curriculum-graph and completion-snapshot models that preserve generated API identities without copying backend DTOs, verified by frontend typecheck.
- [x] 1.2 Implement the pure sorted Journey/Chapter/Quest view-model builder for counts, chapter progression, prerequisite locks, one active/current quest, and remaining available quests; verify focused tests cover unordered input, branching prerequisites, unknown completion IDs, empty journeys, and fully completed chapters.

## 2. Typed curriculum loading

- [x] 2.1 Add a cancellable Journey graph loader through `createCodequestApi()` that fetches Journey, Chapter, and required Quest details, verifies ownership consistency, and fails closed on any partial graph; verify focused tests cover success, abort, not-found, HTTP, malformed-response, and nested-request failures.
- [x] 2.2 Connect the graph loader to TanStack Query with stable Journey-scoped keys, current empty completion evidence, and explicit retry support; verify component tests observe loading, successful, and recoverable failure transitions.

## 3. Journey and Course-map interface

- [x] 3.1 Add the canonical `/journeys/[slug]` route and Journey overview using the API title, counts, entry requirements, outcomes, textual overall progress, and the existing CodeQuest brand/art direction; verify a component test checks heading structure and source-backed copy.
- [x] 3.2 Compose chapter summaries, in-page chapter navigation, Course-map paths, and quest-node metadata/states from the view model without lesson navigation; verify tests cover completed, active/current, available, and locked state text plus chapter progress.
- [x] 3.3 Add accessible loading, Journey-not-found, empty-publication, partial-data, malformed-response, and network-error/retry states; verify tests ensure no raw response or transport-sensitive values are rendered.
- [x] 3.4 Verify the assembled interface retains visible focus, semantic ordered lists, text-equivalent state, reduced-motion behavior, 44-pixel primary targets, and responsive reflow without horizontal page overflow.

## 4. Browser and regression verification

- [x] 4.1 Add a Playwright Journey flow with intercepted public curriculum responses that verifies API consumption, ordering, keyboard navigation, state text, retry behavior, decorative asset loading, and no runtime/hydration/console errors at representative desktop and mobile-reading widths.
- [x] 4.2 Run frontend lint, typecheck, tests, production build, and Playwright; run root lint, typecheck, tests, and build; run API drift validation, strict OpenSpec validation, and `git diff --check`, recording exact failures if an environment limitation prevents a command.
- [x] 4.3 Review the final diff against the Phase 11 boundary and verify there are no backend, database, OpenAPI/generated-client, curriculum-publication, authentication, persisted-progress, lesson/editor/runtime, analytics, PWA, or Phase 12+ changes.

## 5. Lifecycle status

- [x] 5.1 Update `docs/DEVELOPMENT_ROADMAP.md` after Apply verification so Project Status truthfully records Phase 11 Apply completion and identifies Sync as the next OpenSpec stage without claiming the change is synced or archived.
