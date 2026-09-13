## Context

See `proposal.md` for motivation and outputs. The repository currently contains engineering instructions, a license, installed skills, an ignored roadmap, and an empty OpenSpec inventory. There is no application workspace or implemented behavior to preserve. The roadmap's future directory trees are plans, not current architecture.

This design specifies how to produce Phase 0 documentation. It does not design executable modules or assert that proposed product defaults have been approved.

## Goals / Non-Goals

**Goals:** establish traceable, internally consistent definitions; make disputed decisions reviewable; separate accepted constraints from proposed policies; identify the exact evidence needed in Phase 1 and before launch.

**Non-Goals:** freeze DTOs, database schemas, provider adapters, deployment topology, editor layouts, or production security configuration; claim learning efficacy without learner evidence; turn future roadmap features into current implementation requirements.

## Decisions

### D1 — Documentation contract and approval state

Use the nine deliverable areas in the proposal. Product vocabulary and release scope belong in `product.md`; technical rationale belongs in ADRs; each specialist document references the canonical definition instead of maintaining competing lists. `architecture.md` contains the ownership matrix and links to those policies.

Each entry in `docs/decisions.md` must have a stable ID, topic, status (`confirmed`, `proposed`, `unresolved`, or `deferred`), source, rationale, alternatives, affected documents, decision owner, approval evidence when applicable, blocking stage, and revisit trigger. The user/product owner approves product promises and accepted security risks; technical authors recommend architecture choices. Do not invent approval evidence or owner identities.

The existing roadmap/AGENTS commitments are confirmed at their documented level only. Defaults below are proposed. Approval to execute documentation work does not automatically approve every default. If a blocking decision remains unanswered, record it and mark Phase 0 completion blocked; documentation drafts may still be produced. This allows the requested explicit documentation of unresolved decisions without silently selecting product behavior.

Alternative: treat all recommendations as settled requirements. Rejected because exploration did not approve a persona, capstone, or trust policy.

### D2 — Audience and product positioning

Proposed primary audience: English-reading, self-directed adults with little or no programming experience who want to learn JavaScript by writing, debugging, and combining code into a small project. Recommend desktop-first coding with usable mobile reading and short exercises, subject to Phase 1 editor validation. These age/language/device choices are hypotheses requiring product-owner review, not roadmap facts.

Proposed positioning: a guided learning environment with immediate deterministic feedback and visible progress toward practical application. Pixel styling supports motivation while conventional controls preserve readability, accessibility, and editor usability. Do not promise employability, comprehensive JavaScript mastery, or advanced AI-tool proficiency from Foundations.

Alternatives: classroom/minor audiences, experienced-developer practice, or a mobile-only product. Each changes curriculum, onboarding, privacy, and workspace requirements; defer those audiences unless explicitly selected. The primary persona, supported language, age policy, and device promise are Phase 0 approval gates.

### D3 — One canonical MVP inventory

`product.md` must classify every pre-launch roadmap capability as required, optional, or deferred, with rationale and links to dependent policies. Distinguish **Phase 0** (definition) from **P0** (MVP priority) and later numbered development steps.

Confirmed MVP baseline: authentication/profiles; one Foundations journey; 20–30 quests, 5–7 chapters, and one capstone; map/lessons/editor; JavaScript execution and deterministic validation/hints; submissions/progress; XP/levels/streaks/unlocks; installability, local drafts, limited offline support; analytics/monitoring; security/accessibility/testing/performance expectations.

Proposed reconciliation of detailed roadmap omissions:

| Capability | Proposed release classification | Boundary |
| --- | --- | --- |
| Web preview | Required, following the public-MVP list | Sandboxed preview only; no hosting or full IDE. Exercise/capstone use depends on D5. |
| Guest learning and signup migration | Required, following pre-launch phases/E2E flow | A defined initial subset, provisional local progress, explicit migration policy. |
| Account cloud progress and reconnect sync | Required | Backend-accepted progress across devices; no automatic concurrent source-code merge. |
| Offline learning | Required but bounded | Previously downloaded lessons, drafts, local deterministic JS, cached/provisional progress; no account changes or server-confirmed rewards offline. |
| Login methods | Email/password, Google, GitHub proposed required, matching authentication phase | Product owner may reduce provider scope explicitly; recovery and account lifecycle remain launch requirements. |
| Achievements/mastery/adaptive gating | Deferred | Initial entity examples do not override P1 practice/achievement scheduling. |

