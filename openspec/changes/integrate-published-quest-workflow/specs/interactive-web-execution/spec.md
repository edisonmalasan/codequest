# Spec Delta

## ADDED Requirements

### Requirement: Published interactive integration is reviewed separately
R07 MAY land the integrated lesson host while production interactive Quest selection remains disabled. Before R08 selects an original interactive Quest for publication, the exact integrated lesson build SHALL pass the existing containment and recovery probes through the published route and a dated curriculum and technical/security review SHALL accept the declared beginner DOM/event subset, network/storage restrictions, and assessment behavior. The review SHALL identify the exact commit/build, origin topology, browser versions, failed and untested probes, and the selected content/assessment versions. Any change to the adapter, origin policy, selected snapshot, or host integration that affects a probe SHALL require an affected-probe retest before publication. This gate SHALL NOT be inferred from standalone development evidence, CI alone, or later Phase 38 hosted/physical verification.

#### Scenario: Published-route recovery fails
- **WHEN** a hostile loop on the published route fails to terminate or a following finite run misses the approved recovery bound
- **THEN** interactive publication remains blocked and the failure is retained in the evidence record

#### Scenario: R07 integration lands before original content review
- **WHEN** the integrated host is deployed without a selected and reviewed R08 interactive Quest and its exact-build evidence
- **THEN** production interactive Quest selection remains disabled

#### Scenario: Published-route review passes
- **WHEN** the exact integrated build and authored versions pass the declared probes and are explicitly reviewed
- **THEN** only those reviewed compatible Quest snapshots may opt into the interactive mode; backend completion still requires explicit Submit
