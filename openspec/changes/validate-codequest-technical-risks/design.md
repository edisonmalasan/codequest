## Context

See [proposal](proposal.md) for motivation and [validation contract](specs/technical-risk-validation/spec.md) for observable requirements. The repository has documentation, accepted Phase 0 ADRs, and an empty main spec inventory; no `frontend/`, `backend/`, root package manifest, runtime, or executable curriculum exists. No Phase 1 evidence has been gathered. The roadmap's four prototype areas are the baseline; E03 containment and E06 integration make approved Phase 0 constraints independently measurable.

Sources are `docs/DEVELOPMENT_ROADMAP.md` Phase 1; product/frontend/backend/architecture/security/curriculum/gamification/decisions documents; ADRs 0001–0008; and the completed Phase 1 exploration. AP01 approved policies, not empirical containment. F01/F02 must be addressed by evidence; F03–F09 retain their recorded triggers. Historical roadmap root content/shared-package trees do not override accepted ownership paths.

## Goals / Non-Goals

**Goals:** Make risky assumptions falsifiable; exercise real browser/device behavior; choose an evidence-backed containment direction and device capability matrix; demonstrate controlled recovery and truthful offline persistence; deliver an explicitly reviewed production gate.

**Non-Goals:** Production application workspace, NestJS endpoints, database/migrations, actual Auth providers, generated client, production curriculum compiler, full outbox/sync algorithms, cloud drafts, telemetry providers, real learner recruitment, curriculum efficacy study, XP balance, pixel-art polish, remote runners, AI/Python, or automatic Phase 2 execution. Prototype source is not production code and is not promoted automatically.

## Decisions

### D1: Isolate executable spikes from the production foundation

After separate Apply authorization, use `prototypes/technical-risk-validation/` for a self-contained TypeScript/React browser harness, CodeMirror 6, Worker/iframe fixtures, Dexie persistence, Serwist PWA integration, and focused Vitest/Playwright checks. Choose and pin compatible dependency versions during Apply and record them; no dependency installation happens during Propose. A minimal bundler may serve the harness without establishing the production Next.js/NestJS workspace. Treat framework-specific integration as a recorded limitation requiring later verification.

Use local servers for controlled app/compartment/sink origins and synthetic acceptance responses. Learner code executes only in browser compartments; servers serve fixtures and record controlled requests, never execute source. Real-device testing can use a temporary local-network setup with locally trusted HTTPS where browser secure-context requirements demand it. Record hostnames/ports/certificate trust and teardown instructions; do not create cloud infrastructure, public deployment, accounts, secrets, or persistent services. Keep private certificate/key material out of Git. Localhost-only results cannot substitute for physical-device results.

Artifacts later produced:
- `docs/technical-risk-validation/charter.md`: owners, criteria, device inventory, procedures, candidate topology, probe inventory.
- `docs/technical-risk-validation/coverage.md`: per capability/environment result and supporting evidence.
- `docs/technical-risk-validation/evidence/`: bounded synthetic traces, measurements, request records and reproduction notes.
- `docs/technical-risk-validation/report.md`: failures/retests, limitations, F01/F02 recommendations and reviewer decisions.

Alternative: create the production workspace first. Rejected because Phase 1 must test the direction before Phase 2 and avoid sunk infrastructure commitments. Root shared packages remain unjustified.

### D2: Preserve learning and assessment boundaries in tiny fixtures

E06 uses a Q01-aligned output/string task with objective, starter, deliberate wrong result, deterministic check, graduated hint and correction. Exercise read → edit → Run → inspect/debug → Check → provisional completion → save/reload → offline continuation. A second small parameterized function/record fixture tests value/function checks and a supplied read-only inventory preview; it is not a second authored quest or assessed DOM curriculum.

Use public fixtures and trusted orchestration, but treat source/output/reports as untrusted. A tampered local pass demonstrates accepted P06 fraud, not an isolation success or independent grading. Run success, Check success, pending snapshot, and simulated acceptance remain distinct. Reset changes draft only. Simulated rewards never represent real XP or a chosen F04 balance.

