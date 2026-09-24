## Context

See `proposal.md` for motivation. The frontend already has a minimal CodeMirror wrapper, semantic design-system controls, and a Dexie `drafts` table keyed by owner and Quest. Phase 13 must turn those foundations into a reusable workspace while preserving frontend ownership, local-source privacy, the Phase 12 reading route, and the Phase 14 execution boundary.

## Goals / Non-Goals

**Goals:**

- Establish a feature-level workspace composition whose inputs do not depend on curriculum DTOs.
- Keep editor source observable and replaceable by a parent while maintaining responsive local editing.
- Persist independent file drafts by owner and workspace with recoverable save states.
- Make every inactive runtime-facing surface explicit enough for later adapters to populate without redesigning the shell.
- Verify keyboard, reset, restore, responsive, and boundary behavior in unit/component tests and an installed Chromium flow.

**Non-Goals:**

- Mount the workspace in the published lesson route or decide the eventual lesson/editor split.
- Define an execution adapter, console transport, validation result schema, submission contract, or progress transition.
- Add cloud persistence, cross-device merge, authenticated draft backup, or guest import.
- Build a project IDE, file creation/deletion/rename, terminal, preview, package manager, or arbitrary language plugin system.

## Decisions

### Keep the CodeMirror primitive separate from workspace state

`CodeEditor` remains the low-level controlled editor and accepts current value, language, labeling, change, and focus inputs. A new editor feature module owns files, active selection, drafts, reset, shortcuts, and panel composition. This keeps CodeMirror reusable and prevents lesson or persistence concerns from entering the primitive.

An all-in-one editor component was rejected because it would couple rendering, persistence, and future runtime integration. A generic application-wide workspace framework was rejected because there is only one concrete consumer and no second independent need.

### Use a parent-supplied stable workspace model

The workspace receives `ownerId`, `workspaceId`, and ordered files containing `id`, `name`, `language`, and `starterSource`. It owns the current in-memory source map and reports source changes through an optional callback. Stable identities, rather than filenames or route slugs, form persistence keys.

This allows a later lesson adapter to map a Quest snapshot into the workspace without importing curriculum types here. File creation, deletion, and rename are excluded, so parent changes are reconciled by stable file ID.

### Evolve the local draft record without creating backend authority

Dexie schema version 2 adds explicit `workspaceId` and `fileId` fields and a compound `[ownerId+workspaceId+fileId]` index. Existing version-1 rows remain readable data and migrate conservatively by treating their Quest identity as a workspace identity and assigning a deterministic legacy file ID; no row is attached to a different owner. A small repository isolates load/save operations and can be injected in tests.

Storing a serialized multi-file blob in the existing `source` field was rejected because one corrupt write would affect every file and independent saves would be impossible. Reusing `questId` with concatenated values was rejected because it hides the workspace/file model and makes later migration harder.

### Debounce autosave and keep manual save deterministic

Edits update memory immediately and mark status unsaved. A short debounce writes all changed files; Control/Command+S flushes immediately. Each save captures the current revision, so an older completion cannot mark newer edits saved. Failures preserve memory and expose a retryable failed state. No unload promise or cloud durability claim is made.

### Confirm destructive reset with the existing Dialog

Reset targets only the active file. Modified source opens an accessible design-system Dialog; unchanged source can remain a no-op. Confirmation writes starter source through the same draft path. The scoped reset shortcut is `Control/Command+Shift+Backspace`, chosen to avoid browser reload and execution conventions, and is listed alongside Save.

Native `window.confirm` was rejected because it cannot satisfy the established modal focus and presentation contract. Resetting all files was rejected because it increases accidental data loss.

### Keep runtime surfaces display-only

`ConsolePanel`, `TestResults`, and `RuntimeStatus` accept bounded display props and default to explicit unavailable/idle states. Their types contain text and presentation state only; they do not accept executable callbacks or infer correctness. The workspace has no Run, Check, or Submit action in Phase 13.

This preserves the roadmap component structure without implying Phase 14 execution or Phase 16 validation exists.

### Provide an internal preview route without changing the lesson

A development-only `/editor-workspace` route supplies static files and a local preview owner/workspace identity. Production returns not found, matching the design-system showcase pattern. It is a browser-review artifact for desktop/mobile, keyboard, persistence, and reset behavior and is not a product navigation commitment.

## Risks / Trade-offs

- [IndexedDB can be unavailable, full, or cleared] → Keep source in memory, expose failed/local-only status, and never promise cloud backup.
- [Controlled CodeMirror updates can reset selection or create change loops] → Compare documents before dispatching external replacements and test parent updates independently from learner edits.
- [Autosave completions can arrive out of order] → Track edit/save revisions and allow only the matching latest revision to publish `saved`.
- [Tab trapping conflicts with conventional code indentation] → Keep Tab/Shift+Tab inside CodeMirror for indentation and provide normal keyboard exits through CodeMirror's accessible escape behavior; test the documented path.
- [Mobile software keyboards and CodeMirror differ from desktop automation] → Verify responsive layout and touch-sized surrounding controls in Chromium; do not claim physical-device editor validation from emulation.
- [Inactive output panels can look functional] → Use explicit copy and disabled presentation with no execution actions.

## Migration Plan

1. Add the version-2 Dexie draft schema and migration with focused preservation and owner-isolation tests.
2. Extend `CodeEditor` as a controlled primitive while retaining the existing `initialValue` compatibility during the workspace transition.
3. Add workspace components, draft repository, state composition, and preview route.
4. Add unit/component and browser coverage, then run frontend, root, and strict OpenSpec verification.

Rollback removes the workspace feature and preview route. The additive local schema version remains harmless; rollback code can continue opening the existing version-1 schema only if no version-2 database was opened, so production exposure is prevented by keeping the preview development-only until later integration explicitly owns migration rollout.
