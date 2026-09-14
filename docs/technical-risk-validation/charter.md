# Phase 1 experiment charter

Change: [validate-codequest-technical-risks](../../openspec/changes/validate-codequest-technical-risks/proposal.md). Baseline: approved [decision register](../decisions.md), ADRs 0001–0008 and [experiment design](../../openspec/changes/validate-codequest-technical-risks/design.md). Recorded 2026-09-13. Active remote branch: `spike/browser-runtime-containment`, created from updated main at proposal merge `8c4f5c5f063bf41ffd94ca8f150ade92ea922dc7`. The project owner's existing AGENTS.md commit `bb037ff` was preserved unchanged on this branch.

The user approved merging the proposal and beginning Apply, then explicitly assigned review roles and confirmed only the Windows development machine. Their subsequent instruction authorizes all scoped implementation and automated verification available in the development environment on the existing branch/PR. Review-role assignment is not review of results or Phase 2 authorization; exact test-environment inventory must be recorded when testing. Physical and assistive-technology coverage is not inferred from automation.

## Ownership and execution readiness

| Responsibility | Named owner / current state |
| --- | --- |
| Charter preparation and scoped implementation | Codex, the assistant in this repository session |
| Automated experiment operator, E01–E06 | Codex, once the required charter prerequisites are recorded |
| Physical device and assistive-technology operator | Manual operator/access arrangements not yet declared; no manual interaction evidence is available |
| Technical reviewer | Project owner, the user in this session; explicitly self-assigned on 2026-09-13 |
| Security reviewer | Project owner, the user in this session; project-owner self-review, not an independent security audit |
| Product reviewer | Project owner, the user in this session; explicitly self-assigned on 2026-09-13 |
| Curriculum fixture reviewer | Awaiting user assignment or explicit allocation to the product reviewer |

Assignment evidence is the user's explicit instruction: they will act as product, technical and security reviewer as project owner, and security review is a project-owner self-review. This identifies the accountable reviewer without inventing a separate reviewer or personal identity. Curriculum review has not been assigned by that instruction. Retain actual review-of-results evidence separately in the final report; do not infer it from role assignment, proposal approval or merge.

## Environment inventory

The current local machine was inspected using `Get-CimInstance` and executable version metadata, without collecting serial numbers or credentials. This is inventory evidence only, not an experiment result.

| Required environment | Inventory / availability | Experiment state |
| --- | --- | --- |
| Windows desktop Chrome and Firefox | The project owner explicitly confirms this Windows development machine. Preliminary inspection: Windows 10 Pro 10.0.19045, Intel Core i5-6500, 7.9 GiB RAM. Refresh exact hardware/Windows details and record installed Chrome/Firefox versions when testing; browser builds currently unconfirmed | Untested |
| Installed Edge, supplemental only | Edge 153.0.4234.32 found locally; cannot substitute for the declared Chrome/Firefox matrix | Untested |
| macOS Safari | Availability unconfirmed; use only after the project owner explicitly provides access | Untested |
| Android phone Chrome | Availability unconfirmed; use only after the project owner explicitly provides access | Untested |
| iPhone Safari, browser and home-screen modes | Availability unconfirmed; use only after the project owner explicitly provides access | Untested |
| Lower-powered physical device | Local desktop hardware recorded; suitability as the declared lower-powered test device not yet selected | Untested |
| Automated Chromium/Firefox/WebKit | Node 24.21.0 / npm 12.0.2 available; prototype dependencies and browser builds not installed or pinned | Untested |
| Keyboard-only, NVDA desktop | Keyboard/input configuration not yet recorded. NVDA availability explicitly unconfirmed; use only after the project owner provides access | Untested |
| VoiceOver Safari/iOS | Availability explicitly unconfirmed; use only after the project owner provides access | Untested |

