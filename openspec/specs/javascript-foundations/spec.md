# JavaScript Foundations Specification

## Purpose

Provide the reviewed JavaScript Foundations instructional course through the existing versioned curriculum and isolated learning workspace.

## Requirements

### Requirement: Foundations delivers the approved instructional sequence

The published Foundations journey SHALL contain exactly 24 instructional quests Q01–Q24 in the seven approved chapters: Variables, Operators, Conditionals, Loops, Functions, Arrays & Objects, and Integration. Each quest after Q01 SHALL require the preceding stable quest ID; only Q01–Q04 SHALL be guest-eligible. Phase 29 SHALL NOT introduce the separately planned capstone or assessed DOM, events, asynchronous JavaScript, packages or network operations.

#### Scenario: Learner browses Foundations
- **WHEN** the published journey and chapters are read
- **THEN** all 24 instructional quests appear once in approved order with consistent prerequisites; a separately approved Phase 30 capstone SHALL follow Q24 without being counted among the instructional quests

### Requirement: Each quest supplies an explicit accessible learning contract

Every selected quest SHALL include its mapped outcome, objective, conceptual explanation, worked example, concrete task, starter source, graduated question/concept/next-step hints, provisional reward metadata, and declared deterministic normal and boundary expectations. Lesson text SHALL distinguish Run, local unverified Check, guest provisional progress and authenticated backend acceptance. Required formatting, input domains, return types and boundaries SHALL be stated before checking. Reflection and test-reasoning prompts SHALL be clearly ungraded, without claiming deterministic checks establish reasoning quality.

#### Scenario: Beginner starts a quest
- **WHEN** the selected lesson is opened
- **THEN** the learner can identify the task, expected behavior, permitted input domain, starter and hints without relying on an untaught assessed concept

### Requirement: Checks remain behavioral and bounded

Console quests SHALL compare declared complete output, including explicitly supplied normal/boundary examples. Function quests SHALL check named functions on varied declared inputs, including empty, zero or threshold cases where applicable. Valid alternative implementations SHALL pass equivalent behavior; grading SHALL NOT require a particular source shape. All definitions SHALL fit existing runtime and report limits, and failures SHALL offer actionable feedback. Browser-visible tests SHALL NOT be described as secret, independently graded or authoritative.

#### Scenario: Alternative and defective solutions are checked
- **WHEN** reviewed reference, behaviorally equivalent alternative and deliberately defective sources run in the existing isolated browser runtime
- **THEN** reference and alternative sources pass the declared cases, defective sources fail, and source is never executed in NestJS or static authoring validation

### Requirement: Publication preserves history and review evidence

The full instructional inventory SHALL be selected only after recorded instructional and technical review passes, including isolated reference checks. Review documentation SHALL identify AI-assisted self-review honestly and retain open learner-feedback and beta-balancing obligations. Q01 1.0.0 SHALL remain immutable and unselected; the new editorial snapshot SHALL preserve its original assessment with explicit approved compatibility. Content versions SHALL NOT create new completion or XP identities. F04 values SHALL remain explicitly provisional, and repository publication SHALL NOT imply deployment, F06 approval or physical-device evidence.

#### Scenario: Course is selected
- **WHEN** the reviewed publication manifest is loaded
- **THEN** the complete selected inventory is API-visible, the original Q01 bytes remain unchanged, and only its new selected snapshot is served

#### Scenario: Guest learns with published content
- **WHEN** a signed-out learner checks Q01–Q04 successfully and local persistence succeeds
- **THEN** only device-local provisional records are created and no protected learning request, account reward or accepted completion occurs

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
