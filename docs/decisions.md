# CodeQuest decision register

This is the approval record for Phase 0. Documentation execution was authorized by the user's request to apply `define-codequest-product-and-architecture`. That request did not select every proposed product policy. No pending policy below has approval evidence yet.

## Sources and statuses

- **A:** [AGENTS.md](../AGENTS.md), current engineering commitments and architecture boundaries.
- **R:** development roadmap, `temp/DEVELOPMENT_ROADMAP.md`: Product Goal, Architectural Principles, Priority Tiers, Phases 0–40, Explicitly Postpone, and Core Roadmap Rule. The file is ignored; substantive commitments are captured here and in the linked documents so this definition does not depend on that file being present in a fresh checkout.
- **E:** Phase 0 exploration in the conversation: ambiguities, contradictions, and recommendations; not product approval.
- **D:** [archived change design](../openspec/changes/archive/2026-09-13-define-codequest-product-and-architecture/design.md), D1–D10.
- **U:** user's proposal/apply requests: documentation-only execution scope; technical branch naming; no production infrastructure.

`confirmed` means established by an explicit source, not implemented or empirically verified. `proposed` means a concrete recommendation awaiting review. `unresolved` means a choice still needs a selection. `deferred` means a bounded later decision with a trigger, not an implicitly approved feature.

Each row has a stable ID, topic/decision, status, source, rationale/alternatives, affected documents, owner, blocking stage, and revisit trigger. For **confirmed** rows, the cited source is the approval evidence. For all **proposed**, **unresolved**, and **deferred** rows, approval evidence is **none** unless an explicit dated user decision is later appended. Owners are roles, not invented people: PO = product owner/user; TO = technical owner; CO = curriculum owner; SO = security/privacy owner. Named assignees remain unassigned. A decision owner must record the choice and approval evidence before changing status.

## Confirmed commitments

| ID | Topic/decision | Status/source and approval evidence | Rationale / alternatives | Affected documents | Owner | Blocking stage / revisit trigger |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | Pixel-themed coding education; learning and usability before gamification/community/AI | confirmed, A/R | One coherent course before breadth; an entertainment-first product conflicts with roadmap | [product](product.md), [curriculum](curriculum.md), [gamification](gamification.md) | PO | All phases; revisit only on explicit product change |
| C02 | Next.js frontend, NestJS authoritative modular-monolith backend | confirmed, A/R | Avoid service complexity; backend rules cannot move to Next.js | [architecture](architecture.md), [frontend](frontend.md), [backend](backend.md), ADR 0001 | TO | Foundations; scaling/security evidence may justify a separate ADR |
| C03 | Backend owns application tables/rules; no cross-app imports | confirmed, A/R | Enforce identity/ownership centrally rather than client-controlled writes | architecture, frontend, backend, [security](security.md), ADRs 0001/0008 | TO/SO | Any application design; revisit through approved boundary change |
| C04 | REST/OpenAPI; generated client under `frontend/src/lib/api/generated/` | confirmed, A | Roadmap's `packages/api-client` conflicts; A takes precedence, no independent second consumer | architecture, frontend, backend, ADR 0002 | TO | API foundation; revisit when two independent consumers justify extraction |
| C05 | Curriculum belongs under `backend/content/`, Git-first, delivered through API | confirmed, A/R | Roadmap root `content/` trees are superseded by A; client raw-content imports are excluded | curriculum, architecture, backend, ADR 0003 | TO/CO | Content foundation; revisit if an approved authoring requirement changes source |
| C06 | Browser JavaScript Worker and sandboxed web-preview direction; never learner execution inside NestJS | confirmed, A/R | Remote execution deferred; feasibility/isolation not yet proved | architecture, frontend, security, ADR 0004 | TO/SO | Runtime design; Phase 1 evidence required |
| C07 | One Foundations journey, 5–7 chapters, 20–30 quests, one capstone | confirmed, R Phase 0/P0 | One polished course; count interpretation and project promise still P04 | product, curriculum | PO/CO | Curriculum scope; explicit outcomes/scope revision |
| C08 | Deterministic assessment without LLM correctness grading; AI optional/post-MVP | confirmed, R | Curriculum must stand alone; AI cannot substitute for manual learning | product, curriculum, backend, security, ADR 0005 | PO/CO | Assessment design; separately approved future AI capability |
| C09 | Meaningful-learning rewards, no repeat XP farming, derived levels, meaningful streaks | confirmed, R Phases 19–22 | App opens are not learning; balance/qualifying rules remain proposals | gamification, backend, ADR 0006 | PO/TO | Reward design; content balancing/approved new reward source |
| C10 | Limited offline/PWA/local draft support | confirmed, R P0/Phases 23–28 | Preserve usable learning/code; does not promise fully offline account authority | product, frontend, backend, ADR 0006 | PO/TO | PWA scope; explicit offline promise review |
| C11 | Security/testing/accessibility/monitoring are release requirements | confirmed, A/R | Late hardening/testing phases do not excuse unsafe early design | product, frontend, security | TO/SO | From first prototype; beta/public release evidence |
| C12 | This change produces docs/ADRs only; no sync/archive/application/infrastructure execution | confirmed, U/D1 | Planning/apply authorization is limited to Phase 0 | All deliverables | PO/TO | This change; new explicit user request required for later work |

