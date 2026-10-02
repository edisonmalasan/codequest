# Spec Delta

## MODIFIED Requirements

### Requirement: Phase 12 remains a reading capability

The completed Phase 12 lesson-rendering change SHALL remain a safe, inert reading capability when used alone. In the later approved integrated Quest shell, the same published lesson and hints SHALL remain usable beside an independently owned coding workspace. Rendering lesson Markdown SHALL NOT itself execute source, expose hidden assessment data, submit an attempt, accept completion, compute or award XP, or change unlock state. Editor, runtime, Check, and explicit submission behavior SHALL remain governed by their separate capabilities.

#### Scenario: Phase boundary is reviewed

- **WHEN** the completed Phase 12 diff and browser behavior are inspected
- **THEN** the learner can read published instructional content and hints but cannot edit, run, check, submit, complete, or earn from the lesson renderer alone

#### Scenario: Lesson joins an integrated workspace

- **WHEN** a published Quest renders its lesson in the integrated shell
- **THEN** the same inert lesson and learner-controlled hints remain readable beside the workspace without causing execution or a learning write
