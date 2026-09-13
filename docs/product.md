# CodeQuest product definition

Status: Phase 0 draft. Source commitments are confirmed only where stated; concrete recommendations are **proposed** and tracked in the [decision register](decisions.md). This is the canonical product scope/glossary/measurement document. [Architecture](architecture.md) defines ownership; [curriculum](curriculum.md) defines instructional outcomes.

## Product and audience

CodeQuest is a pixel-themed coding education platform whose first release helps learners read, write, run, debug, check, and combine JavaScript into a meaningful project. Learning comes before rewards; one polished course comes before more languages; manual learning comes before AI. These are roadmap commitments (C01/C07/C08).

Proposed audience (P01/U01): self-directed adults starting with little or no programming knowledge, able to read English and use a browser/keyboard. Their problem is moving from explanations to code they can inspect, correct, and apply. The MVP should support a first useful coding experience without tool installation. Desktop-first coding and mobile reading/short exercises are proposed; full mobile coding parity is not claimed. Minors/classrooms, experienced interview-practice users, localization, and mobile-only coding are alternatives requiring a different approved promise.

Proposed positioning (P02): guided coding with deterministic, actionable feedback and a visible path toward application. Pixel art gives context/motivation; it must not reduce readability, focus, accessibility, or editor usability. Foundations does not promise job readiness, comprehensive JavaScript mastery, portfolio credentials, or coding-agent proficiency. Enjoyment, comprehension, repeated learning, meaningful return, and project application are hypotheses to validate, not established results.

## Canonical MVP release inventory

**Phase 0** means product definition. **P0** means features required for public MVP. Numbered development phases/steps are sequencing, not feature priority. A required release feature below is not implemented by this documentation change.

| Capability | Release classification / decision state | Release boundary and rationale |
| --- | --- | --- |
| Authentication, private profiles/account | Required, confirmed roadmap | Verified account ownership; account settings, recovery, and onboarding before beta; public profiles deferred |
| Email/password, Google, GitHub login | Required, proposed P03 | Follow auth phase; reduction needs explicit scope decision; credential recovery/session expiry must be covered |
| Foundations journey/map/lessons | Required, confirmed C07 | 5–7 chapters, 20–30 quests, one capstone; proposed exact plan: seven chapters, 24 instructional quests plus capstone (P04/P05) |
| Browser editor | Required, confirmed | CodeMirror, highlights/indentation/autocomplete, reset, autosave, shortcuts, responsive workspace; not full IDE |
| JavaScript execution | Required, confirmed C06 | Worker direction; output/errors/timeouts/termination; exact isolation must pass Phase 1 |
| Web preview | Required, proposed P03 from public-MVP list | Restricted sandboxed HTML/CSS/JS display; Foundations assessed scope remains JavaScript logic; no public hosting |
| Deterministic checks and hints | Required, confirmed C08 | Output/value/function/custom test direction; actionable failures and graduated hints; no LLM grading |
| Attempts/submissions/progress | Required, confirmed roadmap; trust policy proposed P06/P14 | Account-accepted completion distinct from local passed result; bounded versioned snapshots; derived chapter/journey progress |
| XP, levels, streaks, unlocks | Required, confirmed; detailed policies proposed P09/P10 | Meaningful accepted activity, repeat protection, completion prerequisites; no mastery claims |
| Capstone | Required, confirmed; format proposed P05 | Inventory/quest-manager logic and transfer/debug rubric; shell supplied; DOM/events not assessed |
| Guest learning and signup import | Required, proposed P03/P07 | Q01–Q04 initial entry, local provisional progress, explicit import; avoid duplicate rewards/data reassignment |
| Cloud account progress/reconnect sync | Required, proposed P03/P08 | Accepted progress across devices, versioned idempotent replay; source drafts stay device-local |
| Draft persistence | Required, confirmed C10 | Autosave/local recovery and workspace preferences; no guarantee beyond browser storage |
| PWA and limited offline learning | Required, confirmed C10; boundaries proposed P08 | Installable shell/update/network states, downloaded lesson reading/editing/local JS, cached/provisional progress; account changes and final rewards need network |
| Analytics/monitoring | Required, confirmed | Guest/account activation, learning/retention/capstone measures; PostHog/Sentry direction; minimized data and request/error visibility |
| Security, privacy, reliability/testing | Required, confirmed C11 | Threat review, auth/ownership, least privilege, execution limits, content safety, backups/migration/recovery readiness before real users |
| Accessibility/mobile/performance | Required, confirmed C11; supported experience proposed P01/U01 | Keyboard/focus/screen-reader/contrast/reduced motion/touch/editor; browser/low-end feasibility evidence, no pixel-theme exceptions |
| Internal content workflow | Required basic validation/review, tooling detail deferred F03 | Git-first curriculum; no invalid/broken published quests; minimal tooling needed later, no complex CMS |
| Beta readiness and feedback | Required, roadmap Phases 38–39 | Terms/privacy/data retention decisions, account recovery, feedback route, monitoring, backups/security/release process before beta |
| Additional auth providers, rich profile customization, cloud draft merge | Deferred, F07 or explicit future proposal | No confirmed additional consumer/need; not implicit in account progress sync |