## Proposed policies and unresolved approval gates

All policies in this table are draft defaults for coherent documentation, not accepted release promises. Each gate must be approved, revised, or explicitly excluded by an approved scope decision before Phase 0 readiness. Detailed alternatives are in the linked documents/ADRs.

| ID | Topic and proposed decision / unresolved selection | Status / source | Rationale / alternatives | Affected documents | Owner | Blocking stage / revisit trigger |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | Primary audience: self-directed adult beginners, English-reading, desktop-first coding and usable mobile reading/short exercises | proposed, E/D2 | Limits curriculum/context; alternatives: minors/classrooms, experienced practice, mobile-only. Age/language/device promises need approval | product, frontend, curriculum, security | PO | Phase 0; recruitment/device evidence or changed audience |
| P02 | Positioning: guided writing/debugging/application with deterministic feedback; no job-readiness/full JS mastery/agent proficiency claim | proposed, E/D2 | Theme supports motivation but is not sufficient differentiation; alternative: developer-tool/entertainment platform | product, curriculum | PO | Phase 0; learner interviews/product validation |
| P03 | Required guest entry/import, cloud progress/reconnect sync, web preview, and email/password+Google+GitHub; no cloud draft merge | proposed, R/E/D3 | Follow pre-launch details/public list; reducing scope is valid only explicitly, not by omissions in P0 list | product, frontend, backend, ADRs 0006/0008 | PO | Phase 0; cumulative scope/beta feasibility review |
| P04 | `Journey > Chapter > Quest`; Course a display synonym; 24 instructional quests plus one capstone | proposed, E/D4/D5 | Avoid duplicate entities; alternative: Journey>Course>Chapter>Quest or capstone included in 20–30 | product, curriculum, architecture, backend | PO/CO | Phase 0; changes to hierarchy or count |
| P05 | Seven chapters and observable logic/debug/test/transfer outcomes; inventory-manager capstone with supplied shell, no assessed DOM/events | proposed, E/D5 | Coherent with Foundations; alternative: teach DOM/events with revised allocation or worker-only capstone | curriculum, product, frontend, backend | PO/CO | Phase 0; approval of what counts as meaningful project |
| P06 | Browser-reported deterministic results; backend owns acceptance/persistence, not independent proof of correctness | proposed, E/D6 | Fits browser-only execution; forged completions possible. Alternative: independent isolated grading, outside this scope | architecture, backend, security, product, ADR 0005 | PO/SO | Phase 0; reject if high-stakes/verified claims are required |
| P07 | Guest access to Q01–Q04; device-local provisional progress, explicit signup import to authenticated account | proposed, E/D7 | Concrete small entry subset; alternative: different subset, guest full course, or account-first entry | product, frontend, backend, curriculum, ADR 0006 | PO | Phase 0; onboarding evidence/change to guest promise |
| P08 | Cached lessons/drafts/local JS; offline progress provisional; versioned idempotent outbox; account-separated local state | proposed, R/E/D7 | Avoid authority/merge ambiguity; alternatives: draft-only offline or wider offline progression | frontend, backend, security, ADR 0006 | PO/TO | Phase 0; offline scope/prototype failure |
| P09 | First accepted completion gives XP once per stable quest; hints/failures have no XP penalty; unlock by completion prerequisite | proposed, E/D8 | Encourages experimentation; alternatives: repeat rewards, hint penalties, mastery gating | gamification, curriculum, backend, ADRs 0006/0007 | PO/CO | Phase 0; balance/reward source revision |
| P10 | Streak on accepted first completion, backend acceptance date in learner timezone; no backdated guest/offline credit | proposed, E/D7/D8 | Simple acceptance semantics but delayed-sync fairness cost; alternative: trusted capture-date replay/grace policy | gamification, backend, frontend, ADR 0006 | PO | Phase 0; offline/timezone fairness evidence |
| P11 | Learner compartment has no authenticated origin/session access, network access, or application storage access; isolated messaging and resource limits | proposed, E/D9 | Concrete least-capability promise; exact mechanism unverified; alternative capabilities need explicit scoped review | security, frontend, architecture, ADR 0004 | TO/SO/PO | Phase 0 policy, then Phase 1 feasibility; failed isolation evidence |
| P12 | Direct Supabase Auth identity flows allowed; no learner uploads/direct Storage in MVP; private submissions, minimized telemetry | proposed, E/D9 | Avoid upload scope/data leakage; alternative: approved scoped upload paths | security, frontend, backend, ADR 0008 | PO/SO | Phase 0; upload/privacy/audience changes |
| P13 | Runtime receives no tokens; authenticated API uses verified bearer identity; protected requests never enter learner runtime/cache | proposed, E/D9 | Matches token-verification direction; alternate cookie/session transport requires boundary review; storage/refresh detail deferred | security, frontend, backend, ADR 0008 | TO/SO | Phase 0 transport boundary; auth implementation proposal |
| P14 | Accepted/account versus provisional states are explicit; attempts are submission occurrences; reset never deletes accepted progress | proposed, E/D4/D7 | Prevent state ambiguity; alternate semantics need full glossary/state review | product, frontend, backend, gamification | PO/TO | Phase 0; UX/state contract proposal |
| P15 | Stable IDs, compatible old versions accepted during explicit compatibility window; incompatible/retired pending work requires retry without losing draft; accepted history preserved | proposed, E/D5 | Avoid silent invalidation/duplicate XP; alternative: all old versions rejected or indefinite old assessment support | curriculum, backend, frontend, ADR 0007 | TO/CO | Phase 0; content lifecycle policy revision |
| U01 | Exact mobile coding guarantee, supported device/browser matrix and adult/minor policy need explicit selection | unresolved, E/D2/D9 | P01 gives recommendation, not feasibility/legal evidence; cannot market full mobile parity yet | product, frontend, security | PO/SO | Phase 0 policy and Phase 1 proof; recruitment/browser evidence |

