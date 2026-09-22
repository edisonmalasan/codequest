# Curriculum authoring source

This is the Git-owned, backend-local source of curriculum. It is **not published** by adding files here. The current JavaScript Foundations tree contains one **draft** Q01 fixture to exercise the authoring contract. Publication is selected separately in `publication.yaml`; the production manifest is intentionally empty. Do not import these files into the frontend or query application tables from the frontend.

Run `pnpm --dir backend curriculum:validate` from the repository root. CI runs the same command. It requires no database, Supabase credentials, running API, or learner-code execution. Backend unit tests exercise invalid temporary content trees. The command checks authored file structure and previously merged snapshots against `origin/main`; keep full Git history available. It fails closed when the base cannot be resolved.

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

`journey.yaml` records entry requirements, approved outcome IDs/descriptions, ordered chapter IDs, and `status: draft` or `status: reviewed`. `chapter.yaml` records its journey ID, objective summary, and quest IDs. `quest.yaml` records its chapter ID, `instructional` or `capstone` kind, `guestEligible`, current content version, and review transitions. Q01–Q24 are instructional in the approved seven-chapter order; the final capstone is a separate quest. Only Q01–Q04 are guest eligible, and a numbered Foundations quest after Q01 requires its immediate predecessor. The one-quest draft is deliberately incomplete, so it is not a learner journey.

Each immutable `versions/<semver>/version.yaml` records the same `contentVersion` as the directory, an independent `assessmentVersion`, title, one primary objective, one Foundations outcome ID, concept IDs, completion-prerequisite quest IDs, editorial difficulty, positive XP award candidate, three graduated hints, and case IDs. A capstone additionally needs separate explanation and transfer prompts. Those prompts record responses for later review; deterministic cases cannot prove reasoning quality. `lesson.mdx` carries the task and examples. `starter.js` carries editable starter source. `tests.ts` must contain exactly one exported `const cases = [...]` literal; it is parsed, never imported or evaluated. Cases use `console` expected output or named `function` arguments/expected JSON values, with normal and boundary examples and actionable feedback. The schema and the focused tests in `backend/src/modules/curriculum/content/` are the definitive syntax reference.

Lesson markup is limited to static Markdown: headings, paragraphs, lists, emphasis, code, block quotes, links, and local `./assets/` images with text alternatives. Imports, expressions, JSX, raw HTML, remote embeds, and executable components are invalid. Starter source cannot use browser/network/application capabilities outside Foundations. Keep essential instructions and outputs available as text; images cannot be the only carrier of a concept. Tests are bounded declarative data, with no callbacks, network, filesystem, packages, DOM/event assumptions, or hidden server runner. Browser Check behavior is a later capability; this validator checks authoring structure only.

## Review and versions

Create a new content snapshot for any changed lesson, starter, objective, prerequisite, hint, or case. Never edit or delete a previously merged `versions/` file. If deterministic criteria change, increment `assessmentVersion` as well. Point `currentVersion` to the latest snapshot and append one adjacent old→new transition in `quest.yaml`, recording the old/new assessment versions, `compatible` or `incompatible`, an explanation, pending-work action (`accept-new` or `retry-current`), and curriculum/technical review states. Compatible decisions must accept pending work under the new contract; incompatible decisions require `retryGuidance` for a current-version retry. A draft may keep review state `pending`; validation is not publication approval. CO reviews pedagogy and accessibility; TO reviews deterministic contracts, alternatives, bounds, and runtime assumptions. To activate a complete reviewed Journey, set its status to `reviewed` and add one ordered entry to `publication.yaml` with exact quest content/assessment versions plus `curriculumReview: approved` and `technicalReview: approved`. The selection must include the Journey's full authored inventory and prerequisite closure. Validation rejects partial, stale, draft, unreviewed, ambiguous, or dangling selections. Roll back by restoring the prior reviewed manifest selection; never rewrite a merged snapshot. An empty manifest is valid and serves an empty Journey list. Course remains only the API/display alias for Journey.

The Q01 `xpAward: 10` and `introductory` label are provisional examples. F04 still owns numeric XP and difficulty/timing balance. This tree does not calculate XP, unlocks, progress, or active availability. Unlock references are completion prerequisites only; do not add XP thresholds or stored unlock state. Historical completions and one-reward-per-stable-quest policy are governed by [curriculum decisions](../../docs/curriculum.md) and [ADR 0007](../../docs/adr/0007-curriculum-identity-and-versioning.md). Phase 10 serves only manifest-selected snapshots; completion acceptance remains Phase 12 work.
