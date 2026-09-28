# Guest Learning Specification

## Purpose

Let visitors practice the approved first four quests on one device and explicitly bring provisional work into a verified account without confusing local results with accepted learning.

## Requirements

### Requirement: Guest progression is limited and provisional

The frontend SHALL offer guest editing, Run, Check, and device-local provisional progress only for published guest-eligible Q01–Q04. A passing local Check SHALL persist a versioned source and validation snapshot with stable quest identity and event ID before claiming that provisional completion survived reload. Failed Checks and opened lessons MAY record local activity but SHALL NOT become provisional completion. Other quests SHALL require authentication for learning actions. Guest state SHALL never call protected learning endpoints, award account XP, count an accepted streak day, or claim authoritative unlocks.

#### Scenario: Guest passes a published eligible quest
- **WHEN** a signed-out visitor passes the local Check for published Q01–Q04 and local storage succeeds
- **THEN** the quest displays device-local provisional completion after reload, with a saved source and assessment version

#### Scenario: Guest storage fails
- **WHEN** a passing Check cannot be saved locally
- **THEN** the current source remains editable and no durable provisional-completion claim is shown

#### Scenario: Guest opens another quest
- **WHEN** a signed-out visitor opens a quest outside the published eligible Q01–Q04 subset
- **THEN** the client does not offer guest completion or import capture for that quest

### Requirement: Guest import is explicit and account-targeted

The authenticated UI SHALL show eligible local guest work separately from accepted account facts and SHALL require an explicit import action for the currently verified account. Signing in or switching accounts SHALL NOT import or reassign guest work automatically. The import SHALL submit immutable guest snapshots by stable quest ID and their original content and assessment versions through protected backend transport. It SHALL present each quest's accepted, already-completed, retry-required, or unavailable outcome, and refresh accepted account views only after backend success.

#### Scenario: Signup completes
- **WHEN** a guest signs up and reaches a verified account with local provisional work
- **THEN** the account offers import but no backend attempt, completion, XP, or streak is created until the learner chooses it

#### Scenario: Existing accepted account completion
- **WHEN** the account already has an accepted completion for the same stable quest
- **THEN** import does not replace accepted history or issue another first-completion reward

### Requirement: Import recovery preserves source and history

The importer SHALL preserve guest source and pending snapshots when authentication is unavailable, the network fails, a quest is unpublished, a version is incompatible, prerequisites are unmet, or a response is uncertain. Retrying the same snapshot SHALL reuse its stable event ID. Imported or already-completed outcomes SHALL remain visible without silently deleting guest source or forcing it into an account draft. A later explicit retry MAY submit a new current-version Check snapshot after the learner edits and checks against the current quest.

#### Scenario: Assessment changed
- **WHEN** an old guest snapshot is incompatible with the published assessment
- **THEN** import reports retry-required and keeps the exact old source and report available for recovery

#### Scenario: Response is lost
- **WHEN** the backend accepts an import but the client loses the response
- **THEN** retrying the same event yields the existing backend outcome without another reward or streak day

### Requirement: Imported dates and authority remain backend-owned

The backend SHALL use the verified principal as the import owner, resolve a published guest-eligible stable quest identity, and apply the same report normalization, version compatibility, prerequisite, idempotency, first completion, XP, streak, and unlock policies as an authenticated submission. Guest timestamps SHALL NOT determine backend acceptance or streak dates. Client-reported Check success SHALL be handled under the existing personal-learning trust policy and SHALL NOT be represented as independent grading.

#### Scenario: Old guest activity is imported
- **WHEN** a valid guest snapshot is first accepted days after its local capture
- **THEN** any qualifying streak day uses backend acceptance time in the learner's validated timezone, with no backdating
