# CodeQuest architecture definition

Status: intended architecture, not implemented infrastructure. C02–C06 are confirmed engineering commitments. P06/P08/P11/P13/P15 are approved policies in the [decision register](decisions.md). [Product](product.md) owns release scope/glossary; specialist documents own detailed policy.

Approval evidence: [AP01 — explicit user approval](decisions.md#ap01-explicit-phase-0-approval).

## Current and intended state

The current repository has documentation, engineering instructions, installed skills, and OpenSpec planning artifacts; no application workspace, database, generated client, content engine, or runtime exists. Future paths below describe ownership rather than directories created by Phase 0.

The intended stack follows AGENTS.md: TypeScript; Next.js/React browser/PWA; NestJS/Fastify modular monolith; REST/OpenAPI; Drizzle/PostgreSQL through Supabase; Supabase Auth/Storage. CodeMirror, TanStack Query, Zustand, Dexie and Serwist serve client concerns. Test/ops directions are Vitest/Testing Library/Playwright, pnpm/Turborepo, GitHub Actions, PostHog and Sentry. Their presence in a document does not mean they are installed or configured.

```text
Browser application (Next.js / PWA)
  |-- Editor / local drafts / cached content
  |-- Untrusted learner compartment: Worker / preview iframe
  |     ^ bounded messages only; no session or application access
  |-- Identity flows --> Supabase Auth
  |
  +-- REST through frontend-local generated OpenAPI client
         |
         v
     NestJS / Fastify modular monolith
       |-- Identity / curriculum / learning
       |-- Accepted progress / gamification / capstone records
       |-- Authoritative rule checks / operational events
       |
       +--> PostgreSQL via Drizzle (Supabase)
       +--> backend-owned Git curriculum under backend/content/
```

Worker/iframe isolation feasibility remains unverified. The diagram's restrictions are requirements, not evidence. No remote execution, extra services, queues or direct application-table reads from frontend.

## Ownership and state authority

| System/state | Frontend owns | Backend owns | Authority/trust |
| --- | --- | --- | --- |
| UI/routing/theme/accessibility | Rendering, navigation, responsiveness, motion/settings | Delivered policy/data only | UI cannot define progression business rules |
| Identity/account | Auth UI and permitted Auth flows; session-aware requests | Token verification, derived identity, permissions/profile ownership | Client user IDs/roles never authority |
| Curriculum | Render and cache API-delivered lessons | Git content, versions, prerequisites, availability/publication | Client does not import raw backend content |
| Editor/runtime | Drafts, preferences, execution/preview, local feedback | Bounded snapshot acceptance | Learner code/results are untrusted |
| Guest/offline state | Device-local provisional learning/outbox | Authenticated import/replay acceptance | Local pass/pending unlock not accepted progress |
| Submissions/attempts | Capture immutable submitted version/source/result; display response | Record/validate policy acceptance and attempt occurrence | Result report not proof of correctness (P06) |
| Progress/unlocks | Display accepted/cached and separately provisional state | Accepted completion history, current progress, prerequisite rules | Backend owns accepted transitions; no frontend hardcoded unlock authority |
| XP/levels/streaks | Display/animation and pending state | Unique reward sources, derived levels, qualifying activity/date policy | Retry/import/replay must not duplicate effects |
| Capstone | Workspace/preview/local checks/explanation capture | Account snapshot/completion record | Reasoning quality reviewed separately for efficacy evidence |
| Analytics/monitoring | Minimized interaction/runtime events | Accepted-transition events and request/error records | Avoid duplicate authoritative completion events |
| PWA/local persistence | IndexedDB, service-worker cache, installation/update state | Version/reconciliation policy and current account state | Local cache never authority for protected operations |

Business rules stay in the owning NestJS domain; Next.js Route Handlers/Server Actions do not become an alternate backend. Backend does not import frontend source and frontend does not import backend DTOs. Application-table reads **and** writes are backend-only. Auth identity flows are a bounded exception, not database access permission. Direct learner Storage/upload scope is approved excluded P12.

## Contracts and paths

- `frontend/`: client UI/routing/PWA/editor/runtime/cache/API consumption.
- `backend/`: authoritative business rules, authorization, database access, curriculum, submissions, progress, rewards and orchestration when later approved.
- `backend/content/`: authored curriculum; backend delivers its documented contract to frontend.
- `frontend/src/lib/api/generated/`: regenerated from backend OpenAPI; never hand-edited or replaced with backend-source imports.

Roadmap root `content/` and `packages/api-client` conflict with AGENTS.md. Corrected paths above follow C04/C05; no root shared packages absent two independent consumers. REST/OpenAPI is confirmed; exact DTOs/versioning/errors/generator tooling await the API capability change (F03). Domain vocabulary is the approved product glossary, not a prematurely fixed database entity list.

## Trust crossings and completion acceptance

P06 establishes approved personal-learning trust: local deterministic assessment gives feedback; NestJS accepts authenticated browser reports after checking identity, known version, prerequisites, bounds and uniqueness. Backend persistence is authoritative but assessment is not independently verified. Neither a signature nor a repeated browser assertion proves code behavior. AP01 accepts the declared personal-learning fraud limitation. See [backend policy](backend.md) and [ADR 0005](adr/0005-assessment-trust-and-completion.md).

The untrusted compartment receives source/public task fixtures and sends bounded structured output/results. It receives no tokens/secrets and must not access application sessions, authenticated APIs, application storage or network (approved P11). Auth/API handling stays in the trusted client boundary. Message identity/version/run correlation and limits are validated by its receiver. The exact origin/capability mechanism needs Phase 1 evidence, not Phase 0 implementation.

P08/P15: guest/offline state is provisional. Authenticated reconnect/import reconciles known version/identity/prerequisites and deduplicates effects; rejection preserves editable source. Account switching isolates outboxes and drafts. Accepted historical completion remains distinct from active-curriculum availability/percentages. See [frontend](frontend.md), [curriculum](curriculum.md), and [ADR 0006](adr/0006-local-guest-and-cloud-state.md).

## ADR map and deferred architecture

| ADR | Topic / current status |
| --- | --- |
| [0001](adr/0001-frontend-backend-separation.md) | Separation/modular monolith — accepted documented commitment |
| [0002](adr/0002-api-contract-and-client-ownership.md) | REST/OpenAPI/client ownership — accepted documented commitment |
| [0003](adr/0003-curriculum-source-and-publication.md) | Curriculum source/publication — accepted ownership; publication mechanism deferred |
| [0004](adr/0004-browser-execution-isolation.md) | Browser execution - approved policy; legacy previews reviewed no-go (AP02); Worker-preview recommendation pending review |
| [0005](adr/0005-assessment-trust-and-completion.md) | Assessment trust — approved risk policy |
| [0006](adr/0006-local-guest-and-cloud-state.md) | Local/guest/cloud — approved authority/replay/date policy |
| [0007](adr/0007-curriculum-identity-and-versioning.md) | Identity/version compatibility — approved policy |
| [0008](adr/0008-authentication-and-data-access.md) | Auth/data — approved transport/Storage/data policy; backend table boundary confirmed |

F01–F03 defer actual sandbox/config/schema/compiler/sync mechanisms. F09 defers future execution/AI/storage adapters, root extraction and service splits until a consumer/scaling/security need exists. Security/testing/accessibility apply from first prototypes; later roadmap phases verify and harden. Phase 0 does not create any of this infrastructure or establish runtime feasibility.

## Reviewed legacy Phase 1 outcome (AP02) - 2026-09-13

[AP02](decisions.md#ap02-reviewed-phase-1-no-go) records the project owner's technical/product/security approval of the [no-go report](technical-risk-validation/report.md). Security review is a project-owner self-review. [ADR 0004](adr/0004-browser-execution-isolation.md) retains the accepted policy and records failed preview recovery: neither evaluated preview mechanism is selected for production. Focused Chromium/Firefox execution and persistence results do not satisfy the failed preview gate or missing physical/device/accessibility coverage. F01 requires scoped redesign/retest; F02 remains inconclusive. Production scaffolding stays blocked, with no changed Phase 0 policy, remote-runner fallback or Phase 2 authorization.

## Phase 1 preview redesign continuation - 2026-09-13

The [Worker-backed supplied-shell preview](technical-risk-validation/report.md#worker-preview-redesign-continuation---2026-09-13) passes core automated recovery/containment checks in all three downloaded engines. Learner logic stays in the restricted Worker; fixed script-disabled iframe output and its text equivalent receive bounded escaped data. The historical executable-HTML no-go remains AP02 evidence. WebKit simulated-offline integration fails, physical/accessibility evidence remains untested, and review of the new F01 recommendation is pending. Production selection and Phase 2 stay blocked; accepted architecture, P11 and all acceptance criteria remain unchanged.


## Native Chrome evidence checkpoint - 2026-09-14

The [installed-Chrome evidence](technical-risk-validation/report.md#installed-windows-chrome-continuation---2026-09-14) adds actual Windows Chrome interaction, browser zoom, storage-denial recovery, isolated PWA installation and process-cold diagnostics. Native valid-run startup and fresh-preview timing failures remain a redesign/no-go; earlier downloaded-engine passes do not establish the installed-browser gate. Source/save synchronization defects were corrected with focused regression coverage. Native full-storage, physical mobile/Safari, spoken assistive technology and OS restart evidence remain inconclusive/untested. Proposed progression scope adjustments are review recommendations only, not approved exceptions. F01 remains unselected and F02 incomplete; AP01/AP02 and P11 remain unchanged. The current results need dated project-owner technical/product/security self-review. No Phase 2, Sync or Archive begins.


## Authorized bootstrap experiment checkpoint - 2026-09-14

The project owner explicitly approved the persistent trusted opaque bootstrap/fresh-per-run Worker experiment and D3/charter revision, preserving P11 and all numerical limits. It is implemented through `e9e8436`, including private cleanup control and generation-bound untrusted output. This approval is not S01-S06 approval, F01 production selection, F02 support acceptance or Proceed. See the [current evidence report](technical-risk-validation/report.md#authorized-persistent-bootstrap-checkpoint---2026-09-14). Final installed Chrome: **45 passed / 4 failed**; independent native cycles: **96/100 valid Worker successes, four timeouts, next fresh success 1101.9ms**; 10 witnessed loop recoveries/100 preview cycles and native zoom/PWA/20 persistence cycles pass. Bundled affected retest: **111 passed / 5 failed / 4 skipped**; replay passes all three engines, target-lifetime/WebKit offline failures retained, isolated focus retest passes without erasing the prior failure. Chrome ten-cold-trial probe fails before any completed trial; WebKit single cold-origin control passes.

**Phase 1 remains 22/34 and Redesign/no-go**. Missing physical macOS/Android/iPhone, installed Firefox and NVDA/VoiceOver remain untested; native background/full quota/OS restart and total resource bounds remain unverified. Scope adjustment and dated owner product/technical/security self-review are pending. Security review is self-review, not an independent audit. AP01/AP02, approved Phase 0 policy and required recovery limits remain unchanged. No Phase 2, Sync or Archive.
