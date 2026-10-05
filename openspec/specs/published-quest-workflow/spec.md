# Published Quest Workflow Specification

## Purpose

Make a published Quest's lesson, editing, local feedback, submission, and navigation one recoverable learner workflow while preserving backend learning authority.

## Requirements

### Requirement: Published exercise mode controls only compatible workspace actions
The published Quest host SHALL use the active backend-selected exercise descriptor and owner identity to provide the compatible files, execution adapter, preview adapter, and check definition to one reusable workspace. Unsupported, unreviewed, or unavailable modes SHALL fail closed with a clear explanation and retain source. A JavaScript-only legacy Quest SHALL keep its existing Run, Check, and Submit path. The host SHALL NOT infer mode from file extensions or give the standalone review route publication authority.

#### Scenario: Legacy JavaScript Quest opens
- **WHEN** a current published JavaScript Quest opens
- **THEN** its source and local actions remain available without an exercise migration

#### Scenario: Mode is unsupported
- **WHEN** a published descriptor names an unavailable mode or mismatched file set
- **THEN** execution and submission are unavailable, the source remains recoverable, and no fallback executes learner code elsewhere

### Requirement: Local actions remain correlated and distinct
Run, Preview, and Check SHALL capture immutable, versioned snapshots and present current results only for the matching owner, Quest, files, and source revision. Edits, owner changes, mode changes, cancellation, and navigation SHALL make prior results stale and release active work. A Run or Preview result SHALL never imply a passing Check or accepted completion. Check SHALL present bounded per-case feedback and an explicit local/unverified label.

#### Scenario: Learner edits after passing Check
- **WHEN** a learner changes a file after a passing local Check
- **THEN** the pass is stale and cannot be submitted as the current snapshot

#### Scenario: Learner navigates during execution
- **WHEN** the learner leaves the Quest during a run
- **THEN** active work is cancelled, late results are ignored, and owner-scoped drafts remain recoverable

### Requirement: Explicit submission preserves backend acceptance authority
Submit SHALL be explicit, authenticated, and tied to the exact current checked snapshot and published assessment version. The frontend SHALL preserve the source and stable event ID through uncertain responses and owner-scoped replay, prevent duplicate local sends, and distinguish local pass, pending replay, failed attempt, and backend-accepted personal-learning completion. Only an accepted backend response SHALL trigger trusted progress, XP, level, streak, and unlock refresh. The client SHALL NOT supply account identity, completion flags, totals, or timestamps as authority.

#### Scenario: Local pass is not submitted
- **WHEN** Check passes and the learner does not activate Submit
- **THEN** no account attempt, completion, reward, or unlock change is claimed

#### Scenario: Response is uncertain
- **WHEN** an authenticated Submit loses its response after sending
- **THEN** the original owner-bound event and source remain available for exact replay and no new event is invented

#### Scenario: Backend rejects an attempt
- **WHEN** the backend rejects a stale version, prerequisite, or malformed report
- **THEN** the learner sees the actual non-acceptance reason and can recover source without a false completion state

### Requirement: Quest navigation respects published order and availability
The lesson SHALL provide Back and Next controls using published Journey, Course, Chapter, and Quest order. Availability SHALL come from backend owner-scoped unlock state when authenticated and truthful provisional guest rules where applicable. A locked, unpublished, or unavailable next Quest SHALL show its reason and SHALL NOT be presented as completed or silently opened. Navigation SHALL preserve local drafts and identify unsaved source accurately.

#### Scenario: Next Quest is locked
- **WHEN** the current Quest has a published successor whose prerequisites are unmet
- **THEN** Next explains the lock and does not bypass backend unlock policy

#### Scenario: Learner returns to an earlier Quest
- **WHEN** the learner navigates Back and later reopens the current Quest on the same device and owner
- **THEN** the correct versioned local draft is restored without another account submission

### Requirement: Published interactive use requires exact-build review
An interactive-web Quest SHALL remain unavailable until its authored HTML/CSS/JavaScript subset and assessment have curriculum review and its integrated build has a dated technical/security review of the required browser containment, spoofing, bounds, hostile-loop recovery, and cleanup probes. The review SHALL identify commit/build, origins, browsers, failures, and untested setups. Development-route evidence alone SHALL NOT satisfy this publication gate.

#### Scenario: Development adapter exists without published review
- **WHEN** the interactive adapter passes tests on the standalone review route but the published integration lacks its review
- **THEN** no published Quest selects interactive mode
