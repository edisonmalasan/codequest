# Proposal

## Why

The editor already keeps guest drafts, but a guest cannot turn a passing Q01–Q04 Check into durable provisional progress or explicitly import that work after signup. Phase 24 connects those local facts to the existing authenticated acceptance path without giving browser storage authority over account progress.

## What Changes

- Record bounded, versioned, device-local starts and passing Check snapshots for published guest-eligible Q01–Q04 quests using the Phase 23 guest bucket and pending-operation store. Show provisional state and storage failures truthfully.
- Offer an explicit import action after authentication. Import each stable quest identity into the verified account through a protected backend operation that reuses normal submission, version, prerequisite, idempotency, completion, XP, streak, and unlock policy.
- Show accepted, already completed, retry-required, and unavailable outcomes per quest. Preserve guest source and incompatible snapshots for recovery; never backdate streak activity from local dates.
- Keep the guest subset closed to other quests and leave account drafts, cloud sync, reconnect replay, and multi-device merging unchanged.

## Capabilities

### New Capabilities

- `guest-learning`: Provisional Q01–Q04 guest progression, explicit authenticated import, reconciliation, and recovery presentation.

### Modified Capabilities

- `attempts-and-submissions`: Add a protected stable-quest-ID import entry point that applies existing backend acceptance rules and verified ownership.

## Impact

The frontend guest quest workspace, account import UI, and Phase 23 local repositories gain a small orchestration layer. NestJS learning gains a protected import route and generated OpenAPI client support; accepted learning tables and reward policy remain unchanged. The current publication manifest is empty and only draft Q01 exists, so a live Q01–Q04 path still depends on separately reviewed publication; this change must not publish invented curriculum.
