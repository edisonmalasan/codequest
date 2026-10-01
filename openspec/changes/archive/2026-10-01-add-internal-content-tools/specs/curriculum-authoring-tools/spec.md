# Spec Delta

## Purpose

Give curriculum authors a local, reviewable validation, preview, and deterministic test loop for Git-authored snapshots before explicit publication.

## ADDED Requirements

### Requirement: Existing Git curriculum gate remains the authoring validator

The authoring tools SHALL run the existing full-tree structural, reference, version, publication, and immutable-history checks from a repeatable command without requiring production credentials. Invalid content SHALL fail nonzero with a bounded diagnostic naming the authored path and safe reason. A targeted preview or test SHALL also validate the authored tree before using it and SHALL NOT bypass the publication gate.

#### Scenario: Invalid snapshot is inspected
- **WHEN** an authored Quest has a missing file, invalid case, or broken version reference
- **THEN** the validator and targeted tools reject it with a path-specific reason and no preview or test success claim

#### Scenario: Existing reviewed tree is checked
- **WHEN** the current Git curriculum and history are valid
- **THEN** the authoring command exits successfully without modifying any source or publication selection

### Requirement: Quest preview shows a selected authored snapshot safely

An author SHALL be able to select an authored Quest by stable identity or slug and an explicit content version, or intentionally choose its current authored version. The local preview SHALL show the selected version's lesson, starter source, objective, hints, declarative cases, prerequisites, hierarchy, and content/assessment versions with a conspicuous draft or publication label. It SHALL treat lesson text and local assets as inert content, reject unsafe paths, and make no draft snapshot available through the learner API.

#### Scenario: Unpublished Quest is previewed
- **WHEN** an author selects a valid unselected Quest snapshot
- **THEN** the preview renders that exact authored snapshot, labels it unapproved/unpublished, and leaves `publication.yaml` unchanged

#### Scenario: Snapshot selection is invalid
- **WHEN** the requested Quest is ambiguous, absent, or has no requested version
- **THEN** preview fails with a bounded selection error rather than showing another version

### Requirement: Course preview reflects authored hierarchy and publication state

An author SHALL be able to preview an authored Journey, also called Course in the UI, as an ordered chapter and Quest outline with stable identities, current authored versions, prerequisite relationships, review status, and exact published selection where present. The preview SHALL distinguish authored drafts from the currently approved manifest and SHALL NOT infer learner unlocks, progress, or availability from authoring metadata.

#### Scenario: Draft Journey is previewed
- **WHEN** a valid authored Journey contains a Quest not selected for publication
- **THEN** the outline shows the Quest as authored but unselected and does not imply it is playable

### Requirement: Targeted candidate tests use the isolated local Check contract

An author SHALL be able to run a bounded candidate JavaScript source file against an explicitly selected authored Quest snapshot's ordered declarative cases. The runner SHALL use the established credential-free browser Worker validation boundary and report an ordered per-case result, overall outcome, version identity, and bounded feedback. It SHALL support expected-pass and expected-fail assertions for reference, alternative, and defect fixtures; a mismatch, timeout, malformed source, or invalid snapshot SHALL exit nonzero. It SHALL NOT execute candidate source in NestJS, a Node authoring process, or the authenticated application origin.

#### Scenario: Reference and alternative sources pass
- **WHEN** two valid candidate sources are separately run against the same selected cases with expected-pass
- **THEN** both runs report all cases passed with independent fresh Workers

#### Scenario: Deliberate defect is rejected
- **WHEN** a defective candidate is run with expected-fail
- **THEN** the command succeeds only after at least one case fails and reports the failed case IDs

#### Scenario: Hostile candidate loops
- **WHEN** candidate source loops indefinitely
- **THEN** the runtime terminates within its existing bound, reports timeout, preserves source, and a later finite candidate can run

### Requirement: Authoring tools never change learner authority

Previews and candidate tests SHALL be local read-only author workflows. They SHALL NOT mutate Git snapshots, publication selection, application database tables, attempts, submissions, completion, progress, XP, streaks, or unlocks; SHALL NOT create production author endpoints; and SHALL NOT claim that a passing candidate proves pedagogical quality or production approval. Publication still requires the existing explicit curriculum and technical review.

#### Scenario: Candidate passes every case
- **WHEN** the authoring test runner reports all cases passed
- **THEN** no learner record or publication state changes and the result remains local review evidence only
