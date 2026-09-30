# Curriculum authoring source

This is the Git-owned, backend-local source of curriculum. It is **not published** by adding files here. Phase 29 authors 24 instructional JavaScript Foundations quests in seven chapters; Phase 30 adds one final capstone. The original Q01 1.0.0 draft remains historical; the selected editorial version is 1.1.0 with the unchanged 1.0.0 assessment. Publication is selected separately in `publication.yaml` after the [instructional and technical review](../../docs/javascript-foundations.md). Phase 30 authors CAP01 as a separately counted Integration capstone after Q24; see the [capstone review](../../docs/inventory-capstone.md). Its 10 XP and integrative label remain provisional. Do not import these files into the frontend or query application tables from the frontend.

Run `pnpm --dir backend curriculum:validate` from the repository root. CI runs the same command. It requires no database, Supabase credentials, running API, or learner-code execution. Backend unit tests exercise invalid temporary content trees. The command checks authored file structure and previously merged snapshots against `origin/main`; keep full Git history available. It fails closed when the base cannot be resolved.

## Local authoring tools

Run these commands from the repository root. `content:validate` is an alias for the full curriculum and immutable-history gate; every preview and candidate run performs that gate before reading its selection. IDs accept a stable Quest/Journey ID or an unambiguous slug. A Quest version is always explicit: use `current` to intentionally select `quest.yaml`'s current authored version, or supply an exact content version. Outputs must be new absolute `.html` paths outside `backend/content/`; remove them after review. The tools never update snapshots or `publication.yaml`.

```text
pnpm --dir backend content:validate
pnpm --dir backend content:preview:quest --id Q01 --version current --out <absolute-new-q01.html>
pnpm --dir backend content:preview:quest --id Q01 --version 1.0.0 --out <absolute-new-historical.html>
pnpm --dir backend content:preview:course --id JAVASCRIPT-FOUNDATIONS --out <absolute-new-course.html>
```

The self-contained previews render safe static lesson text and bounded local images with scripts and network loads disabled. Quest previews show selected content and assessment versions, starter, hints, cases, prerequisites, and their exact published comparison. Course previews show the ordered authored inventory, review status, and manifest-selected versions. An unselected snapshot is visibly unpublished; previewing it does not make it available to learners. The Course outline does not calculate learner progress or unlocks.

Save each candidate in a regular local `.js` file, at most 65,536 UTF-8 bytes. The selected Quest must fit the current browser Check limit of 10 cases; a larger authored case set fails with a clear limit error rather than a false test result. Run reference and alternative sources with `--expect pass`, then a deliberate defect with `--expect fail`. A mismatch, malformed source, or timeout exits nonzero. The command starts a fresh local browser Check at the dedicated Worker origin, reports ordered case IDs and bounded feedback, and deletes its temporary fixture. It aborts all backend API requests. A passing candidate is technical review evidence only; curriculum and technical approval remain explicit.

```text
pnpm --dir backend content:test --id Q01 --version current --source <absolute-reference.js> --expect pass
pnpm --dir backend content:test --id Q01 --version current --source <absolute-alternative.js> --expect pass
pnpm --dir backend content:test --id Q01 --version current --source <absolute-defect.js> --expect fail
pnpm --dir backend content:test --id Q01 --version 1.0.0 --source <absolute-reference.js> --expect pass
```

The same commands can target an unselected draft after it passes structural validation. The browser test does not submit attempts or alter account records. A looping candidate fails within the runtime bound; the harness checks that a later finite Check recovers on a fresh Worker. Keep candidate files and generated previews outside Git unless they are reviewed authored content, and delete local outputs when finished.

## Tree and identity

```text
backend/content/
  concepts.yaml
  publication.yaml
  journeys/<journey-slug>/journey.yaml
    chapters/<chapter-slug>/chapter.yaml
      quests/<quest-slug>/quest.yaml
        versions/<content-version>/
          version.yaml
          lesson.mdx
          starter.js
          tests.ts
          assets/ (optional, local images only)
```