For every actual Windows test run refresh exact hardware and Windows version and record installed Chrome and Firefox product versions; record unknown/missing builds honestly rather than substituting automated browser builds. For every run also record viewport, input method, install mode, power/thermal conditions, network state and assistive-technology configuration. Standard-path absence is not proof an application is absent from the entire machine. Do not install browsers, claim manual use, or replace physical coverage with emulation based on this inventory. Unconfirmed/unavailable configurations stay untested until the owner explicitly provides access. They do not remove the approved coverage requirements: the overall progression gate stays inconclusive while required evidence is missing. Genuine unsupported installation is separate from missing equipment or failed required learning capability. See [coverage inventory](coverage.md).

## Frozen numerical criteria: revision 1

Selected before measurements on 2026-09-13 from the user-approved proposal design D7. These are experiment acceptance hypotheses, not established production guarantees or new Phase 0 policy. No results existed at criterion selection; current measurements and retained failures are in the [preliminary report](report.md). Budgets remain unchanged. Any revision must preserve the original result, rationale and affected rerun links.

| ID | Measurement / predeclared criterion | Clock, workload and sample plan |
| --- | --- | --- |
| B01 | Short-exercise input-to-visible-update p95 ≤100 ms | 100 actual edit interactions after 10 warmup edits; monotonic timestamps from input receipt to next rendered source update; list every sample and nearest-rank p95; lower-powered physical device |
| B02 | Worker and hostile-preview run deadline 2 s; feedback/recovery within a further 1 s | Clock starts on trusted dispatch; independent trusted watchdog; host heartbeat/interaction must remain usable; 10 abusive-run trials per applicable environment; browser/process killing fails |
| B03 | Fresh run ready within 1 s after stop/termination | Trusted stop action or termination receipt to fresh compartment readiness; 10 trials per environment |
| B04 | Output maximum 200 entries and 64 KiB total, whichever first | UTF-8 encoded serialized output including per-entry data; test below/exactly/above each bound; exceeding either bound is explicit failure, not successful truncation |
| B05 | Single output/message maximum 16 KiB | UTF-8 encoded serialized bounded shape; below/exactly/above cases and malformed/deep/cyclic payloads; receiver and rendering bounds tested independently of sender cooperation |
| B06 | Submitted source maximum 64 KiB | UTF-8 source bytes; below/exactly/above input; rejection preserves editable source |
| B07 | Prepared cold offline lesson/editor/runtime usable ≤5 s | Browser/home-screen process closed and relaunched after preparation; no existing live page/runtime; start at navigation/launch and end when lesson, exact source and local execution are usable; 10 trials on lower-powered physical device |
| B08 | No crashes, draft loss or continuing retained-resource growth | 100 cycles per desktop browser and 30 per physical-mobile mode; first 10 cycles are warmup within those totals; source/version hashes and lifecycle cleanup recorded each cycle |
| B09 | Exact confirmed source/task/assessment retained | 20 controlled persistence cycles per required browser/mode: 8 save/reload, 6 update with active editing/pending work, 6 multiple-client update cycles; version compatibility/retry guidance verified |

Output bounds include errors/check results, not just console logs. Do not invoke learner-controlled getters or custom serialization inside the trusted host to measure size. The prototype must document what can be rejected only after browser structured-clone allocation; no hard memory quota is inferred from sender limits.

Memory: no reliable browser-specific retained-memory instrumentation is installed yet, so revision 1 selects the design's observational branch: track crashes, responsiveness and lifecycle cleanup, and label hard memory bounds unverified. If reliable instrumentation becomes available, freeze a separate device-specific tolerance before its measured trials and retain this revision. A result without memory measurements must not claim a memory ceiling.

## Fixture and experiment procedures

Fixture IDs are planned reproducibility identifiers; files are not implemented yet. Each run must retain prototype commit, pinned dependencies/browser builds, exact command, candidate/environment, expected/actual result, raw samples, canary/sink records and failure/retest IDs. Mandatory boundary failures cannot be averaged away.

