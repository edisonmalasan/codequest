# Editor Workspace Specification

## Purpose

Provide a reusable, lesson-independent frontend workspace for editing and preserving source with optional isolated execution, static preview, and local validation while submissions and learning authority remain absent.

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

The workspace SHALL autosave changed file source to IndexedDB after editing settles and SHALL support an explicit Save action. It SHALL attempt a best-effort flush when the document becomes hidden or the page is leaving, warn on browser unload while source remains unsaved or a write is unresolved, and SHALL NOT promise that asynchronous page-exit writes always finish. Duplicate triggers for the same source revision SHALL NOT create duplicate writes; older in-flight saves SHALL NOT mark newer edits saved or overwrite them. Draft records SHALL be scoped by owner, workspace, and file identities; loading one owner or workspace SHALL NOT expose another's source. The workspace SHALL distinguish unsaved, saving, saved, and failed local-save states, retain in-memory source after a failure, offer an explicit retry, and SHALL NOT claim cloud backup or synchronization.

#### Scenario: Returning learner restores a local draft

- **WHEN** the same owner and workspace reopen a file with a saved local draft
- **THEN** the workspace restores that draft instead of starter source and identifies it as locally saved

#### Scenario: Local save fails

- **WHEN** IndexedDB rejects an autosave or explicit save
- **THEN** the current source remains editable, the workspace reports that local saving failed, and no cloud or accepted-progress claim is made

#### Scenario: Another owner opens the same workspace

- **WHEN** a different owner opens the same workspace and file IDs
- **THEN** the first owner's draft is not loaded or modified

#### Scenario: Visibility changes before idle save

- **WHEN** an edited workspace becomes hidden before its idle-save timer fires
- **THEN** it starts a best-effort save of the latest source snapshot and does not claim saved until persistence resolves

#### Scenario: Navigation with unsaved work

- **WHEN** browser navigation begins while source is unsaved or a save is unresolved
- **THEN** the workspace attempts a best-effort flush and uses the browser's supported unload warning behavior without erasing editable source

#### Scenario: Duplicate save triggers

- **WHEN** idle, explicit Save, and lifecycle flush target the same source revision
- **THEN** no duplicate durable write is issued and only that revision can become saved

### Requirement: Workspace preference restoration is owner-bound

The workspace SHALL restore a saved active-file preference for the current owner and workspace when that file still exists. A file selection SHALL persist independently of source drafts; an absent, invalid, or unavailable preference SHALL fall back to the first supplied file without hiding or resetting source. Changing owners SHALL NOT display the previous owner's selection.

#### Scenario: Saved file is no longer supplied

- **WHEN** the saved active file ID is absent from the current workspace file list
- **THEN** the workspace selects the first supplied file and keeps all valid source drafts intact

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

The workspace SHALL accept an optional execution adapter. Without one, ConsolePanel and RuntimeStatus SHALL retain explicit unavailable states and no Run control SHALL be enabled. With one, workspace actions SHALL expose Run and Cancel, execute only the current active-file source snapshot, and drive bounded console lines and runtime states through the existing presentation surfaces. TestResults SHALL remain inactive unless a separate validation strategy and definition are supplied, and no runtime result SHALL be treated as a Check, submission, completion, or progress decision.

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

### Requirement: Workspace is accessible and responsive

The workspace SHALL preserve logical landmark and heading structure, semantic tabs and status regions, visible keyboard focus, WCAG AA contrast, at least 44-by-44 CSS-pixel primary targets, editor labeling, and reduced-motion behavior. At representative desktop and mobile-reading widths and at zoom/reflow, controls and panels SHALL recompose without page-level horizontal overflow; editor and console content MAY scroll within clearly bounded regions.

#### Scenario: Keyboard and assistive navigation

- **WHEN** a keyboard learner moves through the toolbar, file tabs, editor, panels, actions, and reset dialog
- **THEN** focus follows a logical order, each region has an accessible name, status changes are announced, and modal focus is trapped and restored

#### Scenario: Narrow viewport workspace

- **WHEN** the workspace renders at a 390 CSS-pixel viewport
- **THEN** controls wrap, panels stack, essential labels remain visible, and only bounded editor or console regions can scroll horizontally

### Requirement: Phase 13 excludes learning authority and execution

The Editor Workspace SHALL remain independent from curriculum and learning authority. Its Phase 13 baseline SHALL execute nothing when no adapter is supplied; its optional Phase 14 adapter SHALL add only browser JavaScript Run/Cancel and runtime presentation; its optional Phase 15 preview adapter SHALL add only script-disabled HTML/CSS presentation and separately isolated JavaScript computation; its optional Phase 16 strategy SHALL add only deterministic local Check feedback. A Phase 17 parent MAY provide an explicit submission action and receive a captured source and local check result; the parent SHALL call the protected backend API and present backend acceptance separately. The workspace SHALL NOT determine quest completion, award XP, alter progress, unlock content, or submit automatically.

