# Spec Delta

## ADDED Requirements

### Requirement: Authors can test static HTML and CSS candidates locally
The targeted authoring candidate command SHALL accept a bounded HTML/CSS snapshot for an explicitly selected static web Quest version and run its ordered declarative cases through the same local Check contract used by learners. It SHALL report version identity, case results, overall outcome, and bounded feedback for expected-pass reference and alternative candidates and expected-fail defects. It SHALL reject an invalid authored snapshot, unsafe candidate, timeout, or outcome mismatch with a nonzero exit. It SHALL NOT execute learner source in NestJS or a Node authoring process, write application learning records, or alter publication selection.

#### Scenario: Two valid candidate pages pass
- **WHEN** an author tests independent reference and alternative HTML/CSS snapshots against one selected Quest version
- **THEN** both receive ordered passing cases from the browser local Check without a submission

#### Scenario: Deliberate CSS defect is detected
- **WHEN** a candidate omits or mis-scopes a declared CSS rule and expected-fail is requested
- **THEN** at least one relevant case fails and no publication state changes