| Experiment | Hypothesis / approved policies | Fixtures and procedure | Expected behavior / failure |
| --- | --- | --- | --- |
| E01 | Editor supports desktop coding and mobile short exercises; P01/U01/P14, C11 | Q01-OUTPUT: read objective, type/replace/select/indent/paste/undo, inspect highlights, resize panels, reset explicitly, rotate with virtual keyboard open; repeat keyboard/focus/screen-reader/zoom/reduced-motion paths | Source retained, all essential actions/feedback reachable, editor escapable; unusable selection, trapped focus, inaccessible feedback or recurring edit loss fails; B01 |
| E02 | Execution is bounded and recoverable; C06/P06/P11/P14 | RUN-OK, RUN-SYNTAX, RUN-ERROR, CHECK-WRONG, RUN-LOOP, RUN-FLOOD, RUN-LARGE, RUN-CYCLIC, RUN-SERIALIZE, RUN-STALE: run/check, stop/restart, cross thresholds, supersede runs and run B08 cycles | Distinct correct result/error categories, explicit limit failures, usable host, draft retained and stale messages rejected; uncontrolled lifecycle or successful truncation fails; B02–B06/B08 |
| E03 | Restricted candidate meets P11/P13 and ADR 0004 | CAP-REQUEST, CAP-IMPORT, CAP-NESTED, CAP-STORAGE, CAP-CHANNEL, CAP-SESSION: establish positive/negative controls, execute online available API probes against both restricted candidates and inspect sinks/app canaries; MSG-SPOOF/SHAPE/VERSION/REPLAY/FLOOD and CHECK-FORGE | Zero learner requests/application authority, bounded receiver behavior; a CORS error alone is not proof. Forged local pass demonstrates P06 only, not an escape or grading guarantee |
| E04 | Preview is useful, contained and recoverable; P03/P05/P11/P13 | PREVIEW-RECORDS, PREVIEW-PARENT/OPENER/SANDBOX/NAV/FORM/POPUP/RESOURCE/INJECT/LOOP/FLOOD: exercise supplied shell and adversarial HTML/CSS/JS, observe sinks/host and trusted reset | Textual equivalent, no outbound request/application access/executable host injection; tight-loop host starvation or recovery needing browser termination fails; B02/B03/B05/B08 |
| E05 | Offline source/lesson/local JS and updates are truthful; P08/P13/P14/P15, ADRs 0006/0007 | SAVE-RELOAD, SAVE-FULL/UNAVAILABLE/CLEARED/INTERRUPTED, OFFLINE-PREPARED/MISSING, UPDATE-WAIT/ACTIVATE/MULTITAB, BACKGROUND-RESTART: prepare, install where supported, close/relaunch offline, inject save failures, update with edits/pending work | Confirmed exact source survives; failed save never claims saved; missing/cleared resources explicit; version coherence preserved; protected/session-bearing cache entries fail; B07/B09 |
| E06 | Components compose into the tiny learning loop; P04–P09/P14/P15 | Q01-OUTPUT: read, edit, successful Run but failed Check, hint/debug/correct, local Check, provisional completion, save/reload/offline/recovery. PREVIEW-RECORDS plus MOCK-LOSS/EXPIRY/OWNER/IMPORT/DUPLICATE/COMPATIBLE/INCOMPATIBLE/RETIRED | Full desktop/mobile flow works with truthful state labels, immutable snapshots and preserved source. Mock acceptance never proves production authorization/sync/XP, and DOM/events stay supplied plumbing |

E01/E02 establish baselines, then E03 compares authority. E04 uses those findings, E05 checks candidate offline/update behavior, E06 integrates only a safely evaluated arrangement. Failures remain in the report even if another candidate later passes. Every manual case needs a named operator and observations; no automatic manual-pass labels.

Q01-OUTPUT will ask the operator to produce the exact declared text `Ready for CodeQuest` from starter code initially logging `Not ready`. The hint points to the string literal and Run versus Check. A separate records fixture declares a function input/return contract and supplied read-only display; no full curriculum or capstone is authored. Browser fixtures/checks remain tamperable under P06.

