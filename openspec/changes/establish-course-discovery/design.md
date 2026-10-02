# Design

## Context

Today `backend/content/journeys/javascript-foundations` publishes one Journey with direct Chapters, 25 selected Quests, and no Course record. The public `/api/v1/courses/:slug` and protected `courses/:slug/progress` routes are Journey aliases. Home renders the Journey list; `/journeys/:slug` owns the current map. Quest completions, XP, drafts, and pending work rely on stable Quest identity and selected versions. See the proposal and the S01 decision in `docs/decisions.md`.

## Goals / Non-Goals

**Goals:** Establish distinct stable Course identity with a compatible transition; give learners a real published catalog and coherent Journey/Course navigation; preserve backend ownership of publication/progress/unlocks and existing quest history.

**Non-Goals:** Author or advertise new Courses; change Quest IDs, versions, accepted completion, XP, streak, guest import, or runtime rules; add a search service or index; replace existing Auth; select a beta release candidate.

## Decisions

### 1. Add Course between Journey and Chapter with explicit legacy mapping

The authored tree becomes `journeys/<journey>/courses/<course>/chapters/<chapter>/quests/<quest>`. Journey metadata orders Course IDs; Course metadata owns stable ID, parent Journey ID, slug, title, summary, topic tags, outcomes, review state, and ordered Chapter IDs; Chapter metadata points to Course ID. The existing Journey stable ID remains `JAVASCRIPT-FOUNDATIONS`; its first Course receives a new distinct stable ID, and all existing Chapter/Quest IDs and version snapshots remain unchanged. The publication manifest selects Courses and exact Quest snapshots, and validation resolves every parent edge before startup. A one-time content move is reviewed as a rename/membership migration, not as a new learning objective. Existing authored historical Quest versions stay available for compatibility checks.

Alternative considered: Treat each existing Journey as a Course and invent new parent Journey IDs. That would disturb existing Journey routes and aggregate references, so the additive Course identity is safer.

### 2. Keep v1 alias meaning and add a catalog namespace

Existing `/api/v1/courses/:slug` and `/api/v1/courses/:slug/progress` retain their Journey-alias response shape. New distinct Course collection/detail/progress operations live at `/api/v1/catalog/courses` and `/api/v1/catalog/courses/:slug[/progress]`; Journey detail gains ordered Course summaries while retaining legacy Chapter summaries for the existing Journey during migration. OpenAPI generation updates the frontend client; no hand-edited generated code. Slugs are public routes, stable IDs remain relationship keys. Unknown/draft Courses return the same not-found envelope as unknown content. A later API-version change can retire aliases after consumer migration.

Alternative considered: Repurpose `/api/v1/courses/:slug`. It would silently change response meaning for existing clients and protected progress consumers.

### 3. Derive Course learning state from existing facts

The backend locates published Course chapters and reuses the existing progress/availability derivation over their selected Quests. The protected Course response is owner-bound through the existing principal guard and contains no mutable Course completion or unlock row. Journey aggregates sum its Courses without double counting. Existing XP, streak, attempts, and drafts continue to reference Quest IDs. Guest map state stays explicitly device-local and provisional. Failed protected reads withhold trusted completion/unlock claims while leaving public outline readable.

Alternative considered: Store a Course completion counter. It could drift from quest publication/version compatibility and owner facts.

### 4. Catalog searches the bounded published collection in the browser

The backend returns only complete reviewed published Course summaries in stable order. The client supports title/topic text search and topic filters over that public collection, with reset, empty, loading, retry, and reduced-motion/keyboard behavior. No static placeholder cards or unpublished metadata. The current one-Course publication is an honest first catalog; later R08/R12 content work adds complete Courses through the same contract. Home and shell link to `/courses` for catalog discovery. `/journeys/:slug` becomes Journey overview with Course entries; `/courses/:slug` hosts the existing map pattern scoped to one Course. Existing `/quests/:slug` links remain stable. The old Journey bookmark still links to the Foundations Course.

Alternative considered: Add a backend full-text index now. Current published set is small and the public collection is bounded; an index adds write/sync authority without a measured need.

## Risks / Trade-offs

- [Large content-tree move can hide identity changes] → snapshot ID/version assertions and publication comparison before/after; review `git diff --find-renames`.
- [Old Course alias can confuse new clients] → explicit `catalog` namespace, distinct generated methods/types, and API contract tests covering both shapes.
- [One published Course makes filtering visually sparse] → show honest single-Course catalog, no future/locked teaser cards until complete publication.
- [Protected Course read may fail while public catalog loads] → preserve public browsing and show saved progress unavailable, not zero or unlocked.
- [Future courses may need cross-Course prerequisites] → stable quest IDs and backend prerequisite evaluation remain the authority; add cross-Course relationship rules only in a later reviewed content change.

## Migration Plan

1. Add Course authoring schema, catalog model, validation, and deterministic fixture support. Migrate the existing content tree while preserving IDs and selected versions; compare the published quest identity/version manifest before and after.
2. Extend public read contracts and protected Course progress/availability. Keep legacy alias endpoints and add regression tests for equivalent legacy results, owner isolation, draft exclusion, and no aggregate double counting. Regenerate OpenAPI client.
3. Build catalog, Journey overview, and Course map with existing design system and generated client. Add browser tests for Home → catalog → Journey → Course → Exercise, search/reset, empty/failure, refresh, and narrow-screen/keyboard use.
4. Run curriculum validation, API drift, root lint/typecheck/tests/build, browser checks, strict OpenSpec validation, and manual visual/integrated review. Record separate technical, integrated, and founder-acceptance status. R04 real Auth remains an independent gate.

Rollback keeps the old API aliases and Quest IDs intact. If the new Course surface must be withdrawn, revert the publication/UI change through a new reviewed commit; do not rewrite accepted history, applied migrations, or saved learning facts.
