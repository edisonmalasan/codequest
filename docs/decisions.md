# CodeQuest decision register

This is the approval record for Phase 0. The user explicitly clarified that the instruction to archive `define-codequest-product-and-architecture` also approved its proposed product and architecture decisions. P01–P15 and the applicable U01 baseline are confirmed by AP01 below. This consistency correction does not reopen the archived change or authorize Phase 1 implementation.

## Sources and statuses

- **A:** [AGENTS.md](../AGENTS.md), current engineering commitments and architecture boundaries.
- **R:** [development roadmap](DEVELOPMENT_ROADMAP.md): Product Goal, Architectural Principles, Priority Tiers, Phases 0–40, Explicitly Postpone, and Core Roadmap Rule. It now lives under `docs/` outside the ignored temporary directory; its contents were preserved during relocation. Historical directory trees and terminology examples remain subject to the explicit conflict resolutions and approved definitions below.
- **E:** Phase 0 exploration in the conversation: ambiguities, contradictions, and recommendations; not product approval.
- **D:** [archived change design](../openspec/changes/archive/2026-09-13-define-codequest-product-and-architecture/design.md), D1–D10.
- **U:** user's proposal/apply requests: documentation-only execution scope; technical branch naming; no production infrastructure.
- **AP01:** [explicit Phase 0 approval](#ap01-explicit-phase-0-approval), this user's clarification of the archive instruction.
- **AP02:** [reviewed Phase 1 no-go](#ap02-reviewed-phase-1-no-go), explicit approval of the measured preview failure outcome.

### AP01: Explicit Phase 0 approval

Recorded on 2026-09-13. Approval evidence is the user's instruction:

> My instruction to archive the completed Phase 0 change was also my explicit approval of the proposed Phase 0 product and architecture decisions.

The same instruction directs P01–P15/U01 and affected document/ADR statuses to reflect that approval. It limits this work to documentation consistency, requests roadmap relocation/reference updates, prohibits reopening the archived change or creating a new proposal, and prohibits Phase 1 implementation.

AP01 confirms the documented defaults, including personal-learning completion fraud acceptance P06 and limited offline/streak trade-offs. It does not establish empirical runtime containment, mobile parity, learning efficacy, legal compliance, or values/details not defined in Phase 0. U01 is resolved to the adult/desktop-first baseline in P01 and the Chrome/Firefox/WebKit testing direction; exact supported versions/devices/performance budgets remain F02. F01–F09 retain their deferred status and triggers. Archived planning decisions remain a historical record; this register and the accepted ADRs record their approval, with only the archived proposal's roadmap source pointer corrected.

`confirmed` means established by an explicit source, not implemented or empirically verified. `proposed` means a concrete recommendation awaiting review. `unresolved` means a choice still needs a selection. `deferred` means a bounded later decision with a trigger, not an implicitly approved feature.

Each row has a stable ID, topic/decision, status, source, rationale/alternatives, affected documents, owner, remaining evidence stage, and revisit trigger. For **confirmed** rows, the cited source is the approval evidence. Future **proposed** or **unresolved** rows need explicit evidence before confirmation; for **deferred** rows, approval to defer does not select unspecified details. Owners are roles, not invented people: PO = product owner/user; TO = technical owner; CO = curriculum owner; SO = security/privacy owner. Named assignees remain unassigned. A decision owner must record the choice and approval evidence before changing status.

## Confirmed commitments

| ID | Topic/decision | Status/source and approval evidence | Rationale / alternatives | Affected documents | Owner | Blocking stage / revisit trigger |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | Pixel-themed coding education; learning and usability before gamification/community/AI | confirmed, A/R | One coherent course before breadth; an entertainment-first product conflicts with roadmap | [product](product.md), [curriculum](curriculum.md), [gamification](gamification.md) | PO | All phases; revisit only on explicit product change |
| C02 | Next.js frontend, NestJS authoritative modular-monolith backend | confirmed, A/R | Avoid service complexity; backend rules cannot move to Next.js | [architecture](architecture.md), [frontend](frontend.md), [backend](backend.md), ADR 0001 | TO | Foundations; scaling/security evidence may justify a separate ADR |
| C03 | Backend owns application tables/rules; no cross-app imports | confirmed, A/R | Enforce identity/ownership centrally rather than client-controlled writes | architecture, frontend, backend, [security](security.md), ADRs 0001/0008 | TO/SO | Any application design; revisit through approved boundary change |
| C04 | REST/OpenAPI; generated client under `frontend/src/lib/api/generated/` | confirmed, A | Roadmap's `packages/api-client` conflicts; A takes precedence, no independent second consumer | architecture, frontend, backend, ADR 0002 | TO | API foundation; revisit when two independent consumers justify extraction |
| C05 | Curriculum belongs under `backend/content/`, Git-first, delivered through API | confirmed, A/R | Roadmap root `content/` trees are superseded by A; client raw-content imports are excluded | curriculum, architecture, backend, ADR 0003 | TO/CO | Content foundation; revisit if an approved authoring requirement changes source |
| C06 | Browser JavaScript Worker and sandboxed web-preview direction; never learner execution inside NestJS | confirmed, A/R | Remote execution deferred; feasibility/isolation not yet proved | architecture, frontend, security, ADR 0004 | TO/SO | Runtime design; Phase 1 evidence required |
| C07 | One Foundations journey, 5–7 chapters, 20–30 quests, one capstone | confirmed, R Phase 0/P0 | One polished course; count interpretation approved in P04/P05 | product, curriculum | PO/CO | Curriculum scope; explicit outcomes/scope revision |
| C08 | Deterministic assessment without LLM correctness grading; AI optional/post-MVP | confirmed, R | Curriculum must stand alone; AI cannot substitute for manual learning | product, curriculum, backend, security, ADR 0005 | PO/CO | Assessment design; separately approved future AI capability |
| C09 | Meaningful-learning rewards, no repeat XP farming, derived levels, meaningful streaks | confirmed, R Phases 19–22 | App opens are not learning; qualifying rules approved in P09/P10; numeric balance deferred F04 | gamification, backend, ADR 0006 | PO/TO | Reward design; content balancing/approved new reward source |
| C10 | Limited offline/PWA/local draft support | confirmed, R P0/Phases 23–28 | Preserve usable learning/code; does not promise fully offline account authority | product, frontend, backend, ADR 0006 | PO/TO | PWA scope; explicit offline promise review |
| C11 | Security/testing/accessibility/monitoring are release requirements | confirmed, A/R | Late hardening/testing phases do not excuse unsafe early design | product, frontend, security | TO/SO | From first prototype; beta/public release evidence |
| C12 | Phase 0 execution produced docs/ADRs only; archive was separately authorized; no application/infrastructure implementation | confirmed, U/D1/AP01 | Phase 0 closure and this correction do not authorize Phase 1 | All deliverables | PO/TO | New explicit user request required for later implementation |

## Approved Phase 0 policies

All policies in this table are confirmed by AP01. Stable IDs retain their P/U prefixes for traceability; the prefixes no longer indicate pending approval. Alternatives are retained as decision rationale, not open approval gates. Exact implementation and feasibility evidence remain subject to the separate deferred decisions.

| ID | Approved decision | Status / source and approval evidence | Rationale / alternatives | Affected documents | Owner | Remaining evidence stage / revisit trigger |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | Primary audience: self-directed adult beginners, English-reading, desktop-first coding and usable mobile reading/short exercises | confirmed, E/D2/AP01 | Limits curriculum/context; alternatives: minors/classrooms, experienced practice, mobile-only. Age/language/device baseline approved by AP01 | product, frontend, curriculum, security | PO | Approved Phase 0; recruitment/device evidence or changed audience |
| P02 | Positioning: guided writing/debugging/application with deterministic feedback; no job-readiness/full JS mastery/agent proficiency claim | confirmed, E/D2/AP01 | Theme supports motivation but is not sufficient differentiation; alternative: developer-tool/entertainment platform | product, curriculum | PO | Approved Phase 0; learner interviews/product validation |
| P03 | Required guest entry/import, cloud progress/reconnect sync, web preview, and email/password+Google+GitHub; no cloud draft merge | confirmed, R/E/D3/AP01 | Follow pre-launch details/public list; reducing scope is valid only explicitly, not by omissions in P0 list | product, frontend, backend, ADRs 0006/0008 | PO | Approved Phase 0; cumulative scope/beta feasibility review |
| P04 | `Journey > Chapter > Quest`; Course a display synonym; 24 instructional quests plus one capstone | confirmed, E/D4/D5/AP01 | Avoid duplicate entities; alternative: Journey>Course>Chapter>Quest or capstone included in 20–30 | product, curriculum, architecture, backend | PO/CO | Approved Phase 0; changes to hierarchy or count |
| P05 | Seven chapters and observable logic/debug/test/transfer outcomes; inventory-manager capstone with supplied shell, no assessed DOM/events | confirmed, E/D5/AP01 | Coherent with Foundations; alternative: teach DOM/events with revised allocation or worker-only capstone | curriculum, product, frontend, backend | PO/CO | Approved Phase 0; approved project promise; revisit on outcome changes |
| P06 | Browser-reported deterministic results; backend owns acceptance/persistence, not independent proof of correctness | confirmed, E/D6/AP01 | Fits browser-only execution; forged completions possible. Alternative: independent isolated grading, outside this scope | architecture, backend, security, product, ADR 0005 | PO/SO | Approved Phase 0; reject if high-stakes/verified claims are required |
| P07 | Guest access to Q01–Q04; device-local provisional progress, explicit signup import to authenticated account | confirmed, E/D7/AP01 | Concrete small entry subset; alternative: different subset, guest full course, or account-first entry | product, frontend, backend, curriculum, ADR 0006 | PO | Approved Phase 0; onboarding evidence/change to guest promise |
| P08 | Cached lessons/drafts/local JS; offline progress provisional; versioned idempotent outbox; account-separated local state | confirmed, R/E/D7/AP01 | Avoid authority/merge ambiguity; alternatives: draft-only offline or wider offline progression | frontend, backend, security, ADR 0006 | PO/TO | Approved Phase 0; offline scope/prototype failure |
| P09 | First accepted completion gives XP once per stable quest; hints/failures have no XP penalty; unlock by completion prerequisite | confirmed, E/D8/AP01 | Encourages experimentation; alternatives: repeat rewards, hint penalties, mastery gating | gamification, curriculum, backend, ADRs 0006/0007 | PO/CO | Approved Phase 0; balance/reward source revision |
| P10 | Streak on accepted first completion, backend acceptance date in learner timezone; no backdated guest/offline credit | confirmed, E/D7/D8/AP01 | Simple acceptance semantics but delayed-sync fairness cost; alternative: trusted capture-date replay/grace policy | gamification, backend, frontend, ADR 0006 | PO | Approved Phase 0; offline/timezone fairness evidence |
| P11 | Learner compartment has no authenticated origin/session access, network access, or application storage access; isolated messaging and resource limits | confirmed, E/D9/AP01 | Concrete least-capability promise; exact mechanism unverified; alternative capabilities need explicit scoped review | security, frontend, architecture, ADR 0004 | TO/SO/PO | Approved policy; Phase 1 feasibility; failed isolation evidence |
| P12 | Direct Supabase Auth identity flows allowed; no learner uploads/direct Storage in MVP; private submissions, minimized telemetry | confirmed, E/D9/AP01 | Avoid upload scope/data leakage; alternative: approved scoped upload paths | security, frontend, backend, ADR 0008 | PO/SO | Approved Phase 0; upload/privacy/audience changes |
| P13 | Runtime receives no tokens; authenticated API uses verified bearer identity; protected requests never enter learner runtime/cache | confirmed, E/D9/AP01 | Matches token-verification direction; alternate cookie/session transport requires boundary review; storage/refresh detail deferred | security, frontend, backend, ADR 0008 | TO/SO | Approved transport boundary; auth implementation proposal |
| P14 | Accepted/account versus provisional states are explicit; attempts are submission occurrences; reset never deletes accepted progress | confirmed, E/D4/D7/AP01 | Prevent state ambiguity; alternate semantics need full glossary/state review | product, frontend, backend, gamification | PO/TO | Approved Phase 0; UX/state contract proposal |
| P15 | Stable IDs, compatible old versions accepted during explicit compatibility window; incompatible/retired pending work requires retry without losing draft; accepted history preserved | confirmed, E/D5/AP01 | Avoid silent invalidation/duplicate XP; alternative: all old versions rejected or indefinite old assessment support | curriculum, backend, frontend, ADR 0007 | TO/CO | Approved Phase 0; content lifecycle policy revision |
| U01 | Adult beginners; desktop-first coding and usable mobile reading/short exercises; Chrome/Firefox/WebKit testing direction, exact supported versions/devices deferred F02 | confirmed, E/D2/D9/AP01 | Approved P01 baseline; no full mobile parity or legal/feasibility evidence claimed | product, frontend, security | PO/SO | F02/Phase 1 evidence before exact support promises; recruitment/browser evidence |

## AP02: Reviewed Phase 1 no-go

Recorded 2026-09-13. The project owner answered the explicit question approving the report's no-go conclusion for the current preview mechanisms, pending a scoped redesign:

> Yes i approve proceed completing all the tasks in Phase 1.

The owner is the assigned technical, product and security reviewer. This is a project-owner security self-review, not an independent audit. AP02 approves the measured no-go conclusion in the [Phase 1 report](technical-risk-validation/report.md), not a passing feasibility claim, missing physical tests, a policy exception or Phase 2 execution. The request to complete tasks authorizes remaining work; tests requiring unavailable hardware and failed acceptance gates cannot be marked passed from this instruction.

F01 is **reviewed no-go for the evaluated preview mechanisms; production selection blocked pending scoped redesign**. Worker focused results do not compensate for preview recovery failure. F02 is **inconclusive for required physical/device/accessibility coverage**; no production support matrix or performance promise is selected. The charter's numeric limits remain experimental criteria, not measured production guarantees. P01-P15/U01/AP01 and F03-F09 remain unchanged.

## Phase 1 Worker-preview continuation - 2026-09-13

The owner explicitly instructed a scoped preview containment/recovery redesign preserving P11 and the approved limits. Core Worker-backed supplied-shell automation now passes in Chromium, Firefox and WebKit; WebKit simulated-offline integration fails and required physical/accessibility evidence remains untested. See the [current report](technical-risk-validation/report.md#worker-preview-redesign-continuation---2026-09-13) and [ADR 0004 addendum](adr/0004-browser-execution-isolation.md). F01 remains unselected for production; review of the new recommendation is pending. AP02 remains historical approval of the failed executable-HTML candidates, not approval of this new result. F02 stays inconclusive; P01-P15/U01/AP01 and F03-F09 are unchanged.

## Deferred decisions

AP01 approves retaining these deferrals and their owners/triggers. It does not select their unspecified implementation details, numeric values or operational policies, nor authorize building features.

| ID | Topic | Status/source | Rationale / alternatives | Affected documents | Owner | Blocking stage / revisit trigger |
| --- | --- | --- | --- | --- | --- | --- |
| F01 | Origin/capability isolation mechanism, iframe/CSP flags, numeric runtime/output limits | legacy preview reviewed no-go AP02; Worker-preview recommendation pending review; production selection blocked | Needs prototype evidence; same-origin privilege assumption is unacceptable | security, frontend, ADR 0004 | TO/SO | Phase 1, before production runtime proposal |
| F02 | Editor layout, exact supported device/browser versions and performance budgets | inconclusive required coverage, AP02; selection deferred | Needs real keyboard/touch/low-end tests; no assumed mobile parity | frontend, product | PO/TO | Phase 1 before supported coding promises |
| F03 | DTOs, schemas, content compiler/publication projection, sync conflict algorithm/cache implementation | deferred, D5–D7 | Policies before mechanisms; no root packages extracted speculatively | backend, architecture, curriculum, frontend | TO | Relevant capability proposal after Phase 0 |
| F04 | XP values, level curve, content timing/difficulty balance | deferred, R/D8 | Needs final curriculum and learner feedback | gamification, curriculum | PO/CO | Before beta balancing |
| F05 | Numerical metric thresholds and beta sample/recruitment plan | deferred, D8 | No baseline/validated targets; choose hypotheses before evaluating results | product | PO | Before beta evaluation approval |
| F06 | Numeric retention durations, legal terms/privacy, deletion implementation, consent rules | deferred, R/D9 | Policy principles defined now, audience/jurisdiction/operation details later | security, backend, frontend | PO/SO | Before collecting real learner data, including private beta |
| F07 | Cloud source-draft sync/merge, public projects, CMS | deferred, R/D7/D10 | MVP preserves local drafts and account progress only; no consumer for expanded scope | product, frontend, backend | PO/TO | Separately approved capability |
| F08 | AI/Python/practice/achievements/leaderboards/portfolio and other P1+ features | deferred, R/D3/D8 | Roadmap tiers; initial entities do not authorize features | product, gamification, architecture | PO | Stabilized MVP evidence plus approved proposal |
| F09 | Future execution/AI/storage adapters, shared packages, service extraction | deferred, A/R/D10 | No independent consumer or scaling/security need; avoid speculative layers | architecture, backend | TO | Concrete consumer/requirement and approved ADR/change |

## Conflict resolutions

| Exploration conflict | Resolution / remaining evidence |
| --- | --- |
| Root content and root API-client package in roadmap | C04/C05 follow A; approved intended paths supersede historical roadmap trees |
| Backend authority versus local grading | P06 distinguishes policy acceptance from proof; personal-learning fraud limitation accepted by AP01, ADR 0005 accepted |
| Limited offline versus guest/multi-device/outbox scope | P03/P07/P08 define the approved bounded scope; technical feasibility remains separate |
| MVP mastery unlocks versus later mastery tracking | P09/F08 defer mastery gating; XP and completion do not measure mastery |
| DOM/events capstone versus untaught concepts | Approved P05 uses supplied shell; assessed DOM/events excluded unless a later curriculum expansion is approved |
| Entity/module examples versus priority tiers | Canonical product matrix controls features, not conceptual entity lists |
| Phase 0 versus P0 versus exact development order | Distinct labels; prototypes and production foundations remain later work |
| Late security/testing/accessibility phases | C11 defines baseline from first design; later phases verify/harden |
| Abstract future systems early | F09 records constraints; no adapters/storage/AI layers built here |
| Roadmap formerly ignored by Git | Relocated unchanged to docs/DEVELOPMENT_ROADMAP.md; current source references updated and approved docs control conflict resolutions |

## Phase 0 completion assessment

Phase 0 product and architecture definition is **complete and approved**: eight documents and eight ADRs are delivered; P01–P15/U01 are confirmed by AP01. The completed change remains archived. Technical feasibility and operational details in F01–F09 remain deferred; approval is not implementation or validation evidence. No Phase 1 prototype or production work is authorized by this correction.

### Four roadmap completion questions

| Question | Approved answer |
| --- | --- |
| What are we building? | A pixel-themed, guided JavaScript Foundations learning environment for adult English-reading beginners with deterministic feedback and the approved capstone/outcomes in P01/P02/P05 |
| What are we not building? | No broad IDE/deployment/community/AI/agent/multi-language/high-stakes credential platform in MVP; canonical exclusions in product.md |
| Who owns each system? | Client owns presentation/editor/runtime/local state; NestJS owns authorization/application tables/curriculum and accepted account transitions; approved P06 client grading is not independent proof |
| What is required for MVP? | Canonical product inventory includes approved guest/sync/preview/provider boundaries in P03/P07/P08 alongside confirmed roadmap commitments |

### Approved policy summary

| Policy group | Approved definition (AP01) | Register IDs |
| --- | --- | --- |
| Audience/positioning | Adult English-reading beginners; desktop-first, usable mobile reading/short exercises; practical guided learning, no job-readiness claim | P01/P02/U01 |
| Release scope | Include guest Q01–Q04/import, account progress/reconnect sync, sandboxed preview, three listed auth methods; source drafts local only | P03/P07/P08 |
| Vocabulary/state | Journey>Chapter>Quest; Course synonym; Run/Check distinct from acceptance; reset/replay preserve accepted completion | P04/P14 |
| Outcomes/project | Seven chapters, 24 instructional quests plus capstone; inventory-manager logic with supplied shell; assess logic/debug/transfer, not DOM/events | P04/P05 |
| Completion trust | Accept browser-reported deterministic results for personal learning with declared fraud limitation; no verified credential/competitive claims | P06 |
| Rewards/dates | First accepted stable quest completion only; no hint/failure penalty, completion-prerequisite unlocks, acceptance-day streak/no backdating | P09/P10 |
| Execution/auth/data | No learner session/network/application storage/authenticated access; bearer identity to backend; private snapshots, minimized telemetry, no uploads | P11/P12/P13 |
| Content compatibility | Explicit supported-version mapping, preserve accepted history/XP, retain incompatible pending source for retry | P15 |

AP01 approves these definitions as the Phase 0 source for later capability planning. It does not authorize implementing those capabilities in this correction.

### Requirements coverage and review outcome

| Requirement | Evidence / outcome |
| --- | --- |
| R1 product | product.md covers persona, canonical release matrix, exclusions, glossary, loop, metrics; PO selections confirmed by AP01, no claims of validated efficacy |
| R2 architecture | architecture.md maps intended versus current state, owners/trust and corrected paths; no applications/infrastructure scaffolded |
| R3 frontend | frontend.md covers editor/device/accessibility, draft/outbox/cache separation, provisional state and recovery; no cloud draft guarantee |
| R4 backend | backend.md covers identity, acceptance, versions, consistent progress/reward/unlocks, capstone and telemetry; no arbitrary execution/independent grading claim |
| R5 security | security.md maps assets/actors/threats, data/capability requirements, explicit residual risk and Phase 1/beta gates; policy approved by AP01; feasibility evidence deferred |
| R6 curriculum | curriculum.md has Q01–Q24 exactly once in order, O1–O8 outcome mapping, seven chapters, prerequisites, capstone scaffold/rubric, review/version policy; not executable content |
| R7 gamification | gamification.md defines sources, uniqueness, hint/failure/replay, derived levels, timezone/acceptance dates, completion unlocks and deferred mechanics |
| R8 register | C01–C12, P01–P15/U01, F01–F09 capture sources/status/owners/alternatives/affected outputs/blocking stages/triggers; P01–P15/U01 approval evidence AP01; deferred detail approvals not invented |
| R9 ADRs | All eight ADRs have context, status/evidence, alternatives, consequences, register links and triggers; 0001–0003 accepted source commitments, 0004–0008 accepted by AP01, with feasibility evidence still unverified |
| R10 consistency | Author review reconciled hierarchy/count/guest subset, assessment vs mastery, active/history version semantics, local vs accepted effects, token/cache boundaries, replay/XP/streak dates. Product approvals are recorded in AP01; remaining technical deferrals are explicit. |
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

## Offline-path diagnostic evidence - 2026-09-14

The [fixed-response service-worker control and cold-origin trials](technical-risk-validation/report.md#offline-emulation-and-cold-origin-diagnostics---2026-09-14) separate WebKit offline emulation from application behavior. All three engines passed a single headless cold-origin functional check, with WebKit requiring a shorter task profile after its original CacheStorage filesystem failure. Original emulation failures remain failed; physical/Safari/accessibility/native quota evidence and new recommendation review remain incomplete. No production mechanism or F02 promise is selected, and AP01/AP02 scope is unchanged.


## Native Chrome evidence checkpoint - 2026-09-14

The [installed-Chrome evidence](technical-risk-validation/report.md#installed-windows-chrome-continuation---2026-09-14) adds actual Windows Chrome interaction, browser zoom, storage-denial recovery, isolated PWA installation and process-cold diagnostics. Native valid-run startup and fresh-preview timing failures remain a redesign/no-go; earlier downloaded-engine passes do not establish the installed-browser gate. Source/save synchronization defects were corrected with focused regression coverage. Native full-storage, physical mobile/Safari, spoken assistive technology and OS restart evidence remain inconclusive/untested. Proposed progression scope adjustments are review recommendations only, not approved exceptions. F01 remains unselected and F02 incomplete; AP01/AP02 and P11 remain unchanged. The current results need dated project-owner technical/product/security self-review. No Phase 2, Sync or Archive begins.


## Authorized bootstrap experiment checkpoint - 2026-09-14

The project owner explicitly approved the persistent trusted opaque bootstrap/fresh-per-run Worker experiment and D3/charter revision, preserving P11 and all numerical limits. It is implemented through `e9e8436`, including private cleanup control and generation-bound untrusted output. This approval is not S01-S06 approval, F01 production selection, F02 support acceptance or Proceed. See the [current evidence report](technical-risk-validation/report.md#authorized-persistent-bootstrap-checkpoint---2026-09-14). Final installed Chrome: **45 passed / 4 failed**; independent native cycles: **96/100 valid Worker successes, four timeouts, next fresh success 1101.9ms**; 10 witnessed loop recoveries/100 preview cycles and native zoom/PWA/20 persistence cycles pass. Bundled affected retest: **111 passed / 5 failed / 4 skipped**; replay passes all three engines, target-lifetime/WebKit offline failures retained, isolated focus retest passes without erasing the prior failure. Chrome ten-cold-trial probe fails before any completed trial; WebKit single cold-origin control passes.

**Phase 1 remains 22/34 and Redesign/no-go**. Missing physical macOS/Android/iPhone, installed Firefox and NVDA/VoiceOver remain untested; native background/full quota/OS restart and total resource bounds remain unverified. Scope adjustment and dated owner product/technical/security self-review are pending. Security review is self-review, not an independent audit. AP01/AP02, approved Phase 0 policy and required recovery limits remain unchanged. No Phase 2, Sync or Archive.


## Latest Apply continuation - 2026-09-15

Terminal-output Worker termination ordering was corrected and verified by 20 unit tests; lint/typechecks/build pass. Full installed Chrome remains **34 passed / 15 failed**; affected bundled engines **31 passed / 4 failed / 1 skipped**, followed by two explicit unsupported-CDP skips. Independent 100 Worker/100 preview cycles and PWA/20 persistence cycles pass, but four post-loop fresh runs time out, the ten-cold-process probe completes 0/10 trials, and the 400% local Check times out. [Latest evidence](technical-risk-validation/report.md#final-continuation-evidence-and-progression---2026-09-15) retains original failures and exact hashes. **Phase 1 stays 22/34 and Redesign/no-go** (historical checkpoint; superseded by AP03 and the 34/34 completion below). The [dedicated-bootstrap follow-up](technical-risk-validation/proposed-bootstrap-revision.md) was implemented and retested; S01-S06 were approved via delegated AP03. Security review is self-review, not an independent audit. Accepted Phase 0 policies/AP01/AP02 remain unchanged. No Phase 2, Sync or Archive.


## Delegated dedicated-candidate review - 2026-09-18

AI-assisted delegated project-owner review, explicitly authorized for this continuation; not an independent audit and not owner-executed testing. Verdict: **Inconclusive** for dedicated-candidate progression — Chromium bundled dedicated scope fully passes (including the charter-backed targets-assertion correction with hard ack/fresh/source gates), unit 28/28 with clean lint/typechecks, P11 holding in all measured runs; Firefox downloaded-headless verdicts churn on timing with a reproducibly slow offline-preparation path (containment signals holding); WebKit offline cluster stable and environmental; opaque-era native substitute failures and untested physical/AT matrix retained. No containment breach and no stable product defect were found, so the spec no-go trigger is not met; required gates do not reproducibly pass, so Proceed is not met. Historical opaque Redesign/no-go (AP02) retained. F01 dedicated recommendation is Chromium-complete and pending Firefox/WebKit stabilization with no production selection; F02 inconclusive; S01-S06 remain proposed, not applied. Task 9.3 complete (**23/34**). Full record: [review](technical-risk-validation/report.md#delegated-technicalproductsecurity-review---2026-09-18). AP01/AP02 and P11 unchanged. No Phase 2, Sync, Archive or PR #6 merge.


## AP03: Delegated S01-S06 scope approval - 2026-09-18

AI-assisted delegated project-owner approval of the [Phase 1 scope adjustment](technical-risk-validation/proposed-scope-adjustment.md) S01-S06, explicitly authorized for this continuation. This is not owner-personal approval and not an independent audit. Entry conditions verified: no stably-failing product finding on any engine; WebKit offline-emulation failure proven environmental by the fixed-response control with passing separate cold-origin recovery (S06 conditions met); full native installed-Chrome suite 63/63; cold-process S04 substitute 10/10; every required automated test holds a passing record on Chromium, installed Chrome and Firefox (partitioned where the dev box is load-constrained; WebKit except the S06 cluster). S01/S02 move inaccessible physical/AT evidence to pre-beta release gates as explicit `untested` obligations (no support claims); S03/S04 substitute eligibility only with unchanged numbers; S05 accepts disclosed missing native quota/restart evidence; S06 accepts the WebKit emulation failure as reviewed configuration limitation with original failures retained. P11, all B01-B09 budgets, failure retention and AP01/AP02 are unchanged. F01 dedicated recommendation and F02 support scope remain pending the final review, not decided here.


## F01/F02 Phase 1 selections - 2026-09-18

Recorded under delegated review (not an independent audit; not owner-personal testing). **F01:** the dedicated Worker computation plus fixed script-disabled supplied-shell presentation with text equivalent is the Phase 1 recommended mechanism: fresh literal-URL HTTP Worker per run, `worker-src 'none'` denial of nested execution, exact-origin private cleanup with 100ms fallback, generation-bound bounded output, pinned public-byte/CSP cache with immutable-byte repair. Evidence: full automated matrix (installed Chrome 63/63, Chromium bundled scope, Firefox partitioned component coverage, WebKit except the S06 cluster), empty sink records in every authority probe, P11 holding throughout. Production adoption still requires a Phase 2+ proposal; no production selection is made here. **F02:** validated scope is desktop-first — accessible installed Windows Chrome plus pinned Chromium/Firefox/WebKit component coverage with the measured budgets on development hardware only. Physical mobile, macOS/Android/iPhone Safari, installed Firefox, NVDA/VoiceOver, low-power-device timing and native quota/background/OS-restart are explicit pre-beta release obligations, `untested`, with no support, installability, performance or accessibility promise inferred. F03–F09 deferrals unchanged.
