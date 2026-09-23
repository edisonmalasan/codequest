## Context

See [proposal.md](proposal.md) for motivation and the three delta specs for behavior. Phase 9 provides a validated `backend/content/` tree and one deliberately draft Q01 fixture. The Curriculum module is inert, the OpenAPI client currently covers health/account, and the database has curriculum identity tables but no authored lesson fields or approved projection mechanism. ADR 0003 leaves publication selection to this phase; ADR 0007 requires stable IDs, explicit versions, and compatibility decisions. Journey is canonical and Course is only a display synonym.

## Goals / Non-Goals

**Goals:** Choose a deterministic publication mechanism; keep invalid/draft material out of runtime; deliver bounded published representations through NestJS and the generated client; preserve explicit version identity and safe errors; run without production credentials.

**Non-Goals:** Populate curriculum tables, publish the draft fixture, author the full course, create author UI/writes, persist learner state, evaluate learner source, implement Check/Submit, or add offline/guest synchronization.

## Decisions

### 1. A root publication manifest selects complete active snapshots

Add `backend/content/publication.yaml` with `schemaVersion: 1` and an ordered list of Journey publications. Each entry names the stable Journey ID, every included stable Quest ID and exact content/assessment version, and records `curriculumReview: approved` plus `technicalReview: approved`. An empty list is valid and is the production baseline until the course is actually reviewed. A published Journey selection is complete relative to its authored child inventories: partial chapters, missing quests, omitted prerequisites, mixed unselected dependencies, or mismatched assessment versions fail validation. The manifest cannot override titles, XP, prerequisites, or other authored data.

This resolves ADR 0003 F03 without a competing editable database source. Alternative: use `status: published` inside every manifest. Rejected because activation and rollback would be scattered and could select mutually inconsistent versions. Alternative: project content into PostgreSQL. Deferred because the existing schema deliberately has identity/history fields rather than lesson payloads, and read-only Phase 10 does not justify a migration or dual source.

### 2. Compile once into an immutable application catalog

Refactor the Phase 9 loader to return a typed validated authored tree, then combine it with the publication manifest in a provider created during NestJS module initialization. Startup fails before serving when the selected catalog is invalid. The provider indexes copied, frozen read models by stable ID and globally unique published slug. It reads no files per request and exposes no mutable authoring objects.

Production builds must include `backend/content/`; TypeScript compilation alone does not copy it, so the backend build/start contract will copy the bounded content directory into `dist/content` and resolve source versus built roots explicitly. Tests inject an in-memory catalog or temporary content root. Alternative: parse on every request. Rejected for inconsistent failure timing, unnecessary I/O, and weaker fail-closed behavior.

### 3. Public read API with one canonical Journey model

Controllers implement the roadmap paths under URI version 1. List and detail DTOs expose only fields needed for curriculum browsing and local learning. `courses/:slug` invokes the same Journey service method and returns the same DTO; it is an alias, never a model or persistence concept. Flat chapter/quest routes require global uniqueness among published slugs, enforced at catalog compilation. Results are ordered by authored positions. Missing, draft, or unpublished slugs use a domain not-found error mapped through the existing safe correlated envelope.

Curriculum reads are public because guest learning needs delivered curriculum and the material itself is not private. `guestEligible` describes which quests later guest-progress behavior may use; it does not become an authorization mechanism in this phase. Browser-visible deterministic cases are returned honestly under the accepted personal-learning trust model. No route accepts a client-selected snapshot version.

### 4. Safe learner-facing representation

Journey detail contains outcomes and ordered chapter summaries. Chapter detail contains its Journey summary and ordered Quest summaries. Quest detail contains stable hierarchy and version identity, concepts, prerequisites, objective/outcome, difficulty, provisional XP candidate, hints, restricted lesson markup as text, starter source, and data-only cases. DTO validation/OpenAPI examples stay bounded. Omit repository paths, other snapshots, review names/rationale, compatibility transitions, and internal parse state.

### 5. Generated client remains the only frontend integration seam

After backend DTO/controller tests pass, run the established OpenAPI generation command. Extend the hand-written frontend transport wrapper with typed public list/detail calls, runtime shape checks, cancellation, and the existing error taxonomy. Generated files are only changed by regeneration. Phase 10 does not add pages or render curriculum; later frontend phases consume this seam.

## Risks / Trade-offs

- **An empty production catalog can look like a broken API** → Return a successful empty list and deterministic `404` details; document that Q01 remains deliberately unpublished until content review.
- **Raw lesson markup could gain unsafe capability later** → Reuse the Phase 9 static allowlist and return text only; no server-side MDX evaluation or HTML rendering.
- **Flat slugs can collide as the course grows** → Reject collisions at publication time, while stable IDs remain authoritative.
- **Published content embedded in deployment can lag Git** → Make startup catalog/version deterministic and rely on normal artifact deployment; later operational publication can add explicit release metadata without changing authored ownership.
- **Assessment cases are visible** → Treat them as learner feedback, not secrets; the accepted trust model already rejects certification claims.

## Migration Plan

Deploy with an empty reviewed publication manifest, so existing behavior gains public routes but publishes no draft content. Rollback removes the routes/catalog while leaving authored Git content and database state untouched. Publishing real curriculum later is a reviewed content change to the manifest and authored snapshots, not a runtime administrative mutation.
