## Why

CodeQuest's development roadmap defines feature sequencing but leaves its primary audience, learning outcomes, release boundaries, and completion trust insufficiently precise. Phase 0 must establish a consistent, reviewable product and architecture definition before prototypes or production foundations begin.

## What Changes

This is a documentation and decision-definition change only. Execution of this change will create:

- `docs/product.md`: audience, positioning, canonical MVP inventory, non-goals, terminology, learning loop, success metrics, and release evidence.
- `docs/architecture.md`: conceptual architecture, responsibility/state-authority matrix, trust boundaries, and ADR references.
- `docs/frontend.md` and `docs/backend.md`: application ownership, client/API interaction boundaries, guest/offline state, completion acceptance, and consistency policies.
- `docs/security.md`: threat model, execution isolation requirements, authentication/authorization, data handling, and accepted limitations.
- `docs/curriculum.md`: JavaScript Foundations entry/exit outcomes, 5–7 chapters, 20–30 quests, one capstone brief/rubric, content principles, review, and versioning policies.
- `docs/gamification.md`: meaningful learning, XP/replay rules, levels, streaks, unlocks, and exclusions.
- `docs/decisions.md`: confirmed commitments, proposed defaults, unresolved approval gates, deferred decisions, owners, rationale, and revisit triggers.
- Eight ADRs under `docs/adr/` covering separation, API ownership, curriculum publication, browser execution, assessment trust, local/guest/cloud state, content versioning, and authentication/data access.

The documents will reconcile roadmap conflicts explicitly: backend-owned curriculum and frontend-local generated client paths follow `AGENTS.md`; shared root packages are not assumed; MVP mastery gating is deferred; guest/sync/web-preview release status must be explicit. See `design.md` for document requirements, review gates, and acceptance criteria.

## Capabilities

### New Capabilities

None. This change defines documentation and proposed future policies, not executable application behavior. `.openspec.yaml` declares `skip_specs: true`; no delta capability specs will be created or synced into the main spec set.

### Modified Capabilities

None. The current OpenSpec capability inventory is empty. Future implementation changes must introduce their own capability requirements from the reviewed Phase 0 definition.

## Impact

Affected outputs are the listed documentation and ADR files only, plus this change's planning artifacts. Sources are `AGENTS.md`, `temp/DEVELOPMENT_ROADMAP.md`, and the preceding Phase 0 exploration. The roadmap is ignored by Git; durable decisions must be captured in the new documents without moving or editing that source in this change.

There are no application, API, dependency, database, deployment, or runtime changes. Creating these planning artifacts does not approve proposed product policies or authorize execution. Stop after proposal/design/tasks creation for user review.

## Exclusions

No application scaffolding, package/workspace configuration, dependency installation/upgrades, generated clients, content parsers, executable quests/tests, runtime prototypes, migrations, CI, Supabase provisioning, deployment, or production infrastructure. No full course authoring, production metric collection, legal-policy drafting, or capability spec sync/archive is included.

## Acceptance Criteria

- All nine deliverable areas have specific requirements and traceable documentation tasks.
- The final documents answer what CodeQuest is, whom it serves, what MVP includes/excludes, who owns each system, and what completion means.
- Proposed defaults are distinguished from existing commitments; unresolved launch-critical policies are explicit approval gates, never silently accepted.
- First-journey outcomes and capstone assessment are coherent with taught concepts and runtime scope.
- Security, trust, offline/guest behavior, versioning, and reward consistency have explicit policies or blocking decisions.
- Deferred details have a rationale and a decision trigger; no implementation work is introduced.
