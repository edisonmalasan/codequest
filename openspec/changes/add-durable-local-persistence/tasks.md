# Tasks

## 1. Existing database evolution

- [ ] 1.1 Extend `CodeQuestDatabase` to v3 with owner-indexed preferences, public lesson snapshots, guest state, and versioned outbox envelopes while retaining v1/v2 migrations and legacy rows; test v1 and v2 upgrades.
- [ ] 1.2 Add bounded owner-scoped repository operations and error semantics for each new record kind, including exact lesson versions, duplicate pending events, legacy pending isolation, guest bucket, and scoped removal; test persistence across database reopen, size rejection, and owner separation.
- [ ] 1.3 Document local record identities, limits, version lookup, legacy pending behavior, and device-only retention in frontend/security documentation; verify examples match repository tests.

## 2. Editor durability

- [ ] 2.1 Extend the existing draft repository with size validation and unchanged-write suppression without replacing older valid records on failed saves; test owner isolation and storage errors.
- [ ] 2.2 Serialize and coalesce Editor Workspace saves; preserve newer edits and truthful status through failures and overlapping idle/manual/lifecycle triggers; test retry and no duplicate writes.
- [ ] 2.3 Restore/save owner-scoped active-file preference, flush on hidden/pagehide/unmount where feasible, and warn on browser unload only while unsaved; test owner changes, invalid preference, lifecycle events, and source retention.
- [ ] 2.4 Document autosave, browser navigation limits, and failure recovery beside the existing Editor Workspace guidance; verify wording against lifecycle tests.

## 3. Integration verification

- [ ] 3.1 Run focused local-persistence/editor tests plus `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and strict OpenSpec validation; review the Apply diff and CI before merge.