`Journey → Chapter → Quest` is the hierarchy; “Course” is a display synonym for Journey. Every concept, journey, chapter, and quest has a stable ID. IDs are not slugs, titles, directory names, database UUIDs, or version numbers. The database already has separate identity and version records; this phase does not populate them. Parent manifests list child IDs. Position is unique among siblings. The path segment must match the slug, but a slug can change without replacing stable identity. Do not change a stable quest ID to reissue XP for an editorial update.

`journey.yaml` records entry requirements, approved outcome IDs/descriptions, ordered chapter IDs, and `status: draft` or `status: reviewed`. `chapter.yaml` records its journey ID, objective summary, and quest IDs. `quest.yaml` records its chapter ID, `instructional` or `capstone` kind, `guestEligible`, current content version, and review transitions. Q01–Q24 are instructional in the approved seven-chapter order; the final capstone is a separate quest. Only Q01–Q04 are guest eligible, and a numbered Foundations quest after Q01 requires its immediate predecessor. The test-only one-quest draft is preserved under `backend/test/fixtures/curriculum-draft`; it is not product publication.

Each immutable `versions/<semver>/version.yaml` records the same `contentVersion` as the directory, an independent `assessmentVersion`, title, one primary objective, one Foundations outcome ID, concept IDs, completion-prerequisite quest IDs, editorial difficulty, positive XP award candidate, three graduated hints, and case IDs. A capstone additionally needs separate explanation and transfer prompts. Those prompts record responses for later review; deterministic cases cannot prove reasoning quality. `lesson.mdx` carries the task and examples. `starter.js` carries editable starter source. `tests.ts` must contain exactly one exported `const cases = [...]` literal; it is parsed, never imported or evaluated. Cases use `console` expected output or named `function` arguments/expected JSON values, with normal and boundary examples and actionable feedback. The schema and the focused tests in `backend/src/modules/curriculum/content/` are the definitive syntax reference.

Lesson markup is limited to static Markdown: headings, paragraphs, lists, emphasis, code, block quotes, links, and local `./assets/` images with text alternatives. Imports, expressions, JSX, raw HTML, remote embeds, and executable components are invalid. Starter source cannot use browser/network/application capabilities outside Foundations. Keep essential instructions and outputs available as text; images cannot be the only carrier of a concept. Tests are bounded declarative data, with no callbacks, network, filesystem, packages, DOM/event assumptions, or hidden server runner. The existing isolated browser Check consumes these cases; this validator checks authoring structure only.

## Review and versions

Create a new content snapshot for any changed lesson, starter, objective, prerequisite, hint, or case. Never edit or delete a previously merged `versions/` file. If deterministic criteria change, increment `assessmentVersion` as well. Point `currentVersion` to the latest snapshot and append one adjacent old→new transition in `quest.yaml`, recording the old/new assessment versions, `compatible` or `incompatible`, an explanation, pending-work action (`accept-new` or `retry-current`), and curriculum/technical review states. Compatible decisions must accept pending work under the new contract; incompatible decisions require `retryGuidance` for a current-version retry. A draft may keep review state `pending`; validation is not publication approval. CO reviews pedagogy and accessibility; TO reviews deterministic contracts, alternatives, bounds, and runtime assumptions. To activate a complete reviewed Journey, set its status to `reviewed` and add one ordered entry to `publication.yaml` with exact quest content/assessment versions plus `curriculumReview: approved` and `technicalReview: approved`. The selection must include the Journey's full authored inventory and prerequisite closure. Validation rejects partial, stale, draft, unreviewed, ambiguous, or dangling selections. Roll back by restoring the prior reviewed manifest selection; never rewrite a merged snapshot. An empty manifest is valid and serves an empty Journey list. Course remains only the API/display alias for Journey.

All Phase 29 `xpAward: 10` values and difficulty labels are provisional candidates. F04 still owns numeric XP and difficulty/timing balance. This tree does not calculate XP, unlocks, progress, or active availability. Unlock references are completion prerequisites only; do not add XP thresholds or stored unlock state. Historical completions and one-reward-per-stable-quest policy are governed by [curriculum decisions](../../docs/curriculum.md) and [ADR 0007](../../docs/adr/0007-curriculum-identity-and-versioning.md). Phase 10 serves only manifest-selected snapshots. Phase 12 renders their static lesson markup and serves selected local illustrations; existing completion acceptance remains owned by the learning module.