Mock responses exercise request loss after submit, immutable pending snapshots despite later editing, expired identity, owner A→B switching, explicit guest import, duplicate stable-quest completion with a different event ID, compatible old assessment, incompatible/retired assessment, and retry preserving source. Fake accepted history remains separate from active-version progress. These validate UI/recovery semantics only; production authorization, version windows, transactions, ordering and timezone algorithms stay F03.

Alternative: implement real auth/progress/sync to make the demo impressive. Rejected because it exceeds technical-risk scope and confuses mocked behavior with production evidence.

### D3: Compare containment candidates before selecting F01

Begin with a same-origin Worker as a negative control to expose available privileges, not a launch candidate presumed safe. Evaluate at most two restricted candidates initially: (1) Worker launched through an opaque-origin sandbox bootstrap, with its effective CSP and browser support measured; (2) Worker hosted behind a dedicated local compartment origin with no application cookies/session/storage and independently restrictive policy. Compare equivalent preview topology. Candidate feasibility, permissions, bootstrap loading and offline resource availability are experiment outputs, not assumed compatibility guarantees.

Record document/worker/preview origin relationships, script loading, effective response/inherited CSP, iframe flags, run/channel identity, policy violations and allowed bootstrap requests. No same-origin authenticated preview with script authority. Do not rely solely on removed globals, CORS, a message nonce, or a default Worker/iframe boundary. If no candidate meets policy on required environments, return redesign rather than silently weakening P11 or adding remote runners. Choosing a successful mechanism requires technical/security review and an evidence addendum to ADR 0004; policy status remains Accepted regardless of a failed feasibility experiment.

Trusted bootstrap may load only predeclared platform resources before learner execution. No exception for resources selected by learner source, HTML, CSS, imports, or navigation. Demonstrate execution-phase request blocking while online; running tests with network disconnected is insufficient.

Primary references explaining why these are experiments: [Worker capabilities/CSP](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) and [iframe sandbox permissions](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe). These references inform probe design, not a claim that a candidate is secure.

### D4: Experiment inventory and independent acceptance

| ID | Hypothesis / cases | Evidence and pass/fail focus | Owner role |
| --- | --- | --- | --- |
| E01 | Short CodeMirror exercise is usable; typing, selection, indentation, highlighting, undo/paste, reset, resize, touch/keyboard, rotation/zoom | Physical interaction recording/notes, focus/screen-reader checks, input latency; any inaccessible required action, recurring edit loss or unusable selection fails | Frontend/technical, product reviews mobile promise |
| E02 | Worker provides bounded recoverable execution; success, syntax/runtime/check failure, loop, log flood, oversized/deep/cyclic output, repeated stop/restart, delayed results | Timings/traces and source hashes; host stays responsive, correct categories, bounds enforced and stale data rejected; uncontrolled run/source loss fails | Technical |
| E03 | Candidate compartment has no application/session/storage/network authority; available request/import/nested-worker/channel paths | Online controlled-sink records, canary observations, topology/policy evidence and negative controls; any unauthorized side effect fails | Security/technical |
| E04 | Useful preview is contained and recoverable; parent/opener/sandbox escape, popups/forms/navigation, resource URLs, malicious output, tight loop/flood | Sink/policy logs, trusted-host DOM checks and recovery timings; escape, outbound request, executable host injection or uncontrollable preview fails | Security/technical |
| E05 | Prepared lesson/source/local JS survives cold offline start and update; install/relaunch, network loss, background/restart, quota/unavailable/cleared storage, waiting/activation/multi-tab | Cache inspection, exact persisted source/version comparisons and update traces; false saved/offline claims, incompatible mixing or protected cache contents fail | Frontend/technical |
| E06 | Tiny learning loop and failures compose on desktop/physical mobile; mock owner/version/reconnect outcomes | Repeatable integrated procedure and observed results; earlier component success cannot compensate for integrated failure | Technical/product, curriculum reviews fixture fit |

E01 and E02 establish usability/lifecycle baselines; E03 validates candidate authority; E04 uses the containment findings; E05 tests the selected candidate offline/update behavior; E06 runs only after these components can be integrated safely. Separate failures remain visible even when a happy path passes.

### D5: Security probes observe side effects