There are no optional launch features silently awaiting implementation. A feature may be moved to optional/deferred only by an explicit product decision recorded in the register. Review the cumulative guest/sync/preview/provider scope rather than accepting each addition in isolation.

### Explicit exclusions and post-MVP scope

- P1: AI tutor, Python/Pyodide, daily challenge/practice/mastery tracking, achievements, leaderboards, public portfolio, expanded content tools, notifications.
- P2: cosmetics/avatars/skill trees/adaptive learning, TypeScript/React/Git tracks, sharing/remixing/community/mentors, certificates.
- P3: terminal/packages/WebContainers/remote runners/compiled languages, GitHub integration/PRs, deployments, collaborative projects, AI pair programming/agents/MCP.
- No classroom/teacher dashboard, multiplayer, marketplace/subscriptions/loot economy, complex CMS/vector recommendations, microservices/Kubernetes/Kafka/Redis/queues/GraphQL/tRPC in MVP without separately approved scope.
- No user-authored network requests, authenticated previews, arbitrary server execution, verified competitive grading, or high-stakes credentials under proposed completion trust.

Future architecture diagrams/entities are not launch requirements. Stabilization and evidence precede scope expansion.

## Glossary and state meanings

Hierarchy is proposed P04: `Journey > Chapter > Quest`. **Course** is a display synonym for Journey in MVP, not a separate entity. Alternative hierarchy remains an approval gate; do not build parallel concepts from conflicting roadmap examples.

| Term | Definition |
| --- | --- |
| Journey | An ordered learning path with entry requirements and outcomes; first is JavaScript Foundations |
| Chapter | A coherent set of concepts and quests within a journey |
| Quest | A versioned objective, explanation/task, starter material, deterministic assessment, hints and completion prerequisites |
| Capstone | Final integration quest/project with a rubric; proposed additional to 24 instructional quests |
| Concept / prerequisite | Instructional skill / an explicit completion dependency; XP is not mastery |
| Draft | Editable device-local source, independent of submitted snapshots |
| Run | Experiment with source and see output/errors; can succeed without satisfying assessment |
| Check | Evaluate deterministic task criteria locally; may be part of Submit rather than a separate button |
| Submission / attempt | Versioned source snapshot and reported assessment sent for acceptance / one submitted assessment occurrence; repeated Run is not automatically an account attempt |
| Local pass | Browser assessment result, not proof of account completion or independent correctness |
| Provisional completion | Guest/offline local result, clearly pending account acceptance where applicable |
| Accepted completion | Backend-owned persisted completion under declared trust/eligibility policy; not tamper-resistant verification |
| Learning status / lock state | `not_started`, `in_progress`, `completed` / availability derived from prerequisites; locked is not a fourth learning status |
| Unlock / level / streak | Prerequisite-based availability / derived XP display / meaningful accepted activity on learner-local days under approved date policy |

## Learning loop and exceptions

Normal loop: choose Foundations → open available quest → understand objective/example → write/edit → Run → inspect output/errors → debug → Check/Submit → feedback → backend acceptance for signed-in online user → accepted progress/XP → next prerequisite unlock → eventually apply concepts in capstone.

| Path | Proposed behavior (P06–P10/P14) |
| --- | --- |
| Syntax/runtime/check failure | Distinguish error category, point toward next action, preserve draft, allow retry; no completion/reward |
| Hint use | Graduated guidance; track usage for friction, not automatic failure/XP penalty; curriculum works without AI |
| Reset | Explicitly restore starter material with confirmation if discarding edits; accepted progress/rewards remain intact |
| Successful Run but failed Check | Explain unmet objective; no implied completion |
| Local pass, request fails | Keep draft and pending submitted snapshot; show pending acceptance; retry idempotently |
| Replay accepted quest | Allow practice; do not erase completion or grant repeated XP/streak credit |
| Guest | Q01–Q04 provisional learning on device; signup offers explicit import; opening another account cannot silently reassign data |
| Offline | Previously downloaded material and local deterministic JS; provisional results and cached/provisional unlock display; no new server-confirmed XP |
| Reconnect/import | Authenticate target, reconcile versions/prerequisites/deduplicate, receive accepted/rejected status; retain rejected source for retry |
| Content changed/retired | Explain compatibility/retry requirement; preserve accepted history and draft; no double reward for content edit |

