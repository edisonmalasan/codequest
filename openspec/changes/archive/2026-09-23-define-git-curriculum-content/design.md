## Context

See [proposal.md](proposal.md) for motivation and [curriculum-content delta](specs/curriculum-content/spec.md) for the behavior contract. The repository has no `backend/content/` source yet. Its `CurriculumModule` is inert; PostgreSQL already has stable journey/chapter/quest IDs, concept links, prerequisite links, and content/assessment version columns. AGENTS.md, C05, architecture, and ADR 0003 place authored content at `backend/content/`; the roadmap's root `content/` tree is an outdated sketch. ADR 0007 requires retained versions and explicit compatibility, while F04 leaves XP amounts and difficulty balancing open.

## Goals / Non-Goals

**Goals:** Establish a reviewable authoring tree, a constrained data contract for JavaScript Foundations, repeatable local/CI validation, and one clearly draft fixture. Keep validation independent of Supabase, PostgreSQL, a running NestJS server, and learner execution.

**Non-Goals:** Activate/publish content, fill all seven chapters or 25 quests, expose routes or OpenAPI types, project authored data into tables, compute learner eligibility/rewards, execute assessment cases, or settle production balancing and compatibility-window durations.

## Decisions

### 1. Backend-owned tree and stable identifiers

Use a flat capability inside the backend application, not a root package or frontend import:

```text
backend/content/
  concepts.yaml
  journeys/javascript-foundations/
    journey.yaml
    chapters/variables/
      chapter.yaml
      quests/first-message/
        quest.yaml
        versions/1.0.0/
          version.yaml
          lesson.mdx
          starter.js
          tests.ts
```

`journey.yaml` declares stable ID, display slug/title, order, draft status, entry requirements, outcomes O1–O8, and chapter IDs. `chapter.yaml` declares stable ID, parent journey ID, display slug/title, order, objective summary, and quest IDs. The root `quest.yaml` declares stable ID (Q01 in the fixture), parent chapter ID, display slug, order, `instructional|capstone`, current content version, and reviewed version-transition records. These IDs correspond conceptually to the existing database keys but this phase creates no rows. Directory names and display slugs are editorial navigation, never identity or reward keys. The roadmap's `quest.yaml` remains present; version-specific fields move into immutable snapshots so older material stays addressable.

`version.yaml` declares `contentVersion`, `assessmentVersion`, title, primary objective, Foundations outcome ID, concept IDs, prerequisite quest IDs, difficulty, XP award metadata, hints, and validation case references. The lesson and starter are snapshot-owned. The validator resolves parent/child references and checks unique IDs, slugs, positions, current pointers, and the prerequisite DAG. Course has no file or entity. Alternative considered: one mutable quest folder plus Git history; rejected because an older supported assessment would not be an explicit current source artifact.

### 2. Assessment files are declarative source, not executable hooks

Retain the roadmap's `tests.ts` filename but constrain it to one exported JSON-compatible literal containing case IDs, supported inputs and expected outputs/returns. A limited TypeScript syntax parser extracts literal data without importing or evaluating the module; it rejects imports, function definitions, calls, computed expressions, extra statements, unsupported values, and oversized cases. Zod then validates the extracted data and its cross-references to `version.yaml`. This makes a typed, reviewable authoring file without permitting arbitrary test code in the validation process. The future browser Check engine and its delivery format belong to a later change.

Assessment kinds initially cover bounded console-output and named-function input/output cases, including normal and boundary examples. Richer state/rubric checks require a reviewed extension. `version.yaml` records separate explanation/transfer prompts for the capstone; their presence is not machine-graded reasoning quality. Alternative considered: importing `tests.ts` in Node for validation; rejected because it would execute arbitrary module top-level code during the authoring gate.

### 3. Restrict authored lesson capabilities

`lesson.mdx` uses readable Markdown/MDX syntax with a deliberately small static allowlist. CI rejects imports, exports, executable expressions, arbitrary JSX/components, remote embeds, and external scripts. Referenced local assets require safe relative paths and text alternatives; content is authored/trusted but does not automatically gain application capabilities. A later renderer can decide the exact delivery representation. Alternative considered: unrestricted MDX to maximize author flexibility; rejected because it obscures the authoring security boundary and complicates safe downstream rendering.

### 4. Version and review policy

Use exact semantic version strings for content snapshots and separate assessment-version strings. A changed lesson, starter, objective, prerequisite, hint, or assessment creates a new content snapshot; changed deterministic criteria also increments assessment version. The root quest manifest records each old→new transition as `compatible` or `incompatible`, rationale, and curriculum/technical review state. A draft fixture may record pending review; publishable transitions require both reviews, but no publication workflow is implemented here. Previous snapshot files are immutable by authoring policy and can be checked against the Git merge base in CI. Actual compatibility windows, active projections, and old-submission acceptance stay in Phase 10+.

XP is an authored positive bounded award candidate tied to one stable quest, not an award engine or level curve. Difficulty uses `introductory`, `developing`, and `integrative` as editorial scaffold labels; F04 remains responsible for balancing timing and numeric awards. Unlocks are represented by prerequisite IDs only; there is no separate XP threshold or stored unlock flag. Alternative considered: version-specific quest IDs or implicit compatibility based on equal tests; both violate ADR 0007's historical identity/review rule.

### 5. Validator and CI contract

Add backend-local, pinned YAML/Zod and parsing dependencies only when Apply begins. A backend script validates all authored files against Zod schemas, static lesson/assessment restrictions, duplicate/path bounds, known concepts/outcomes, current-version pointers, review metadata, and graph integrity. It reports safe path/field diagnostics, returns nonzero on failure, and never logs lesson source or secrets. CI runs this command alongside existing checks. Focused tests use temporary fixture trees for valid draft content and negative missing-file, malformed schema, duplicate-ID, cycle, unsafe MDX, executable `tests.ts`, invalid transition, and oversized-data cases. Do not weaken the existing root command contract.

## Risks / Trade-offs

- **Schema too rigid for later quests** → Keep a small discriminated validation-case vocabulary, require an explicit schema/version review before expanding it, and avoid claiming the single draft fixture proves the entire course is authorable.
- **Version transition metadata mistaken for publication approval** → Mark the representative journey and snapshots draft; document that validation is necessary but insufficient for Phase 10 activation and CO/TO review.
- **MDX or TypeScript parser accepts active content** → Use syntax-tree allowlists with adversarial fixtures; fail closed on unknown nodes and avoid module import/evaluation.
- **XP/difficulty labels mistaken for final balance** → Label sample values provisional and retain F04 balancing before actual publication.
- **Old snapshots accidentally edited** → CI compares authored snapshot paths/content with the target merge base and requires a new version rather than rewriting a previously merged snapshot.

## Migration Plan

No runtime or database migration is needed. Apply adds the backend-owned authoring source and CI validator without making it available through NestJS. Rollback removes that source and gate; no learner or production records are affected.

## Deferred Decisions

Phase 10 determines projection/activation, API shapes, delivered assessment format, compatibility-window length, and how authored versions map to persisted quest-version UUIDs. F04 determines final XP amounts and timing/difficulty balance. Later curriculum authoring fills the approved 24 instructional quests and capstone through CO/TO review.
