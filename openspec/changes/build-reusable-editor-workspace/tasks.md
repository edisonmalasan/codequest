## 1. Editor Foundation

- [ ] 1.1 Add the task-specific CodeMirror command/autocomplete dependencies and verify the frozen workspace install succeeds.
- [ ] 1.2 Extend `CodeEditor` into a controlled, labeled JavaScript editor with line numbers, indentation, bounded autocomplete, external snapshot reconciliation, and retained proof-of-render compatibility; verify focused component tests pass.

## 2. Local Draft Persistence

- [ ] 2.1 Add the version-2 owner/workspace/file draft schema and conservative version-1 migration; verify migration and cross-owner isolation tests pass.
- [ ] 2.2 Add an injectable draft repository that loads and saves file source without cloud or progress behavior; verify success, missing-draft, and failure behavior with focused tests.

## 3. Workspace Components

- [ ] 3.1 Build `EditorToolbar`, `FileTabs`, `ConsolePanel`, `TestResults`, `RuntimeStatus`, and `WorkspaceActions` as accessible presentation components; verify semantics, keyboard tabs, inactive defaults, and supplied display states in component tests.
- [ ] 3.2 Compose `EditorWorkspace` from stable parent-supplied owner/workspace/file inputs with independent in-memory sources and active-file switching; verify edits survive file switches and parent snapshot reconciliation.
- [ ] 3.3 Implement debounced autosave, explicit save, revision-safe save status, owner-isolated restore, and failure recovery; verify fake-timer/component tests cover unsaved, saving, saved, restored, and failed states.
- [ ] 3.4 Implement selected-file reset through the existing accessible Dialog plus scoped, discoverable Save and Reset shortcuts; verify cancel/confirm, focus restoration, local persistence, and outside-workspace shortcut behavior.

## 4. Responsive Review Surface

- [ ] 4.1 Style the workspace with existing semantic tokens and conventional application-control language so desktop and 390 CSS-pixel layouts recompose without page overflow; verify component assertions and responsive browser inspection.
- [ ] 4.2 Add a development-only `/editor-workspace` route with static demonstration files and ensure production returns not found; verify development rendering and production gating tests.
- [ ] 4.3 Add a Chromium Playwright flow for editing, file switching, save/restore, reset confirmation, keyboard navigation, status announcements, narrow-width reflow, and absence of runtime actions; verify the focused browser suite passes without console or hydration errors.

## 5. Documentation and Gates

- [ ] 5.1 Document the reusable workspace API, local-only draft limitations, shortcuts, and Phase 14 integration boundary in frontend documentation; verify links and terminology against the approved docs and ADRs.
- [ ] 5.2 Update the roadmap to record Phase 13 Apply completion without claiming Sync/Archive or Phase 14 work; verify status and evidence links match the active change.
- [ ] 5.3 Run frontend lint, typecheck, tests, build, root lint, typecheck, tests, build, strict OpenSpec validation, boundary/credential scans, and `git diff --check`; record exact evidence and repair all failures before marking Apply complete.
