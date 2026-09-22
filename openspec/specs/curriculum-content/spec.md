# Curriculum Content Specification

## Purpose

Define a reviewable, backend-owned Git curriculum source and validation contract for JavaScript Foundations before any API publication or learner-facing delivery is introduced.

## Requirements

### Requirement: Curriculum source follows the approved hierarchy and ownership

Authored curriculum SHALL live under `backend/content/` as ordered Journey, Chapter, and Quest records. Course SHALL remain a display synonym for Journey, not a fourth hierarchy level. The authored tree SHALL identify its owning journey and chapter for each quest and SHALL NOT require frontend imports, direct application-table access, or a root `content/` source.

#### Scenario: Authored hierarchy is inspected

- **WHEN** the repository content tree is reviewed
- **THEN** journey, chapter, and quest metadata have one unambiguous parent and order under `backend/content/`, with no separate Course entity or frontend copy

### Requirement: Stable identity is separate from presentation and versions

Every journey, chapter, concept, and quest SHALL have a stable, unique ID independent of title, slug, and directory name. Quest content snapshots SHALL declare a content version and assessment version; a new snapshot SHALL NOT overwrite an older authored snapshot. A quest's current authored version SHALL resolve to exactly one snapshot, while historical snapshots remain reviewable. The authoring model SHALL distinguish an instructional quest from the final capstone without counting the capstone among the 24 instructional quests.

#### Scenario: Quest title or lesson wording changes

- **WHEN** an author adds a new content version for the same learning objective
- **THEN** the stable quest ID remains unchanged and both old and new snapshots remain addressable by ID and version

#### Scenario: Duplicate identity or broken current pointer is submitted

- **WHEN** two records reuse a stable ID or a current-version reference names no snapshot
- **THEN** curriculum validation fails before the change can merge

### Requirement: Quest authoring records the approved learning contract

Each quest SHALL declare its display slug and position. Each quest version SHALL declare its title, primary objective and mapped Foundations outcome, concept references, completion prerequisites, difficulty label, XP award metadata, lesson/task content, starter JavaScript, graduated hints, and deterministic validation definition. Outcome, concept, and prerequisite references SHALL use stable IDs. Content SHALL include clear normal and boundary examples, actionable feedback intent, and accessible text alternatives for essential visuals. The capstone format SHALL distinguish deterministic functional checks from explanation and transfer responses that require later human review for learning evidence.

#### Scenario: Required quest material is missing

- **WHEN** an authored quest lacks an objective, lesson, starter source, hint progression, prerequisite declaration, XP metadata, or validation definition
- **THEN** curriculum validation reports the affected file and field and rejects the change

#### Scenario: Capstone reasoning is authored

- **WHEN** the capstone includes explanation or transfer prompts
- **THEN** the authored assessment identifies their required presence separately from deterministic functional cases and makes no claim that a browser check proves reasoning quality

### Requirement: Assessment definitions remain deterministic and bounded

Authored validation definitions SHALL identify test cases and expected outcomes for the stated objective, including normal and boundary cases. They SHALL be data-only, bounded, and compatible with the approved browser-reported personal-learning trust model. They SHALL NOT require network, filesystem, packages, authenticated application access, DOM/event knowledge in Foundations, hidden server execution, or learner-code execution inside NestJS or CI authoring validation.

#### Scenario: Data-only assessment is reviewed

- **WHEN** a quest defines expected output or function results for specified inputs
- **THEN** the authoring validator confirms the definition's structure, case identity, supported value types, and bounds without running learner source

#### Scenario: Executable or unsupported assessment definition is submitted

- **WHEN** a validation definition contains executable callbacks, unsupported dependencies, or unbounded fixture data
- **THEN** the authoring gate rejects it rather than treating it as a publishable assessment

### Requirement: Cross-reference and sequencing integrity is validated

The authoring gate SHALL reject missing concept, outcome, quest, version, or prerequisite references; duplicate positions or slugs within a parent; self-prerequisites; and cycles in the completion-prerequisite graph. It SHALL verify the approved JavaScript Foundations order and guest Q01â€“Q04 subset for any authored portion without requiring all 24 instructional quests and capstone to exist during an incomplete draft stage. Unlock references SHALL derive from declared completion prerequisites, not XP thresholds or a stored unlock state.

#### Scenario: Cyclic prerequisites are proposed

- **WHEN** two authored quests depend on each other or a quest depends on itself
- **THEN** validation fails with the involved stable quest IDs

#### Scenario: Partial draft journey is validated

- **WHEN** a clearly marked draft contains only a representative chapter and quest with valid references
- **THEN** structural validation can pass without implying that the full Foundations journey is published or available to learners

### Requirement: Version compatibility decisions are explicit and history-safe

An authored version transition SHALL record a reviewed compatibility decision for older content/assessment versions, including a reason and whether previously pending work may use the new version's acceptance contract. Incompatible or retired versions SHALL retain their authored history and require future retry guidance; editorial changes SHALL NOT silently alter assessment compatibility. Content-version changes SHALL NOT create a new stable quest or a second XP source. Actual acceptance windows, historical database mappings, and active publication SHALL remain backend runtime decisions in later changes.

#### Scenario: Assessment changes

- **WHEN** an author changes the deterministic criteria for a stable quest
- **THEN** the assessment version changes and the transition records an explicit compatibility decision before validation succeeds

#### Scenario: Editorial version is added

- **WHEN** an author changes only lesson wording while preserving the objective and assessment
- **THEN** the content version changes, the assessment version may remain the same, and the transition explicitly records compatibility without replacing the older snapshot

### Requirement: CI validates authored content before merge

The backend SHALL provide a repeatable Zod-based curriculum validation command and CI gate. It SHALL validate metadata, required files, text and source bounds, data-only assessment definitions, cross-file references, ordering, version transitions, and prohibited content capabilities; diagnostics SHALL identify offending paths and safe reasons. Valid fixture content SHALL pass locally and in CI, while deliberately malformed fixtures SHALL make the command fail with a nonzero status without production credentials or services.

#### Scenario: Invalid curriculum enters a pull request

- **WHEN** the CI curriculum command encounters malformed metadata, a missing file, an invalid reference, or a disallowed assessment definition
- **THEN** CI fails before merge and reports the relevant authored path without emitting secrets or executing learner code

### Requirement: Curriculum architecture remains separate from delivery and learning behavior

This change SHALL NOT add curriculum REST endpoints, database projections or migrations, active publication decisions, generated frontend client operations, learner execution, Check/Submit acceptance, progress, XP award computation, unlock enforcement, guest import, offline synchronization, or a completed 24-plus-capstone course. A representative authored fixture SHALL remain explicitly draft and unavailable as a product journey until a later approved publication capability exists.

#### Scenario: Phase boundary is inspected

- **WHEN** the completed curriculum-content change is reviewed
- **THEN** only authored content structure, schema/validation tooling, draft examples, CI integration, tests, and documentation are present
