# Design

## Context

`LearningService.submit` serializes each owner through a user-row lock and inserts attempts and first accepted completions in one database transaction. `xp_events` exists with owner/quest uniqueness and a completion FK but is unused. Published snapshots already validate `xpAward` as a positive integer up to 1000; its current numeric values remain provisional under F04.

## Goals / Non-Goals

**Goals:** One immutable award per stable quest/owner, committed with first completion; owner-only derived XP read; no new learner-code execution.

**Non-Goals:** Backdating, import/sync mechanisms, level curves, streaks, achievements, unlock presentation, independent grading, or balancing F04 values.

## Decisions

- Extend the existing event row with `source_type = quest_completion` and `source_id = stable quest ID`, retaining the owner/quest FK to accepted completion. A forward migration adds explicit source identity and a unique owner/type/source constraint. Existing rows are backfilled from `quest_id` if present. Alternative: rely only on the current owner/quest unique index; rejected because the ledger contract needs explicit source identity for future source types.
- Insert the XP event only after a first completion insert succeeds, inside the existing submit transaction and owner lock. An insertion failure rolls back the attempt and completion. The amount comes from the validated active published snapshot, not request data. Alternative: async award after commit; rejected due to partial success and replay ambiguity.
- Expose `GET /api/v1/xp` through GamificationModule with a verified principal and self-read permission. Compute `sum(amount)` from owner events; zero when none. No stored aggregate or client-written XP. Alternative: include XP in submit response; rejected as an unnecessary coupling for Phase 19.
- Do not retroactively award pre-Phase-19 completions: their original published XP snapshot was not durably recorded, and using today's value would fabricate history. Existing accepted completions remain completion facts; later repeat submissions still cannot earn XP. Deployment must surface this known rollout boundary. Alternative: inferred backfill from current curriculum; rejected as historically inaccurate.

## Risks / Trade-offs

- [Client-reported pass can be forged] → Keep ADR 0005 personal-learning qualifier and avoid competitive or verified claims.
- [Provisional values may change] → Store award amount immutably at acceptance; future balancing affects only later first completions.
- [Existing completions have no XP] → Document rollout boundary; do not mint rewards on replay.

## Migration Plan

Generate and review a forward Drizzle migration for source identity and uniqueness; deploy migration before backend code. Rollback application code may leave additive columns in place. Do not rewrite applied migrations or delete historical ledger rows.
