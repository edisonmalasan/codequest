# Spec Delta

## ADDED Requirements

### Requirement: Published Quest selects a reviewed exercise descriptor
The selected published snapshot SHALL identify one bounded exercise mode, an ordered set of stable file IDs, names, languages and starter source, and the compatible declarative assessment. Publication validation SHALL reject duplicate or unsafe file identities, unsupported modes, invalid combinations, oversized source, unsupported check definitions, and missing mode-specific review evidence before serving the Quest. The current single-file JavaScript response SHALL remain valid and be interpreted as one JavaScript exercise; existing published quest and assessment versions SHALL keep their meanings. Public responses SHALL expose no draft snapshots, protected tests, credentials, or server execution hooks.

#### Scenario: Legacy Quest is requested
- **WHEN** an existing JavaScript snapshot without a new descriptor is read
- **THEN** the API retains its current starter code and case contract and the client may form one stable JavaScript file

#### Scenario: Multi-file Quest is requested
- **WHEN** a reviewed web exercise is selected for publication
- **THEN** the API returns its exact mode, file order and identities, versions, and browser-visible declarative cases through OpenAPI

#### Scenario: Invalid authored descriptor is selected
- **WHEN** the publication manifest selects unsupported files, cases, or mode combinations
- **THEN** startup and curriculum checks fail before the snapshot is exposed