#### Scenario: Phase boundary is reviewed

- **WHEN** the published quest workspace is inspected
- **THEN** Run and Check remain local, Submit is explicit and authenticated, and only the backend response can report accepted personal-learning completion

#### Scenario: Submission integration is absent

- **WHEN** a parent supplies no submission action
- **THEN** the reusable workspace retains its local editing, Run, Preview, and Check behavior without any learning write

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

### Requirement: Workspace supports optional local validation

The Editor Workspace SHALL accept an optional lesson-independent validation strategy and definition from its parent. With both supplied and an active JavaScript file, Check SHALL capture the current source snapshot and present correlated, bounded per-case results in TestResults with an explicit local/unverified label and elapsed time. Run and Preview SHALL remain separate actions; a successful Run or Preview SHALL NOT imply a passing Check. Without validation inputs, Check SHALL remain unavailable. Editing, reset, owner change, cancellation, or unmount SHALL prevent stale check results from presenting as current, preserve local drafts, and release validation resources.

#### Scenario: Check evaluates active source

- **WHEN** a learner activates Check with a valid strategy and JavaScript file
- **THEN** the workspace announces checking, then presents the current snapshot's ordered local case outcomes and feedback

#### Scenario: Source changes during check

- **WHEN** a learner edits after Check captures source
- **THEN** the old result cannot appear as a current pass and the new source remains editable and locally saved

#### Scenario: Validation is unavailable

- **WHEN** no strategy or definition is supplied
- **THEN** the workspace retains the inactive TestResults state and does not enable Check or make a completion claim

### Requirement: Optional written responses share local draft and snapshot behavior

The reusable workspace SHALL accept optional parent-defined labeled written response fields without curriculum coupling. Responses SHALL share owner/workspace/version-bound draft storage, idle and explicit Save, revision ordering, lifecycle best-effort flush, unload warnings and truthful failure behavior with editable source. Response text SHALL NOT enter execution, preview or deterministic check requests. Explicit Submit SHALL capture current responses with the checked source and report; editing or switching owners SHALL NOT leak a previous owner's responses. Without fields, existing workspace behavior SHALL remain unchanged.

#### Scenario: Responses survive reload
- **WHEN** the same owner returns to the same versioned workspace after a successful save
- **THEN** source and responses restore together while another owner's work remains inaccessible

#### Scenario: Written work cannot save
- **WHEN** storage rejects a response save
- **THEN** text stays editable, failure and retry are exposed, and no durable or cloud-save claim is made

#### Scenario: Learner submits written work
- **WHEN** the parent permits explicit Submit for a checked source
- **THEN** the captured responses belong to that snapshot and later edits do not alter it or execute the response text

### Requirement: Optional host composition preserves reusable workspace behavior

The Editor Workspace SHALL allow an approved parent to present its editor and output/result surfaces in distinct host regions while preserving one owner-scoped source, draft, active file, execution, preview, validation, and submission state machine. Standalone workspace usage SHALL continue to work without a curriculum parent. Layout changes, responsive panel switches, and host navigation SHALL NOT duplicate execution, Check, or submission actions or release current source solely because a region changes visibility.

#### Scenario: Quest host presents three regions

- **WHEN** the Quest host places lesson, editor, and output in separate visible desktop regions
- **THEN** the Editor Workspace keeps one active file and one correlated set of runtime and validation results across those regions

#### Scenario: Standalone workspace remains available

- **WHEN** the reusable workspace is opened without a Quest host
- **THEN** its existing editing, panels, local actions, and owner-scoped draft behavior remain available

### Requirement: Workspace may present an optional interactive web adapter

The reusable Editor Workspace SHALL accept an optional, lesson-independent interactive web adapter for compatible identified files without replacing its existing static preview, JavaScript Run, local Check, draft, or explicit Submit contracts. It SHALL label the selected mode, display correlated preview/output/error states, preserve every source and local draft across mode changes or failures, and keep preview actions distinct from Check and backend-accepted completion. Without a supplied and available interactive adapter, its interactive control SHALL remain unavailable.

#### Scenario: Parent enables interactive exercise

- **WHEN** a compatible parent supplies the interactive adapter and files
- **THEN** the learner can Run a captured interactive snapshot, inspect its bounded display and console, and return to editing without losing source

#### Scenario: Parent omits the adapter

- **WHEN** the workspace has only its current static preview or JavaScript execution adapter
- **THEN** those modes retain their existing behavior and no interactive DOM action is enabled