All proposed classifications require review, especially their cumulative scope. Any reduction must be recorded as a deliberate roadmap reconciliation. Non-goals must include AI tutor/LLM grading, Python/other languages, public portfolio/hosting, community/classrooms, certificates, subscriptions, avatar economy, terminal/packages/Git integrations, agents/MCP, remote runners, WebContainers, microservices, queues/Redis, and complex CMS/recommendations.

Alternative: interpret every entity, module, and future abstraction as MVP scope. Rejected because it contradicts priority tiers and the one-polished-course principle.

### D4 — Terminology and learning loop

Propose `Journey > Chapter > Quest`, with Capstone as a final integration quest with a project rubric. Use Course only as a presentation synonym for Journey in MVP, not a distinct domain entity. Record the alternative `Journey > Course > Chapter > Quest` and require approval before changing hierarchy-dependent documents.

Define Concept as an instructional skill; Prerequisite as a completion dependency; Draft as editable local source; Run as experimentation; Check as deterministic local assessment; Submission as a submitted code snapshot plus versioned result; Attempt as one submission/assessment occurrence; Completion as a backend-accepted record or explicitly labeled guest/offline provisional state. Clarify whether Check is a separate action in later UX design; it need not be a third button.

Document the normal, failure, hint, reset, replay, guest, offline, and reconnect paths. Failure produces actionable feedback and another attempt, not completion/rewards. Passing locally alone must not be labeled backend-confirmed progress. Learning status and lock state are separate concepts. Debugging and checking are taught throughout, not postponed to the integration chapter.

### D5 — Foundations outcomes and capstone

Proposed seven-chapter outline: variables/types; operators/expressions; conditionals; loops; functions; arrays/objects; integration. Allocate 20–30 quest briefs by outcome and difficulty; state whether the capstone is inside that count (proposed: 20–30 instructional quests plus one capstone). No executable course content is required in this change.

Exit outcomes must be observable: learners can represent/transform values, select behavior with conditions, iterate collections, decompose work into functions, interpret syntax/runtime/validation feedback, test examples and edge cases, and combine these skills in a project.

Proposed capstone: a small data-driven quest/inventory manager using functions and collections, with supplied input/output or a supplied preview shell. Grade learner-written JavaScript logic and explain/debug tasks. A supplied DOM shell is not evidence that learners know DOM APIs. HTML/CSS/DOM, event handling, asynchronous JavaScript, packages, and deployment are outside assessed Foundations outcomes unless explicitly added with prerequisites and a revised quest allocation.

The capstone brief must define deliverables, allowed scaffold, meaningful learner choices, concept coverage, deterministic tests/rubric, a debugging requirement, and an independent transfer task. Product owner must approve the capstone and whether a supplied interface satisfies the promise of a meaningful project. Alternative: teach and assess DOM/events; this expands scope and requires an explicit curriculum decision before Phase 0 completion.

Curriculum policy must cover clear objectives/examples, progressive scaffolding, multiple valid solutions, edge cases, actionable errors, graduated hints without automatic solving, accessibility, pedagogical/test review, and avoiding tests that merely enforce one textual solution. Git is the curriculum source of truth under `backend/content/`; frontend consumes API-delivered content. Define stable quest identity, versioned assessments, edit categories, retired quests, old-progress handling, and replay of stale offline submissions. Publication/storage implementation is deferred.

### D6 — Ownership and completion trust

Keep the documented Next.js/NestJS modular-monolith and REST/OpenAPI commitments. Resolve path conflicts in favor of `backend/content/` and `frontend/src/lib/api/generated/`. Do not introduce root shared packages without two real independent consumers.

