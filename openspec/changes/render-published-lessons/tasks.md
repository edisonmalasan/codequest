## 1. Published Illustration Delivery

- [ ] 1.1 Extend the immutable curriculum catalog with a bounded selected-snapshot asset lookup that returns copied PNG/WebP bytes and metadata only for the active published Quest version; verify focused catalog tests reject draft, stale-version, traversal, symlink, missing, oversized, and unsupported-file requests.
- [ ] 1.2 Add the public versioned Quest-asset controller operation with exact media type, immutable cache metadata, `nosniff`, safe not-found behavior, and no authentication requirement; verify backend application and OpenAPI tests cover success and adversarial requests without leaking repository paths.
- [ ] 1.3 Regenerate the frontend-local OpenAPI schema through the existing generation command and verify `pnpm api:check` passes with no backend-source import or hand-edited generated code.

## 2. Lesson Rendering

- [ ] 2.1 Add the focused static-Markdown rendering dependency and a pure lesson document component that covers semantic text, normalized headings, examples, inline/fenced code, ordered and unordered instructions, blockquote callouts, safe links, and version-pinned local illustrations; verify unit tests cover every supported form and reject unsafe protocols, raw HTML/MDX execution, remote images, traversal, and missing alternatives.
- [ ] 2.2 Add accessible graduated-hint disclosures in question, concept, and next-step order, initially collapsed and side-effect free; verify keyboard interaction and disclosure-state tests pass.
- [ ] 2.3 Add the `/quests/[slug]` API-backed page with Quest/Journey/Chapter context, objective, concepts, difficulty, provisional XP, guest and content-version metadata, plus accessible loading, not-found, invalid-response, retry, and illustration-failure states; verify focused page tests cover successful and failed typed reads without rendering starter code or assessment cases.
- [ ] 2.4 Style the lesson for a readable desktop measure and comfortable mobile reflow, including visible focus, contrast, 44-pixel primary targets, reduced motion, responsive illustrations, and locally scrollable labeled code regions; verify component assertions and browser layout checks detect no page-level overflow.

## 3. Course Map Integration

- [ ] 3.1 Extend the display-only `QuestNode` with optional semantic link behavior while preserving its public display states and inert locked behavior; verify component tests cover link, locked, keyboard-focus, and presentational-only contracts.
- [ ] 3.2 Link active/current, available, and completed Journey-map nodes to their published Quest routes while leaving locked nodes non-interactive; verify Journey tests and a browser navigation flow cover every state without changing unlock derivation or progress authority.

## 4. Verification and Documentation

- [ ] 4.1 Add Playwright coverage with intercepted published curriculum and image responses for route navigation, semantic lesson content, keyboard hints and links, reduced motion, asset loading/failure, desktop and 390-pixel reflow, localized code scrolling, no broken images, and no runtime/hydration/console errors.
- [ ] 4.2 Update curriculum/API/frontend guidance and Phase 12 roadmap status to describe static lesson rendering, the selected-snapshot asset boundary, empty production publication, and Phase 13 exclusions; verify documentation links, terminology, and source-of-truth boundaries agree.
- [ ] 4.3 Review the final diff for raw HTML injection, remote/unbounded media, backend-source imports, manually edited generated files, production content publication, editor/runtime/check/submission/progress/reward behavior, auth/database changes, and Phase 13+ work; verify none are introduced.
- [ ] 4.4 Run frozen install, curriculum validation, API drift, backend and frontend lint/typecheck/tests/build, root lint/typecheck/tests/build, focused Playwright, strict OpenSpec validation, boundary/credential/link scans, and `git diff --check`; record exact passing results before the Apply PR is eligible to merge.
