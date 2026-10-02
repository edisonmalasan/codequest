# Tasks

## 1. Stable curriculum hierarchy and publication

- [ ] 1.1 Add distinct Course metadata, parent links, and catalog types to the existing backend content module; verify schema tests reject duplicate IDs, missing parents, ambiguous slugs, and invalid ordering.
- [ ] 1.2 Migrate the existing Foundations content tree and publication selection into one Course while preserving Journey/Chapter/Quest IDs and all selected content/assessment versions; verify a before/after identity/version inventory and curriculum validation.
- [ ] 1.3 Enforce complete reviewed Course publication and draft exclusion in the existing validator/loader; verify malformed and draft fixtures cannot appear in the public catalog, and document the Course authoring/publication shape.

## 2. Public Course contracts and backend learning state

- [ ] 2.1 Add public Course collection/detail and Journey membership responses while retaining existing v1 Journey/Course alias behavior; verify backend API tests for ordered published results, safe 404s, and unchanged legacy alias responses.
- [ ] 2.2 Add owner-scoped derived Course progress and availability using published quest facts; verify partial/empty/version-incompatible/two-owner cases, legacy progress alias equivalence, and no mutable Course authority.
- [ ] 2.3 Regenerate the frontend OpenAPI client and update the trusted API wrapper; verify `pnpm api:check`, contract tests, and no hand-edited generated files. Document the old and new resource paths.

## 3. Discovery and learner navigation

- [ ] 3.1 Add `/courses` catalog, published Course search/topic filters, loading/empty/error/reset states, and Home/global navigation entry; verify component tests and keyboard/narrow-screen browser checks with published-only fixtures.
- [ ] 3.2 Refactor `/journeys/:slug` into a Journey overview and add `/courses/:slug` scoped Course map using the existing map components; verify ordered Course/Chapter/Quest navigation, legacy bookmark usefulness, direct refresh, and existing quest links.
- [ ] 3.3 Connect account Course map to protected Course progress/availability and guest map to labeled provisional facts; verify error and two-owner tests never assert saved completion or unlock from public/client data.
- [ ] 3.4 Update learner-facing navigation/help documentation and capture desktop/mobile screenshots from the real local build; verify the screenshots match the committed implementation and no unpublished Course is advertised.

## 4. Integrated R05 verification

- [ ] 4.1 Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, curriculum validation, `pnpm api:check`, focused Playwright catalog-to-exercise flow, and strict OpenSpec validation; record exact results and remaining real Auth/environment limitations.
- [ ] 4.2 Review the final identity/version diff, accepted-history compatibility, public catalog contents, accessibility/reflow, and manual founder path Home → catalog → Journey → Course → Exercise; record separate technical, integrated, and founder-acceptance outcomes without marking an unobserved gate passed.
