## REMOVED Requirements

### Requirement: Map nodes do not enter unimplemented lesson behavior

**Reason**: Phase 12 now implements the lesson-reading route that this Phase 11 boundary intentionally withheld.

**Migration**: Replace the no-lesson behavior with the approved lesson-link behavior below while preserving locked-node and later-phase boundaries.

## ADDED Requirements

### Requirement: Map nodes enter only approved lesson reading behavior

Quest nodes SHALL communicate title, sequence, difficulty, reward metadata, guest eligibility, and map state where available. An active/current, available, or completed published node SHALL be a semantic link to `/quests/[slug]`; a locked node SHALL remain non-interactive. Following an enabled node SHALL enter only the Phase 12 lesson-reading experience and SHALL NOT edit starter code, run learner code, perform checks, submit attempts, accept completion, award XP, or change unlock state.

#### Scenario: Learner opens an eligible Quest

- **WHEN** the learner activates an available, active/current, or completed quest node
- **THEN** navigation opens that published Quest's lesson route with the node label and state available in text

#### Scenario: Learner inspects a locked Quest

- **WHEN** the learner focuses or reads a locked quest node
- **THEN** its label and locked state are available in text and it provides no lesson link or later-phase behavior
