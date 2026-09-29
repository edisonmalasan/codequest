# Design

## Context

See proposal.md for motivation. Dexie v3 already has version-1 `attempt-submit` envelopes with a 64 KiB JSON-payload bound and immutable owner/event identity. Phase 24 uses the guest bucket explicitly; authenticated Submit currently bypasses durable storage. LearningService already serializes owner acceptance in PostgreSQL and enforces event, completion, XP, and streak uniqueness. Its initial slug lookup prevents recorded-event replay after retirement. Protected Journey reads use owner-keyed memory queries; account XP/streak reads use local component state. ADRs 0006/0007 and P03/P08/P10/P15 govern authority; F03 allows this scoped mechanism, F07 excludes cloud drafts.

## Goals / Non-Goals

**Goals:** Recover explicitly requested authenticated attempts through reload/reconnect; isolate owners across races; refresh accepted facts from backend reads on both sending and other devices.

**Non-Goals:** Queue starts/hints, auto-submit Checks, auto-import guests, choose compatibility transitions, persist protected snapshots, cloud draft merge, background service-worker sync, publish curriculum, or add remote grading.

## Decisions

1. Extend the existing envelope with optional bounded delivery metadata (`confirmed` or `blocked` plus safe message), leaving payload and schema version intact. Missing metadata means pending. Metadata is transport status only; never store raw AttemptResponse, source duplicates, tokens, totals, or completion authority. Keep confirmed source until explicit owner removal. Legacy and guest rows remain inert. A separate sync database would duplicate Phase 23 ownership and recovery logic.
2. Add `POST /api/v1/learning-sync/:questId`. Refactor the existing acceptance path to check owner/event equality using stable quest identity before requiring publication for new events. Normal slug submissions still resolve published context. No acceptance logic or authority is moved to the client. Existing exact-version admission remains explicit; this phase does not silently declare old assessments compatible.
3. A reusable frontend replay service saves immutable source/report JSON and delivers at most 50 envelopes per pass, in creation order. It serializes same-tab work, checks live owner before requests and response processing, and obtains only that owner's token. Transient/uncertain failures stop the pass with pending data retained; terminal 400/403/404/409 rejections record blocked metadata and continue. Explicit retry includes blocked rows without modifying payload. Duplicate cross-tab transport is harmless through backend idempotency.
4. A trusted application provider observes session changes, online events, foreground/focus, and explicit submissions/retries. No periodic timer or service worker. Identity changes clear protected memory queries and reset UI generations. A small authenticated account panel exposes delivery status and source recovery/removal; guest import keeps its existing explicit separate flow. Authenticated workspace owner changes remount the editor boundary so source cannot leak across identities.
5. On reconnect/foreground and confirmed replay, invalidate owner progress queries and notify account XP/streak views to fetch again. A device with no local pending work still refreshes cloud facts. Protected Journey token selection binds to the query owner. No IndexedDB progress cache is required for this phase; unavailable backend reads stay unavailable. Pending status never supplies counts, unlocks, XP, or streaks.

## Risks / Trade-offs

- Browser event/session timing races: bind every request token to the captured owner and discard generation-stale results. An already-dispatched A request may finish for A; it must never mutate B UI.
- Storage quota and clearing: bounded payload rejects safely, source remains editable, and UI discloses device-only retention. Users may remove recovered envelopes explicitly.
- Lost response or post-response metadata-write failure: retain the immutable event and replay safely; never announce synchronized storage before the metadata write succeeds.
- Prerequisites queued in another order: blocked source remains; explicit retry can follow prerequisite acceptance. No inferred unlock or silent source migration.
- Cross-device drafts are absent by design: only accepted backend facts travel between devices. Current production publication is empty, so fixtures verify the behavior without claiming live curriculum availability.

## Migration Plan

No SQL or Dexie index migration is needed for optional envelope metadata. Existing schema-1 records are replayable only for their authenticated owner with valid source/report payload; guest and legacy rows remain untouched. Regenerate OpenAPI. Rollback disables the replay provider/endpoint without removing durable source or backend accepted history.
