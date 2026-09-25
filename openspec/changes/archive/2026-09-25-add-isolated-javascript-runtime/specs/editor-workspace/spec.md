## MODIFIED Requirements

### Requirement: Runtime-facing panels remain truthful presentation surfaces

The workspace SHALL accept an optional execution adapter. Without one, ConsolePanel and RuntimeStatus SHALL retain explicit unavailable states and no Run control SHALL be enabled. With one, workspace actions SHALL expose Run and Cancel, execute only the current active-file source snapshot, and drive bounded console lines and runtime states through the existing presentation surfaces. TestResults SHALL remain inactive, and no runtime result SHALL be treated as a Check, submission, completion, or progress decision.

#### Scenario: Workspace opens before runtime integration

- **WHEN** no execution adapter is supplied
- **THEN** the panels state that execution and checks are unavailable and no Run, Check, Submit, pass, or completion control is enabled

#### Scenario: Parent supplies display-only diagnostics

- **WHEN** no execution adapter is supplied and a parent supplies bounded status, console lines, or test-result display data
- **THEN** the panels render that data as text without executing source or treating it as authoritative progress

#### Scenario: Learner runs the active source

- **WHEN** an adapter is supplied and the learner activates Run
- **THEN** the workspace submits an immutable snapshot of the active file, announces running then terminal status, and renders only the correlated bounded result through ConsolePanel and RuntimeStatus

#### Scenario: Learner cancels an active run

- **WHEN** execution is active and the learner activates Cancel
- **THEN** the workspace aborts that run, announces cancellation, preserves source and drafts, and permits a fresh run

### Requirement: Phase 13 excludes learning authority and execution

The Editor Workspace SHALL remain independent from curriculum and learning authority. Its Phase 13 baseline SHALL execute nothing when no adapter is supplied; its optional Phase 14 adapter SHALL add only browser JavaScript Run/Cancel and runtime presentation. The workspace SHALL NOT add or change backend endpoints, generated API clients, authentication behavior, curriculum publication or lesson integration, web preview, deterministic validation, attempts, submissions, completion acceptance, progress, XP, levels, streaks, unlocks, analytics, PWA behavior, cloud draft sync, or Phase 15+ behavior.

#### Scenario: Phase boundary is reviewed

- **WHEN** the completed Phase 14 diff and browser behavior are inspected
- **THEN** the learner can edit, save, reset, run, cancel, and inspect runtime output but cannot preview HTML, check, submit, complete, or earn from it
