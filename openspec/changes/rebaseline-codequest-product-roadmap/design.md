# Design

## Context

See [proposal.md](proposal.md). Phases 0–37 are archived engineering work. Phase 38 technical preparation and Phase 39 synthetic study preparation exist, while the active [gate-closure change](../review-beta-gate-closure/tasks.md) has only its F04/F05 decision-recording tasks checked. The existing product definition approves one `Journey > Chapter > Quest` path, with Course as a display synonym, and deliberately defers many Codédex-inspired surfaces. Those decisions remain historical evidence until explicitly superseded.

The real product gap is cross-surface integration: the current home is a simple entry page; the quest page places reading above `QuestWorkspace`; reusable `EditorWorkspace`/Worker/validation/preview seams and backend authority exist, but the intended persistent lesson/editor/output-preview composition does not. The founder reports real Supabase local email and OAuth flows failing, so test fixtures cannot be promoted to integrated evidence.

## Goals / Non-Goals

**Goals:**

- Establish a reviewable V1 inclusion contract and phase sequence without silently broadening the approved feature set.
- Separate source implementation, user-visible feature completion, real integration, founder acceptance, and release evidence.
- Preserve historical decisions and beta-gate evidence while pausing Phase 38 release-gate execution.
- Make the founder's core learning and authentication acceptance path a hard predecessor of beta readiness.

**Non-Goals:**

- Implementing UI, curriculum, runtime, API, data model, provider setup, telemetry, or deployment changes in this proposal.
- Approving practice, Builds, public social features, additional tracks, AI, credentials, or competitive ranking solely by reference-product similarity.
- Selecting a beta release candidate, resolving F06, closing hosted/device gates, or recruiting learners.

## Decisions

### 1. Keep history and overlay a new dependency program

The roadmap retains Phases 0–37 as completed engineering history, Phase 38 as technically prepared but release-blocked, and the prior Phase 39 synthetic protocol as preparation. A new R01–R19 Product Completion sequence becomes the forward execution order. R16 resumes the same Phase 38 readiness change; R17 is the first real Private Beta. The previous Phase 39/40 labels remain historical references and do not authorize recruitment or public release. This avoids renumbering archived work or moving evidence between changes. Alternative: rewrite old phase numbers; rejected because it obscures PR/ADR traceability.

### 2. Use evidence-bearing readiness states

The roadmap defines an ordered state model. `TECHNICALLY IMPLEMENTED` means code and focused checks exist; `FEATURE COMPLETE` means all approved user-visible behavior exists; `INTEGRATED` means connected flows work with real configured dependencies; `FOUNDER ACCEPTED` means the founder personally verifies the actual V1 app; `RELEASE READY` means the exact candidate passes legal, hosted, physical, security and operational gates. Private Beta, Beta Accepted, and Production Ready follow distinct decisions. A capability cannot skip a state through CI, archive status, or a mock. Alternative: one “done” marker; rejected because it hides the current Auth and learning-shell gaps.

### 3. Founder-approved breadth precedes dependent architecture

The founder's 2026-10-02 Apply instruction makes the listed major public-product categories and broad original topic coverage **required V1 scope**. R01 records them in a capability matrix, supersedes old V1 exclusions through AP05, and separates required parent categories from unresolved implementations. R10–R12 are split into dependency-ordered subphases; no required category may be omitted because its security, grading, privacy or runtime design is hard. Exact mechanisms receive separate OpenSpec decisions and verification before dependent work. Alternative: assume current browser grading, static preview or old content hierarchy can simply support the broader product; rejected because that would make unsafe or false promises.

### 4. Redesign composition around existing boundaries

The future learning shell composes the lesson renderer, editor, output/preview, validation feedback, and trusted progress rather than replacing their domain contracts. Desktop uses persistent lesson/editor/output-preview regions and a stable action/navigation bar. Tablet/mobile use intentional focus and panel-switch patterns with source and output preserved. Any interactive DOM scripting or published Builds capability requires separate security design and proof; the current script-disabled preview remains as specified. Alternative: stretch current stacked layout; rejected because it does not meet the founder's persistent three-pane requirement.

### 5. Real Auth and founder acceptance are independent gates

R04 diagnoses the actual Supabase configuration and verifies email delivery, confirmation, provider redirects, callback, sessions, logout and recovery using synthetic accounts on the intended environment. R15 records a founder-run journey with exact release and observed outcomes. Automated provider fixtures support but cannot substitute for either. Alternative: rely on Phase 8 completion/CI; rejected because the founder reports real flows failing.

### 6. Preserve beta controls

The active `review-beta-gate-closure` artifacts are not edited by this change. F04 remains an experimental private-beta baseline, F05 preregistration remains approved, F06 and all hosted/physical evidence remain open, PostHog/Sentry real delivery remains off, and feedback remains local-only. R16 selects and verifies a release candidate only after product completion and Founder Acceptance. This defers evidence tied to a build likely to change, without pretending a gate passed.

## Risks / Trade-offs

- **Approved reference-product breadth is much larger than the former MVP** → split into coherent subphases and advertise each required course/surface only when fully usable; beta cannot start while a required V1 category remains incomplete.
- **Multi-course or interactive Builds requirements change architecture** → make hierarchy, runtime, grading, publishing, moderation and privacy decisions before implementation; preserve current trust boundaries until superseded.
- **Founder's Auth report is misdiagnosed as only configuration or only code** → reproduce on the real configured environment and retain expected/observed provider evidence before choosing a fix.
- **Roadmap labels imply readiness** → put evidence state alongside phase status; keep Phase 38 `NO GO` until the existing worksheet closes.
- **A later product change invalidates release probes** → bind R16 evidence to exact commit/build, content versions and environment, and retest affected rows.
- **Legacy roadmap prose conflicts with the new sequence** → mark old Phase 39/40 execution descriptions superseded while retaining historical links and approved F04/F05 facts.

## Migration Plan

This is a planning migration. During this proposal stage, update roadmap/product/decision language and directly affected planning references through one docs PR. Do not change database schemas, code, providers or runtime flags. Future R phases use separate OpenSpec proposal, Apply, verification, Sync and Archive workflows. If the rebaseline is not approved, revert only the planning PR; no application behavior has changed.

## Open Questions

The founder has resolved inclusion of the listed broad V1 categories. Later phase proposals still need exact original course outlines, runtime containment, independent competitive/certificate grading, public moderation/deletion, AI and mentor service models, notification channels, commercial terms/prices/entitlements, and exact device support. These choices affect later implementations and block beta while unresolved; they do not make the parent categories optional.