## Planned local topology and bootstrap allowlist

Physical-device HTTPS endpoints below remain planned. For development automation, the implementation uses app `http://127.0.0.1:4310`, runner `http://127.0.0.2:4311` and sink `http://127.0.0.1:4312`, with loopback-only binding and no system DNS/certificate changes. Distinct loopback hosts isolate application origin/storage; port isolation alone is not the argument. This recorded development variant preserves the containment hypotheses and makes no claim of physical-device HTTPS evidence. Pin exact public asset hashes from each build manifest before collecting candidate measurements.

| Endpoint / candidate | Planned use |
| --- | --- |
| `https://app.codequest.test:4310` | Trusted synthetic harness, editor/source persistence, fake session/application canaries; negative-control Worker isolated to synthetic data |
| `https://runner.codequest.test:4311` | Dedicated-origin candidate bootstrap/Worker/preview; no app cookies/session/storage; independent effective policy measured |
| `https://sink.codequest.test:4312` | Controlled request recorder and safe fixtures for permitted positive-control / attempted denied requests |
| Opaque-origin candidate | Sandboxed bootstrap frame with no same-origin application privilege; measure Worker creation, inherited/effective policy and offline compatibility |

Distinct hostnames are deliberate: ports alone do not isolate host-scoped cookies. Resolve these test names to loopback for desktop. For physical devices, declare a reachable LAN address/local name mapping and locally trusted certificate plan only after the operator/device inventory is available. Bind LAN services only for that controlled session. No public tunnel/deployment or new persistent DNS/service is authorized. Localhost-only runs cannot prove physical coverage.

Trusted bootstrap allowlist, before learner execution: harness document; pinned built editor/React/CSS assets and their build manifest; public Q01/record lesson fixtures; candidate bootstrap document and Worker entry bytes; service-worker script and versioned public offline assets. Exact generated asset names/hashes must be recorded before running a candidate. No Auth/analytics/storage-provider assets. No learner-selected URL/import/resource appears in this allowlist. Use separate recorded bootstrap and execution phases; the latter must produce zero learner-initiated requests while network is online.

The candidate experiment selects effective Worker CSP and iframe permissions; this charter does not assert untested flags solve isolation. Same-origin scripted authenticated previews and globals-only confinement are not passing candidates. Bind sender/channel plus run/task/version; `origin: null`, nonces and CORS alone do not establish authority. Raw messages never request arbitrary privileged host operations.

Instrumentation controls: trusted harness request reaches sink; permissive synthetic negative control can reach sink/discover its own app canaries. Restricted candidate must deny the same probes. Keep actual session/credentials out of source/messages/sinks/evidence. Local servers only serve fixtures or record bounded requests; never execute learner source.

## Evidence, revision and exit rules

Verdicts are passed, failed, unsupported or untested per capability/environment. Overall recommendation is Proceed, Redesign/no-go or Inconclusive/awaiting review. Each evidence record must carry E/fixture ID, expected/actual behavior, environment/candidate, monotonic timestamps/raw samples, prototype commit and commands, dependency/browser versions, topology/effective policy, sink/canary observations and failure/retest links. No measurements existed at revision 1 selection. Current evidence is in the [preliminary report](report.md), including failed preview containment/recovery and required untested coverage. Initial dirty-build trials did not freeze complete asset fingerprints; later prospective freezing does not certify earlier builds.

Record numerical revisions as B-ID/revision, original selected criterion/result, reason, approver where applicable and new trial IDs. Do not retrospectively convert original failures. Policy changes or reduced required scope require explicit scoped approval and revised active artifacts; no automatic remote-runner fallback.

Proceed requires passing all required integrated/device/accessibility, runtime/preview containment/recovery and offline/update/persistence gates, reviewed F01/F02 recommendations and dated named technical/security/product reviewer evidence. Missing physical coverage or reviewer assignment is inconclusive. Approved P06 fraud/local data-clearing loss does not permit session leakage, cross-account authority, unsafe execution or unbounded host abuse. F03–F09 remain deferred, ADR 0004's policy stays Accepted and feasibility remains unverified until applicable evidence is reviewed. Phase 2 requires separate authorization.

