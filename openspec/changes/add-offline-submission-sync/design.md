# Design

## Context

See proposal.md for motivation. Phase 25 already owns stable-quest POST `/api/v1/learning-sync/:questId`, the Dexie pending-operation repository, bounded 50-row sequential replay, immutable event identity, owner-bound token transport, and account recovery. Phase 27 mounts QuestWorkspace in the public offline shell but disables its Submit callback. Its selected and library views omit PendingWorkPanel. No published live course exists yet; browser evidence must use explicit fixtures.

## Goals / Non-Goals

**Goals:** Compose the existing workspace/outbox/recovery seams so explicitly saved offline work can reach normal backend acceptance on reconnect without changing authority or persistence formats.

**Non-Goals:** Queue starts/hints; infer submission from Check; expand version compatibility; add background/service-worker replay; cloud source-draft synchronization; guest auto-import; Phase 29 curriculum. Backend and generated contracts remain unchanged.

## Decisions

1. **Use the existing Submit path for downloaded lessons.** Remove the offline-view suppression for an authenticated local owner. Check the SDK-selected owner before saving, keep session-generation guards, persist before any transport, then return pending when `navigator.onLine` is false. The existing root replay lifecycle handles reconnect. Browser connectivity is a hint: when true, uncertain transport still retains the event. This avoids duplicate stores or a second endpoint.
2. **Reuse PendingWorkPanel in both offline-library views.** Mount it under the selected account only, keyed by owner so account changes clear prior state. Guests receive no account panel. Retain existing view/copy/remove semantics. Disable retry when known offline and guard its handler so no delivery occurs during an offline transition. The panel retains source even if a lesson was removed; no dependency on a downloaded lesson is required.
3. **Preserve all backend policy.** LearningService resolves exact recorded owner/event payloads before current publication, then applies current exact supported versions, prerequisites and ADR 0005 normalization for new events. Existing completion, XP-source and qualifying-day uniqueness settle duplicates. No client timestamp is sent as acceptance authority; no assessment compatibility window is introduced here. Local source/report snapshots are pending submissions, not F07 cloud draft backup.
4. **Map the roadmap envelope to established camelCase fields.** `event_id` = `eventId`; `event_type` = `operationType: attempt-submit`; `resource_id` = `questId`; `content_version` = `contentVersion`; `timestamp` = `createdAt` (local ordering only); `payload` = bounded serialized source/report. Existing `ownerId`, `schemaVersion: 1`, and `assessmentVersion` add required context. Existing 64 KiB payload and owner-bound repository limits remain. No database upgrade or renamed event format is needed.
5. **Keep last-known accepted facts truthful.** Saving, retrying, or confirming delivery never updates the offline accepted-progress projection. Existing refreshAccountFacts invalidates trusted progress and requests refreshed account XP/streak reads after confirmed replay. Offline identity merely selects a local bucket; verified backend bearer identity decides every accepted fact.

## Risks / Trade-offs

- Expired session or captive connectivity -> retain immutable work as pending/uncertain and require a matching authenticated account on reconnect.
- Curriculum or prerequisite changes -> preserve blocked source/versions for explicit recovery; a fresh Check/Submit is a separate event, with existing no-repeat rewards.
- Storage rejection or eviction -> retain editable in-memory source, show failure, send nothing if save fails; browser clearing can still lose device work.
- Account switch during save/replay -> retain originating-owner envelope, suppress stale UI, stop further wrong-owner requests. Existing backend owner/event uniqueness handles multi-tab duplicates.
- Headless Chromium fixtures are bounded evidence -> retain F02 physical/native/accessibility obligations and F06 release gates; no support or privacy-compliance claim.

## Migration Plan

No schema, dependency, or API migration. Deploy a normal coherent frontend build using existing waiting-worker update guidance. Rolling back restores prior Submit visibility while keeping all existing outbox rows recoverable from the account panel. Never force activation, reload editors, or delete local records.
