# Design

## Context

See proposal.md. Phase 17 persists owner-scoped attempts and accepted completions. The foundational schema already has `quest_starts`, but no write path or hint-use fact. The immutable publication catalog is the active hierarchy; database curriculum rows are materialized on submission and cannot provide a complete denominator. The Journey page still passes `emptyCompletionSnapshot` to its map model.

## Goals / Non-Goals

**Goals:** Preserve accepted-completion semantics, expose one owner-scoped progress contract, derive current aggregates without stored percentages, and record meaningful lesson activity with bounded idempotent facts.

**Non-Goals:** Independent grading, guest import, progress sync queues, analytics telemetry, XP, levels, rewards, streaks, and unlock authority.

## Decisions

1. **Facts and migration.** Reuse `quest_starts`, `quest_attempts`, and `quest_completions`; add `quest_hint_uses` with primary key `(user_id, quest_id, quest_version_id, hint_key)`, a server `used_at`, a quest/version foreign key, and owner/quest/time indexes. Keep first use per published hint per version; count distinct keys for the active snapshot. A forward migration is required. Repeated start/hint calls use conflict no-op, never client timestamps. Alternatives of mutable hint counters or stored progress rows would lose provenance and invite drift.
2. **Catalog scope.** Locate published slug and active version through the injected catalog. Start/hint writes ensure minimal curriculum identity/version rows exist before their foreign-keyed facts, following LearningService's projection pattern. Reads query facts by owner and catalog quest IDs; construct ordered snapshots from the catalog. Historic completions for currently published stable IDs count; retired IDs stay out of the denominator. Version is checked for writes, not for stable-quest accepted completions, per ADR 0007.
3. **Progress derivation.** Fetch owner facts in bounded batch queries for one quest, chapter, or Journey rather than an N+1 query per quest. For each catalog quest, compute earliest start across explicit start/hint/attempt and latest activity across those plus completion. Count attempts across all versions; count distinct active-version hint keys; use the completion's `acceptedAt` as completed time. Chapter and Journey totals fold ordered quest snapshots. Empty scope is zero percent and not started. Course is a controller alias returning the Journey DTO.
4. **Trusted API and UI.** Add ProgressModule controller/service/DTO and permission entries. Expose POST start and POST hint under quest routes and GET quest/chapter/journey/course progress; authenticate all. Regenerate OpenAPI types through the existing command. Add typed frontend wrapper methods. The Journey page loads public curriculum and protected progress for a signed-in owner, builds the existing map from accepted completed IDs, and handles auth/transport failure without a false zero claim. The lesson records start when an authenticated session and current quest are ready; opening a native hint disclosure records first use. Guest lesson stays local. Requests originate only from trusted app code.

## Risks / Trade-offs

- [Hint disclosure request fails or is retried] → The content remains visible; a retry uses the same unique fact and does not inflate usage. The UI does not claim saved activity on failure.
- [Published content changes] → Current catalog determines denominator and active hint set; stable accepted completion remains, old hint facts remain auditable but do not count as current-version use.
- [Concurrent starts/hints/attempts] → Unique constraints and conflict no-op make activity idempotent; aggregate reads are computed from committed facts and may briefly lag an in-flight write.
- [Client-reported Phase 17 passes are forgeable] → Progress labels remain personal-learning acceptance, never independent assessment proof, following ADR 0005.
- [F06 operational privacy decisions remain open] → Use local fixtures and isolated database tests; no production learner collection claim.

## Migration Plan

Generate and review one forward Drizzle migration for hint-use facts. Deploy migration before the new API. A rollback of application code leaves additive facts intact; do not rewrite an applied migration. Regenerate frontend OpenAPI after routes/DTOs stabilize. No backfill is needed: older attempts provide started/last activity and accepted completions provide completion time.
