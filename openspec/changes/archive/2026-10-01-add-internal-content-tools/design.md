# Design

## Context

`backend/content/` is the Git authoring source. `loadAuthoredCurriculum` validates and loads every authored version; `loadCurriculumCatalog` selects only reviewed versions from `publication.yaml`. `curriculum:validate` already combines content validation with the immutable-history check. The frontend's local Check uses a dedicated credential-free Worker origin; current Playwright curriculum tests exercise published versions through the learner UI. See the proposal and `curriculum-authoring-tools` delta for the new author workflow.

## Goals / Non-Goals

**Goals:** Make the selected authored snapshot, its review status, and candidate-case behavior inspectable before publication. Reuse current parsing, projection, validation, and browser Check contracts. Keep failures nonzero and source/version identity explicit.

**Non-Goals:** A database CMS, author login, production preview endpoint, arbitrary assessment callbacks, server-side learner execution, automatic review approval, or publication mutation.

## Decisions

1. **Local CLI entry points.** Add documented backend commands for full `content:validate`, `content:preview:quest`, `content:preview:course`, and `content:test`. Keep `curriculum:validate` as the existing CI contract and make the new validator entry point delegate to it. Use strict named arguments, stable ID/slug resolution, explicit optional version, bounded outputs, and nonzero exits. Alternatives: a production admin API adds auth and publication exposure; a parallel parser could drift from the reviewed tree.

2. **Inert browser previews generated from validated authored data.** After `loadAuthoredCurriculum` succeeds, write a self-contained HTML document to an explicit new output path. Refuse overwrite and paths inside authored snapshot history. Render only the approved static Markdown nodes, escape text and attributes, inline bounded local image bytes as data URLs, and set a restrictive CSP with no script or network. Quest preview includes versioned lesson and author-only metadata; Course preview shows the ordered hierarchy and manifest comparison. Neither serves an HTTP route. Alternatives: plain JSON lacks readable lesson/layout inspection; reusing the production API would expose unapproved content.

3. **Publication comparison is read-only.** Parse the existing reviewed manifest through the catalog and compare stable IDs plus exact content/assessment versions. Show authored current versus published selection separately. Never update `publication.yaml`, infer learner availability, or mark a draft reviewed because its cases pass.

4. **Test through the real local Check path.** A backend CLI validates/serializes a selected authored Quest into a bounded temporary fixture with the existing Quest DTO shape and a candidate source file path. A dedicated Playwright harness starts the frontend with the normal dedicated runtime origin, intercepts only that Quest's public read with the fixture, opens its workspace, loads the deferred editor, enters the candidate source, and invokes Check. The harness asserts expected pass/fail, captures ordered case IDs/results, and checks timeout recovery with a second finite run. The CLI never evaluates source, and the fixture is never sent to a production service. Alternatives: Node `vm` or worker threads cannot reproduce the credential-free browser containment; the published-only curriculum browser suite cannot inspect drafts.

5. **Fixture and cleanup bounds.** Candidate source uses the current source byte ceiling; authored cases retain current schema bounds. The temporary fixture contains only the selected Quest's authored public projection and candidate source, is created under the OS temp directory with a unique name, is removed in a `finally` path, and is not committed or logged. Failed checks report case IDs and bounded feedback, not full source. Existing worker timeout and cleanup tests remain the containment gate.

## Risks / Trade-offs

- **Preview differs from the learner page** → Label it an editorial preview and keep browser Check coverage against the actual workspace. It cannot certify responsive learner UI or publication review.
- **Draft DTO projection drifts** → Reuse the curriculum service projection where practical and add a contract test comparing a published snapshot's preview fixture with the public DTO.
- **Local file preview exposes authored content to the author machine** → Require an explicit output path, never auto-open or upload it, and document deletion; CSP disables active content.
- **Browser test setup is slower than a Node test** → Run it on demand for candidate files; keep the existing CI curriculum and runtime gates for published content.

## Migration Plan

Add commands without changing existing authored files, database schema, publication manifest, or public API. Existing `curriculum:validate` and CI continue unchanged. Removing the tools leaves the Git source and published runtime unaffected.
