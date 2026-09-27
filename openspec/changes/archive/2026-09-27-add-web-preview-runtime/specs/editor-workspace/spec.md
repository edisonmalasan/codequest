# Spec Delta

## ADDED Requirements

### Requirement: Workspace accepts optional static web preview integration

The Editor Workspace SHALL accept an optional lesson-independent preview adapter for parent-supplied HTML, CSS, and JavaScript files. With an adapter, the workspace SHALL expose Preview and Reload actions and a named static preview surface. HTML and CSS SHALL display in a script-disabled sandboxed iframe; JavaScript computation SHALL remain in the isolated Worker with bounded text output and SHALL NOT modify or access the preview DOM. Without a preview adapter, Preview and Reload SHALL remain unavailable. The workspace SHALL capture a multi-file snapshot, preserve local drafts on success or failure, and SHALL NOT infer curriculum rules or treat preview output as a Check, submission, completion, progress, or reward decision.

#### Scenario: Parent enables web preview

- **WHEN** a parent supplies compatible files and a preview adapter
- **THEN** the learner can display the captured HTML/CSS snapshot and inspect separate JavaScript computation output while existing edit, draft, Run, and Cancel behavior remains independent

#### Scenario: Preview adapter is absent

- **WHEN** the workspace is rendered without a preview adapter
- **THEN** no preview document runs and no Preview or Reload action is enabled

#### Scenario: Preview fails

- **WHEN** preview generation, loading, or computation fails
- **THEN** the workspace announces a bounded failure and retains every editable source and local draft

## MODIFIED Requirements

### Requirement: Phase 13 excludes learning authority and execution

The Editor Workspace SHALL remain independent from curriculum and learning authority. Its Phase 13 baseline SHALL execute nothing when no adapter is supplied; its optional Phase 14 adapter SHALL add only browser JavaScript Run/Cancel and runtime presentation; its optional Phase 15 preview adapter SHALL add only script-disabled HTML/CSS presentation and separately isolated JavaScript computation. The workspace SHALL NOT add or change backend endpoints, generated API clients, authentication behavior, curriculum publication or lesson integration, DOM scripting, deterministic validation, attempts, submissions, completion acceptance, progress, XP, levels, streaks, unlocks, analytics, PWA behavior, cloud draft sync, or Phase 16+ behavior.

#### Scenario: Phase boundary is reviewed

- **WHEN** the completed Phase 15 diff and browser behavior are inspected
- **THEN** the learner can edit, save, reset, run isolated JavaScript, and display static HTML/CSS with separate bounded computation output, but cannot run JavaScript in the preview DOM, check, submit, complete, or earn from preview
