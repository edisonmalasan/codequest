# Attempts and submissions

Phase 17 adds authenticated `POST /api/v1/quests/:slug/attempts` and owner-only `GET /api/v1/quests/:slug/attempts`. The frontend runs JavaScript and Check in the separate credential-free browser Worker origin, then offers explicit Submit for the current captured source and local report. Local Check alone writes no learning record.

NestJS derives the owner from a verified bearer token. It resolves the published quest and exact content/assessment version, checks the bounded source and complete published case-ID report, and computes the pass from the individual statuses. It stores one private source/result snapshot per owner-scoped event ID, a server timestamp, and an attempt count. Repeating the same event and payload returns the original attempt; changing the payload with the same event ID is rejected. Only the owner can read their bounded history.

Under [ADR 0005](adr/0005-assessment-trust-and-completion.md), a reported pass may become one backend-accepted **personal-learning** completion after prerequisite and uniqueness checks. The browser controls its report. Acceptance is **not independent proof** that the submitted source passed tests, and no high-stakes or certified claim may rely on it. NestJS never runs learner code. The response exposes `reportedPassed`, `accepted`, and `clientReported` separately. Failed checks can be recorded as attempts without completion.

Phase 17 does not write XP, streaks, rewards, unlocks, or progress aggregates. Those remain later phases. Real learner source collection is gated by the unresolved F06 privacy, retention, consent, and deletion decisions in [security](security.md); this implementation and its tests use local fixtures until that operational gate is satisfied.
