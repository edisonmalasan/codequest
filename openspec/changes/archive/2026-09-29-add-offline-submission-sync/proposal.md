# Proposal

## Why

Phase 27 downloaded lessons support offline Run and Check, but suppress explicit Submit and hide the existing pending-work recovery panel. Phase 28 completes the approved offline-to-account loop using Phase 25's durable outbox and authenticated replay rather than introducing another synchronization system.

## What Changes

- Enable explicit Submit for a downloaded lesson belonging to the current signed-in local owner, saving an immutable source/report snapshot before any transport. Known-offline submission saves locally without attempting delivery.
- Expose owner-scoped pending, uncertain, blocked, and confirmed delivery records, source recovery, removal, and connected retry inside the offline library and saved lesson view.
- Preserve stable event identities through reload and reconnect; reuse existing bounded sequential replay and backend idempotency, version, prerequisite, completion, XP, and acceptance-day streak policies.
- Keep accepted account facts separate from local Checks and saved submissions; refresh trusted backend views after confirmed replay. Guest work continues through explicit authenticated import.
- Add focused storage, ownership, reconnect, uncertain-response, and production-browser evidence and document the roadmap envelope mapping.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offline-learning`: Require explicit authenticated offline submission and in-library recovery through the existing pending-operation mechanism.
- `cloud-progress-sync`: Require known-offline explicit submission to persist without transport and expose recovery from downloaded learning.

## Impact

Frontend QuestWorkspace, OfflineLearningClient, PendingWorkPanel, existing replay tests, production PWA tests, and offline/sync documentation. No dependency, database migration, generated API, or backend policy change is planned. NestJS/PostgreSQL remain authoritative under ADR 0005/0006/0007 and P03/P08/P10/P15. F03 uses the existing versioned envelope; F07 keeps source drafts device-local. Starts and hints remain online-only. Background sync, compatibility-window expansion, cloud draft merging, new curriculum, and Phase 29+ work are out of scope. Existing F02 physical/native and F06 operational privacy obligations remain open.
