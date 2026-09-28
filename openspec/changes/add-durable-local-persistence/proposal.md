# Proposal

## Why

Phase 23 must protect learner work across ordinary browser navigation and offline use. The existing Dexie database persists editor drafts after idle but has no durable preference, lesson, or guest-state stores, and its outbox is only a schema placeholder.

## What Changes

- Extend the existing Dexie database through a forward migration, preserving v1/v2 drafts and outbox rows, with owner-scoped stores for workspace preferences, downloaded public lesson snapshots, guest-local state, and versioned pending operations.
- Add bounded, explicit storage repositories for those records; preserve stable identities, distinguish unsupported legacy pending rows, and provide owner-scoped read, write, and removal operations without performing sync or acceptance.
- Strengthen the existing draft repository and Editor Workspace autosave: deduplicate unchanged snapshots, serialize overlapping writes, flush on visibility change and page exit where the browser permits, warn before unloading unsaved work, and keep source editable with truthful failure status.
- Document local-only retention, version compatibility, storage errors, and the limits of navigation-time persistence.

## Capabilities

### New Capabilities

- `local-persistence`: Durable, bounded, owner-isolated device storage for drafts, preferences, public lesson snapshots, guest state primitives, and pending operation envelopes.

### Modified Capabilities

- `editor-workspace`: Add lifecycle flush, duplicate-write suppression, preference restoration, and truthful unsaved/failure behavior.
- `frontend-foundation`: Evolve the existing Dexie draft/outbox skeleton through a preserving schema migration.

## Impact

Frontend Dexie schema and repositories, Editor Workspace lifecycle and focused tests, local-storage documentation, and canonical OpenSpec specs. No backend, REST/OpenAPI, cloud source backup, guest progression, signup import, account reconciliation, or network sync behavior changes.