## Deferred decisions

Approval evidence is none; owners/triggers below are requirements for later planning, not authorization to build features.

| ID | Topic | Status/source | Rationale / alternatives | Affected documents | Owner | Blocking stage / revisit trigger |
| --- | --- | --- | --- | --- | --- | --- |
| F01 | Origin/capability isolation mechanism, iframe/CSP flags, numeric runtime/output limits | deferred, E/D9 | Needs prototype evidence; same-origin privilege assumption is unacceptable | security, frontend, ADR 0004 | TO/SO | Phase 1, before production runtime proposal |
| F02 | Editor layout, exact supported device/browser versions and performance budgets | deferred, R/D2/D9 | Needs real keyboard/touch/low-end tests; no assumed mobile parity | frontend, product | PO/TO | Phase 1 before supported coding promises |
| F03 | DTOs, schemas, content compiler/publication projection, sync conflict algorithm/cache implementation | deferred, D5–D7 | Policies before mechanisms; no root packages extracted speculatively | backend, architecture, curriculum, frontend | TO | Relevant capability proposal after Phase 0 |
| F04 | XP values, level curve, content timing/difficulty balance | deferred, R/D8 | Needs final curriculum and learner feedback | gamification, curriculum | PO/CO | Before beta balancing |
| F05 | Numerical metric thresholds and beta sample/recruitment plan | deferred, D8 | No baseline/validated targets; choose hypotheses before evaluating results | product | PO | Before beta evaluation approval |
| F06 | Numeric retention durations, legal terms/privacy, deletion implementation, consent rules | deferred, R/D9 | Policy principles defined now, audience/jurisdiction/operation details later | security, backend, frontend | PO/SO | Before collecting real learner data, including private beta |
| F07 | Cloud source-draft sync/merge, public projects, CMS | deferred, R/D7/D10 | MVP preserves local drafts and account progress only; no consumer for expanded scope | product, frontend, backend | PO/TO | Separately approved capability |
| F08 | AI/Python/practice/achievements/leaderboards/portfolio and other P1+ features | deferred, R/D3/D8 | Roadmap tiers; initial entities do not authorize features | product, gamification, architecture | PO | Stabilized MVP evidence plus approved proposal |
| F09 | Future execution/AI/storage adapters, shared packages, service extraction | deferred, A/R/D10 | No independent consumer or scaling/security need; avoid speculative layers | architecture, backend | TO | Concrete consumer/requirement and approved ADR/change |