| State/system | Frontend responsibility | Backend responsibility |
| --- | --- | --- |
| Identity | Auth UI and permitted Auth SDK interactions | Verify identity, derive principal, authorize resources |
| Curriculum | Render/cache delivered content | Own content, versions, prerequisites, availability |
| Workspace | Editor, drafts, runtime, local feedback | Accept bounded submission snapshots under policy |
| Guest/offline progress | Local provisional records and pending actions | Accept/reject/reconcile account records after authentication |
| Progress/rewards/unlocks | Display accepted state and labeled provisional state | Own accepted transitions, reward uniqueness, streaks, unlock rules |
| Capstone | Editing/preview and local feedback | Account record and completion acceptance |
| Telemetry | User interaction/runtime events with minimization | Accepted transition events and operational records |

Proposed MVP trust policy: deterministic browser assessment provides learning feedback; authenticated NestJS accepts versioned client-reported assessment results under explicitly documented personal-learning trust. It checks ownership, known quest/version, prerequisite policy, payload bounds, idempotency, and reward eligibility; it does not re-execute code or prove correctness. Replaying identical assertions or signing a client request cannot make an untrusted browser result proof of execution.

Backend authority means consistent acceptance/persistence of progress and rewards, not tamper-resistant grading. Completion metrics must be described as reported/accepted completion rather than independently verified mastery. No credentials, certificates, competitive verified rankings, or high-stakes claims depend on this policy. Forged completion remains an accepted limitation only after product-owner approval. If stronger verification is required, block dependent submission design and create a separately scoped architecture change; do not add remote execution here.

Alternative: independently re-grade in an isolated service. Deferred because remote runners are outside MVP and arbitrary execution inside NestJS is prohibited. Static checks alone cannot be represented as general behavioral verification.

### D7 — Guest, offline, consistency, and content updates

Propose guest access to a small, explicitly chosen initial quest subset. Drafts/progress are device-local and provisional; warn through product behavior when browser data is the only copy. Signup import targets the authenticated user derived by the backend, applies normal version/acceptance policy, and cannot grant duplicate rewards. Existing account and imported progress must merge by stable completion identity, not blindly overwrite cloud state. The exact guest subset is a Phase 0 review decision.

Propose an outbox for bounded pending learning actions, with stable event IDs and content versions. Backend defines idempotent acceptance, rejects malformed/unsupported events, returns reconciliation results, and prevents duplicate completion/reward effects. Separate source drafts from learning-event sync; cloud draft sync and concurrent code merging are deferred.

Define local storage separation per guest/account, logout/account-switch cleanup, stale-content handling, network failure/retry behavior, provisional unlock display, and recovery from rejected imports. Pending local actions must not silently attach to a different account.

Proposed dates: online rewards use backend acceptance; offline/guest replay grants no backdated streak credit in MVP. Use learner timezone for day boundaries with documented timezone-change rules. This simplicity trades fairness on long offline sessions for resistance to arbitrary client timestamps; require product-owner review. Exact conflict algorithms and storage schema belong to later capability designs.

### D8 — Gamification and metrics

Propose first accepted quest/capstone completion as the MVP XP source, unique across replay/import/retry and content edits unless a later policy explicitly defines a new reward identity. Failed runs and hints do not deduct XP. Levels derive from total XP, never establish mastery. Unlocks follow completion prerequisites; mastery-based unlocks, achievements, daily challenges, and leaderboards are deferred. Define meaningful streak activity, timezone rules, completion dates, and disabled/deferred mechanics; numerical XP curves are deferred until curriculum balancing.

`product.md` must specify metric event, numerator/denominator, cohort, time window, source/trust, and target status. Cover time to first run/completion, multiple-quest/chapter progression, meaningful D1/D7 return, capstone start/completion, and independent transfer/rubric evidence. Returning means learning activity, not dashboard visits. Include both guest-start and signup funnels, identity migration/deduplication, validation friction/hints, device cohorts, and qualitative lesson feedback. Do not infer understanding solely from accepted completion or absence of hints.

