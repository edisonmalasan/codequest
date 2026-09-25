# Frontend responsibility and experience definition

Status: approved Phase 0 documentation. Client ownership is confirmed C02–C06/C10/C11. Guest/offline/trust/device policies P01/P03/P06–P08/P11–P15 are approved in the [register](decisions.md). [Product](product.md) is canonical for scope/glossary; [architecture](architecture.md) owns the responsibility matrix.

Approval evidence: [AP01 — explicit user approval](decisions.md#ap01-explicit-phase-0-approval).

## Client responsibilities and boundaries

Next.js owns UI/routing/PWA, responsive rendering, accessibility, CodeMirror workspace, browser execution/preview, local drafts/preferences, IndexedDB/cache and API consumption. Use the documented stack direction without adding code or configuration in Phase 0. Accepted progress/rewards/unlock rules and application database access stay in NestJS. Frontend neither imports backend source/raw curriculum nor reads/writes application tables. API types come from generated OpenAPI code at `frontend/src/lib/api/generated/`.

Phase 8 implements Supabase Auth identity UI and cookie-backed PKCE session refresh through isolated browser/server adapters. `/login`, `/register`, `/auth/callback`, and `/account` use validated local return paths; protected API calls obtain the current access token at call time through the typed frontend wrapper. Sign-out clears protected query state. Verified API identity/ownership remains backend responsibility. No MVP direct learner Storage/uploads. Session/token material stays out of runtime messages, lesson fixtures, cached protected responses and telemetry. Learner compartment cannot issue authenticated requests. See [authentication](authentication.md).

## Published lesson reading

Phase 12 adds `/quests/[slug]` as a reading-only route backed by the generated public curriculum contract. It renders the approved static Markdown subset as semantic headings, prose, lists/instructions, callouts, inline and fenced code, safe HTTPS/fragment links, and version-pinned local illustrations. Raw HTML, MDX components/expressions, scripts, remote images, unsupported protocols, and arbitrary paths are never evaluated. Graduated question, concept, and next-step hints use learner-controlled native disclosures with no persistence or reward side effects. Eligible and completed Course-map nodes link to the lesson; locked nodes remain inert.

The reading column uses conventional body typography, bounded measure, responsive images, and local horizontal scrolling for wide code so mobile prose does not create page overflow. Loading, unpublished/not-found, malformed-response, network/retry, and illustration-failure states remain safe and readable. Phase 12 does not expose starter code or assessment cases in the page and adds no editor, runtime, Check, submission, progress acceptance, or XP behavior.

## Editor and feedback

Phase 13 implements a reusable Editor Workspace independently from curriculum DTOs and the published lesson route. A parent supplies stable `ownerId`, `workspaceId`, and ordered files with stable IDs, names, JavaScript language, and starter source. The workspace composes `EditorToolbar`, `FileTabs`, `CodeEditor`, `ConsolePanel`, `TestResults`, `RuntimeStatus`, and `WorkspaceActions`; it supports syntax highlighting, line numbers, Tab/Shift+Tab indentation, bounded JavaScript autocomplete, file switching, responsive panels, and controlled source replacement. The development-only `/editor-workspace` route is an internal review surface and remains unavailable in production.

Drafts autosave after editing settles and can be flushed with **Control/Command+S**. **Control/Command+Shift+Backspace** opens the selected-file reset confirmation. Shortcuts are intercepted only while focus is inside that workspace. Reset uses the accessible dialog, replaces only the selected file with its parent-supplied starter source, and persists that replacement after confirmation. Draft records are device-local and keyed by owner, workspace, and file; save status distinguishes loading/ready, unsaved, saving, saved, and failed. A failed save leaves source editable in memory and never claims cloud backup.

Console, test-results, and runtime-status surfaces retain a presentation-only baseline when no execution adapter is supplied. Phase 14 adds optional Run/Cancel through the lesson-independent [`ExecutionAdapter`](javascript-runtime.md): it snapshots only the active file, presents bounded correlated output and runtime status, and preserves source and drafts across success, error, timeout, cancellation, and recovery. TestResults remains inactive, and no runtime result implies a Check, submission, completion, progress, or reward decision.

The workspace remains intentionally small: no lesson mounting, file creation/deletion/rename, full file tree, package manager, terminal, preview, cloud draft merge, or backend persistence. Optional later platform-owned preview shells must retain textual output equivalence and must not introduce assessed DOM requirements.

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


## Native Chrome evidence checkpoint - 2026-09-14

The [installed-Chrome evidence](technical-risk-validation/report.md#installed-windows-chrome-continuation---2026-09-14) adds actual Windows Chrome interaction, browser zoom, storage-denial recovery, isolated PWA installation and process-cold diagnostics. Native valid-run startup and fresh-preview timing failures remain a redesign/no-go; earlier downloaded-engine passes do not establish the installed-browser gate. Source/save synchronization defects were corrected with focused regression coverage. Native full-storage, physical mobile/Safari, spoken assistive technology and OS restart evidence remain inconclusive/untested. Proposed progression scope adjustments are review recommendations only, not approved exceptions. F01 remains unselected and F02 incomplete; AP01/AP02 and P11 remain unchanged. The current results need dated project-owner technical/product/security self-review. No Phase 2, Sync or Archive begins.


## Authorized bootstrap experiment checkpoint - 2026-09-14

The project owner explicitly approved the persistent trusted opaque bootstrap/fresh-per-run Worker experiment and D3/charter revision, preserving P11 and all numerical limits. It is implemented through `e9e8436`, including private cleanup control and generation-bound untrusted output. This approval is not S01-S06 approval, F01 production selection, F02 support acceptance or Proceed. See the [current evidence report](technical-risk-validation/report.md#authorized-persistent-bootstrap-checkpoint---2026-09-14). Final installed Chrome: **45 passed / 4 failed**; independent native cycles: **96/100 valid Worker successes, four timeouts, next fresh success 1101.9ms**; 10 witnessed loop recoveries/100 preview cycles and native zoom/PWA/20 persistence cycles pass. Bundled affected retest: **111 passed / 5 failed / 4 skipped**; replay passes all three engines, target-lifetime/WebKit offline failures retained, isolated focus retest passes without erasing the prior failure. Chrome ten-cold-trial probe fails before any completed trial; WebKit single cold-origin control passes.

**Phase 1 remains 22/34 and Redesign/no-go**. Missing physical macOS/Android/iPhone, installed Firefox and NVDA/VoiceOver remain untested; native background/full quota/OS restart and total resource bounds remain unverified. Scope adjustment and dated owner product/technical/security self-review are pending. Security review is self-review, not an independent audit. AP01/AP02, approved Phase 0 policy and required recovery limits remain unchanged. No Phase 2, Sync or Archive.


## Latest Apply continuation - 2026-09-15

Terminal-output Worker termination ordering was corrected and verified by 20 unit tests; lint/typechecks/build pass. Full installed Chrome remains **34 passed / 15 failed**; affected bundled engines **31 passed / 4 failed / 1 skipped**, followed by two explicit unsupported-CDP skips. Independent 100 Worker/100 preview cycles and PWA/20 persistence cycles pass, but four post-loop fresh runs time out, the ten-cold-process probe completes 0/10 trials, and the 400% local Check times out. [Latest evidence](technical-risk-validation/report.md#final-continuation-evidence-and-progression---2026-09-15) retains original failures and exact hashes. **Phase 1 stays 22/34 and Redesign/no-go**. The [dedicated-bootstrap follow-up](technical-risk-validation/proposed-bootstrap-revision.md) and S01-S06 are proposed only; new owner technical/product/security self-review and production/support selection remain pending. Security review is self-review, not an independent audit. Accepted Phase 0 policies/AP01/AP02 remain unchanged. No Phase 2, Sync or Archive.
