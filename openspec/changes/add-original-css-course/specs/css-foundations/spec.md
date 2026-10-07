# Spec Delta

## Purpose

Deliver an original, complete beginner CSS Course through CodeQuest's reviewed static web learning workflow, from first stylesheet through a responsive final page.

## ADDED Requirements

### Requirement: CSS Foundations is a complete ordered Course
The published Web Foundations Journey SHALL contain a distinct CSS Foundations Course with four ordered chapters and twelve original instructional Quests. The sequence SHALL teach stylesheet connection and selectors, typography/color/spacing, box and layout models, and responsive design before a final integrated page. Each Quest SHALL provide a stable identity, one objective, original explanation and worked example, editable HTML/CSS starters, task constraints, graduated hints, normal and boundary cases, and prerequisites that require no untaught JavaScript. The complete Course SHALL be reviewed and selected atomically; an incomplete catalog card or Quest set SHALL remain unpublished.

#### Scenario: Learner opens the reviewed Course
- **WHEN** the CSS Foundations Course is selected for publication
- **THEN** all twelve usable Quests appear once in reviewed order with a final integrated project

#### Scenario: A Course component is missing
- **WHEN** a chapter, lesson, starter, assessment, or final project is missing or unreviewed
- **THEN** the Course is not selected into the public catalog

### Requirement: CSS exercises use safe static authoring and truthful assessment
Each Quest SHALL use the static web mode with an HTML document and CSS stylesheet. Preview SHALL remain script-disabled and isolated. Check SHALL inspect only the declared, bounded source properties and rule scopes for the taught objective; it SHALL NOT claim to measure all computed appearance, visual quality, accessibility, or independent mastery. Cases SHALL give deterministic local, unverified feedback for normal and boundary inputs, accept equivalent source ordering and whitespace, and preserve editable source on failure. Unsupported or unsafe CSS SHALL fail safely with actionable bounded feedback.

#### Scenario: Learner checks a responsive rule
- **WHEN** the learner supplies a valid allowlisted media rule and declaration required by the lesson
- **THEN** Check reports the ordered local case result and Preview can show the page at the declared narrow and wide widths

#### Scenario: Learner tries an unsupported feature
- **WHEN** source includes an external import, resource URL, executable content, unsupported selector, or over-limit rule tree
- **THEN** Preview and Check preserve the source without granting network or application authority, and Check does not report a pass

### Requirement: CSS learning follows the existing account boundary
The Course SHALL use public curriculum delivery, owner-scoped availability, device-local drafts, explicit authenticated Submit, backend personal-learning acceptance, first-completion XP, and trusted progress refresh. Guest eligibility SHALL be explicitly authored; this Course SHALL NOT silently expand the existing guest subset. Uncertain or rejected submission responses SHALL preserve the owner-bound source and stable event for recovery. No CSS completion SHALL be represented as verified ability or certification.

#### Scenario: Account learner completes a CSS Quest
- **WHEN** a current local Check passes and an eligible account learner submits the matching source and versions
- **THEN** the backend applies its existing owner, prerequisite, version, idempotency, and personal-learning rules before progress or XP changes

#### Scenario: Submission response is uncertain
- **WHEN** delivery cannot be confirmed and the learner revisits
- **THEN** the source and pending event remain available for exact replay without a repeat award

### Requirement: Publication requires complete dated review
The Course SHALL be published only after dated curriculum and technical review of every exact content and assessment version, original writing and assets, hint usefulness, semantic HTML, CSS safety, responsive preview behavior, passing reference and alternative candidates, deliberate defects, and catalog-to-final-project browser traversal. The review SHALL record failed and untested setups. Existing HTML and JavaScript snapshots and historical learner facts SHALL remain unchanged. Static CSS publication SHALL NOT select an interactive Quest or close its separate exact-build gate.

#### Scenario: All selected versions pass review
- **WHEN** the full Course inventory and exact build pass required content, security, and integrated checks
- **THEN** only those reviewed versions become public through the existing API and learner routes

#### Scenario: Interactive gate remains open
- **WHEN** CSS static publication passes but an interactive Quest lacks its own required evidence
- **THEN** interactive Quest selection remains disabled