Beta target numbers/sample size and metric thresholds need product-owner approval before beta; they are not invented efficacy claims and do not require data collection in Phase 0. Phase 0 must define how those targets will be set and who owns them.

### D9 — Security and quality as baseline requirements

`security.md` must map assets (sessions, code, profiles, progress, curriculum, telemetry), actors (guest, authenticated learner, malicious learner, privileged author/operator), and trust crossings. Cover forged submissions, unauthorized records, execution escape/data access, unbounded loops/output, unsafe preview messages/content rendering, cache/account leakage, stale replay, and telemetry/source-code leakage.

Define learner execution as an untrusted compartment: no credentials/secrets; no authenticated application access; explicit network/storage capability policy; strict message validation; time/output/payload limits; reset/termination behavior. A Worker choice alone is not a demonstrated security boundary. Phase 1 must validate the chosen origin/capability isolation and iframe restrictions, including inability to reach session state or authenticated resources. Record feasibility as unverified, never imply Phase 0 proves containment.

Frontend may use Supabase Auth for identity flows; CodeQuest application table reads/writes always pass through NestJS. Decide whether any direct Storage use is permitted (proposed: no MVP learner uploads; future scoped authorization required). NestJS derives identity from verified tokens, enforces ownership and request limits, and uses least privilege. Specify conceptual token/session transport, code visibility/retention/deletion, log/analytics minimization, guest/account cache separation, and secret handling without provisioning or choosing production configuration.

Privacy/age constraints and acceptable client-grading risk are approval gates. Exact retention periods and legal documents are deferred to beta preparation, with a requirement to settle them before real learner data collection. Security, testing, accessibility, and low-end/mobile performance apply from initial design; late roadmap phases verify/harden them rather than introduce them. Define keyboard, focus, screen-reader, contrast, reduced-motion, touch/editor, and supported-browser expectations, with Phase 1 evidence for feasibility.

### D10 — Required ADR set

Create these only during later authorized documentation execution:

| File under `docs/adr/` | Decision/rationale to capture |
| --- | --- |
| `0001-frontend-backend-separation.md` | Next.js/NestJS ownership and modular monolith; alternatives/extraction triggers |
| `0002-api-contract-and-client-ownership.md` | REST/OpenAPI and frontend-local generated client; shared-package alternative |
| `0003-curriculum-source-and-publication.md` | Backend-owned Git content and conceptual API/publication relationship |
| `0004-browser-execution-isolation.md` | Worker/iframe policy, capability boundary, unverified feasibility, Phase 1 gate |
| `0005-assessment-trust-and-completion.md` | Client-report limitations, backend acceptance, stronger-verification trigger |
| `0006-local-guest-and-cloud-state.md` | Provisional/accepted state, import, replay, merge, account separation, streak dates |
| `0007-curriculum-identity-and-versioning.md` | Stable IDs, assessment compatibility, retirement, old progress/rewards |
| `0008-authentication-and-data-access.md` | Auth flows, token/ownership boundary, application tables and Storage policy |

Each ADR needs status, context/source, decision or pending alternatives, consequences, approval evidence where required, related decision IDs, and revisit triggers. Confirmed separation/path commitments can be accepted; unresolved policies remain proposed. Do not mark isolation feasibility verified without Phase 1 evidence.

## Documentation Requirements and Acceptance

