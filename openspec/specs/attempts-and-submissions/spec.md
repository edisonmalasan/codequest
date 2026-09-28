# Attempts and Submissions Specification

## Purpose

Create private, durable learning attempts and submissions through an authenticated backend boundary while reserving personal-learning completion acceptance for NestJS policy.

## Requirements

### Requirement: Authenticated owner creates and reads attempts

The backend SHALL expose versioned protected operations to submit an attempt and read only the authenticated learner's attempt history for a published quest. It SHALL derive ownership solely from the verified principal, require a backend permission, and reject unexpected owner, completion, or authority fields. Missing authentication SHALL produce 401 and absent ownership or permission SHALL produce a safe denial.

#### Scenario: Forged owner is supplied
- **WHEN** a learner includes another user ID or completion decision in a submission payload
- **THEN** the request is rejected without writing another learner's records

#### Scenario: Learner reads history
- **WHEN** an authenticated learner reads attempts for a published quest
- **THEN** only that learner's bounded history and count are returned, with private source accessible only to its owner

### Requirement: Submission is bound to published quest and assessment context

The backend SHALL resolve the stable quest and its published content and assessment versions, require exact or explicitly supported compatible assessment context, and reject unknown, retired, mismatched, or unavailable quests before creating a new record. New attempt eligibility SHALL honor the active published prerequisite relationships and current-equivalent accepted prerequisite completions for the same owner under `learner-unlocks`. An exact idempotent event replay SHALL retain its original outcome without creating a new attempt even if publication changed.

#### Scenario: Version has changed
- **WHEN** a new submission names an unsupported version
- **THEN** it receives a safe current-version retry response and retains its source in the caller without creating completion

#### Scenario: Prerequisite is missing
- **WHEN** a learner submits a new report for a locked quest whose prerequisite they have not completed
- **THEN** the attempt is denied and no attempt or completion fact is written

#### Scenario: Prerequisite completion is incompatible
- **WHEN** an owner has only an accepted prerequisite completion incompatible with the current published prerequisite snapshot
- **THEN** a new dependent attempt is denied while historical completion remains durable

### Requirement: Immutable bounded snapshots and attempt counts

Each accepted request SHALL create at most one attempt with a server timestamp, stable quest/version reference, private immutable source snapshot, normalized bounded validation report, and owner-scoped client event ID. The backend SHALL return the attempt count for the owner and quest. Replaying the same event with the same payload SHALL return its original outcome without another attempt; replaying it with different content SHALL be rejected.

#### Scenario: Event is retried
- **WHEN** the same authenticated event and payload are submitted again
- **THEN** only one attempt exists, its original acceptance result is returned, and the current owner/quest attempt count is reported

#### Scenario: Source or report exceeds limits
- **WHEN** source exceeds 64 KiB or report fields exceed the validation contract bounds
- **THEN** the backend rejects the request before persistence and never logs source

### Requirement: Backend decides personal-learning completion

The backend SHALL treat the local validation report as untrusted input. It SHALL normalize the report, recompute the aggregate pass from the complete exact published case-ID set and terminal statuses, enforce the supported assessment version and uniqueness, and only then MAY create one accepted personal-learning completion for the owner and stable quest. It SHALL NOT represent client results as independently verified execution proof or execute learner source in NestJS. Failed and malformed reports SHALL never create completion. The response SHALL distinguish reported local outcome from backend acceptance.

#### Scenario: Client claims pass with incomplete case list
- **WHEN** a report says `passed: true` but omits or fails a published case
- **THEN** the backend rejects or records a nonpassing attempt and creates no completion

#### Scenario: All published cases are reported passing
- **WHEN** a valid current-version report covers all published cases with terminal passes and prerequisites are met
- **THEN** the backend may accept one personal-learning completion under ADR 0005 and identifies that acceptance as client-reported

#### Scenario: Passing retry after completion
- **WHEN** an owner submits another eligible passing attempt after completion
- **THEN** the new attempt may be recorded but no second completion is created

### Requirement: Phase 17 has no later learning side effects

Attempt creation and completion acceptance SHALL NOT compute progress aggregates, issue rewards beyond the specified first-completion XP event and qualifying streak day, or unlock content. First accepted completion SHALL atomically award the Phase 19 quest XP event under the `quest-xp` specification and MAY create one Phase 21 qualifying day under the `learner-streaks` specification; no other attempt SHALL award XP or create a streak day. Local Run and Check SHALL remain browser-isolated feedback and SHALL NOT submit automatically. No LLM grading or remote runner SHALL be introduced.

#### Scenario: Local check passes
- **WHEN** a local Check returns passing feedback without an explicit authenticated Submit
- **THEN** no backend learning, XP, or streak record changes