## Teardown and data handling

Use only synthetic source/profiles/session canaries and bounded local artifacts; no analytics SDKs or real learner recruitment. Preserve reproducible source/evidence, not transient secrets or unbounded logs. F06 remains a prerequisite before real learner data collection.

When executable work exists, stop only documented prototype server processes; close only task-created browser profiles; clear only task-created origin caches/IndexedDB; remove only temporary task certificate/name mappings actually added, recording what changed. Verify every resolved target is within the task-owned directory or explicitly recorded setup before removal; preserve ordinary user browser data. No certificate/hosts setup has been added yet, so no teardown action is currently needed. Never commit private certificate keys, `.env` files, tokens or credentials. Do not promote prototype source into production automatically.

## Continuation procedure limits — 2026-09-13

The isolated preview comparison uses the same runner host and trusted preview bootstrap with an inner opaque learner document. Effective policies and tested behavior are recorded in the report; it adds no remote runner or accepted policy exception. The loop watchdog verifies a learner execution marker before starting the emergency cutoff, and compares constrained Chromium flags with no additional browser flags.

The CDP quota diagnostic is limited to 128 synthetic records of 65,536 ASCII source bytes each (8 MiB logical payload) in a task-owned browser context. This bounds the procedure, not a physical storage quota. It records committed writes, native errors, reported quota/usage and recovery; overrideActive alone is not evidence of enforced quota failure. Earlier failed assertions and methodology corrections remain retained. No physical disk is filled or ordinary profile modified. B01–B09 acceptance criteria are unchanged; rerun the selected procedure against a frozen completed build.

Continuation records explicitly distinguish dependency preflight from actual engine launch. Firefox runs with the recorded host-preflight option, without skipped security assertions or changed policies. The same owned loop procedure compares opaque and dedicated Firefox previews with default launch settings; an observed learner marker remains the prerequisite for classifying trusted-recovery failure. No numerical budget or required environment is revised.

## E04 authorized redesign continuation - 2026-09-13

The user explicitly authorizes preview containment/recovery redesign and retest while preserving P11 and all budgets. The supplied-shell function/record preview now separates learner computation (the existing restricted opaque Worker) from presentation (a fixed, empty-sandbox iframe with script/style/resource/form/frame/base policies denied). Bounded decoded strings are escaped into a fixed text result element; learner HTML/CSS is never parsed as a host or iframe document. Learner JavaScript, including an infinite loop, executes only in the terminable Worker; no learner script runs on the document thread. The normal preview button reruns current source through this path. Previous executable-HTML variants and no-go evidence remain diagnostic comparisons, never production selections.

Retests must demonstrate useful function output and its text equivalent, actual Worker timeout and fresh restart, stop/reset/source retention, online request/storage/message denial, hostile HTML/CSS-as-output containment, and prepared offline/update integration. Run 10 abusive preview trials and 100 desktop preview cycles per available engine, keeping the original 2-second deadline plus 1-second recovery, 1-second fresh-run, byte/message/output limits and physical/mobile requirements unchanged. Automated timing cannot supply missing physical or hard memory quota evidence. This is supplied DOM plumbing for the approved logic curriculum; a general DOM programming runtime is not claimed.

## Offline-diagnostic continuation - 2026-09-14

Keep all original offline-emulation failures and required physical criteria unchanged. A separate fixed-response service-worker control (scoped under `/__offline-control/`, no React/Serwist/IndexedDB/learner source) records online/offline fetch delivery counters and navigation behavior in each available engine. Its diagnostic collection pass is never a passing application offline gate.

