# Spec Delta

## ADDED Requirements

### Requirement: The selected JavaScript course receives an exact-version quality review

Before the existing JavaScript Foundations Course is advanced beyond technical implementation, all selected Q01–Q24 and CAP01 snapshots SHALL be reviewed together for coherent outcome and prerequisite progression, original and accessible explanations, a concrete learner task, useful worked examples, graduated hints, starter behavior, declared normal and boundary checks, actionable failure feedback, and a meaningful final-project transfer task. The review SHALL name each selected content and assessment version, record findings or an explicit no-change decision per Quest, and identify the exact integrated build used for verification. A published version with a material finding SHALL be replaced through a reviewed immutable snapshot and explicit compatibility decision before this quality gate passes; unchanged historical snapshots SHALL remain available. Automated checks or AI-assisted review alone SHALL NOT be described as founder acceptance or observed learning efficacy.

#### Scenario: A selected lesson has an unclear contract
- **WHEN** the course review finds that the task, allowed input, expected result, or Check feedback is unclear for a selected Quest
- **THEN** the quality gate remains open until a reviewed new snapshot resolves the finding and the selected version is verified in the learner flow

#### Scenario: An assessment criterion changes
- **WHEN** a quality correction changes a selected Quest's deterministic pass criteria
- **THEN** the assessment version and compatibility decision are updated explicitly, prior accepted completion and XP remain intact, and stale pending work receives the existing source-preserving retry path

#### Scenario: Course is traversed after review
- **WHEN** the selected Course is tested from entry through CAP01 on an exact integrated build
- **THEN** reference and valid alternative sources pass, deliberate defects fail, the learner can Run, Check, use hints, submit, move Next, resume source, and observe only backend-accepted progress and rewards under the existing authority boundary

#### Scenario: Technical review passes without founder review
- **WHEN** all local authoring, browser, and repository checks pass but the founder has not accepted the selected Course build
- **THEN** technical publication may be recorded, while founder acceptance and release readiness remain open under the product-readiness gates
