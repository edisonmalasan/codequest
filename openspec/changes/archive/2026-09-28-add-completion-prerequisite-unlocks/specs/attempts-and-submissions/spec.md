# Spec Delta

## MODIFIED Requirements

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