## Conflict resolutions

| Exploration conflict | Resolution / remaining gate |
| --- | --- |
| Root content and root API-client package in roadmap | C04/C05 follow A; capture corrected intended paths without editing ignored roadmap |
| Backend authority versus local grading | P06 distinguishes policy acceptance from proof; risk unapproved, ADR 0005 proposed |
| Limited offline versus guest/multi-device/outbox scope | P03/P07/P08 specify bounded proposed scope; cumulative release promise still unapproved |
| MVP mastery unlocks versus later mastery tracking | P09/F08 defer mastery gating; XP and completion do not measure mastery |
| DOM/events capstone versus untaught concepts | P05 uses supplied shell; assessed DOM/events excluded pending explicit curriculum expansion |
| Entity/module examples versus priority tiers | Canonical product matrix controls features, not conceptual entity lists |
| Phase 0 versus P0 versus exact development order | Distinct labels; prototypes and production foundations remain later work |
| Late security/testing/accessibility phases | C11 defines baseline from first design; later phases verify/harden |
| Abstract future systems early | F09 records constraints; no adapters/storage/AI layers built here |
| Roadmap ignored by Git | Durable commitments captured in these docs; source file unchanged |

## Phase 0 completion assessment

Documentation drafting and author consistency review are complete: eight documents and eight ADRs are delivered. Approval readiness is **blocked** on P01–P15/U01; applying the change is not approval evidence. No Phase 1 prototype or production work is authorized by this register. A future explicit policy decision updates the affected register rows/documents/ADR statuses; no approval is inferred from silence.

### Four roadmap completion questions

| Question | Defined answer / remaining gate |
| --- | --- |
| What are we building? | A pixel-themed, guided JavaScript Foundations learning environment with deterministic feedback and one meaningful capstone; exact persona/project promise P01/P02/P05 pending |
| What are we not building? | No broad IDE/deployment/community/AI/agent/multi-language/high-stakes credential platform in MVP; canonical exclusions in product.md |
| Who owns each system? | Client owns presentation/editor/runtime/local state; NestJS owns authorization/application tables/curriculum and accepted account transitions; client grading is not independent proof (P06 pending) |
| What is required for MVP? | Canonical product inventory captures confirmed baseline and proposed guest/sync/preview/provider boundaries; cumulative scope P03/P07/P08 pending |

### Policy review packet

