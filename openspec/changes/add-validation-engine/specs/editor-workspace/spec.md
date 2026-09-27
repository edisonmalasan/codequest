# Spec Delta

## ADDED Requirements

### Requirement: Workspace supports optional local validation

The Editor Workspace SHALL accept an optional lesson-independent validation strategy and definition from its parent. With both supplied and an active JavaScript file, Check SHALL capture the current source snapshot and present correlated, bounded per-case results in TestResults with an explicit local/unverified label and elapsed time. Run and Preview SHALL remain separate actions; a successful Run or Preview SHALL NOT imply a passing Check. Without validation inputs, Check SHALL remain unavailable. Editing, reset, owner change, cancellation, or unmount SHALL prevent stale check results from presenting as current, preserve local drafts, and release validation resources.

#### Scenario: Check evaluates active source
- **WHEN** a learner activates Check with a valid strategy and JavaScript file
- **THEN** the workspace announces checking, then presents the current snapshot's ordered local case outcomes and feedback

#### Scenario: Source changes during check
- **WHEN** a learner edits after Check captures source
- **THEN** the old result cannot appear as a current pass and the new source remains editable and locally saved

#### Scenario: Validation is unavailable
- **WHEN** no strategy or definition is supplied
- **THEN** the workspace retains the inactive TestResults state and does not enable Check or make a completion claim
