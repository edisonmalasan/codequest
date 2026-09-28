# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Workspace preference restoration is owner-bound

The workspace SHALL restore a saved active-file preference for the current owner and workspace when that file still exists. A file selection SHALL persist independently of source drafts; an absent, invalid, or unavailable preference SHALL fall back to the first supplied file without hiding or resetting source. Changing owners SHALL NOT display the previous owner's selection.

#### Scenario: Saved file is no longer supplied
- **WHEN** the saved active file ID is absent from the current workspace file list
- **THEN** the workspace selects the first supplied file and keeps all valid source drafts intact
