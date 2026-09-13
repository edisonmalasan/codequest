# Backend responsibility and acceptance definition

Status: approved Phase 0 documentation. NestJS authority/table access and no learner execution are confirmed C02–C06. Acceptance/sync/version/reward/transport policies P06/P08–P15 are approved in the [register](decisions.md). [Product](product.md) owns terms/release inventory; [architecture](architecture.md) owns the matrix. This is not an endpoint, schema or module implementation plan.

Approval evidence: [AP01 — explicit user approval](decisions.md#ap01-explicit-phase-0-approval).

## Domain ownership

NestJS/Fastify remains a modular monolith. It verifies identity, authorizes resources, owns application database access through Drizzle/PostgreSQL, exposes curriculum, and owns account submissions/progress/gamification/capstone records. Curriculum source is backend-owned Git content, not frontend-bundled files. REST/OpenAPI defines the application contract, generated for frontend without source imports. Exact DTOs/modules/schema/publication projection await their capability proposals (F03).

Initial domain responsibilities are identity, curriculum, learning, progress and gamification, with health/operational visibility. Capstone is a learning record in approved MVP vocabulary; a separate ProjectsModule is not required just because a roadmap lists it later. Future AI/execution/community/analytics services are not implicitly created. Backend must never run arbitrary learner source or learner-written tests inside NestJS.

## Identity and authorization

Every protected action derives principal from a verified Supabase Auth token. Validate issuer/audience/signature/expiry and reject invalid/expired identity; never accept frontend user IDs/roles as authority. Enforce ownership for profile, submission, progress and account sync resources independently of IDs in payloads. Curriculum availability and privileged author/operator policy are explicit; no public administrative writes.

P13 establishes bearer API requests from trusted client Auth handling; final refresh/storage/transport mechanics are later design. Bound request/source/event/output payloads, validate shape and known values, apply rate limits/least privilege and explicit error categories. Operational logs use request IDs/route/status/duration, not secrets/source. Application-table authorization is not delegated to client-side checks or exposed direct Supabase queries.

## Completion acceptance and trust

Approved P06/P14: submission is an immutable quest/content/assessment-version/source/result snapshot; attempt is one submitted assessment occurrence. Runs without submission are experimentation and may be local telemetry, not automatically persisted account attempts. A failure can be recorded as an attempt with feedback; it cannot produce completion/XP. Duplicate retry of one attempt preserves identity rather than inflating attempts.

Browser deterministic results are untrusted reports. NestJS owns policy acceptance and persistence, **not independent behavioral grading**. It checks identity/ownership, supported content/assessment, prerequisite eligibility, payload bounds, declared result shape, event identity and reward uniqueness. A forged passing report remains possible; AP01 accepts that personal-learning limitation. Do not describe accepted records or derived percentages as proof of mastery/certification. Independent grading would need a separate scoped design, not arbitrary execution here. See [ADR 0005](adr/0005-assessment-trust-and-completion.md).

| Conceptual transition | Accepted effect / failure behavior |
| --- | --- |
| Start/first attempt | In-progress state/activity under policy; no XP for opening |
| Failed reported assessment | Record bounded attempt/result when valid; preserve accepted completion if already complete; no reward |
| Passing report, eligible known version | Accept completion once, update derived state and qualifying reward/unlock effects consistently |
| Same event retry | Return consistent result; no duplicate attempt/completion/reward/activity effect |
| New replay of completed quest | Practice attempt if policy permits; no duplicate completion XP/streak credit |
| Invalid identity/version/prerequisite/payload | Explicit rejected/retry-required result; do not partially accept completion/reward |
| Pending local pass | No account state until accepted; client labels provisional |

Acceptance/progress/XP/unlock effects must be consistent as a single logical operation with uniqueness guarantees; exact transaction/idempotency implementation is deferred F03. If acceptance fails, do not leave completion accepted while dependent reward effects silently disappear. Explicit errors and reconciliation results let the frontend recover.

## Progress, rewards, streaks and capstone

Accepted quest history is authoritative. Learning states follow product glossary; lock state is derived separately. Chapter/journey percentage derives from active requirements and accepted/explicitly mapped compatible completion, not client percentage fields. Attempts/hints/activity are facts under declared trust and deduplication, not inferred mastery. Historical version/completion timestamps remain auditable; client stale updates cannot overwrite accepted history.

Approved P09/P10: one XP source per learner/stable quest completion including capstone; retries/imports/replays/editorial versions never multiply XP. Maintain unique reward source and event-ledger direction. Levels derive from total XP. Unlock by completion prerequisites, not XP/minimum mastery. Streak activity is first accepted completion, counted on backend acceptance day in learner timezone; no backdated guest/offline credit. Timezone changes apply to future acceptance without rewriting history (see [gamification](gamification.md)). Numeric curves deferred F04.

Capstone stores submitted source/result/version and required explanation/transfer responses with completion status. Presence of reasoning responses is not automatically correct reasoning; CO beta rubric review gives separate understanding evidence. No manual review/verified-certificate workflow is silently promised.

## Guest, offline and reconnect reconciliation

Approved P07/P08/P15: guest Q01–Q04 local records remain untrusted/provisional. Explicit import targets verified current account, checks supported version/prerequisites/identity, deduplicates accepted quest/reward sources, and preserves accepted account history. It never trusts guest-supplied identity/timestamps as authority. Import/ordinary sync share acceptance rules so alternate paths cannot bypass them.

Pending outbox concept includes stable event/type/resource/version/timestamp/payload. Client timestamp may help display/diagnose but cannot backdate streak/reward authority. Reconcile events by supported causal prerequisites; return per-action outcomes and latest accepted state. A stale/unsupported version or retirement returns retry-required with compatible/current curriculum guidance. Do not silently relabel old source as newly assessed. Preserve draft on client for retry. Exact event/schema/batch ordering/conflict algorithm is F03.

Account progress sync does not overwrite independent local source drafts or promise cloud source merging (F07). Duplicates, reconnect retries and signup import are ordinary consistency cases, not new reward sources. Offline/provisional unlocks are a client convenience; only backend-known accepted prerequisites permit account transitions.

## Curriculum, data and telemetry

Follow [curriculum version policy](curriculum.md#identity-publication-and-version-lifecycle). Backend publishes known authored versions/contracts, explicit compatibility mappings and active requirement set. Preserve historical accepted records; do not revoke XP through editorial fixes or silently change denominator interpretation. Slugs are presentation, stable identity governs records.

P12/P13 establish private learner code/submissions, no direct learner uploads/Storage paths, minimized operational analytics and bounded authorized operator access. Retention/deletion principles are in [security](security.md); numeric periods/legal/deletion implementation must be settled before real data collection (F06). Do not provision Storage merely because it is in stack direction.

Backend originates deduplicated accepted completion/XP/unlock events and operational request/error records. Client interactions remain separate untrusted evidence. Avoid logging raw code/tokens/hint content/profile secrets. Metrics qualify accepted versus independently reviewed learning evidence.

## Verification expectations

Later capability work requires focused unit/integration tests for authorization, validation, progress, XP, streaks, unlocks, content/version acceptance and sync. Cover forged report limitations honestly, duplicate events/import, stale versions, prerequisite failure, auth expiry, transactional acceptance effects, timezone rules and account ownership. Playwright should cover guest → run/submit → signup/import → retained progress → next quest, plus rejection/reconnect recovery. Security/rate limits and backups/migration/account recovery are beta gates. Phase 0 writes no executable tests, endpoints or infrastructure.
