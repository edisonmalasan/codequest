# Spec Delta

## ADDED Requirements

### Requirement: Workspace may present an optional interactive web adapter

The reusable Editor Workspace SHALL accept an optional, lesson-independent interactive web adapter for compatible identified files without replacing its existing static preview, JavaScript Run, local Check, draft, or explicit Submit contracts. It SHALL label the selected mode, display correlated preview/output/error states, preserve every source and local draft across mode changes or failures, and keep preview actions distinct from Check and backend-accepted completion. Without a supplied and available interactive adapter, its interactive control SHALL remain unavailable.

#### Scenario: Parent enables interactive exercise

- **WHEN** a compatible parent supplies the interactive adapter and files
- **THEN** the learner can Run a captured interactive snapshot, inspect its bounded display and console, and return to editing without losing source

#### Scenario: Parent omits the adapter

- **WHEN** the workspace has only its current static preview or JavaScript execution adapter
- **THEN** those modes retain their existing behavior and no interactive DOM action is enabled
