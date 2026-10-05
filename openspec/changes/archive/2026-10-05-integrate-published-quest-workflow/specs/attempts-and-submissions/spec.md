# Spec Delta

## ADDED Requirements

### Requirement: Identified multi-file submission snapshots preserve existing learning policy
For a published multi-file Quest, the backend SHALL accept a versioned, canonical source bundle containing exactly the authored editable file IDs, languages, order, and bounded source text; it SHALL reject missing, duplicate, extra, malformed, oversized, or version-mismatched bundles before persistence. The existing single-file string submission and historical attempts SHALL remain readable and replayable unchanged. A bundle SHALL remain private owner-scoped attempt data within the existing source limit and exact event replay identity. The backend SHALL apply the same published case-ID, prerequisite, version, authentication, idempotency, first-completion, XP, streak, and personal-learning acceptance policies as single-file submissions; it SHALL NOT execute the files or treat client-reported success as independently verified.

#### Scenario: Multi-file report is submitted
- **WHEN** an authenticated learner submits a valid current bundle and complete local report for a published multi-file Quest
- **THEN** the backend records one immutable owner-bound attempt and decides personal-learning acceptance under its existing policy

#### Scenario: Bundle identity is altered on replay
- **WHEN** the same event ID is reused with changed file source, order, language, or version
- **THEN** the replay is rejected and no second attempt or reward is created

#### Scenario: Legacy attempt is read
- **WHEN** a learner reads a historical single-file attempt
- **THEN** its original source, report, event outcome, and ownership semantics are unchanged
