# Spec Delta

## MODIFIED Requirements

### Requirement: Learners can create and reopen independent bounded Builds

The frontend SHALL provide a production Builds entry separate from published lessons and SHALL allow a learner to create an original web Build from a reviewed starter. Each Build SHALL have a stable device-local identity, an owner scope, and an identified manifest containing exactly one HTML file, one JavaScript file, and optionally one CSS file. The learner SHALL be able to reopen an existing Build on the same device. The interface SHALL distinguish a device-local draft from an explicitly confirmed private account snapshot, including when cloud saving is pending, conflicted, or unavailable, and SHALL NOT describe either as published.

#### Scenario: Create and reopen a Build

- **WHEN** a learner creates a Build, edits two files, leaves the route, and returns on the same device under the same local owner
- **THEN** the Build retains its stable identity and restores its available drafts and active-file preference without changing a lesson draft

#### Scenario: Different owner opens Builds

- **WHEN** a different authenticated owner or guest bucket becomes active on the same browser
- **THEN** the previous owner's Build list and source are not displayed or modified

#### Scenario: Local edit follows a confirmed cloud save

- **WHEN** a learner edits a Build after its private account snapshot was confirmed
- **THEN** the interface identifies the current draft as local changes until another account save is confirmed
