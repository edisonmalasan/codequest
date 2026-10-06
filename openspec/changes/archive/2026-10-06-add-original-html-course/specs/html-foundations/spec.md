# Spec Delta

## Purpose

Deliver a complete original beginner HTML Course through the reviewed static web learning workflow, from first document to an integrated accessible page.

## ADDED Requirements

### Requirement: HTML Foundations is a complete ordered Course
The published Web Foundations Journey SHALL contain a distinct HTML Foundations Course with four ordered chapters and twelve original instructional Quests. The sequence SHALL teach document structure and text, links and images, grouped semantic content, and accessible form basics before an integrated one-page project. Each Quest SHALL have a stable identity, one clear objective, an explanation and worked example, editable starter, explicit task and constraints, graduated hints, normal and boundary checks, and completion prerequisites that do not require untaught CSS or JavaScript. Every chapter SHALL build toward the final project; an incomplete Course SHALL remain unpublished.

#### Scenario: Learner opens the Course
- **WHEN** the HTML Foundations Course is published and browsed
- **THEN** all twelve Quests appear once in reviewed order with usable lessons and a final project, rather than a placeholder card

#### Scenario: Course inventory is incomplete
- **WHEN** an authored Quest, assessment, chapter, or project is missing or unreviewed
- **THEN** the Course is not selected into the public catalog

### Requirement: HTML exercises use safe static authoring and honest feedback
Each HTML Quest SHALL use the published static web exercise mode with an identified HTML file and only reviewed optional assets. Preview SHALL show safe markup without executable learner script, link navigation, or form submission. Check SHALL use bounded declarative cases that test the stated HTML objective, including semantic element identity and safe attributes where necessary, and SHALL label its result local and unverified. The lesson SHALL explain when previewed links or forms are deliberately inert. Valid alternative markup satisfying the declared behavior SHALL not fail for arbitrary source formatting.

#### Scenario: Learner checks an accessible form
- **WHEN** a learner writes the required label and field relationship and checks the current source
- **THEN** ordered local cases report the declared structural result without submitting the form or sending learner data

#### Scenario: Learner adds active content
- **WHEN** a learner adds script, unsafe URL, external resource, or unsupported HTML
- **THEN** Preview and Check fail safely or filter that content without granting authority, while source remains recoverable

### Requirement: HTML learning follows the published account boundary
The Course SHALL use existing public curriculum delivery, owner-scoped availability, local drafts, explicit authenticated Submit, backend personal-learning acceptance, first-completion XP, and trusted progress refresh. Guest availability SHALL be explicitly authored and truthful; no new guest eligibility is implied. Source, versions, and stable event identity SHALL survive uncertain or rejected submission responses. Completion SHALL not claim independently verified HTML mastery.

#### Scenario: Authenticated learner completes a Quest
- **WHEN** a current local Check passes and the learner explicitly submits an eligible HTML Quest
- **THEN** the backend applies its normal owner, version, prerequisite, idempotency, and personal-learning policy before trusted completion or XP appears

#### Scenario: Learner revisits after a lost response
- **WHEN** the submission response is uncertain and the learner returns
- **THEN** the original owner-bound source and event remain available for exact replay without a second award

### Requirement: Publication and course review retain exact evidence
The Course SHALL be selected only after dated curriculum and technical review of original lessons, examples, starter files, declared checks, hint usefulness, accessibility, safe preview behavior, and complete versioned inventory. Review SHALL include passing reference and alternative solutions, deliberate defects, browser traversal from catalog through the final project, and known failures or untested setups. Existing JavaScript content and historical learner facts SHALL remain unchanged. Publishing static HTML SHALL NOT select an interactive web Quest or close its separate exact-build gate.

#### Scenario: Static Course review passes
- **WHEN** the selected Course and all Quest versions pass the required review and publication checks
- **THEN** only those reviewed versions become public through the existing API and learner routes

#### Scenario: Interactive content lacks its review
- **WHEN** the static HTML Course is published but no original interactive Quest has its exact-build evidence
- **THEN** interactive Quest selection remains disabled
