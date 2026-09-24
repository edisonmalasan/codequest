# Editor Workspace Specification

## Purpose

Provide a reusable, lesson-independent frontend workspace for editing and preserving source while later execution, validation, and submission capabilities remain absent.

## Requirements

### Requirement: Workspace composition is reusable and externally configured

The frontend SHALL provide an Editor Workspace composed from an editor toolbar, file tabs, code editor, console panel, test-results panel, runtime-status surface, and workspace actions. A parent SHALL supply stable owner and workspace identities plus one or more files with stable IDs, display names, language, and starter source. The workspace SHALL NOT fetch curriculum, infer lesson rules, or require a specific Quest.

#### Scenario: Standalone workspace is rendered

- **WHEN** a parent supplies a workspace identity and JavaScript files
- **THEN** the complete workspace renders from those inputs without a lesson route, API request, backend import, or curriculum-specific rule

#### Scenario: Workspace has no files

- **WHEN** a parent supplies an empty file list
- **THEN** the workspace presents an explicit non-editable empty state and does not create a draft

### Requirement: File tabs preserve separate editable source

File tabs SHALL expose the active file and allow keyboard and pointer selection without losing unsaved in-memory edits in other files. Tabs SHALL use semantic tab relationships and arrow, Home, and End navigation. The active editor SHALL announce the selected filename and language.

#### Scenario: Learner switches files

- **WHEN** the learner edits one file, selects another file, and returns
- **THEN** each file retains its own current source and the selected tab remains programmatically identifiable

#### Scenario: Learner navigates tabs by keyboard

- **WHEN** focus is in the file tab list and the learner uses arrow, Home, or End keys
- **THEN** focus and the active editor move to the corresponding file in the supplied order

### Requirement: Code editing provides the approved authoring baseline

The code editor SHALL provide JavaScript syntax highlighting, line numbers, conventional indentation including Tab and Shift+Tab, bounded JavaScript autocomplete, and controlled source updates. Editor text SHALL use the code typeface, preserve browser and assistive-technology operability, and SHALL NOT execute source or interpret it as trusted markup.

#### Scenario: Learner authors JavaScript

- **WHEN** the learner types, indents, and requests completion in a JavaScript file
- **THEN** the editor updates the active source with visible line numbers, JavaScript highlighting, indentation behavior, and relevant bounded completion options

#### Scenario: Parent replaces a file snapshot

- **WHEN** the parent supplies a newer source snapshot for the active stable file identity
- **THEN** the editor reconciles to that snapshot without remounting the entire workspace or invoking learner code

### Requirement: Drafts autosave locally with explicit status and owner isolation

The workspace SHALL autosave changed file source to IndexedDB after editing settles and SHALL support an explicit Save action. Draft records SHALL be scoped by owner, workspace, and file identities; loading one owner or workspace SHALL NOT expose another's source. The workspace SHALL distinguish unsaved, saving, saved, and failed local-save states, retain in-memory source after a failure, and SHALL NOT claim cloud backup or synchronization.

#### Scenario: Returning learner restores a local draft

- **WHEN** the same owner and workspace reopen a file with a saved local draft
- **THEN** the workspace restores that draft instead of starter source and identifies it as locally saved

#### Scenario: Local save fails

- **WHEN** IndexedDB rejects an autosave or explicit save
- **THEN** the current source remains editable, the workspace reports that local saving failed, and no cloud or accepted-progress claim is made

#### Scenario: Another owner opens the same workspace

- **WHEN** a different owner opens the same workspace and file IDs
- **THEN** the first owner's draft is not loaded or modified

### Requirement: Reset is deliberate and limited to editable source

Workspace reset SHALL restore the selected file's supplied starter source. If the current source differs from starter source, reset SHALL require an accessible confirmation that names the file and explains that local edits will be replaced. Cancelling SHALL preserve the current source; confirming SHALL update the editor and local draft without changing curriculum, progress, or rewards.

#### Scenario: Learner cancels reset

- **WHEN** the learner requests reset for a modified file and cancels the confirmation
- **THEN** the edited source and draft remain unchanged

#### Scenario: Learner confirms reset

- **WHEN** the learner confirms reset for a modified file
- **THEN** only that file returns to its supplied starter source and the reset source becomes the current local draft

### Requirement: Workspace shortcuts are discoverable and scoped

The workspace SHALL expose its supported keyboard shortcuts in the interface and handle them only while focus is within that workspace. Save SHALL support Control+S on Windows/Linux and Command+S on macOS. Reset confirmation SHALL have a documented non-browser-reserved shortcut. Shortcuts SHALL NOT simulate Run, Check, Submit, or completion.

#### Scenario: Learner saves with the keyboard

- **WHEN** focus is within the workspace and the learner presses the platform save shortcut
- **THEN** browser page-save is suppressed for that event, the current files are persisted locally, and save status is announced

#### Scenario: Shortcut is pressed outside the workspace

- **WHEN** the same key combination occurs while focus is outside the workspace
- **THEN** the workspace does not intercept it

### Requirement: Runtime-facing panels remain truthful presentation surfaces

The toolbar and workspace actions SHALL provide only editing, file, save, reset, and shortcut affordances. ConsolePanel, TestResults, and RuntimeStatus SHALL render explicit inactive or parent-supplied display states without running code, fabricating output, evaluating tests, or implying that validation occurred.

#### Scenario: Workspace opens before runtime integration

- **WHEN** no runtime or test result is supplied
- **THEN** the panels state that execution and checks are unavailable and no Run, Check, Submit, pass, or completion control is enabled

#### Scenario: Parent supplies display-only diagnostics

- **WHEN** a parent supplies bounded status, console lines, or test-result display data
- **THEN** the panels render that data as text without executing source or treating it as authoritative progress

### Requirement: Workspace is accessible and responsive

The workspace SHALL preserve logical landmark and heading structure, semantic tabs and status regions, visible keyboard focus, WCAG AA contrast, at least 44-by-44 CSS-pixel primary targets, editor labeling, and reduced-motion behavior. At representative desktop and mobile-reading widths and at zoom/reflow, controls and panels SHALL recompose without page-level horizontal overflow; editor and console content MAY scroll within clearly bounded regions.

#### Scenario: Keyboard and assistive navigation

- **WHEN** a keyboard learner moves through the toolbar, file tabs, editor, panels, actions, and reset dialog
- **THEN** focus follows a logical order, each region has an accessible name, status changes are announced, and modal focus is trapped and restored

#### Scenario: Narrow viewport workspace

- **WHEN** the workspace renders at a 390 CSS-pixel viewport
- **THEN** controls wrap, panels stack, essential labels remain visible, and only bounded editor or console regions can scroll horizontally

### Requirement: Phase 13 excludes learning authority and execution

The Editor Workspace SHALL NOT add or change backend endpoints, generated API clients, authentication behavior, curriculum publication or lesson integration, learner execution, preview, deterministic validation, attempts, submissions, completion acceptance, progress, XP, levels, streaks, unlocks, analytics, PWA behavior, cloud draft sync, or Phase 14+ business behavior.

#### Scenario: Phase boundary is reviewed

- **WHEN** the completed Phase 13 diff and browser behavior are inspected
- **THEN** the learner can edit, switch, save, restore, and reset local source in a reusable workspace but cannot run, check, submit, complete, or earn from it