A separate single functional cold-origin trial per available engine prepares a task-only persistent browser profile, confirms a controlling service worker and exact saved source, awaits closure of that browser, stops only its owned fixture server, verifies ECONNREFUSED at all three bootstrap/sink endpoints, and relaunches the prepared profile in a new headless process. It checks exact source, local provisional check and supplied preview/text without any origin server. Record prospective build/script/server/source hashes, versions/options, observed timings, original failures and cleanup. This is origin-unreachable transport testing with network/offline emulation disabled, not physical network-disconnection or B07's ten-trial lower-powered physical measurement. Required offline-emulation and physical/device/accessibility gates remain unchanged and untested/failed where already recorded.

After the WebKit persistent preparation failure, the comparison uses a shorter task-only profile root at repository `temp/phase1-profiles` (only a fresh mkdtemp child, never ordinary profiles). Preserve the original failure and verify the absolute deletion target stays in that exact root. Profile-location correlation is not proof of a particular native path-length bug, and no numerical or security criterion changes.

## Available native-Chrome continuation - 2026-09-14

The owner's latest instruction confirms installed Chrome and requires Codex to perform every accessible browser/development-environment check without requesting manual user validation. Current Apply remains remote `spike/worker-preview-recovery`, draft PR #6. No dedicated Browser Use or computer-interaction tool is exposed; Playwright/CDP can launch installed Chrome with an isolated task profile. Native Chrome automation is Windows browser evidence, not physical typing, mobile/Safari or assistive-technology evidence.

Observed native browser: Chrome 153.0.8010.37, Windows 10 Pro 10.0.19045, HP ProDesk 600 G2 SFF, Intel Core i5-6500, 8,464,728,064 bytes RAM, Intel HD Graphics 530 driver 31.0.101.2111, 1920x1080 reported display. Installed Firefox was not found at inspected standard paths and remains unconfirmed/untested. No lower-powered designation, thermal condition or screen-reader availability is inferred. Timestamped inventory and per-trial metadata preserve exact observations.

Native procedures use headed `channel: chrome`, no added GPU/renderer restrictions, and `viewport: null` for desktop interaction; 320 CSS pixel sizing is explicitly a desktop reflow diagnostic. Automated keyboard editing and Escape/Tab activation exercise real browser event handling. Native page zoom is changed only in the task profile through Chrome appearance settings and independently checked by devicePixelRatio/viewport geometry; renderer shortcut attempts that do not change zoom remain inconclusive. Reduced-motion media emulation is not a global Windows setting. CDP AX-tree inspection is not speech/comprehension testing.

Record 10 warmup plus 100 beforeinput-to-next-animation-frame exact-source samples as a frame proxy, not physical B01. Record ten closed/relaunched native Chrome processes with all owned origins connection-refused as cold-origin diagnostics, not physical network-disconnection/lower-powered B07. Native installation is attempted only in a fresh task profile with manifest inspection, PWA install/launch/standalone-setting diagnostics, exact persistence-cycle mix and cold-origin relaunch where accessible; preserve actual display-mode observations, and uninstall the task app before profile cleanup. Window minimize/restore commands do not establish background behavior unless its actual state is observed.

Existing B01-B09, P11 and physical/device/accessibility requirements are unchanged. Unavailable evidence is recorded, and the [smallest proposed scope adjustment](proposed-scope-adjustment.md) awaits explicit approval. That recommendation does not authorize a failed eligible containment/recovery/source-retention gate or a production selection. Codex executes all available work; no manual participation request is made.


Final native inventory refines Windows to 22H2 build 19045.6466 and retains standard-path/four-key Firefox discovery without proving absence. Supplemental nested Blob controls distinguish constructor capability from inherited network denial; fixed child-first-message rejection/recovery is separate from normative parent/preview timeout trials. Natural-idle resource snapshots at ten/thirty seconds are observational diagnostics, not a new memory tolerance or extension of B02/B03. B08 remains the selected usability/crash/lifecycle observational branch; a hard browser memory quota is unverified. See the final report for retained native readiness failures and the proposed, unapproved bootstrap-lifetime experiment.


