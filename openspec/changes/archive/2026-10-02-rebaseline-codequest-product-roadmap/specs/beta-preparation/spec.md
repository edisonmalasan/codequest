# Spec Delta

## ADDED Requirements

### Requirement: Product completion precedes beta release-gate execution
Phase 38 release-gate execution SHALL remain paused and its decision SHALL remain `NO GO` while the approved V1 product is being completed and integrated. The existing gate-closure change, F04/F05 owner decisions, F06 open decisions, and all hosted and physical evidence obligations SHALL remain intact. The project SHALL resume the Phase 38 release review only after all advertised V1 capabilities are founder accepted and an exact release candidate is appropriate to select; later changes that invalidate evidence SHALL trigger retest.

#### Scenario: Historical technical preparation is archived
- **WHEN** Phase 38 technical preparation is archived but V1 learning or authentication still fails Founder Acceptance
- **THEN** release-gate execution stays paused, readiness remains `NO GO`, and no learner invitation is authorized

#### Scenario: Founder Acceptance passes
- **WHEN** the founder accepts the complete integrated V1 on a candidate build
- **THEN** the existing Phase 38 gate-closure workflow may resume against that exact candidate, without presuming F06 approval or hosted and physical checks passed

### Requirement: Private beta and production follow recorded decisions
Real private-beta recruitment and collection SHALL occur only after product completion, integration, Founder Acceptance, and every blocking Phase 38 release-readiness row is closed with actual applicable evidence and owner approval. Production release SHALL additionally require beta findings to be reviewed, required corrections accepted, and a separate production-ready decision. Synthetic study preparation SHALL NOT be represented as a completed real beta.

#### Scenario: Study protocol exists without release approval
- **WHEN** a synthetic private-beta protocol and passing CI exist but a blocking release row remains open
- **THEN** private beta has not started and production readiness cannot be claimed
