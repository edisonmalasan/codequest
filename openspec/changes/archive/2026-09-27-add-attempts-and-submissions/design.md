# Design

## Context

See proposal.md. The database already has versioned quest, attempt, private submission, and completion tables with owner and idempotency constraints. `LearningModule` is empty. Published curriculum is a frozen backend catalog, while the only real authored quest is still a draft, so tests need a reviewed fixture. Phase 16 Check runs in a separate browser Worker origin and its result is forgeable. ADR 0005 permits acceptance of checked client reports for personal learning, not proof of execution.

## Goals / Non-Goals

**Goals:** Transactional owner-bound attempt persistence, a backend controlled acceptance decision, safe replay, exact published case coverage, private bounded history, and an explicit learner submission path.

**Non-Goals:** Independent code execution or proof, high-stakes grading, offline outbox, guest import, aggregate progress, XP, rewards, streaks, unlocks, and real learner data collection before F06 privacy obligations are settled.

## Decisions

1. **Contract:** `POST /api/v1/quests/:slug/attempts` accepts `clientEventId`, published `contentVersion` and `assessmentVersion`, source, and the Phase 16 result data. `GET /api/v1/quests/:slug/attempts` returns owner-only bounded history and count. Bearer principal and a `learning:submit:self`/`learning:read:self` permission guard wrap both. No user ID or client completion field is accepted. OpenAPI generation produces the frontend types.
2. **Assessment policy:** Server maps the published quest to its authored case IDs. It validates exact ID coverage, unique ordered cases, terminal result, bounded text and time, and recomputes pass from case statuses. A reported pass can be accepted as personal-learning completion only after server context, version, prerequisite, and uniqueness checks. The response calls it `accepted` and `clientReported`; it never claims independent verification. The raw source is stored, never run by NestJS. This follows the user's selection of ADR 0005 policy while rejecting raw client success as direct authority.
3. **Persistence:** Use existing `quest_attempts`, `quest_submissions`, and `quest_completions`. Project the published hierarchy and current quest version into existing curriculum tables transactionally at submission, retaining older rows. Use owner/event uniqueness for replay. Serialize writes for one owner to make the derived attempt count stable; compare replay payloads and reject mismatches. Store server-generated timestamps and normalized report. Do not create XP or progress facts.
4. **Frontend:** A published quest mounts the reusable Editor Workspace with the quest starter, existing isolated JavaScript runner, and public cases mapped to `ValidationDefinition`. A parent captures the current source and result through an optional workspace seam; the explicit Submit action requires a current completed local check for the same source, obtains a bearer token through the existing client boundary, sends one event ID, and displays backend acceptance distinct from local feedback. Changing source invalidates the result. No auth token enters a Worker.
5. **Privacy:** Bound source/report/request sizes, avoid raw source in logs/telemetry, keep history owner-only, and use safe errors. F06 still gates real learner data collection; implementation and tests use fixtures only.

## Risks / Trade-offs

- Forged case reports remain possible → State the personal-learning trust limit in API/UI/docs; do not use accepted records as certified proof.
- Concurrent replay/count races → Use transaction serialization and unique database constraints; test replay and conflicting payloads.
- Published catalog and relational rows can diverge → Resolve only published catalog versions and insert immutable missing projection rows; reject incompatible history rather than relabel it.
- Frontend Check may be stale → Capture source and result together and invalidate on edits; backend still applies all policy checks.

## Migration Plan

No existing migration is rewritten. Use existing tables; add a forward migration only if implementation reveals a necessary constraint. Regenerate OpenAPI/client after route implementation. Deploy after privacy operations F06 are settled for real learner data; rollback can disable the new route without losing earlier schema history.
