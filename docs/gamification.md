# Gamification principles and policies

Status: approved Phase 0 documentation. Meaningful rewards, repeat protection, derived levels and meaningful streaks are confirmed C01/C09. Concrete qualifying/replay/hint/date/unlock policies P09/P10/P14/P15 are approved in the [register](decisions.md). [Product](product.md) owns scope/glossary; [backend](backend.md) owns accepted effects; [curriculum](curriculum.md) owns instructional prerequisites.

Approval evidence: [AP01 — explicit user approval](decisions.md#ap01-explicit-phase-0-approval).

## Purpose and meaningful learning

Game presentation makes learning progress understandable and encourages continuation. It does not replace explanation, debugging, testing or application. XP/level are progress displays, not mastery/ability/certification. Pixel styling must not reduce accessibility or shame learners for needing guidance.

Approved MVP qualifying reward/activity source is **first backend-accepted completion of a stable quest ID**, including capstone. A browser pass or offline/guest result is provisional until account acceptance. The backend's acceptance still uses personal-learning client-report trust P06; rewards are consistent account records, not independently verified performance.

| Activity | XP / accepted streak activity under approved policy |
| --- | --- |
| First accepted quest/capstone completion | One defined quest reward and meaningful activity on acceptance day |
| Duplicate submit/outbox retry/signup import of same completion | No additional reward or duplicate activity |
| Replay completed quest/new practice attempt | Allowed practice, no repeated quest XP/streak credit |
| Hint use/failed run/check/debug experimentation | No XP deduction; feedback is for learning; does not alone qualify under MVP streak source |
| Open app/view map/dashboard/lesson | No XP/streak credit |
| Guest/offline local pass | Provisional feedback only; account effects require acceptance; no backdated streak credit P10 |
| Daily challenge/project milestones/mastery tasks | Deferred mechanisms, not current alternative reward sources |

Hint absence, speed, low attempt count, or XP total is not reliable understanding evidence. Avoid incentives to skip explanations/hints or farm easy submissions. If a future rule rewards learning effort or debugging, define its evidence/anti-duplication semantics explicitly rather than counting arbitrary client events.

## XP ledger, levels and replay

Confirmed ledger direction: XP events carry source identity/amount/time and rewards have unique protection. Approved P09 defines one reward identity per learner/stable quest completion. Idempotency key uniqueness alone is insufficient when a learner submits a different event for the same quest; stable reward-source uniqueness must also hold. Editorial/assessment version changes, reinstall/import, repeated failed/pass requests, and multiple devices cannot reissue the same reward.

Accepted completion/progress/XP/unlock effects form a consistent logical backend operation; retry recovers the outcome instead of silently adding/losing effects. Reset only edits source; accepted completion/history/XP remain. Incompatible content pending actions do not earn rewards by pretending to use current tests. Accepted historical rewards remain after retirement/wording edits; a new materially distinct quest/reward needs explicit stable identity review (P15).

Level derives from total accepted XP with simple understandable math; no separately editable client level authority. Names/thresholds/numeric quest values are F04 balancing decisions before beta, not implementation constants chosen here. No negative hint/failure XP and no level-based mastery gate.

## Streak dates and timezone

Approved P10: a meaningful day has at least one **first accepted quest/capstone completion**. Multiple completions on one day count one day; duplicate/replay activity does not manufacture another day. Consecutive learner-local acceptance days extend streak; a missed calendar day breaks continuity, with longest historical streak retained if product chooses that display later. Opening the app never extends it.

Backend acceptance timestamp is authoritative. Guest/offline events count on authenticated acceptance day, not claimed capture date; importing a week of local completions on one day cannot grant seven days. This is simple and resists arbitrary client timestamps but can feel unfair to offline learners. AP01 approves this trade-off; no offline backdating/grace promise is made.

Approved timezone rule: validate a learner-selected timezone, retain timezone used for each accepted activity day, and apply changes prospectively. Do not reinterpret existing activity days or award a second streak day merely by changing timezone/replaying an event. Exact day-boundary/change-eligibility algorithm and timezone data mechanism require focused tests in later design (F03); numeric freeze/grace mechanics are not introduced. Account settings explanation must match the approved rule.

## Unlocks and learning availability

Approved P09: first quest available; subsequent quests require stated completion prerequisites; capstone requires integration prerequisites. Backend owns accepted lock state; client can show delivered prerequisite explanations and **labeled provisional** offline/guest availability without authoritative unlock claims. Learning status and lock status remain separate.

Minimum concept mastery, XP thresholds, adaptive placement, skill trees, achievements, daily challenges and leaderboards are deferred F08. The roadmap's mastery-unlock example does not override later mastery scheduling. Changing prerequisites/retiring content needs explicit compatibility/mapping and active-progress explanation (P15), not UI-hardcoded gate rewrites.

## Feedback, accessibility and scope limits

Accepted progress/reward feedback should connect to the learning achievement and next available task. Respect reduced motion, readable numeric/text progress, keyboard/focus/screen-reader feedback, and avoid color/art alone for state. Pending/offline rewards remain explicitly pending; failed acceptance explains recovery without losing edits.

No loot economy, subscriptions/pay-to-progress, public ranked competition, punitive hint mechanics, mastery claims, or certificates in MVP. Future optional leaderboards require stronger trust/anti-farming review rather than reuse unverified client completion as verified ranking. See [ADR 0005](adr/0005-assessment-trust-and-completion.md) and [ADR 0006](adr/0006-local-guest-and-cloud-state.md).

Before later reward implementation, focused tests must cover stable-source uniqueness across new event IDs, retry/import/multiple devices/content edits, failed acceptance, replay/reset, timezone boundaries/changes and stale submissions. Beta balances values and evaluates whether rewards improve continuation without harming learning; no efficacy claim is made by Phase 0.
