# Tasks

## 1. Visual foundation and shared shell

- [x] 1.1 Audit current production route screenshots, semantic tokens, assets, and copy; record the chosen visual roles, route inventory, asset placements, and acceptance viewports in a frontend design record; verify the record covers Home, onboarding, catalog, Journey, Course, auth, account, offline learning, feedback, errors, and lesson.
- [x] 1.2 Add the revised semantic surface/type/action roles and original placement-specific artwork with provenance; verify token/asset checks, contrast calculations, image loading, and existing design-system tests.
- [x] 1.3 Recompose the shared production navigation and mobile menu without changing destinations or semantics; verify keyboard/Escape/focus tests and browser navigation at 320, 390, 820, and 1440 CSS pixels.

## 2. Home and course discovery

- [x] 2.1 Rebuild Home around its real published-learning entry and original art; preserve loading/empty/error/guest truth; verify focused Home tests and desktop/mobile browser screenshots.
- [x] 2.2 Recompose the catalog for one published Course and future multi-Course results without invented cards; verify published-only search/filter, empty/error/retry tests and browser checks at desktop/mobile widths.
- [x] 2.3 Update Home/catalog copy and design documentation for accurate product claims; verify all visible links, labels, images, and responsive states in an installed browser.

## 3. Journey and Course map

- [x] 3.1 Recompose Journey overview and ordered Course entries with readable outcomes and a direct next step; verify existing public/owner-state tests and desktop/mobile browser captures.
- [x] 3.2 Recompose the Course map into legible chapter landmarks and substantial quest rows while retaining backend availability and guest provisional rules; verify locked/available/completed tests, keyboard use, and scans at 320, 390, 820, and 1440 CSS pixels.
- [x] 3.3 Record the map's interaction, accessibility, and visual rules in frontend documentation; verify text labels, prerequisite explanations, target size, and no page overflow in the real local Course route.

## 4. Auth, account, and supporting routes

- [x] 4.1 Apply the shared visual language to login, register, recovery, password update, and onboarding without changing form fields or auth actions; verify form-state tests and local browser layouts with synthetic/no-account states only.
- [x] 4.2 Recompose account, guest import, pending work, and feedback presentation without changing owner authority, pending state, or local-only feedback behavior; verify focused state tests and browser captures with controlled fixtures.
- [x] 4.3 Align offline-learning and shared error/recovery routes with the new visual language while preserving offline and retry behavior; verify existing offline/error tests and responsive browser checks.
- [x] 4.4 Record consistent error/loading/empty/status treatment for these routes; verify no protected payload, secret, or false account claim appears in screenshots or documentation.

## 5. Published lesson presentation and R06 handoff

- [x] 5.1 Refresh current published lesson typography, hints, and workspace framing in the revised visual language without adding a second editor controller or changing Run/Check/Submit authority; verify existing lesson/workspace tests and local desktop/mobile browser behavior.
- [x] 5.2 Reconcile the active R06 design/tasks with the accepted visual roles before its Apply, keeping its R05 founder gate explicit; verify strict validation of both active changes and inspect their diff.
- [x] 5.3 Document the visual contract for the future persistent lesson/editor/results shell, including desktop/tablet/mobile hierarchy and source-safe panel behavior; verify the handoff matches the existing R06 specification and does not claim R06 implementation.

## 6. Integrated visual review and founder gate

- [ ] 6.1 Run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, relevant Playwright learning/accessibility flows, API drift if touched, and strict OpenSpec validation; record exact command results and implementation commit.
- [ ] 6.2 Capture real production-route desktop/tablet/mobile evidence, inspect focus, reduced motion, image loads, console errors, and overflow, then correct defects and record the final build/environment; verify the evidence links resolve.
- [x] 6.3 Review the complete diff for route stability, original asset provenance, guest/account truth, Worker/preview boundaries, and Phase 38 status; leave revised R03/R05 founder acceptance open until an explicit review of the final build.
