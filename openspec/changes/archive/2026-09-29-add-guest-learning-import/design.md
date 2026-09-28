# Design

## Context

See proposal.md. Phase 23 already provides an owner-isolated guest key/value store, draft repository, and versioned outbox envelopes. `QuestWorkspace` currently disables Submit for signed-out users, while `LearningService.submit` owns all authenticated attempt, completion, XP, and streak effects. The public catalog is empty; only draft Q01 exists. The Phase 24 code must operate against published guest-eligible data without creating unreviewed lessons.

## Goals / Non-Goals

**Goals:** A durable local passing snapshot, truthful guest status, explicit account import, stable-ID resolution, idempotent retry, and backend policy reuse.

**Non-Goals:** Publishing curriculum, offline network replay, multi-device sync, guest-account draft copying, account progress cache, independent grading, or new reward rules.

## Decisions

1. **Use Phase 23 storage without a new database.** Keep small per-quest provisional metadata in the guest bucket and immutable passing source/report snapshots in the existing outbox with owner `guest`. The outbox's 64 KiB payload bound limits the whole import snapshot; if it cannot fit, retain the editable draft and report a local-save failure. Guest metadata stores the stable event ID and quest/version context, never accepted account state. An explicit owner-scoped repository validates Q01–Q04, schema, data shape, and cross-record consistency. A second passing Check may replace the selected guest snapshot by creating a new event only after the new record is durable; old recovery data remains until explicit cleanup policy exists. Avoid localStorage and a new Dexie schema.

2. **Capture a local Check at its source revision.** Add an optional Editor Workspace callback for the terminal Check result plus immutable active-source snapshot, invoked only for the current owner/workspace/check token. `QuestWorkspace` records guest start separately and persists only passing, complete local results. Guest UI reads provisional state from device storage, labels it as device-only, and offers signup. A failed persistence call cannot change the durable-completion label. `guestEligible` plus explicit Q01–Q04 stable IDs gate guest behavior; other quests keep the authenticated path.

3. **Create a protected single-quest import route by stable ID.** `POST /api/v1/guest-import/:questId` takes the existing bounded attempt body. The backend resolves the stable ID from the current published catalog, rejects non-guest/unpublished IDs, and calls the existing `LearningService.submit` path using the verified principal and current slug. This path already serializes by owner, validates reports and versions/prerequisites, handles event replay, creates one completion, awards one stable-quest XP source, and records the acceptance-day streak. No guest timestamp or owner field is accepted. It does not mutate existing accepted completion; a different event after completion may become a practice attempt but cannot farm XP or streak. A lost response retries the same event and body.

4. **Import is a deliberate account action.** Account UI lists locally saved Q01–Q04 snapshots after account establishment, explains target account and date policy, and requires clicking Import. Process in Q01–Q04 order so prerequisites can become satisfied in one action. Each request obtains the current token via the generated client. Record per-item result locally without deleting the source or event. If auth expires, stop; a network/409/404/locked result remains retryable or recovery-required, with source visible/copyable. Explicitly avoid automatic import on auth callback or sign-in. Refresh account XP/streak/progress views after confirmed successes.

5. **No false live-curriculum promise.** The flow works for published eligible quests and tests use a published fixture catalog. With the current empty manifest, public routes have no guest quest and the UI must say no published guest quests are available. Authoring/review/publication of Q01–Q04 is a separate curriculum decision, not inferred from guest eligibility in draft files.

## Risks / Trade-offs

- **Client-reported success can be forged** → Preserve ADR 0005 personal-learning framing and backend report normalization; never call it independent grading.
- **Guest browser data can disappear** → Device-only language, visible storage failure, editable source retention, no implicit deletion after import.
- **Old snapshot cannot be accepted** → Keep exact source/report/version and show current-version retry guidance; do not rewrite historical payload.
- **Response lost after commit** → Stable event ID and exact replay return the prior backend result; no repeat reward.
- **Source nearly fills the payload bound** → Reject the composite snapshot before overwrite and leave the draft editable; no claim that it was durably importable.
- **Current publication has no Q01–Q04** → Keep the route fail-closed and test with reviewed-style fixtures rather than publishing draft content.

## Migration Plan

No PostgreSQL or Dexie migration. New guest records use versioned keys and envelopes within existing Phase 23 stores. Deploy backend route/OpenAPI before frontend import UI; regenerate the frontend client from OpenAPI. Rollback leaves guest records readable as device-only data without submitting them.
