## Why

CodeQuest now has a validated backend-owned authoring format, but every authored item is still draft and the inert `CurriculumModule` exposes no safe delivery contract. Phase 10 must establish an explicit publication boundary and versioned REST API before the frontend or later learning-state work can consume curriculum.

## What Changes

- Add an explicit reviewed publication manifest under `backend/content/` that selects active journey and quest snapshots without creating a database-first CMS or treating draft files as public.
- Compile validated published content into an immutable backend catalog at application startup; fail startup and CI safely when a publication selection is invalid, unreviewed, incomplete, or inconsistent with authored versions.
- Implement public read-only `GET /api/v1/journeys`, journey detail, chapter detail, and quest detail operations. Keep Journey canonical; `GET /api/v1/courses/:slug` is a documented compatibility alias returning the same Journey representation, not a Course entity.
- Deliver only the bounded learner-facing lesson, starter source, hints, objectives, concepts, prerequisites, XP candidate, and declarative local-check contract for the selected snapshot. Do not expose filesystem paths, unpublished snapshots, transition review notes, or backend internals.
- Regenerate the frontend-local OpenAPI client and add typed curriculum transport methods without importing backend source or raw content.
- Keep Phase 11+ behavior out of scope: no enrollment, attempt/submission acceptance, progress, completion, XP awarding, unlock calculation, guest import, offline sync, learner execution, author/admin writes, or database projection/migration.

## Capabilities

### New Capabilities

- `curriculum-api`: Reviewed curriculum publication selection, immutable backend catalog, public versioned read endpoints, safe response/error contracts, and generated frontend consumption.

### Modified Capabilities

- `curriculum-content`: Add the explicit publication manifest and review/activation rules that distinguish validated drafts from API-visible snapshots.
- `api-contract-generation`: Extend the generated contract and drift gate to the implemented public curriculum operations.

## Impact

Apply affects `backend/content/`, the backend Curriculum module and tests, OpenAPI output, the generated frontend API schema/wrapper and tests, curriculum/API documentation, CI validation, and roadmap status. It uses the existing validated authored files and application foundation. It does not alter PostgreSQL schema, authentication authority, learner execution, or any Phase 11 learning-state behavior.
