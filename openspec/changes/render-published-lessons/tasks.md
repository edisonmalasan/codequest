## 1. Published Illustration Delivery

- [x] 1.1 Extend the immutable curriculum catalog with a bounded selected-snapshot asset lookup that returns copied PNG/WebP bytes and metadata only for the active published Quest version; verify focused catalog tests reject draft, stale-version, traversal, symlink, missing, oversized, and unsupported-file requests.
- [x] 1.2 Add the public versioned Quest-asset controller operation with exact media type, immutable cache metadata, `nosniff`, safe not-found behavior, and no authentication requirement; verify backend application and OpenAPI tests cover success and adversarial requests without leaking repository paths.
- [x] 1.3 Regenerate the frontend-local OpenAPI schema through the existing generation command and verify `pnpm api:check` passes with no backend-source import or hand-edited generated code.

## 2. Lesson Rendering

- [x] 2.1 Add the focused static-Markdown rendering dependency and a pure lesson document component that covers semantic text, normalized headings, examples, inline/fenced code, ordered and unordered instructions, blockquote callouts, safe links, and version-pinned local illustrations; verify unit tests cover every supported form and reject unsafe protocols, raw HTML/MDX execution, remote images, traversal, and missing alternatives.
- [x] 2.2 Add accessible graduated-hint disclosures in question, concept, and next-step order, initially collapsed and side-effect free; verify keyboard interaction and disclosure-state tests pass.
- [x] 2.3 Add the `/quests/[slug]` API-backed page with Quest/Journey/Chapter context, objective, concepts, difficulty, provisional XP, guest and content-version metadata, plus accessible loading, not-found, invalid-response, retry, and illustration-failure states; verify focused page tests cover successful and failed typed reads without rendering starter code or assessment cases.
- [x] 2.4 Style the lesson for a readable desktop measure and comfortable mobile reflow, including visible focus, contrast, 44-pixel primary targets, reduced motion, responsive illustrations, and locally scrollable labeled code regions; verify component assertions and browser layout checks detect no page-level overflow.

## 3. Course Map Integration

- [x] 3.1 Extend the display-only `QuestNode` with optional semantic link behavior while preserving its public display states and inert locked behavior; verify component tests cover link, locked, keyboard-focus, and presentational-only contracts.
- [x] 3.2 Link active/current, available, and completed Journey-map nodes to their published Quest routes while leaving locked nodes non-interactive; verify Journey tests and a browser navigation flow cover every state without changing unlock derivation or progress authority.

## 4. Verification and Documentation

- [x] 4.1 Add Playwright coverage with intercepted published curriculum and image responses for route navigation, semantic lesson content, keyboard hints and links, reduced motion, asset loading/failure, desktop and 390-pixel reflow, localized code scrolling, no broken images, and no runtime/hydration/console errors.
- [x] 4.2 Update curriculum/API/frontend guidance and Phase 12 roadmap status to describe static lesson rendering, the selected-snapshot asset boundary, empty production publication, and Phase 13 exclusions; verify documentation links, terminology, and source-of-truth boundaries agree.
- [x] 4.3 Review the final diff for raw HTML injection, remote/unbounded media, backend-source imports, manually edited generated files, production content publication, editor/runtime/check/submission/progress/reward behavior, auth/database changes, and Phase 13+ work; verify none are introduced.
- [x] 4.4 Run frozen install, curriculum validation, API drift, backend and frontend lint/typecheck/tests/build, root lint/typecheck/tests/build, focused Playwright, strict OpenSpec validation, boundary/credential/link scans, and `git diff --check`; record exact passing results before the Apply PR is eligible to merge.

## Apply Verification (2026-09-24)

- `pnpm install --frozen-lockfile`, `pnpm --dir backend curriculum:validate`, and `pnpm api:check` passed.
- Backend lint, typecheck, 111 Vitest tests plus 3 curriculum-history tests, and build passed.
- Frontend lint, typecheck, 159 Vitest tests, production build, and all 5 Chromium Playwright flows passed. The browser flows cover Journey-to-lesson navigation, keyboard hint disclosure, reduced motion, responsive 390-pixel reflow, local code scrolling, selected image loading, failed-image fallback, and clean runtime/console behavior.
- Root lint, typecheck, test, and build passed.
- `openspec validate render-published-lessons --strict`, strict validation of all 11 OpenSpec items, changed-document relative-link checks, unsafe-rendering/backend-import/credential-addition scans, and `git diff --check` passed.
- Final scope review found no raw HTML execution, remote curriculum images, backend-source imports, hand-edited generated output, production curriculum publication, editor/runtime/check/submission/progress/reward behavior, authentication/database change, or Phase 13+ implementation.