Probe all paths available in each target context, recording unavailable APIs rather than inferring universal protection:
- Worker: fetch/XHR/WebSocket, imports/dynamic scripts, nested Workers/SharedWorkers where exposed, IndexedDB/CacheStorage, cross-context channels and application resource attempts.
- Preview: script/frame/image/style/CSS URL loading, connections, forms, navigation/popups/downloads, parent/opener and sandbox manipulation, storage/cookie access and hostile HTML output.
- Messages: wrong window/source/channel, opaque-origin ambiguity, wrong run/task/version, stale/replayed data, malformed/oversized payloads and flooding. Do not grant trust to `origin: null` alone; bind the actual source/channel and lifecycle.
- Resources: loops, allocation stress, huge/deep/cyclic values, hostile object serialization, output backpressure, repeated restart and stale timers. Avoid invoking learner-controlled serialization in the trusted host.

Plant synthetic canaries in app DOM/storage, a fake session and fake protected responses, never real credentials. Before testing denial, verify instrumentation with a trusted positive-control request and a deliberately permissive negative-control compartment on isolated synthetic origins. Record which fixture caused every sink request. A blocked response read/CORS error is not proof of zero request; requests must be absent from the sink. Inspect host state and request records as well as browser console errors. Run with developer tools closed for representative lifecycle/performance measurements, capturing instrumentation separately where needed.

A preview loop may starve a host watchdog; sandbox permissions are not CPU containment. Test trusted recovery rather than assuming removal/navigation always works. If it requires killing the browser/process, record no-go. Browser memory is not a proven hard quota: stress only in a controlled environment, measure growth/recovery, and disclose unenforceable bounds rather than promising memory isolation.

### D6: Coverage is physical and capability-specific

| Environment | Required checks |
| --- | --- |
| Physical Windows desktop: Chrome and Firefox | Integrated loop, full execution/preview probes, keyboard, offline/update, timings |
| Physical macOS: Safari | Integrated loop, execution/preview containment/recovery, storage/update and keyboard |
| Physical Android phone: Chrome | Integrated short exercise, virtual keyboard/selection/touch/rotation, containment, install/relaunch, cold offline/recovery |
| Physical iPhone: Safari and home-screen mode | Same short-exercise/containment/recovery/offline checks; background/relaunch and update behavior in both modes |
| One declared lower-powered physical device among the above | Typing, cold start, bounded output, timeout/restart, repeated lifecycle; record hardware and power/thermal conditions |
| Automated Chromium/Firefox/WebKit | Repeatable behavioral/probe checks and viewport regression coverage; exact browser builds pinned |
| Accessibility: keyboard-only, NVDA with a declared desktop browser, VoiceOver on Safari/iOS | Focus order/escape, instruction/output/error comprehension, zoom/reflow, reduced motion, essential textual equivalence |

Record exact OS/browser versions, hardware, viewport, input method, network state and install mode before testing. This matrix selects validation environments, not a forever support-version promise. Physical installation is tested where exposed; lack of an install capability is documented as unsupported, not success. Required reading/editing/local JS/containment failure cannot be excused as unsupported without explicit product-scope revision. Missing required hardware yields untested coverage and an inconclusive overall gate. No timer or resource assumption comes solely from browser emulation.

Alternative: automated engines alone. Rejected because virtual keyboard, Safari/PWA lifecycle and physical low-end performance are material risks.

### D7: Predeclare provisional budgets before measurements

These are initial **proposal hypotheses**, not Phase 0 approvals or measured production guarantees. Proposal review can revise them; authorized Apply records the selected charter before collecting results. Limits must exist from the first executable prototype.

| Measure | Initial criterion |
| --- | --- |
| Short-exercise typing | p95 input-to-visible-update ≤100 ms on the declared lower-powered physical device; at least 100 recorded edit interactions |
| Worker and hostile-preview run deadline | 2 seconds; trusted termination/recovery feedback within an additional 1 second while host stays usable |
| Fresh run after stop/termination | Ready within 1 second |
| Console output | Maximum 200 entries and 64 KiB total serialized output per run, whichever is first; exceeding a limit is explicit failure |
| Single output/message payload | Maximum 16 KiB serialized size; reject oversized messages before expensive host rendering where feasible |
| Source snapshot | Maximum 64 KiB; reject oversized input explicitly and retain editable source |
| Prepared cold offline launch | Lesson/editor/local runtime usable within 5 seconds on the declared lower-powered device; report at least 10 trials |
| Repeated lifecycle | 100 cycles per desktop browser and 30 per physical-mobile mode; no crash/source loss or continuing resource-growth trend after warmup/cleanup |
| Confirmed persistence | Exact source and task/assessment identity retained over 20 controlled save/reload/update cycles per required browser/mode |

