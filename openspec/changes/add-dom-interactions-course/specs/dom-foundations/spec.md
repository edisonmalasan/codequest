# Spec Delta

## Purpose

Deliver a complete original beginner Course for bounded browser interactions through CodeQuest's isolated interactive learning workflow and reviewed publication contract.

## ADDED Requirements

### Requirement: DOM Foundations is a complete prerequisite-aware Course

The published Web Foundations Journey SHALL contain a distinct DOM Foundations Course with four ordered chapters and twelve original instructional Quests. It SHALL progress from selecting supplied HTML and changing text, through click/input/change events and small interface state, to an integrated accessible interface project. The first Quest SHALL require accepted completion of HTML12, CSS12, and Q24; later Quests SHALL require their preceding stable DOM Quest ID. Every Quest SHALL have a stable identity, original lesson and worked example, explicit supported-API contract, concrete task, editable identified files, graduated hints, deterministic normal and boundary checks, and actionable feedback. The complete Course SHALL be reviewed and selected atomically; an incomplete card or partial Quest set SHALL remain unpublished.

#### Scenario: Eligible learner opens the Course

- **WHEN** an account has accepted the three published entry prerequisites and the reviewed Course is selected
- **THEN** all twelve usable Quests appear once in order, with the first available and the final integrated project reachable through normal completion

#### Scenario: Prerequisites or content are missing

- **WHEN** an entry completion is absent, a selected Quest is missing, or its lesson, starter, or assessment is unreviewed
- **THEN** the backend explains the lock to that owner or rejects the incomplete Course at publication, without exposing draft content

### Requirement: Lessons assess only the supported interaction subset

The Course SHALL teach and assess only the declared bounded DOM facade: supported element selection, text/class/limited attribute and style changes, text-input values, and click/input/change listeners. HTML/CSS SHALL remain constrained display data, and learner JavaScript SHALL run only in the credential-free Worker. Lessons SHALL state that this is a deliberately limited browser model; they SHALL NOT imply support for `innerHTML`, element creation, timers, network, packages, storage, navigation, or a full native DOM. Each assessment SHALL use ordered, browser-visible, data-only `interactive-text` cases with normal and boundary interaction sequences. A reference and behaviorally valid alternative SHALL pass, while a deliberate defect SHALL fail without source-shape grading.

#### Scenario: Learner completes a finite interaction

- **WHEN** source attaches a supported handler and updates the declared result after the authored event sequence
- **THEN** Run shows the current isolated result and Check reports bounded local case feedback for that exact source snapshot

#### Scenario: Learner uses an unsupported API

- **WHEN** source attempts an unavailable browser capability or active/external markup
- **THEN** the run or check fails truthfully within its bounds, preserves editable source, and gains no application or network authority

### Requirement: Course completion follows existing personal-learning authority

All DOM Quests SHALL be account-only. Run and Check SHALL remain local and unverified; an account attempt or completion SHALL require explicit Submit of the current passing source, content version, assessment version, and stable event identity. NestJS SHALL apply existing owner, prerequisite, version, bound, replay, and first-accepted-completion policies before progress, XP, streak, or unlock views change. The Course SHALL NOT claim independently verified DOM ability, competitive ranking, or certification from a browser report.

#### Scenario: Check passes but Submit is not activated

- **WHEN** a learner passes a local case set and leaves the Quest
- **THEN** no accepted completion or reward is created, and the owner-scoped source remains recoverable

#### Scenario: A submission response is uncertain

- **WHEN** an eligible learner submits and the response is lost
- **THEN** the same owner-bound event and source remain available for exact replay without a second completion or XP award

### Requirement: Interactive publication requires exact-version and exact-build evidence

The Course SHALL remain unpublished until dated curriculum and technical/security review approves every selected content and assessment version and the first interactive Quest passes the R08 published-route containment gate on the exact integrated candidate. A candidate branch MAY stage the full selection solely to exercise the production route before merge. The gate SHALL cover distinct application, runner, and preview origins; effective CSP and sandbox; forbidden network/storage/navigation/active-markup sinks; exact correlated message handling; source/output/mutation bounds; unsupported APIs; repeated source and event-handler loops; two-second termination and eligible one-second fresh-run recovery; cancellation, reload, owner switch, navigation, and cleanup across the declared Chromium, Firefox, WebKit, and mobile-browser automation matrix. The full Course SHALL also pass reference, alternative, and defect checks plus catalog-to-final-project traversal before merge. The record SHALL identify commit/build, origin topology, browser versions, content and assessment versions, date, reviewers, pass/fail/untested rows, and affected retests. A missing or failed required row SHALL keep production selection blocked. Automation alone SHALL NOT imply founder acceptance, real-provider Auth, hosted/physical proof, or beta readiness.

#### Scenario: Candidate fails a containment or recovery probe

- **WHEN** any required selected-route probe reaches a forbidden sink or misses the recovery bound
- **THEN** no interactive Quest is published, the failure remains in the record, and only an affected-build retest may close it

#### Scenario: Complete candidate passes required review

- **WHEN** the exact selected Course versions and integrated candidate pass all required instructional, assessment, browser, and security rows
- **THEN** only that complete reviewed selection becomes public through the existing catalog and lesson routes

#### Scenario: Runtime or selected snapshot changes later

- **WHEN** an adapter, origin policy, host integration, assessment, or selected snapshot changes after review
- **THEN** affected publication probes must be rerun against the new exact build before the changed selection is accepted
