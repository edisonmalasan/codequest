# JavaScript Foundations Specification

## Purpose

Provide the reviewed JavaScript Foundations instructional course through the existing versioned curriculum and isolated learning workspace.

## Requirements

### Requirement: Foundations delivers the approved instructional sequence

The published Foundations journey SHALL contain exactly Q01–Q24 in the seven approved chapters: Variables, Operators, Conditionals, Loops, Functions, Arrays & Objects, and Integration. Each quest after Q01 SHALL require the preceding stable quest ID; only Q01–Q04 SHALL be guest-eligible. Phase 29 SHALL NOT introduce the separately planned capstone or assessed DOM, events, asynchronous JavaScript, packages or network operations.

#### Scenario: Learner browses Foundations
- **WHEN** the published journey and chapters are read
- **THEN** all 24 instructional quests appear once in approved order with consistent prerequisites and no capstone

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