Declare clock boundaries, workload, warmup, sample count and background state. Record distributions and individual failures, not only means. Set a measurable device-specific retained-memory tolerance before repeated-cycle testing where reliable instrumentation exists; otherwise record repeated usability/crash observations and label hard memory bounds unverified. Missing reliable memory evidence cannot become a claim of a hard quota. Use explicit total/per-message bounds and receiver backpressure; sender checks alone are insufficient when learner code can bypass them. Payload/serialization limitations must appear in the final risk assessment.

Alternative: choose budgets after seeing timings. Rejected because it removes falsifiability. A revised hypothesis requires a recorded original failure, rationale and rerun; mandatory security and truthful-save boundaries are never traded for averages.

### D8: Evidence and reviewed exit gate

Every case records experiment/fixture ID, expected/actual behavior, verdict, prototype commit, commands, pinned versions, environment/topology, effective policy, raw measurements, canary/sink observations, source/version comparisons where relevant, failure ticket/rationale and retest links. Evidence uses synthetic data and bounded artifacts; no external analytics or editor replay collection. Classify each capability/environment as passed, failed, unsupported, or untested. Separate measured results from inferred limits and untested future integration.

Final recommendation:
- **Proceed** only when every required integrated, containment, runtime/preview recovery, persistence/offline/update, device/accessibility gate passes and F01/F02 recommendations have evidence plus explicit technical/security/product approval.
- **Redesign / no-go** when required policy or capability fails. Stop production scaffolding; report the candidate failure and a scoped redesign or requested explicit product revision. No remote-runner fallback or automatic scope reduction.
- **Inconclusive / awaiting review** when required equipment/evidence is missing, measurements cannot establish criteria, or reviewer approval has not arrived. Never mark missing review complete due to elapsed time.

Name actual accountable experiment and review owners in the charter before execution. Technical owner reviews mechanism/reproducibility; security owner reviews boundary and residual limits; product owner reviews declared mobile/offline promise and exclusions; curriculum owner confirms fixture consistency. Reviewer evidence may be an explicit user instruction where it identifies the applicable decision/outcome; do not infer it from committing, proposing, or running experiments.

Update F01/F02 with reviewed selections and evidence references; add feasibility evidence to ADR 0004 and consistent frontend/security/architecture notes without rewriting AP01 or reopening Phase 0. If policy must change, do not edit it silently: request explicit scoped approval and revise active planning artifacts before proceeding. A report documenting no-go can finish the investigation but cannot satisfy the successful Phase 1 progression gate. Phase 2 remains a separate proposal/execution authorization even after Proceed.

### D9: Maintain the roadmap snapshot without rewriting historical plans

Project Status is a dated snapshot before Product Goal: current/completed/next phase, active change, OpenSpec stage, validation state, repository state, source-of-truth links and progression gate. During this proposal it states Propose/review and no evidence. Later Apply updates only observed stage/results; successful completion is recorded only after review. Current-change links must be updated during a future archive workflow. Historical roadmap scope/trees remain unchanged and subordinate to the approved register.

## Risks / Trade-offs