### Completion trust

P06 recommends personal-learning browser-reported checks. NestJS verifies identity, ownership, known content/version, eligibility, bounds and deduplication; it does not run learner code or independently prove the browser's assertion. Forged completion remains possible. The PO must accept that limitation before dependent implementation. Completion metrics mean reported/accepted completion; independent transfer/rubric review provides separate evidence of understanding. Certificates and verified rankings are excluded. See [ADR 0005](adr/0005-assessment-trust-and-completion.md).

## Success and measurement plan

No measurements, thresholds, efficacy claims, or learner baselines exist yet. This plan specifies definitions, not telemetry implementation. PO owns targets/recruitment (F05); CO owns transfer rubric; TO owns collection/deduplication design. Before beta, choose and record thresholds, sample size, recruitment criteria, and review windows **before** interpreting results. Pair quantitative funnels with lesson/editor feedback.

Proposed windows below are definitions for review, not empirically chosen targets. Day windows use elapsed time for retention metrics, independently from timezone-based streak rules. Distinguish guest-observed/local and authenticated/backend-accepted cohorts; never silently add their numerators together.

| Measure/event | Numerator or value / denominator | Cohort and window | Source/trust / target status |
| --- | --- | --- | --- |
| First run activation: `first_code_run` | Unique starters with run / unique first-quest starters | Guest and account cohorts separately; first session | Client event, not proof of code correctness; target pending PO |
| Time to first run | Median and distribution of elapsed time from first quest start; denominator starters who run, show non-run/dropout count too | Same cohorts; first session | Client timestamps; observation quality noted; pending PO |
| First accepted quest: `quest_completed` | Users with first accepted completion / account first-quest starters | Accounts, within 24h of start; guest local-pass rate reported separately | Backend accepted under P06, not verified; pending PO |
| Five-quest progression | Users with five distinct accepted quest IDs / activated accounts | Within 7 days of first accepted completion | Backend ledger, retry/import deduplication; pending PO |
| Chapter completion | Accounts completing all chapter prerequisites / accounts starting that chapter | Within 7 days of chapter start | Derived accepted quest IDs/version policy; pending PO |
| D1 meaningful return | Activated learners with a new run/check/submission or learning completion at 24–48h / activated learners whose full window elapsed | Guest observed and accepted-account activity separately | Client learning events vs backend submissions; app opens excluded; pending PO |
| D7 meaningful return | Same return definition at 168–192h / activated learners with full window elapsed | Same split cohorts; daily timezone streak is a separate measure | Qualified event source as above; pending PO |
| Capstone start: `capstone_started` | Eligible accounts starting capstone / capstone-eligible accounts | Within 14 days of eligibility | Client start matched to backend eligibility; pending PO |
| Capstone accepted: `capstone_completed` | Accepted capstones / capstone starters with full observation window | Within 14 days of capstone start | Backend accepted/client-reported rubric, not independent mastery; pending PO |
| Independent transfer/rubric | Learners meeting each rubric criterion / participants offered assessment; also report participation separately | Beta capstone completers, new task after completion | CO-reviewed response/observed explanation with bounded consent; pending PO/CO |
| Validation/hint friction: `validation_failed`, `hint_used`, `execution_error` | Rates/counts per quest attempt and per quest starter; distinguish run vs submission | Quest/version/device; first 7 days from start | Local events, hint use is not incompetence; pending CO |
| Enjoyment/clarity feedback | Distribution and recurring reported issues / respondents, with invite/response rates | Beta sessions/chapter finish; weekly review | Voluntary qualitative evidence and selection bias; pending PO |
| Reliability | Failed protected requests/submissions / matching requests; latency/error distributions | Release/browser/device; daily and weekly | API operational/Sentry records, minimized metadata; pending TO |

Guest activation is first quest start/run; account activation for accepted funnels is first accepted quest. On explicit signup import, use a consent-compatible anonymous-to-account linkage where allowed, deduplicate event/quest identity, and disclose gaps caused by browser clearing/multiple devices. Accepted-transition events originate from backend to avoid duplicate client/retry counts. Client timestamps and local passing reports are untrusted. Exclude unfinished cohort windows, report sample sizes, segment by content version/device, and compare barriers through interviews rather than jumping to requested features.

## Definition of Phase 0 readiness

The reviewed definition must answer: what are we building, what are we not building, who owns each system, and what is MVP-required? Documents/ADRs can be complete while persona/scope/trust and other policy gates remain unapproved. [The register assessment](decisions.md#phase-0-completion-assessment) controls readiness; this draft is not a release authorization.