| Review group | Concrete recommendation to approve or revise | Register IDs |
| --- | --- | --- |
| Audience/positioning | Adult English-reading beginners; desktop-first, usable mobile reading/short exercises; practical guided learning, no job-readiness claim | P01/P02/U01 |
| Release scope | Include guest Q01–Q04/import, account progress/reconnect sync, sandboxed preview, three listed auth methods; source drafts local only | P03/P07/P08 |
| Vocabulary/state | Journey>Chapter>Quest; Course synonym; Run/Check distinct from acceptance; reset/replay preserve accepted completion | P04/P14 |
| Outcomes/project | Seven chapters, 24 instructional quests plus capstone; inventory-manager logic with supplied shell; assess logic/debug/transfer, not DOM/events | P04/P05 |
| Completion trust | Accept browser-reported deterministic results for personal learning with declared fraud limitation; no verified credential/competitive claims | P06 |
| Rewards/dates | First accepted stable quest completion only; no hint/failure penalty, completion-prerequisite unlocks, acceptance-day streak/no backdating | P09/P10 |
| Execution/auth/data | No learner session/network/application storage/authenticated access; bearer identity to backend; private snapshots, minimized telemetry, no uploads | P11/P12/P13 |
| Content compatibility | Explicit supported-version mapping, preserve accepted history/XP, retain incompatible pending source for retry | P15 |

These are decision selections, not requests for permission to write the already-authorized documentation. They must be explicitly reviewed before claiming Phase 0 ready or using them as approved behavior in later capability changes.

### Requirements coverage and review outcome

| Requirement | Evidence / outcome |
| --- | --- |
| R1 product | product.md covers persona, canonical release matrix, exclusions, glossary, loop, metrics; PO selection gates remain pending, no claims of validated efficacy |
| R2 architecture | architecture.md maps intended versus current state, owners/trust and corrected paths; no applications/infrastructure scaffolded |
| R3 frontend | frontend.md covers editor/device/accessibility, draft/outbox/cache separation, provisional state and recovery; no cloud draft guarantee |
| R4 backend | backend.md covers identity, acceptance, versions, consistent progress/reward/unlocks, capstone and telemetry; no arbitrary execution/independent grading claim |
| R5 security | security.md maps assets/actors/threats, data/capability requirements, explicit residual risk and Phase 1/beta gates; policy approval/evidence pending |
| R6 curriculum | curriculum.md has Q01–Q24 exactly once in order, O1–O8 outcome mapping, seven chapters, prerequisites, capstone scaffold/rubric, review/version policy; not executable content |
| R7 gamification | gamification.md defines sources, uniqueness, hint/failure/replay, derived levels, timezone/acceptance dates, completion unlocks and deferred mechanics |
| R8 register | C01–C12, P01–P15/U01, F01–F09 capture sources/status/owners/alternatives/affected outputs/blocking stages/triggers; pending approval evidence explicitly none |
| R9 ADRs | All eight ADRs have context, status/evidence, alternatives, consequences, register links and triggers; 0001–0003 accepted source commitments, 0004–0008 proposed detailed policies |
| R10 consistency | Author review reconciled hierarchy/count/guest subset, assessment vs mastery, active/history version semantics, local vs accepted effects, token/cache boundaries, replay/XP/streak dates. Product approvals remain pending rather than hidden inconsistencies. |
| R11 scope/checks | Change-authored files are only docs and OpenSpec planning/task tracking; existing AGENTS.md branch-cleanup edit was observed and preserved, not authored here. No code/config/migration/generated skill/infrastructure changes. |

### Verification record

Performed during documentation apply on 2026-09-13:

- `openspec validate define-codequest-product-and-architecture --strict`: passed; `skip_specs: true` deliberately permits zero capability deltas for this documentation-only change.
- Relative Markdown file links and referenced heading anchors: checked across all 16 documentation files; passed.
- Curriculum table: Q01–Q24 exactly once in increasing order; passed.
- Placeholder/trailing-whitespace scan of docs/change artifacts: no matches. `git diff --check` passed for tracked files; untracked deliverables were also reviewed with no-index diffs/checks.
- `pnpm test`: could not run, PowerShell `CommandNotFoundException` because `pnpm` is not available on PATH.
- `pnpm lint`: same unavailable-command failure.
- `pnpm typecheck`: same unavailable-command failure.
- The repository also has no root `package.json`, frontend or backend workspace. No workspace or dependencies were created to make unrelated application checks runnable.

Documentation validation is not application test coverage or proof of isolation/learning efficacy. All F01–F09 retain the owners/triggers above. Policy decisions and Phase 1 evidence are needed before later implementation promises; beta data collection additionally requires F06. No automatic sync/archive/merge is performed.
