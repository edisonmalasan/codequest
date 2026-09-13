# Frontend responsibility and experience definition

Status: approved Phase 0 documentation. Client ownership is confirmed C02–C06/C10/C11. Guest/offline/trust/device policies P01/P03/P06–P08/P11–P15 are approved in the [register](decisions.md). [Product](product.md) is canonical for scope/glossary; [architecture](architecture.md) owns the responsibility matrix.

Approval evidence: [AP01 — explicit user approval](decisions.md#ap01-explicit-phase-0-approval).

## Client responsibilities and boundaries

Next.js owns UI/routing/PWA, responsive rendering, accessibility, CodeMirror workspace, browser execution/preview, local drafts/preferences, IndexedDB/cache and API consumption. Use the documented stack direction without adding code or configuration in Phase 0. Accepted progress/rewards/unlock rules and application database access stay in NestJS. Frontend neither imports backend source/raw curriculum nor reads/writes application tables. API types come from generated OpenAPI code at `frontend/src/lib/api/generated/`.

Supabase Auth identity UI/flows are permitted under approved P12/P13; verified API identity/ownership remains backend responsibility. No MVP direct learner Storage/uploads. Session/token material stays out of runtime messages, lesson fixtures, cached protected responses and telemetry. Learner compartment cannot issue authenticated requests. Exact session storage/refresh/generator/service-worker implementation awaits later capability design.

## Editor and feedback

Workspace supports the MVP editor features: syntax highlights, line numbers, indentation/autocomplete, reset, idle/navigation/visibility autosave, shortcuts, console/check results/runtime status, and responsive panels. Its concepts work independently of one lesson; full file tree/package manager/terminal is excluded. Optional platform-owned preview shell must have textual output equivalence and not introduce assessed DOM requirements.

Distinguish source editing, Run experimentation, local Check, submitted snapshot, pending acceptance, and accepted completion. Show syntax/runtime/check/time/output-limit failures separately with next-action feedback. Correlate output to a specific run/version; stale messages cannot overwrite current results. Runtime reset/termination cannot erase draft or accepted progress. Resetting source requires an explicit destructive-edit action; preserve the prior draft where practical and never reset account completion.

A passing run is not necessarily a passing check, and a passing local check is not accepted account progress. Submit captures a versioned snapshot so later edits do not alter the pending attempt. Failure preserves source and permits hints/retry without XP punishment (P09). Rerunning accepted work is practice, not repeat rewards.

## Guest/offline and account separation

Approved P07: guest can work through Q01–Q04 on one browser. Guest draft/progress is local/provisional and browser clearing can lose it; expose that limitation at the point local persistence matters. Signup/import is explicit and targets the authenticated account, not a supplied user ID. Retain rejected code for editing/retry. Do not implicitly migrate one guest's data merely because any account signs in.

Approved P08: downloaded lessons, saved drafts, local deterministic JS and cached progress remain usable offline. Newly discovered curriculum/account changes/publishing/AI/remote services are unavailable. Show network status and accepted cached versus locally provisional progress/rewards/unlocks. Provisional unlock simulation uses delivered prerequisites and remains labeled; backend may reject it on reconcile. The proposal makes no offline web-preview guarantee beyond later validated capability.

Use an outbox concept for pending submitted learning snapshots with stable event/content IDs; implementation/schema is deferred F03. Pending actions belong to the guest/account that created them. On reconnect/authentication, send eligible pending actions idempotently, surface accepted/rejected/retry-required outcomes and refresh authoritative state. Expired identity pauses protected sync; re-authentication does not silently reassign events.

| Transition/failure | Approved client behavior |
| --- | --- |
| Network failure after submit | Keep snapshot/event ID; show pending; retry without a new reward identity |
| Account switch | Stop old sync/runtime; clear protected in-memory state; isolate drafts/outbox/cache by owner; never send old events as new account |
| Logout | Clear session/protected cache and account UI; retain owner-isolated drafts/pending work only under disclosed local retention policy; offer local removal |
| Stale/unsupported content | Show reason/current version, preserve source, request explicit retry; do not silently change task/version |
| Import meets existing completion | Show reconciled accepted state; do not overwrite accepted history or repeat XP |
| Browser storage unavailable/full/cleared | Report save failure/limitation; keep edits in memory where possible and provide copy/recovery action; never claim saved when save failed |
| PWA update | Disclose available update, protect drafts/pending work, avoid mixing incompatible cached assessment versions |
| Reset/navigation | Save before leaving where feasible, distinguish actual persistence success from request, warn before discarding unsaved source |

Drafts are device-local; account cloud progress does not promise source-draft cloud backup or automatic simultaneous code merging (F07). Approved P10 gives no backdated streak credit for guest/offline imports; display this limit clearly and do not promise offline streak preservation.

## Devices, accessibility and performance

Approved P01/U01: desktop-first coding; usable mobile reading and short exercises. Phase 1 must validate real mobile selection, typing, touch, keyboard/focus, resizing, scrolling and panel use. No full mobile parity claim before evidence. Approved browser targets are Chrome/Firefox/WebKit engines and mobile viewport checks from roadmap testing; exact supported versions/devices are F02.

Keyboard paths/focus order, visible focus, screen-reader instruction/output/error announcements, sufficient contrast, zoom/reflow, reduced motion, touch targets and editor escape/navigation must work without a pixel-theme exception. Conventional controls serve forms/dialogs/editor/navigation; decorative art/motion must not convey essential state alone. Provide accessible alternatives for map and preview information. Targeted real-user/editor checks complement automated coverage.

Low-end performance should prioritize readable content before editor loading, bounded output/rendering, responsive typing and termination of stuck code. Numeric budgets/cache sizes/bundle thresholds need Phase 1 evidence (F02). App/install/network/update states should explain product impact, not expose infrastructure jargon.

## Telemetry and verification gates

Client sends minimized run/hint/error/start interactions; backend owns accepted completion/reward events. Do not send raw source, access tokens, profile secrets or session replay of editor content by default. [Product metrics](product.md#success-and-measurement-plan) define cohorts/trust/deduplication; [security](security.md) controls data use/retention.

Phase 1 evidence must demonstrate editor/device usability, runtime containment/termination/output limits, safe preview messaging and local save/offline recovery on one mock quest. Later focused tests must cover local drafts/account isolation/stale outbox behavior, auth expiry, rejected import, duplicates and PWA updates; user-critical flows require Playwright where practical. No prototype or executable test is created in this change.

## Reviewed legacy Phase 1 outcome (AP02) - 2026-09-13

[AP02](decisions.md#ap02-reviewed-phase-1-no-go) records the project owner's technical/product/security approval of the [no-go report](technical-risk-validation/report.md). Security review is a project-owner self-review. [ADR 0004](adr/0004-browser-execution-isolation.md) retains the accepted policy and records failed preview recovery: neither evaluated preview mechanism is selected for production. Focused Chromium/Firefox execution and persistence results do not satisfy the failed preview gate or missing physical/device/accessibility coverage. F01 requires scoped redesign/retest; F02 remains inconclusive. Production scaffolding stays blocked, with no changed Phase 0 policy, remote-runner fallback or Phase 2 authorization.

## Phase 1 preview redesign continuation - 2026-09-13

The [Worker-backed supplied-shell preview](technical-risk-validation/report.md#worker-preview-redesign-continuation---2026-09-13) passes core automated recovery/containment checks in all three downloaded engines. Learner logic stays in the restricted Worker; fixed script-disabled iframe output and its text equivalent receive bounded escaped data. The historical executable-HTML no-go remains AP02 evidence. WebKit simulated-offline integration fails, physical/accessibility evidence remains untested, and review of the new F01 recommendation is pending. Production selection and Phase 2 stay blocked; accepted architecture, P11 and all acceptance criteria remain unchanged.
