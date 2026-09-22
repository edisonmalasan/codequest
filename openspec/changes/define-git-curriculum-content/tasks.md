## 1. Authoring Contract and Dependencies

- [x] 1.1 Add only the pinned backend-local YAML, Zod, and static parsing dependencies needed for curriculum validation; verify a frozen workspace install succeeds without unrelated upgrades.
- [x] 1.2 Define Zod schemas for journey, chapter, quest manifest, version metadata, concepts, review transitions, hints, and case definitions; verify focused schema tests reject missing, malformed, unknown, and out-of-range fields.
- [x] 1.3 Document the `backend/content/` tree, stable ID versus slug rules, snapshot files, draft status, and authored field meanings; verify examples and references agree with P04/P05/P09/P15 and the current database identity shape.

## 2. Static Content and Assessment Safety

- [x] 2.1 Parse YAML and required `lesson.mdx`/`starter.js`/`tests.ts` files with bounded reads and path confinement; verify missing, oversize, traversal, and malformed files fail with path-scoped safe diagnostics.
- [x] 2.2 Restrict lesson MDX to the approved static markup and local asset allowlist; verify imports, exports, expressions, arbitrary components, remote embeds, unsafe paths, and missing text alternatives are rejected.
- [x] 2.3 Extract only the permitted JSON-compatible `tests.ts` literal syntax without importing/evaluating it, then validate data with Zod; verify calls, functions, imports, extra statements, unsupported values, duplicate case IDs, and oversized cases fail without executing code.
- [x] 2.4 Validate normal/boundary cases, case references, expected-result kinds, feedback intent, and capstone functional-versus-reasoning separation; verify malformed assessment definitions fail while no learner source is executed.

## 3. Hierarchy, References, and Versioning

- [x] 3.1 Build whole-tree checks for unique stable IDs, parent IDs, slugs, positions, declared child inventories, concepts, outcomes, and current-version pointers; verify duplicate and dangling references fail deterministically.
- [x] 3.2 Validate prerequisite references, Q01–Q04 guest sequence where authored, graph acyclicity, and completion-based unlock semantics; verify self/cyclic/unknown prerequisites and XP-gated unlock declarations fail.
- [x] 3.3 Validate content and assessment version syntax, immutable snapshot paths, and explicit reviewed compatibility transitions; verify changed criteria require a new assessment version and missing/contradictory transition decisions fail.
- [x] 3.4 Add a merge-base snapshot immutability check for previously merged authored versions, with CI checkout history configured for that comparison; verify editing an old snapshot fails while adding a new snapshot passes.

## 4. Draft Fixture and Integration

- [x] 4.1 Add one explicitly draft JavaScript Foundations Q01 fixture under `backend/content/journeys/` using approved O1/O7 intent, valid concepts, a lesson, starter, hints, and bounded declarative cases; verify it passes validation without implying the full course is authored or published.
- [x] 4.2 Expose a repeatable backend curriculum-validation command and wire it into CI; verify valid content exits zero and deliberately malformed temporary fixture trees fail nonzero without Supabase, PostgreSQL, or provider credentials.
- [x] 4.3 Add authoring and review guidance for content/assessment version changes, CO/TO compatibility decisions, draft status, accessibility, XP/difficulty balancing deferral, and future publication handoff; verify relative links and commands resolve.

## 5. Boundaries and Final Gates

- [x] 5.1 Review the Apply diff for root `content/`, Course entities, frontend authored-content imports, API routes, generated-client edits, database changes, learner execution, assessment runtime, publication, XP/unlock computation, and Phase 10+ behavior; verify none are introduced.
- [x] 5.2 Run backend lint/typecheck/tests/build, root lint/typecheck/tests/build, the curriculum command and negative fixture probes, strict OpenSpec validation, credential/boundary/link scans, and `git diff --check`; record exact results before the Apply PR is eligible to merge.

## Apply verification

- `pnpm install --frozen-lockfile`: passed with the pinned backend-local validation dependencies.
- `pnpm --dir backend lint`, `typecheck`, `test`, `build`, and `curriculum:validate`: passed. Backend tests: 91 Vitest and 3 Git-history tests. The validator accepts the draft Q01 tree and rejects malformed temporary content with a nonzero CLI status without provider credentials.
- `pnpm lint`, `typecheck`, `test`, and `build`: passed. Frontend tests: 132. The first concurrent root test run timed out in an unchanged backend HTTP test under load; the subsequent root run and backend-only run passed without changing its limit.
- `openspec validate define-git-curriculum-content --strict`, authoring-link resolution, scoped credential/boundary review, and `git diff --cached --check`: passed. The scoped diff contains no root content tree, frontend imports/generated client, API endpoints, database or migration changes, assessment runtime, publication, or reward/unlock computation. Credential-like text appears only in a regression fixture and is not emitted by validation errors.
