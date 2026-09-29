# Proposal

## Why

Authenticated submissions currently lose their retry identity on reload and cannot reconnect from the existing durable outbox. Phase 25 must carry pending work to authoritative NestJS/PostgreSQL account state across devices without converting local Checks, timestamps, or totals into authority.

## What Changes

- Persist an explicit authenticated Submit as an immutable owner/version/event-bound snapshot in the existing Phase 23 outbox before transport.
- Replay bounded pending attempts on authenticated app entry, reconnect, foreground return, and explicit retry; preserve uncertain and rejected source.
- Add protected stable-quest replay using normal submission acceptance, including exact recorded-event recovery after publication changes or retirement.
- Expose owner-only delivery/recovery status separately from trusted backend progress, and refresh progress/unlock/XP/streak views after confirmed replay or reconnect.
- Isolate account switches, leave guest import explicit, and keep source drafts device-local.

## Capabilities

### New Capabilities

- `cloud-progress-sync`: Authenticated durable submission replay, owner isolation, source recovery, and truthful trusted-view refresh across devices.

### Modified Capabilities

- `attempts-and-submissions`: Protected stable-quest replay returns existing event outcomes before applying current-publication checks to new events.

## Impact

Frontend outbox repository, trusted application provider, quest Submit, account recovery UI, Journey protected reads, API transport and generated contract; backend learning controller/service and focused integration tests. No new dependencies, database authority tables, raw protected-response cache, cloud draft transport/merging, guest auto-import, service worker, or Phase 26 work. The current publication remains empty; this phase does not author or publish curriculum. Start/hint failures retain their existing immediate-write behavior; the Phase 23 replayable operation type is attempt submission.