## Authorized persistent-bootstrap experiment - 2026-09-14

Approval evidence: after being asked explicitly to approve revising D3/charter and implementing/retesting a persistent trusted opaque bootstrap with a fresh Worker per run, preserving P11 and every numerical acceptance limit, the project owner replied: "Yes i approve". This approves this experimental lifecycle/control-channel revision only, not S01-S06, F01/F02 production selection, an independent audit or Proceed.

D3's opaque candidate now retains at most one hidden trusted opaque bootstrap per BrowserRuntime instance. Learner code never executes on a document thread; every run creates a fresh Worker from the same public worker bytes under the unchanged inherited CSP. Dedicated-origin and permissive controls remain separate comparisons; no third candidate is added. The fixed script-disabled supplied-shell presentation is unchanged.

An actual-window-bound one-time bootstrap handshake transfers a host/bootstrap MessagePort. That private port never reaches learner Workers and carries only bounded start/stop control and lifecycle acknowledgments correlated to run/task/content/assessment identity. Learner output uses the separate untrusted window channel, checked against the actual compartment and current identity. Output cannot acknowledge cleanup. The bootstrap terminates its current Worker before acknowledging stop. Host control serializes cleanup before a fresh start. A missing/malformed acknowledgment triggers compartment removal and private-channel invalidation within a predeclared 100ms cleanup fallback inside the existing additional 1s recovery allowance. Bootstrap loading still counts toward the original 2s execution deadline and 1s fresh-start gate; no prewarming outside measurements.

A retained trusted bootstrap is not leaked learner execution: record total trusted frames separately from active execution/presentation frames and require zero acknowledged active learner Workers after cleanup. Explicit disposal closes ports, revokes the public Worker Blob and removes the bootstrap. No learner Blob/session/application data is retained for reuse. Browser allocation and descendant termination remain measured limitations, not hard-quota promises.

Before any favorable recommendation, rerun first/fresh startup, ten verified parent/preview loops, ten nested-child cases per candidate, 100 desktop cycles, natural-idle resources, wrong/stale/forged control and output vectors, online request/storage/channel probes, source preservation and exact offline/update/PWA persistence cycles in all accessible engines. Retain old failed hashes/timings. A missed original limit is still no-go. Missing physical/AT coverage and dated outcome review remain pending; PR #6 stays draft and Phase 2/Sync/Archive stay blocked.


Persistent-frame correlation correction: a queued window output from an old run must not fail or replace a fresh run. The trusted bootstrap stamps each callback with its captured run/task/content/assessment identity in a bounded `learner-output` envelope; the actual-window-bound receiver discards superseded envelopes and independently validates the raw current output. The complete serialized envelope retains the same 16KiB message limit. One-time bootstrap readiness carries a public per-bootstrap identifier; this is correlation, never a session credential or authority proof. The private control port remains separate and unavailable to learner code. Retest the stale-generation regression and all affected containment/recovery/update cases. This fixes a directly reproducible stale-message weakness; it does not establish the cause of native timeouts or waive their retest gates.


Terminal-output lifecycle correction: the trusted bootstrap now invokes Worker termination before forwarding every non-start-marker message, because the host protocol finishes on either a decoded terminal result or a malformed non-marker message. The exact single correlated execution-start marker remains nonterminal; duplicate markers still fail host validation. Private cleanup acknowledgment and the 100ms removal fallback remain required and unchanged. Two execution tests of the actual bootstrap script verify termination-before-delivery, marker continuity and private cleanup acknowledgment. These tests establish ordering, not synchronous descendant death, a hard resource bound or a passing browser recovery gate.


Further dedicated-bootstrap lifetime/public-offline-resource revision is [proposed for explicit review only](proposed-bootstrap-revision.md). It is not part of the currently approved opaque-bootstrap contract and must not be implemented or selected from an instruction merely to continue existing work. It preserves the two-candidate limit, P11 and all numerical gates; new security/cache/startup evidence is required.
