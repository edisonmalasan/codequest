## 1. Publication Contract

- [x] 1.1 Extend the backend content schemas with `publication.yaml` version/review selections and add the empty production manifest; verify valid empty and reviewed selections parse while unknown fields, duplicate IDs, non-approved reviews, and mismatched versions fail.
- [x] 1.2 Refactor authored-content loading to return a typed immutable tree instead of validation-only control flow; verify the existing Phase 9 validation suite remains green and callers cannot mutate catalog source data.
- [x] 1.3 Validate publication completeness, selected hierarchy, exact content/assessment versions, prerequisite closure, and global published slug uniqueness; verify draft, partial, stale, ambiguous, and dangling selections fail with safe path-scoped diagnostics.
- [x] 1.4 Update curriculum authoring/publication guidance for review, activation, rollback, empty-catalog behavior, and Course-as-alias terminology; verify relative links and documented commands resolve.

## 2. Backend Catalog and API

- [x] 2.1 Add an immutable startup curriculum catalog provider with source/build content-root resolution and injectable test seams; verify valid empty/published fixtures start and invalid publication prevents initialization without database or provider credentials.
- [x] 2.2 Define bounded OpenAPI DTOs for journey summaries/details, chapter details, quest summaries/details, concepts, prerequisites, hints, cases, and normalized arrays/version fields; verify reflection/OpenAPI schemas contain no repository path or review metadata.
- [x] 2.3 Implement ordered public Journey collection/detail and Course alias routes with safe correlated `404` behavior; verify the alias returns the canonical Journey representation and draft/unknown slugs are indistinguishable.
- [x] 2.4 Implement public Chapter and Quest detail routes backed only by the selected catalog; verify ordering, active snapshot fields, visible declarative cases, no alternate-version selector, and no unpublished material.
- [x] 2.5 Ensure build artifacts contain only the required content source and startup resolves development/built paths deterministically; verify backend build plus built-app startup work with the empty production publication manifest.

## 3. Generated Frontend Contract

- [x] 3.1 Regenerate backend OpenAPI and the frontend-local schema from the implemented routes; verify contract drift passes and no generated file is hand-edited.
- [x] 3.2 Extend the trusted frontend API wrapper with typed cancellable curriculum list/detail methods and existing failure taxonomy; verify public calls omit bearer credentials and reject malformed success payloads.
- [x] 3.3 Add frontend transport tests for journey, Course alias only where needed internally, chapter, and quest reads plus HTTP, network, cancellation, and invalid-response outcomes; verify no frontend import references backend source or `backend/content/`.

## 4. Integration and Boundaries

- [x] 4.1 Add backend unit/application tests for empty catalog, published fixtures, deterministic ordering, all five roadmap endpoints, public access, alias equivalence, safe `404`, throttling/error envelopes, and OpenAPI security metadata.
- [x] 4.2 Add adversarial publication tests for unreviewed/draft selections, slug collisions, incomplete inventories, unsupported versions, prerequisite leakage, malformed lesson/cases, symlinks/paths, and sanitized diagnostics; verify no authored or learner code executes.
- [x] 4.3 Update API/curriculum/roadmap documentation to record the chosen publication mechanism, Apply state, empty production catalog, generated-client boundary, and Phase 11 exclusions; verify links and terminology agree with ADRs 0003/0007 and canonical specs.
- [x] 4.4 Review the Apply diff for Course entities/tables, database migrations/projection, authenticated curriculum requirements, author writes, frontend raw-content imports, learner execution, enrollment, submissions, progress, XP awarding, unlock calculation, guest/offline sync, and Phase 11+ behavior; verify none are introduced.
- [x] 4.5 Run frozen install, curriculum validation, API drift, backend/frontend/root lint/typecheck/tests/build, built-startup probes, strict OpenSpec validation, credential/boundary/link scans, and `git diff --check`; record exact results before the Apply PR is eligible to merge.

## Apply Verification (2026-09-23)

- `pnpm install --frozen-lockfile` passed.
- Backend lint, typecheck, test (104 Vitest tests plus 3 history checks), and build passed.
- Frontend lint, typecheck, test (134 tests), and build passed.
- Root lint, typecheck, test, and build passed.
- `pnpm --dir backend curriculum:validate` and `pnpm api:check` passed.
- Built `dist` application/OpenAPI startup resolved the copied empty production catalog and exposed all five curriculum routes.
- `openspec validate expose-versioned-curriculum-api --strict` and `git diff --check` passed.
- Frontend/backend-source, later-phase behavior, credential-value, and changed-document relative-link scans passed. The production publication remains empty and Q01 remains draft/unpublished.
