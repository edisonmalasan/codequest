# Course Discovery Specification

## Purpose

Let learners discover and enter only reviewed, complete published Courses through a clear Journey and Course catalog without mistaking browser state for accepted account progress.

## Requirements

### Requirement: The catalog exposes only published complete Courses

The public catalog SHALL list only Courses whose owning Journey and complete reviewed Course snapshot are selected by backend publication. It SHALL expose stable Course and Journey identity, display title, concise authored summary, topic/category metadata, ordered chapter and exercise counts, and published position. Draft, partial, or unselected Courses SHALL not appear as available cards or search hits.

#### Scenario: Complete Course is published
- **WHEN** a reviewed Course and all of its selected exercises are published
- **THEN** the Course appears in the catalog under its owning Journey with a working detail and first eligible exercise path

#### Scenario: Course is not ready
- **WHEN** a Course is draft, incomplete, or absent from publication
- **THEN** no public card, search hit, or published detail discloses it

### Requirement: Learners can browse and search published Courses

The frontend SHALL offer a dedicated catalog route reachable from Home and global navigation. Search and topic filters SHALL operate only on backend-published public metadata, preserve a useful all-Courses view, and support keyboard, screen reader, and narrow-screen use. Search results SHALL preserve stable Course identity and distinguish Journey grouping from Course identity.

#### Scenario: Search matches a published Course
- **WHEN** a learner searches a published title or topic
- **THEN** only matching published Courses remain, with direct links to the appropriate Course

#### Scenario: No published Course matches
- **WHEN** search or filters produce no match
- **THEN** the catalog explains the empty result and offers a clear reset

#### Scenario: Catalog read fails
- **WHEN** the public catalog cannot be loaded
- **THEN** the page shows a safe recoverable error and never substitutes unpublished or static placeholder Courses

### Requirement: Journey, Course, and Exercise navigation is coherent

The learner journey SHALL support Home to catalog to Journey to Course to Chapter to Exercise. The Journey page SHALL present its published Courses in order; the Course page SHALL present its ordered chapters and exercises, authored description/outcomes, and available next step. Direct links and refresh SHALL resolve through stable slugs while stable IDs, not titles/slugs, remain the relationship and history keys. Existing published quest links SHALL remain usable.

#### Scenario: Learner chooses a Course
- **WHEN** a learner selects a published Course from its Journey or catalog
- **THEN** the Course map shows only that Course's published chapters and exercises in backend order

#### Scenario: Legacy Journey bookmark
- **WHEN** a learner follows the existing JavaScript Foundations Journey URL
- **THEN** the page still reaches the published Foundations Course without losing access to its chapters or exercises

### Requirement: Discovery status is truthful

For authenticated learners, any Course completion, progress, or unlock presentation SHALL come from an owner-scoped backend read and SHALL fail closed on an unavailable or incomplete protected response. Guest signals MAY use device-local provisional facts with explicit provisional labeling. Public catalog counts SHALL not be presented as account progress.

#### Scenario: Protected read fails
- **WHEN** public Course metadata loads but the authenticated Course progress read fails
- **THEN** the Course remains browsable while saved progress and unlock claims show an unavailable state

#### Scenario: Guest opens a Course
- **WHEN** a guest views a Course with local work
- **THEN** any local progress is labeled device-local and provisional

### Requirement: Catalog remains useful at sparse and broad publication sizes

The Course catalog SHALL give each published Course an identifiable topic, owning Journey, concise learning promise, and direct entry while retaining discoverable search and filters. Its visual composition SHALL remain intentional when one Course is published and scale without a different interaction model when many are published. Empty space SHALL not be filled with unreviewed or unavailable Course cards.

#### Scenario: Sparse catalog

- **WHEN** publication contains a single Course
- **THEN** that Course and the available search/filter controls are clear, visually balanced, and reachable without implying additional Courses

#### Scenario: Larger catalog

- **WHEN** multiple reviewed Courses are published
- **THEN** search, filtering, Journey identity, and each Course's direct entry remain scannable without changing URL or identity semantics
