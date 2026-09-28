# Design

## Context

See [proposal](proposal.md). `frontend/src/lib/db.ts` has Dexie v1/v2, `drafts`, and a legacy `outbox`; `IndexedDbDraftRepository` already owns draft IDs and writes. `EditorWorkspace` owns the 600 ms idle timer and save status. Supabase session, protected progress, and learning acceptance remain outside local persistence (ADR 0006).

## Goals / Non-Goals

**Goals:** Preserve v1/v2 records, provide one typed browser-local storage seam, keep source safe through ordinary lifecycle events, and make all local claims reflect actual durable writes.

**Non-Goals:** Register a service worker, fetch lessons for download automatically, progress guest quests, import on signup, choose replay eligibility, send pending operations, cache protected API responses, or merge source across devices.

## Decisions

### One Dexie v3 migration

Add `preferences`, `lessonSnapshots`, and `guestState` tables and extend `outbox` indexes in the existing `CodeQuestDatabase`. Keep `drafts` and outbox primary keys, v1→v2 migration, and all old rows intact. New pending envelopes carry `schemaVersion: 1`; pre-Phase-23 outbox rows lack that discriminator and stay readable as legacy records but are excluded from the new-format pending list. No guessed assessment version or silent legacy replay. The alternative of another database or destructive outbox rewrite risks losing saved work.

### Bounded repository contracts

Keep `IndexedDbDraftRepository` for source. Add small typed repositories over the same injected database for preferences, public lesson snapshots, guest values, and pending envelopes. All read/list/delete operations require owner identity; guest state requires the explicit `guest` bucket. Encode compound IDs, avoid token-bearing protected DTOs, and validate stable IDs, version strings, JSON-safe payloads, and UTF-8 sizes before writing. Initial per-record limits: source 64 KiB, preferences 4 KiB, public lesson snapshot 256 KiB, guest value 16 KiB, pending payload 64 KiB. These are local bounds, not backend acceptance limits. A rejected write leaves the preceding row intact. Use exact content/version identity for lesson lookup; do not treat stale material as current. The alternative of unbounded arbitrary `unknown` records makes quota failures and version confusion hard to diagnose.

### Serialized editor saves and lifecycle flush

Keep the existing 600 ms idle save and explicit Save. Capture a revision and source snapshot, run at most one draft save at a time, and coalesce multiple triggers for the same revision. If edits arrive during a save, the next write uses the latest snapshot after the in-flight write settles. Only a successful write of the current revision can show `saved`; failure keeps source and offers retry. Visibility hidden, `pagehide`, and editor unmount start a best-effort flush; `beforeunload` requests the native warning only while work is unsaved or a save unresolved. Browser shutdown may cancel asynchronous IndexedDB work, so no unload promise or synchronous storage substitute is made. Reuse `onSourcesChange`/editor state, not a second source authority.

### Preference integration

Save only a bounded active-file ID for the selected owner/workspace. Load it alongside drafts; ignore unknown file IDs and stale owner responses. File selection can fail independently of draft saving and falls back to the first file. An optional injected preference repository keeps tests deterministic. No panel-layout migration or broad settings system is introduced.

### Failure and retention

Repositories reject malformed/oversize input before writes and propagate IndexedDB/quota errors. UI keeps in-memory source and a failed save status; no fallback to `localStorage` or credentials in persistence. Document device-only storage and browser-clear loss. Caller-controlled owner removal can remove local records in future account UI, but Phase 23 does not add account-deletion or signout flow changes.

## Risks / Trade-offs

- [Browser kills page before async flush resolves] → idle saving is primary protection; lifecycle flush is best effort and unload warning is conditional.
- [Quota, private mode, or IndexedDB denial] → reject writes clearly, retain editor memory, preserve prior durable rows, and allow retry/copy.
- [Legacy outbox lacks version metadata] → retain it without assigning current-format semantics; Phase 24+ can decide explicit migration or cleanup.
- [Owner ID is a local partition, not authorization] → never treat device records as backend progress or submit them automatically.

## Migration Plan

Create Dexie v3 without rewriting v1/v2 migrations. Verify upgrades from both historical versions and the existing v2 draft/outbox behavior with fake IndexedDB. New stores start empty; no network backfill. Rolling back to code that only knows v2 may not open a v3 database, so rollback requires a forward-compatible app fix rather than deleting learner data.
