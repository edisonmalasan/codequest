# Proposal

## Why

R11A lets a learner create and reopen a bounded web Build on one device, but clearing browser storage loses it and another device cannot retrieve it. R11B adds an explicit, private account save for the existing Build format while preserving local drafts and the isolated Run boundary.

## What Changes

- Add owner-bound private Build records and versioned REST/OpenAPI operations to save, list, read, update, and delete a bounded HTML/CSS/JavaScript snapshot. NestJS derives ownership from the verified principal and stores no execution result as authority.
- Add explicit account Save and cloud Open actions to the Builds UI. Local autosave remains device-only; a successful backend response is required before the UI calls a snapshot cloud saved. Guest work stays in its guest bucket until the learner explicitly copies it into the signed-in account.
- Resolve uncertain responses and competing device edits without silent last-write-wins: preserve local source, compare server revisions, and require an explicit choice before replacing a local snapshot. Backend writes use conditional revisions and exact-snapshot idempotency.
- Keep project records private. No public page, publishing, sharing, grading, XP, cloud synchronization of lesson drafts, arbitrary file support, or broader execution authority is introduced.
- Require synthetic ownership, failure, cross-device, and exact-build save/relogin/reopen evidence. Real-provider R04 verification and founder review remain separate entry and acceptance gates.

## Capabilities

### New Capabilities

- `private-build-saving`: Authenticated, owner-bound, bounded private Build snapshots and explicit multi-device save/reopen behavior.

### Modified Capabilities

- `independent-web-builds`: Replace the R11A-only device-local disclosure with a truthful distinction among local drafts, pending account saves, and confirmed private cloud snapshots.

## Impact

- Backend: additive Drizzle migration, a Build domain module, guarded versioned REST operations, and OpenAPI export.
- Frontend: generated API client, Build repository/workspace/list integration, explicit account-save and conflict states, and focused browser tests. The existing Dexie draft store and isolated Worker/preview adapter remain the editor and execution foundations.
- R11B implementation must not claim real-account integration until R04 email Auth is verified against the exact environment. F06 still blocks real learner collection and Phase 38 remains PAUSED / NO GO.
