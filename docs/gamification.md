# Gamification principles and policies

## Phase 21 implemented streaks

The backend writes a durable `streak_activity_days` fact only in the transaction of a first accepted quest or capstone completion. It uses the server's acceptance timestamp, converts that instant to the learner's validated IANA timezone, and credits at most one fact for that owner and local date. Retries, further completions on the same date, practice on a completed quest, failed attempts, hints, local Checks, and app opens do not add days. Guest and offline work has no historical capture-date credit: any eventual accepted completion uses its backend acceptance date.

`PUT /api/v1/account/timezone` accepts an authenticated learner's IANA timezone for future accepted completions. Earlier activity facts keep their local dates and timezone. If the latest credited day used a different timezone and was less than 24 hours ago, a new completion receives no extra day credit; it is not backfilled later. Same-zone local-midnight completions can credit consecutive dates without a 24-hour wait. This transition rule prevents rapid timezone switching from manufacturing a day, at the cost of occasionally skipping a genuine travel-day completion.

`GET /api/v1/streaks` reads only the authenticated owner's facts. `longestStreak` is the longest consecutive local-date run. `currentStreak` is the trailing run when its latest date is today or yesterday in the current timezone; otherwise it is zero. The response also provides the current timezone, latest activity date (or null), and `clientReported: true`. No mutable current/longest counter exists. Acceptance still follows [ADR 0005](adr/0005-assessment-trust-and-completion.md)'s bounded client-report personal-learning policy; streaks do not prove independent grading. Pre-Phase-21 completions are not backfilled because their acceptance timezone was not captured. Achievements and unlock presentation remain later work.

## Phase 20 provisional levels

The protected `GET /api/v1/xp` response now derives level and next-level progress from the same owner-bound XP ledger total. The current policy is **`provisional-linear-100-v1`**: level 1 starts at 0 XP and each 100 XP starts the next level. For example, 0/99 XP are level 1 with 100/1 XP remaining; 100 XP is level 2 with 0/100 XP within that level; 235 XP is level 3 with 35/100 XP within it and a 300 XP next boundary. The response supplies `level`, `levelStartXp`, `nextLevelAtXp`, `xpIntoLevel`, `xpToNextLevel`, `curveId`, and `curveProvisional`. No level row or client level input exists.

The project owner approved this curve and 10 XP per first accepted stable quest, including CAP01, as an **experimental private-beta F04 baseline on 2026-10-01**, not as balanced final values. Current published difficulty labels and hints remain for initial beta; quest timing, difficulty and hint effects still need Phase 39 observation. No level names or mastery, certification, ability or job-readiness claim is approved. A later reviewed policy change will rederive displayed levels from historical XP without changing earned ledger amounts. The account page labels the curve as provisional and shows unavailable feedback if the protected read fails. See the [gate-closure decision record](beta-gate-closure-checklist.md#f04--learning-and-xp-balance).

## Phase 19 implemented XP

The backend now writes one `xp_events` row in the same transaction as an authenticated learner's **first accepted** completion of a stable quest ID. That row records the verified owner, `quest_completion` source type, stable quest ID as source ID, positive XP from the published snapshot, and server award time. A database unique constraint on owner and source prevents repeat awards even when a later practice submit uses a new event ID. Exact retries, failed reports, local Check, starts, and hints add no XP. Awards remain in the ledger if content is edited or retired. The current Q01 amount is provisional under F04; an award already recorded keeps its original amount.

`GET /api/v1/xp` requires authentication and `xp:read:self`, and returns `{ totalXp, clientReported: true }`. `totalXp` is summed from the owner's ledger rows, with zero for no events; it is not stored as a separate mutable balance. The qualifier reflects [ADR 0005](adr/0005-assessment-trust-and-completion.md): completion acceptance is personal-learning policy based on a bounded client report, not independent execution proof. Accepted completions from before Phase 19 have no historical XP snapshot, so they receive no inferred backfill or replay award. F06 privacy decisions still gate real learner data collection. Achievements, unlocks, broader rewards, and reward presentation remain later phases.

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

Level derives from total accepted XP with simple understandable math; no separately editable client level authority. This Phase 0 text did not choose names, thresholds or numeric quest values; the later 2026-10-01 F04 decision above approves only the experimental private-beta baseline. Final balance remains open. No negative hint/failure XP and no level-based mastery gate.

## Streak dates and timezone

Approved P10: a meaningful day has at least one **first accepted quest/capstone completion**. Multiple completions on one day count one day; duplicate/replay activity does not manufacture another day. Consecutive learner-local acceptance days extend streak; a missed calendar day breaks continuity, with longest historical streak retained if product chooses that display later. Opening the app never extends it.

Backend acceptance timestamp is authoritative. Guest/offline events count on authenticated acceptance day, not claimed capture date; importing a week of local completions on one day cannot grant seven days. This is simple and resists arbitrary client timestamps but can feel unfair to offline learners. AP01 approves this trade-off; no offline backdating/grace promise is made.

Approved timezone rule: validate a learner-selected timezone, retain timezone used for each accepted activity day, and apply changes prospectively. Do not reinterpret existing activity days or award a second streak day merely by changing timezone/replaying an event. The Phase 21 implementation above resolves F03's day-boundary and timezone-change algorithm for this capability; numeric freeze/grace mechanics are not introduced. Account settings explanation matches this rule.

## Unlocks and learning availability

Approved P09: first quest available; subsequent quests require stated completion prerequisites; capstone requires integration prerequisites. Backend owns accepted lock state; client can show delivered prerequisite explanations and **labeled provisional** offline/guest availability without authoritative unlock claims. Learning status and lock status remain separate.

Phase 22 derives owner availability from the active published quest prerequisites and accepted completions that are active or connected to the current assessment through approved compatible transitions. A missing, retired, incompatible, or other-owner completion does not unlock a dependent quest. Protected quest, chapter, and Journey/Course progress reads return `availability` and ordered `unmetPrerequisites` with published quest ID, slug, and title. A chapter or Journey is locked only when every contained quest is locked; an empty published scope is browseable but has no playable quest. New locked starts, hints, and submissions are rejected before activity is recorded; an exact recorded submission replay returns its original result. The authenticated map displays these backend values, while guest device progress remains labeled provisional. Availability is derived from learning facts, with no unlock ledger or mutable flag.

Minimum concept mastery, XP thresholds, adaptive placement, skill trees, achievements, daily challenges and leaderboards are deferred F08. The roadmap's mastery-unlock example does not override later mastery scheduling. Changing prerequisites/retiring content needs explicit compatibility/mapping and active-progress explanation (P15), not UI-hardcoded gate rewrites.

## Feedback, accessibility and scope limits

Accepted progress/reward feedback should connect to the learning achievement and next available task. Respect reduced motion, readable numeric/text progress, keyboard/focus/screen-reader feedback, and avoid color/art alone for state. Pending/offline rewards remain explicitly pending; failed acceptance explains recovery without losing edits.

No loot economy, subscriptions/pay-to-progress, public ranked competition, punitive hint mechanics, mastery claims, or certificates in MVP. Future optional leaderboards require stronger trust/anti-farming review rather than reuse unverified client completion as verified ranking. See [ADR 0005](adr/0005-assessment-trust-and-completion.md) and [ADR 0006](adr/0006-local-guest-and-cloud-state.md).

Before later reward implementation, focused tests must cover stable-source uniqueness across new event IDs, retry/import/multiple devices/content edits, failed acceptance, replay/reset, timezone boundaries/changes and stale submissions. Beta balances values and evaluates whether rewards improve continuation without harming learning; no efficacy claim is made by Phase 0.
