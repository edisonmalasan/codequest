# Learner progress

Phase 25 refreshes protected account facts on entry, reconnect, foreground return, and confirmed replay. Pending device work cannot supply accepted counts or availability, and no protected response is durably cached. See [cloud progress replay](cloud-progress-sync.md).

Phase 18 exposes owner-only, backend-derived progress for published quests, chapters, and Journeys. The protected REST operations are:

| Operation | Purpose |
| --- | --- |
| `POST /api/v1/quests/:slug/start` | Record the first authenticated start for the current published `contentVersion` |
| `POST /api/v1/quests/:slug/hints` | Record first use of `question`, `concept`, or `nextStep` for the current published `contentVersion` |
| `GET /api/v1/quests/:slug/progress` | Read status, timestamps, attempt count, and current-version distinct hint count |
| `GET /api/v1/chapters/:slug/progress` | Read ordered quest progress and derived chapter totals |
| `GET /api/v1/journeys/:slug/progress` | Read ordered chapter/quest progress and derived Journey totals |
| `GET /api/v1/courses/:slug/progress` | Read the identical Journey representation through the Course display alias |

All operations require a verified bearer principal and self-scoped progress permission. Start and hint requests accept only published version/hint context; owner IDs, statuses, completion decisions, and timestamps are never accepted from the browser. Repeated identical activity creates no duplicate and preserves the first server timestamp. Unpublished slugs return the same safe not-found response as other curriculum routes.

Quest status is `completed` only when the owner has an accepted Phase 17 completion for the stable quest ID that is equivalent to the active snapshot through approved compatible publication transitions. Incompatible historical completions remain in owner attempt history but do not claim current completion. Otherwise a start, hint use, or attempt makes it `in_progress`; without facts it is `not_started`. `startedAt` is the earliest start/hint/attempt, `completedAt` is the accepted completion time, and `lastActivityAt` is the latest start/hint/attempt/completion. Existing attempts need no backfill. Attempt counts include all owner attempts; hint counts include distinct keys for the active published content version. Earlier hint facts remain durable and contribute to historical activity time without inflating the current hint count.

Phase 17 permits one accepted completion per stable quest. A materially new objective therefore needs a new stable quest ID under [ADR 0007](adr/0007-curriculum-identity-and-versioning.md); an incompatible historical completion remains in owner history.

Chapter and Journey counts use the **current published catalog** as denominator and current-equivalent accepted stable-quest completions as numerator. Percentage is `floor(100 × completed / total)`, or zero for an empty scope. Nonempty fully completed scopes are `completed`; any other scope with durable quest activity is `in_progress`; otherwise it is `not_started`. Retired or unpublished quest history remains durable but does not affect current published totals. No aggregate or percentage table is stored.

The authenticated Journey map loads this protected progress through the generated OpenAPI client. A failed protected read shows an unavailable state, not an authoritative empty snapshot. Guest work remains provisional. Lesson reading is not blocked by an activity write failure. As [ADR 0005](adr/0005-assessment-trust-and-completion.md) explains, accepted personal-learning completion can be based on a bounded client report; progress does not independently prove code execution. No Phase 19 XP, levels, rewards, streaks, or unlock facts are written. [F06 privacy decisions](security.md) still gate real learner data collection.
