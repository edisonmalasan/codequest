# Spec Delta

## ADDED Requirements

### Requirement: Static preview remains the default bounded mode

The existing static PreviewAdapter SHALL continue to render HTML/CSS in its script-disabled sandbox and compute optional JavaScript separately in the Phase 14 Worker. Introducing a separate opt-in interactive adapter SHALL NOT add script permission, DOM mutation, external loading, or an implicit mode switch to a static preview. A caller SHALL identify the intended mode before sending a snapshot, and unavailable interactive execution SHALL not downgrade to unannounced static or unsafe execution.

#### Scenario: Existing static caller previews code

- **WHEN** a caller supplies the current static PreviewAdapter and HTML, CSS, and JavaScript files
- **THEN** the page remains script-disabled and JavaScript output remains separate text

#### Scenario: Interactive mode is unavailable

- **WHEN** a caller explicitly requests interactive execution but its safety prerequisites are unavailable
- **THEN** the caller receives a clear unavailable result without changing the static preview's permissions
