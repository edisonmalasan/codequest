# Design

## Context

See [proposal.md](proposal.md). The published Quest host currently builds `main.js` from `starterCode`, maps console/function cases to the JavaScript validation strategy, and submits a single `source` string through the owner-scoped outbox. The R06 host already separates lesson, code, and results. The reusable Editor Workspace supports identified files and optional static/interactive adapters, but the R07A interactive mode is enabled only on a synthetic review route. The backend validates publication, report case IDs, versions, prerequisites, ownership, and event replay; it does not run learner code (ADR 0005).

## Goals / Non-Goals

**Goals:** Integrate the existing seams through one published Quest state machine; make authored modes explicit; preserve all source on failures; keep learning and reward authority in NestJS; make publication and interactive safety gates testable.

**Non-Goals:** Authoring or publishing R08 courses, generalized browser DOM or project hosting, server-side code execution, independent correctness proof, competitive/certificate claims, source-draft cloud sync, real-provider R04 verification, and Phase 38 release evidence.

## Decisions

### 1. Versioned exercise descriptor, with a legacy adapter

The backend publication parser validates a discriminated descriptor alongside each selected content/assessment snapshot. Modes are `javascript`, `static-web`, and `interactive-web`. Each has an ordered list of stable files and a compatible declarative case set. The legacy descriptor is synthesized for existing JavaScript snapshots and leaves `starterCode` and current case DTO behavior intact. The generated client receives an optional descriptor during migration; the frontend constructs one `main.js` only when it is absent. Publication rejects unsupported mode/file/case combinations and demands selected review evidence. Content or assessment semantics changing requires new versions and a reviewed transition; no published historical snapshot is rewritten.

Alternative: infer mode from extensions in the frontend. Rejected because it would let unreviewed content choose execution authority and make version compatibility ambiguous.

### 2. One owner/version-bound workspace snapshot and separate local actions

The Quest host maps descriptor files into the existing Editor Workspace and supplies only the adapter allowed by the mode. JavaScript uses the existing Worker Run/Check. Static web uses the script-disabled preview and an inert data-only checker. Interactive web uses the R07A Worker/fixed-display adapter only after the publication gate. The host owns a snapshot identity containing quest ID, content and assessment versions, owner, file IDs/order, and source revision; Check and Submit must refer to that same identity. Navigation, owner change, or version change cancels active work and invalidates a prior pass. The workspace remains reusable and the standalone review route does not acquire account authority.

Alternative: build a second quest-specific editor. Rejected because it would duplicate draft, lifecycle, and containment behavior.

### 3. Declarative web checks, bounded to supported behavior

Static-web checks inspect an inert, bounded representation of the authored HTML/CSS; they never attach learner markup to the application DOM or fetch referenced resources. Interactive checks exercise only the R07A supported DOM/event subset through isolated execution, then compare bounded final state/events with allowlisted data predicates. Each case has a stable ID, terminal status, feedback, and elapsed time. Definitions with executable test source, unsupported selectors/operations, or unbounded fixtures fail publication validation. Preview remains visual feedback; only Check produces a local report. The backend normalizes the complete reported case set but does not independently execute the source.

Alternative: test DOM inside the preview frame. Rejected because that would mix display, test code, and learner script authority and weaken R07A's fixed-bridge boundary.

### 4. Canonical multi-file bundle inside the existing private source field

Keep the existing `source: string` transport and 64 KiB total bound. For multi-file quests, use a versioned canonical JSON envelope containing descriptor identity/version and ordered `{id, language, source}` entries. The backend parses and verifies it against the selected published descriptor before writing the original immutable string. Legacy single-file source remains a plain string. The whole bundle counts against 64 KiB, including metadata, so a large local preview may be runnable but cannot be submitted; the UI must surface this before Submit. No migration rewrites historical attempts. Existing event IDs, owner scoping, report normalization, and idempotent replay apply to the canonical bytes.

Alternative: add a parallel source table/API payload. Rejected because current snapshot and replay semantics already work for a bounded string and this would introduce unnecessary migration risk.

### 5. Trusted navigation and acceptance feedback

Derive Back/Next from selected published hierarchy and gate Next against the current owner-scoped unlock response. Guest Q01–Q04 use the existing provisional rules; no account state is inferred from guest local work. On accepted replay, invalidate/refetch owner progress, XP/level, streak, and unlock queries and show the backend response. On stale version, blocked replay, storage failure, or uncertain response, retain the local source and stable event ID, report the actual state, and offer an appropriate retry. Never say “complete” based solely on local Check.

Alternative: calculate locks or rewards from a local pass. Rejected because it conflicts with the existing backend authority model.

### 6. Published interactive release flag is evidence-bound

The descriptor/parser does not publish interactive mode merely because the adapter exists. R07 may land the integrated host while interactive publication stays disabled. R08 owns the first original interactive Quest selection and must obtain reviewed content/assessment plus an exact-build verification record for the published route before changing that guard. The record must include containment, origin, message-spoof, source/output bounds, repeated tight-loop and fresh-run recovery, cancellation, navigation, and cleanup across the declared browser matrix. It must identify the selected content/assessment versions, commit/build, origin topology, browser versions, failures, and untested setups. This selected-Quest record is separate from R07A synthetic evidence, R07 integration fixtures, and Phase 38 hosted/device evidence. A failed or missing required probe keeps interactive publication disabled.

## Risks / Trade-offs

- [A browser-only Check is not independent proof] → Preserve ADR 0005 labels and prohibit competition/certification claims.
- [Source bundle overhead may exceed the existing limit] → Count UTF-8 bytes before Submit, show a recoverable error, and keep the editor draft.
- [Mode or curriculum version changes can strand drafts] → Key drafts by stable owner/quest/content version, show stale-work recovery, and never silently overwrite.
- [Interactive containment differs in the published host] → Re-run exact-build route, origin, spoofing, timeout, cleanup, and browser probes before selecting any interactive snapshot.
- [Navigation during pending writes can lose source] → Use existing idle/visibility best-effort save and explicit unsaved warnings; do not promise a guaranteed page-exit write.
- [R04 provider flows are unverified] → Keep integrated Auth acceptance blocked and use synthetic accounts only for development tests.

## Migration Plan

1. Add optional validated descriptor and generated API types while serving existing JavaScript snapshots unchanged.
2. Add client mode mapping, local checks, source-bundle validation, and the published route in compatibility mode; test old and new paths.
3. Enable only reviewed static/web fixtures for R07 integration verification. Keep production interactive selection disabled when R07 lands. R08 owns complete original course publication and must select an interactive snapshot only after the exact-build gate and reviewed content/assessment exist.
4. Roll back a new mode by removing its publication selection, not by rewriting accepted attempts. Keep old attempts, drafts, and outbox events readable/replayable under existing compatibility policy.
