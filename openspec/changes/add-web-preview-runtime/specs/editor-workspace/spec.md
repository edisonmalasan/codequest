# Spec Delta

## ADDED Requirements

### Requirement: Workspace accepts optional web preview integration

The Editor Workspace SHALL accept an optional lesson-independent preview adapter for parent-supplied HTML, CSS, and JavaScript files. With an adapter, the workspace SHALL expose Preview and Reload actions and a named preview surface without replacing the existing JavaScript Run/Cancel path. Without an adapter, preview controls SHALL remain unavailable. Preview SHALL capture the current multi-file snapshot, preserve local drafts on success or failure, and render bounded status and errors as text. The workspace SHALL NOT infer curriculum rules from file names or treat a preview as a Check, submission, completion, progress, or reward decision.

#### Scenario: Parent enables web preview
- **WHEN** a parent supplies compatible files and a preview adapter
- **THEN** the learner can preview a captured HTML/CSS/JavaScript snapshot while the existing editor, draft, Run, and Cancel behaviors remain independent

#### Scenario: Preview adapter is absent
- **WHEN** the workspace is rendered without a preview adapter
- **THEN** no preview document runs and no Preview or Reload action is enabled

#### Scenario: Preview fails
- **WHEN** preview generation, loading, or rendering fails
- **THEN** the workspace announces a bounded failure and retains every editable source and local draft

## MODIFIED Requirements

### Requirement: Phase 13 excludes learning authority and execution

The Editor Workspace SHALL remain independent from curriculum and learning authority. Its Phase 13 baseline SHALL execute nothing when no adapter is supplied; its optional Phase 14 adapter SHALL add only browser JavaScript Run/Cancel and runtime presentation; its optional Phase 15 preview adapter SHALL add only sandboxed browser preview generation and presentation. The workspace SHALL NOT add or change backend endpoints, generated API clients, authentication behavior, curriculum publication or lesson integration, deterministic validation, attempts, submissions, completion acceptance, progress, XP, levels, streaks, unlocks, analytics, PWA behavior, cloud draft sync, or Phase 16+ behavior.

#### Scenario: Phase boundary is reviewed
- **WHEN** the completed Phase 15 diff and browser behavior are inspected
- **THEN** the learner can edit, save, reset, optionally run and cancel isolated JavaScript, and optionally preview HTML/CSS/JavaScript, but cannot check, submit, complete, or earn from any preview result
