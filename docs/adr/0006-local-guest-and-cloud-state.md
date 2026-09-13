# ADR 0006: Local, guest, offline and accepted account state

## Status and evidence

**Proposed** detailed authority/import/replay/date policy. Limited offline/draft direction is confirmed C10; policy approval evidence is **none**. Register: [P03/P07/P08/P09/P10/P14/F03/F07](../decisions.md); design D7/D8. Owners: product/technical owners; named assignees unassigned.

## Context

Roadmap includes guest migration, cloud progress, local persistence and offline outbox before launch, but abbreviated MVP inventories omit some of them. Client passing reports and timestamps are untrusted; account switching and retries can create duplication/leakage unless policy is explicit.

## Proposed decision

Guest Q01–Q04 and offline local checks create device-local provisional progress. Drafts remain device-local. Authenticated NestJS owns accepted account records/rewards/unlocks. Signup import is explicit, uses verified target identity and applies normal version/prerequisite/acceptance policy. Existing accepted completion merges by stable identity, not blind overwrite.

Pending bounded actions use versioned stable event identities; reconnect replay is idempotent and reward identity remains unique per stable quest, including new event IDs. Account-separated drafts/cache/outbox cannot silently attach to another user. Surface rejected/stale actions and preserve editable source. Minimal owner-scoped progress cache is distinct from raw protected-response/session caching.

First accepted completion counts streak on backend acceptance day in learner timezone; no backdated guest/offline credit. Timezone changes are prospective, do not rewrite history or create replay days. Cloud source-draft sync/concurrent code merge is deferred. Exact schema/algorithms/cache/transport are F03.

## Alternatives

- Draft-only offline/account-first entry: smaller scope but explicit roadmap reconciliation needed.
- Fully authoritative offline progress/client timestamps: misstates authority and enables forged/backdated effects.
- Captured-day grace/backdating: may improve fairness but needs separately approved evidence/date semantics.
- Last-write-wins/cloud source merging: can lose accepted history/source; not required for progress sync.

## Consequences

Offline streak fairness is a visible trade-off requiring PO review. Local storage clearing can lose drafts/provisional work; disclose lack of cloud source backup. Protected cache is cleared on logout/switch while disclosed owner-isolated drafts/pending work may remain. Focused later tests cover duplicates/import/auth expiry/version rejection/account separation/timezones.

## Related records and revisit trigger

[Frontend](../frontend.md), [backend](../backend.md), [gamification](../gamification.md), [ADR 0007](0007-curriculum-identity-and-versioning.md). Phase 0 review must select guest subset/release scope/date policy. Revisit on offline fairness failures, multi-device draft requirement, or different guest promise; no sync mechanism implemented here.
