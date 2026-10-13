# Tasks

## 1. Device-local Build model

- [ ] 1.1 Add the reviewed fixed HTML/CSS/JavaScript starter and versioned manifest validator; verify tests reject duplicate, missing, unsupported, and oversized files before interactive execution.
- [ ] 1.2 Add an additive owner-indexed Build metadata table and repository in the existing Dexie database; verify upgrade tests preserve old drafts and pending operations and that create/list/reopen are owner-scoped.
- [ ] 1.3 Implement confirmed local Build removal with scoped metadata, draft, and preference cleanup; verify storage errors preserve unrelated and in-memory work, and document that local removal is not account or cloud deletion.

## 2. Independent Builds product flow

- [ ] 2.1 Add the production Builds entry and device-local list/create/reopen route; verify guest and authenticated owner changes do not expose another scope and UI tests show truthful device-only, empty, loading, and storage-failure states.
- [ ] 2.2 Compose the existing Editor Workspace and isolated interactive adapter for the fixed Build manifest; verify component tests cover edit, active-file restoration, Run/reload/cancel, stale output, navigation, and source retention without Quest Check or Submit.
- [ ] 2.3 Implement responsive and keyboard-operable Build controls and bounded capability/help copy; verify desktop, 390/320-pixel or zoom reflow, focus order, accessible status, and unsupported-API feedback in browser/component tests, and document the supported subset.

## 3. Integrated isolation and recovery

- [ ] 3.1 Add production-route browser tests for finite interaction, hostile source/handler loops, fresh-run recovery, output and manifest limits, denied network/storage/navigation/script sinks, origin collision, and stale/spoofed messages; verify no unsafe fallback or source loss across the declared browser matrix.
- [ ] 3.2 Add route/owner-switch, storage-failure, and unmount cleanup browser tests; verify the old worker/frame/channel cannot update the new Build and no lesson draft, accepted learning fact, or other owner's Build changes.
- [ ] 3.3 Record an exact-build R11A technical/security verification with commit, origin topology, environment, browser versions, failures/retests, and untested physical/AT setups; verify the report does not claim hosted release, complete Builds, or founder acceptance from CI alone.

## 4. Repository and product review

- [ ] 4.1 Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm api:check`, relevant production browser suites, and `openspec validate add-bounded-web-builds --strict`; record exact results and leave any failing gate open.
- [ ] 4.2 Record the founder's exact-build create/edit/run/reopen review or explicitly mark it untested with required retest details; verify R11A readiness and the roadmap distinguish technical integration from founder acceptance and keep R11B–R11E and Phase 38 open.