- [No candidate meets P11 across engines] → Fail the gate and recommend scoped redesign; do not invent browser guarantees or weaken policy.
- [Iframe loop or serialization flood starves trusted control] → Independent recovery and host responsiveness probes; no-go if recovery is not demonstrated.
- [Prototype bundler differs from production Next.js] → Capture bootstrap/CSP/offline constraints and require production integration revalidation later; no automatic prototype promotion.
- [Local HTTPS/physical hardware unavailable] → Record missing coverage as inconclusive and request specific assistance during Apply; no substituted claims.
- [Service-worker update disrupts active clients] → Test waiting/activation/multiple clients, preserve source/version coherence and include [lifecycle reference](https://web.dev/articles/service-worker-lifecycle).
- [Mock acceptance appears authoritative] → Explicit simulation labels, P06 limitation and no backend correctness claim.
- [Storage eviction/clearing loses local data] → Disclose approved local-loss boundary and verify truthful recovery states; no cloud backup promise.
- [Technical test results mistaken for learner efficacy] → F04/F05/F06 retain beta-stage triggers; no real learner study or telemetry here.

## Migration Plan

No production deployment or data migration exists. Later Apply installs only prototype-local dependencies, runs local fixtures and records evidence; teardown stops local servers and removes temporary browser profiles/caches/certificate setup according to recorded instructions without touching user data. Keep reproducible source and synthetic evidence for review; never move prototypes into production applications automatically. Correct proposal errors through normal edits, not destructive history operations.

## Open Questions

Exact accessible physical device models/browser builds, named operators/reviewers and pinned prototype dependency versions are execution inventory details to record before measurements. They do not change the required coverage or acceptance contract; unavailable resources make the result inconclusive. Candidate mechanism selection is the planned experiment output, not an omitted pre-implementation architecture decision. Production cache/sync/compiler/DTO mechanisms, version-window duration, legal/retention policies and beta numerical targets remain F03–F06 for their separately scoped capabilities/triggers.

## E04 authorized redesign continuation - 2026-09-13

The user explicitly authorizes preview containment/recovery redesign and retest while preserving P11 and all budgets. The supplied-shell function/record preview now separates learner computation (the existing restricted opaque Worker) from presentation (a fixed, empty-sandbox iframe with script/style/resource/form/frame/base policies denied). Bounded decoded strings are escaped into a fixed text result element; learner HTML/CSS is never parsed as a host or iframe document. Learner JavaScript, including an infinite loop, executes only in the terminable Worker; no learner script runs on the document thread. The normal preview button reruns current source through this path. Previous executable-HTML variants and no-go evidence remain diagnostic comparisons, never production selections.

Retests must demonstrate useful function output and its text equivalent, actual Worker timeout and fresh restart, stop/reset/source retention, online request/storage/message denial, hostile HTML/CSS-as-output containment, and prepared offline/update integration. Run 10 abusive preview trials and 100 desktop preview cycles per available engine, keeping the original 2-second deadline plus 1-second recovery, 1-second fresh-run, byte/message/output limits and physical/mobile requirements unchanged. Automated timing cannot supply missing physical or hard memory quota evidence. This is supplied DOM plumbing for the approved logic curriculum; a general DOM programming runtime is not claimed.


## Authorized persistent-bootstrap experiment - 2026-09-14

Approval evidence: after being asked explicitly to approve revising D3/charter and implementing/retesting a persistent trusted opaque bootstrap with a fresh Worker per run, preserving P11 and every numerical acceptance limit, the project owner replied: "Yes i approve". This approves this experimental lifecycle/control-channel revision only, not S01-S06, F01/F02 production selection, an independent audit or Proceed.

D3's opaque candidate now retains at most one hidden trusted opaque bootstrap per BrowserRuntime instance. Learner code never executes on a document thread; every run creates a fresh Worker from the same public worker bytes under the unchanged inherited CSP. Dedicated-origin and permissive controls remain separate comparisons; no third candidate is added. The fixed script-disabled supplied-shell presentation is unchanged.

An actual-window-bound one-time bootstrap handshake transfers a host/bootstrap MessagePort. That private port never reaches learner Workers and carries only bounded start/stop control and lifecycle acknowledgments correlated to run/task/content/assessment identity. Learner output uses the separate untrusted window channel, checked against the actual compartment and current identity. Output cannot acknowledge cleanup. The bootstrap terminates its current Worker before acknowledging stop. Host control serializes cleanup before a fresh start. A missing/malformed acknowledgment triggers compartment removal and private-channel invalidation within a predeclared 100ms cleanup fallback inside the existing additional 1s recovery allowance. Bootstrap loading still counts toward the original 2s execution deadline and 1s fresh-start gate; no prewarming outside measurements.

A retained trusted bootstrap is not leaked learner execution: record total trusted frames separately from active execution/presentation frames and require zero acknowledged active learner Workers after cleanup. Explicit disposal closes ports, revokes the public Worker Blob and removes the bootstrap. No learner Blob/session/application data is retained for reuse. Browser allocation and descendant termination remain measured limitations, not hard-quota promises.

Before any favorable recommendation, rerun first/fresh startup, ten verified parent/preview loops, ten nested-child cases per candidate, 100 desktop cycles, natural-idle resources, wrong/stale/forged control and output vectors, online request/storage/channel probes, source preservation and exact offline/update/PWA persistence cycles in all accessible engines. Retain old failed hashes/timings. A missed original limit is still no-go. Missing physical/AT coverage and dated outcome review remain pending; PR #6 stays draft and Phase 2/Sync/Archive stay blocked.


Persistent-frame correlation correction: a queued window output from an old run must not fail or replace a fresh run. The trusted bootstrap stamps each callback with its captured run/task/content/assessment identity in a bounded `learner-output` envelope; the actual-window-bound receiver discards superseded envelopes and independently validates the raw current output. The complete serialized envelope retains the same 16KiB message limit. One-time bootstrap readiness carries a public per-bootstrap identifier; this is correlation, never a session credential or authority proof. The private control port remains separate and unavailable to learner code. Retest the stale-generation regression and all affected containment/recovery/update cases. This fixes a directly reproducible stale-message weakness; it does not establish the cause of native timeouts or waive their retest gates.


Terminal-output lifecycle correction: the trusted bootstrap now invokes Worker termination before forwarding every non-start-marker message, because the host protocol finishes on either a decoded terminal result or a malformed non-marker message. The exact single correlated execution-start marker remains nonterminal; duplicate markers still fail host validation. Private cleanup acknowledgment and the 100ms removal fallback remain required and unchanged. Two execution tests of the actual bootstrap script verify termination-before-delivery, marker continuity and private cleanup acknowledgment. These tests establish ordering, not synchronous descendant death, a hard resource bound or a passing browser recovery gate.


Further dedicated-bootstrap lifetime/public-offline-resource revision is [proposed for explicit review only](../../../docs/technical-risk-validation/proposed-bootstrap-revision.md). It is not part of the currently approved opaque-bootstrap contract and must not be implemented or selected from an instruction merely to continue existing work. It preserves the two-candidate limit, P11 and all numerical gates; new security/cache/startup evidence is required.

## Authorized dedicated-bootstrap experiment - 2026-09-15

The owner explicitly approved the persistent dedicated-bootstrap/public-offline-cache experiment with "i approve it. continue finishing all the tasks in phase 1". The frozen contract is docs/technical-risk-validation/proposed-bootstrap-revision.md: at most one trusted dedicated document per runtime, fresh HTTP Worker per run, exact-origin/window private handshake, unchanged 100ms cleanup fallback, generation-bound bounded output, and isolated public-resource-only runner cache preserving Worker CSP. Trusted bootstrap/service-worker network is restricted to its own public resources; learner Worker connect/import/nested-worker permissions remain denied. Both restricted candidates and permissive controls remain available. P11, B01-B09 and unavailable-device classifications remain unchanged. Freeze implementation hashes before trials. Approval is for experimental implementation/retest only; S01-S06, F01/F02 and new progression review remain pending.

Dedicated offline contract detail: a separate fixed runner-prepare.html/js document downloads public resources and is removed; it creates neither an execution bootstrap nor a Worker, so first execution bootstrap loading stays measured. The runner cache contains only bootstrap.html/js, worker.js and runner-prepare.html/js. The browser-managed installed runner service worker is not served from the mutable public cache. Its trusted manifest pins SHA-256 build bytes and exact CSP for every served cached resource, checking on installation and every fetch; learner Cache API mutation must fail closed. The parent permits only named trusted runner frames; learner presentation keeps the empty sandbox and deny-all CSP. Test cache poisoning, byte/header mismatch and offline/update security under this contract. This is a security correction within the approved public-cache experiment, not a new containment candidate or acceptance exception.
