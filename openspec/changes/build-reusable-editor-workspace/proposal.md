## Why

CodeQuest has a proven CodeMirror render primitive and owner-isolated draft storage, but it does not yet have the reusable coding workspace required by the learning loop. Phase 13 establishes that frontend-owned workspace before execution and validation are introduced, so later runtime work can plug into a stable, accessible interface without coupling the editor to one lesson.

## What Changes

- Add a lesson-independent Editor Workspace composed from `EditorToolbar`, `FileTabs`, `CodeEditor`, `ConsolePanel`, `TestResults`, `RuntimeStatus`, and `WorkspaceActions`.
- Deepen the CodeMirror experience with JavaScript highlighting, line numbers, indentation support, bounded autocomplete, controlled source updates, and accessible editor labeling.
- Add parent-supplied file models, active-file switching, local owner/workspace-scoped autosave, explicit manual save feedback, and reset-to-starter behavior that confirms before discarding edits.
- Add documented keyboard shortcuts for save and reset without reserving or simulating Run, Check, or Submit actions.
- Provide conventional, responsive workspace layout and semantic empty/status panels that remain usable with keyboard navigation, visible focus, narrow viewports, zoom/reflow, and reduced motion.
- Add a development-only workspace preview route and automated coverage for component composition, editing, files, persistence, reset, shortcuts, accessibility semantics, and responsive overflow.
- Keep the existing published lesson route independent in this change; curriculum integration is deferred to separately approved work.

## Capabilities

### New Capabilities

- `editor-workspace`: Defines the reusable frontend coding workspace, controlled file/source contract, local draft lifecycle, accessible interactions, responsive layout, and inactive runtime-facing presentation surfaces.

### Modified Capabilities

None.

## Impact

- Frontend editor components and a new editor feature module will build on the existing CodeMirror, Dexie, design-token, and core-control foundations.
- The current draft table remains device-local and owner-isolated; no database migration, cloud draft synchronization, backend endpoint, or generated API-client change is required.
- No learner code executes, no validation occurs, and no attempt, submission, completion, progress, XP, or unlock state is created.
- Phase 13 status and its verification evidence will be recorded in the development roadmap.
