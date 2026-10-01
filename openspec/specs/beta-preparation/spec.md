# beta-preparation Specification

## Purpose

Give prospective beta learners a clear first-use path while keeping unapproved feedback collection and release decisions visibly gated by evidence.

## Requirements

### Requirement: First-use path explains guest and account learning
The public start experience SHALL link to the published journey, sign-in and a short onboarding explanation of guest device-local provisional progress, the Q01–Q04 guest limit, and explicit authenticated import. It SHALL not describe local Check or guest completion as authoritative account progress.

#### Scenario: New visitor starts as guest
- **WHEN** a new visitor opens onboarding
- **THEN** they can reach the published learning journey and understand that guest work remains on this device until explicit import after sign-up

### Requirement: Feedback remains local until policy approval
The feedback form SHALL accept a bounded text draft, preserve it only in the current browser, permit clearing it, and plainly state that CodeQuest has not received it. It SHALL make no network request or telemetry event containing the draft. A failed local save SHALL leave the text visible for copying and report the failure.

#### Scenario: Visitor drafts feedback
- **WHEN** a visitor types feedback and navigates away after a successful local save
- **THEN** the same browser can recover the draft without it being submitted to CodeQuest

#### Scenario: Storage fails
- **WHEN** device storage rejects a draft write
- **THEN** the editor keeps the current text and presents a recoverable error without claiming it was saved or sent

### Requirement: Beta readiness has explicit evidence gates
The repository SHALL record for each Phase 38 obligation its owner, repeatable evidence or external verification step, status and release decision. F06 legal terms, privacy, consent, retention and deletion, hosted backup and restore, live security configuration, migration rehearsal, analytics and monitoring approval, F02 device/accessibility checks, and F04/F05 balancing and evaluation choices SHALL remain open until actual evidence exists. The project SHALL not declare private beta ready or invite real learners based solely on local tests or placeholders.

#### Scenario: Repository checks pass without hosted evidence
- **WHEN** CI passes but F06 or hosted restore evidence is absent
- **THEN** the readiness record still says no go and names the missing owner action

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
