# Spec Delta

## ADDED Requirements

### Requirement: Guest import submits by stable published quest identity

The backend SHALL expose a versioned protected import operation keyed by stable quest ID for the approved guest subset. It SHALL derive the owner only from the verified principal, reject browser-supplied owner or completion fields, resolve the current published guest-eligible quest, and pass the source, original versions, report, and stable event ID through the same submission acceptance path. An existing accepted completion SHALL not be overwritten or rewarded again. Unsupported, retired, or locked quest work SHALL receive a safe rejection without deleting caller-held source. The operation SHALL appear in OpenAPI and the generated frontend client.

#### Scenario: Guest import names another owner
- **WHEN** an import request supplies another owner ID or completion decision
- **THEN** it is rejected without writing either account's learning records

#### Scenario: Current published guest quest is imported
- **WHEN** a verified learner imports a valid Q01–Q04 snapshot by stable quest ID
- **THEN** normal submission policy decides the result and any first-completion side effects use backend acceptance time

#### Scenario: Quest is not in the guest subset
- **WHEN** an import names an unpublished or non-guest-eligible quest ID
- **THEN** no attempt, completion, XP, or streak fact is created