| ID | Requirement and review evidence |
| --- | --- |
| R1 | Product doc defines reviewed primary persona/positioning, one release inventory, explicit non-goals, glossary, loop, and measurable success plan; proposals/gates remain visibly labeled. |
| R2 | Architecture doc distinguishes current empty repo from intended architecture and maps each system/state to its owner and trust boundary, with correct paths. |
| R3 | Frontend doc covers devices/accessibility, editor/runtime, drafts, cache/account separation, Auth/API boundaries, provisional guest/offline state, and recovery. |
| R4 | Backend doc covers identity/authorization, curriculum/submission acceptance, accepted progress/rewards/unlocks, sync idempotency, capstone records, and telemetry ownership without module/schema implementation. |
| R5 | Security doc covers D9 threats, mitigation requirements, accepted/unaccepted risks, data handling and Phase 1/beta verification gates. |
| R6 | Curriculum doc defines entry/exit outcomes, quest-count interpretation, chapter/quest briefs, capstone rubric, scaffold limits, feedback/review/versioning, and assessed/non-assessed concepts. |
| R7 | Gamification doc defines qualifying events, repeat protection, hint/failure/replay policy, levels, streak/timezone rules, prerequisite unlocks, and deferred mechanics. |
| R8 | Decision register represents every D1–D10 topic, distinguishes source commitments/defaults/approval gates/deferrals, and links owners, evidence, affected docs, and triggers. |
| R9 | All eight ADRs exist with consistent status/rationale/alternatives/consequences and register references; no pending choice is described as approved. |
| R10 | Cross-document review finds no conflicting scope, glossary, outcome/runtime, authority, reward, or version policies; unresolved blockers are listed in a Phase 0 completion assessment. |
| R11 | No application or infrastructure files are created/modified. Documentation-only checks are recorded; no application test success is claimed without execution. |

Phase 0 is complete only when required documents/ADRs exist, R1–R11 are reviewed, and persona/scope/hierarchy/capstone/trust/guest-offline/security promise gates are approved or explicitly excluded through approved scope decisions. An unresolved gate can satisfy transparent documentation requirements but cannot satisfy Phase 0 readiness. Phase 1 must still prove execution/mobile/offline feasibility.

## Risks / Trade-offs

- [Suggested defaults become accidental commitments] → Use proposed status and approval evidence; never equate artifact completion with policy approval.
- [MVP guest/sync/preview scope is too large] → Review the canonical inventory as a whole and record explicit reductions before dependent implementation proposals.
- [Client grading permits forged completion] → Require explicit personal-learning risk acceptance, qualify metrics, and defer high-stakes/competitive claims.
- [Meaningful project requires untaught web concepts] → Approve scaffold boundaries or revise curriculum before completion.
- [Late roadmap security/testing interpreted literally] → Put baseline requirements and Phase 1 evidence gates in specialist docs.
- [Ignored roadmap unavailable later] → Capture source commitments and conflict resolutions in version-controlled outputs; do not rely on an ignored file as the sole durable record.
- [Duplicated policies drift] → Canonical ownership, cross-links, decision IDs, and R10 consistency review.

## Migration Plan

No deployment, database migration, or runtime rollback applies. After separate authorization, draft only the listed docs/ADRs, obtain necessary policy decisions, and review the documentation diff. Preserve all existing files and user edits. Revisions are ordinary documentation edits; no history rewrite or automatic archive/sync is required.

## Deferred Decisions

| Decision | Why deferred | Owner/trigger |
| --- | --- | --- |
| Exact isolation mechanism, CSP/sandbox flags, runtime limits | Needs empirical validation | Technical owner, Phase 1 before production runtime proposal |
| Mobile coding feasibility and detailed editor layouts | Needs device/editor prototype evidence | Product/technical owners, Phase 1 before promising supported coding flows |
| DTOs, content compiler/format tooling, database projection, sync algorithm/schema | Policy must precede implementation | Technical owner, relevant capability proposal after Phase 0 |
| XP values, level curve, balance | Requires finalized quest difficulty/content | Product/content owner, curriculum balancing before beta |
| Beta metric thresholds/sample size | Requires recruitment goals and measurement constraints | Product owner, before beta evaluation plan approval |
| Numeric retention periods, legal policies, deletion implementation | Definition of handling is Phase 0; final operational details need beta context | Product/security owner, before real learner data collection |
| Cloud draft merge, CMS, AI/storage abstractions, future languages/services | No confirmed MVP consumer or scaling need | Relevant owner, separately approved future capability |

Launch-critical approval gates in D2–D9 are not harmless deferred implementation details. They remain explicit blocking entries in the decision register until reviewed; Phase 0 documentation execution must not silently resolve them.
