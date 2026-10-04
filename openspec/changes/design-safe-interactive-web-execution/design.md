# Design

## Context

See `proposal.md`. Phase 14 runs one source snapshot in a fresh Worker on a credential-free runner origin with a two-second deadline and one-second fresh-run recovery bound. Phase 15 uses a different credential-free preview origin and an empty-sandbox, script-disabled child to show sanitized HTML/CSS; optional JavaScript runs separately and cannot touch that page. R06 composes lesson, editor, and results, but published JavaScript Quests do not yet mount a web preview adapter. Earlier executable learner-frame experiments missed the recovery gate. The new mode must not change either existing adapter's contract. Browser workers can be terminated independently of their event loop; main-thread script loops can stall the UI ([Worker termination](https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate), [event loop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth)).

## Goals / Non-Goals

**Goals:** Prove and, only after all gates pass, expose a useful beginner DOM/event subset with visible HTML/CSS changes; keep learner source terminable and all output bounded; preserve the existing origin, authority, draft, and static-preview boundaries.

**Non-Goals:** A general browser implementation, arbitrary third-party scripts/assets, networked projects, full CSS/DOM/browser API fidelity, independent grading, completion authority, backend execution, or published interactive curriculum in this change. R07 and R08 integrate and author the learning flows after R07A passes.

## Decisions

### 1. Build a separate interactive adapter, not a permission toggle

`InteractiveWebAdapter` accepts identified HTML/CSS/JavaScript snapshots and explicit `start`, `dispatch`, `reload`, `cancel`, and `dispose` operations. It is not the Phase 15 `PreviewAdapter` and cannot silently replace it. The production default remains static until the opt-in adapter has passing evidence. R07 owns published Quest wiring, Back/Next, Check and Submit sequencing; this change may use a development-only review route to prove the adapter. A failed gate leaves the new mode unavailable and retains the static mode unchanged.

### 2. Execute JavaScript against a small DOM facade in a fresh Worker

Use a fixed runner-origin bootstrap to create a fresh Worker for each interactive session. The Worker receives only source, a bounded sanitized document model, generation ID, and later allowlisted event records. Provide a documented beginner subset: `querySelector`/`querySelectorAll` for simple ID, class and tag selectors; `getElementById`; `textContent`; selected attribute/class/style updates; `addEventListener` for click, input and change on identified elements; and bounded `console` output. Do not expose a native document/window, arbitrary selector engine, HTML parser, `innerHTML`, network, storage, timers, dynamic import, nested workers, or navigation. Unsupported operations report a bounded error. This avoids moving learner loops into a frame. The facade is not claimed to be browser-complete; R08 content must target its published subset.

The session Worker may remain idle between a bounded number of interactions so registered handlers and simple state persist; it is terminated on any deadline, session limit, cancellation, supersession, disposal, owner change, or protocol failure. Trusted timers outside it enforce two seconds for initial source execution and each dispatched handler; a fresh finite session must recover within one second after a hostile loop. Start with fixed caps of 64 events and five minutes per session, subject to reducing them if browser evidence requires it. Keep existing Phase 14 Worker resource paths and limits unchanged; the interactive Worker uses separate fixed resources and may reuse protocol helpers without weakening their checks.

### 3. Display validated data through a fixed bridge on the preview origin

Reuse the dedicated credential-free preview host but add only fixed, allowlisted interactive bootstrap/bridge assets with their own CSP. An outer preview bootstrap owns a nested opaque-origin learner display iframe. That child may run **only** a fixed external event bridge; it never receives/evaluates learner JavaScript. It omits `allow-same-origin`, forms, popups, downloads and navigation permissions, and uses a policy that allows only its fixed bridge script, inline constrained CSS and bounded local data images. The current static child remains `sandbox=""` and script-disabled. Sandboxed frames without `allow-same-origin` have opaque origins; the combination of script and same-origin permission is a known dangerous pattern ([iframe sandbox reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe)).

The trusted app never writes learner markup to its own DOM. It sends bounded source to the preview bootstrap, which parses/sanitizes it using the existing allowlist as a starting point. The bridge delegates only click/input/change on current allowlisted element IDs, sends bounded event records to its parent, and applies validated text/class/attribute/style operations. No learner-supplied handler body or raw HTML mutation crosses into the child script evaluator. Retain static preview's filtered-active-content notice; interactive mode additionally reports unsupported DOM/API use.

### 4. Correlate and bound the three-compartment flow

The application controls the current generation and relays between the preview bootstrap and runner bootstrap over separate private channels after exact window/origin/nonce checks. The opaque child may report only to its immediate bootstrap; that bootstrap validates child `source`, instance nonce, active generation, event target and packet shape before forwarding. Never treat `origin: null` alone as authentication. The runner bootstrap validates session/event IDs, ordering, byte caps and allowlisted mutation operations. The application applies only active-generation results. No token, account identity, protected response, draft repository handle, or API client enters either origin.

Initial hard ceilings are Phase 15's 64 KiB HTML, 32 KiB CSS, 64 KiB JavaScript and 128 KiB generated document; 512 elements, depth 32, 64 interaction events, 256 mutation operations per session, 16 KiB per mutation/event packet, 128 KiB total emitted mutation data, and existing 200 console entries/12 KiB text output. These are trusted constants, not caller options. The Apply stage may tighten them after profiling but cannot loosen the existing Phase 14/15 limits. Oversize or malformed active packets terminate the session without partial success.

### 5. Gate availability with adversarial browser evidence

First build a focused development probe with finite counter/input/class/text exercises and a representative hostile corpus. Test direct and indirect access to app/runner routes, cookies/storage/network, CSS and markup sinks, frame/self/top navigation, active HTML, fixed-script injection, fake/stale/duplicate/oversize messages, 100 loop/recovery cycles, event-handler loops, node/mutation floods, cleanup, and owner switch. Check Chromium, Firefox and WebKit plus installed browser where available. Record exact commit, origin topology, versions, timings, sink observations and retained failures. If a security or recovery gate fails, keep R07A blocked and do not mount it on published Quests. Physical-device/AT and hosted-origin verification remain separate release gates; automation is not a substitute. A passed R07A technical gate still needs security/product review and later founder acceptance of actual R07 learning workflows.

## Risks / Trade-offs

- [The facade diverges from real browser semantics] -> Publish only its tested subset, write original exercises to that subset, and reject unsupported APIs explicitly. Do not imply full DOM support.
- [Fixed display bridge or sanitizer admits active content] -> Keep a separate origin, opaque sandbox and strict fixed-resource CSP; test external sinks and injection paths in all declared engines. Any breach blocks use.
- [Opaque child message origin cannot prove identity] -> Validate exact frame window, unpredictable instance/generation IDs, private parent channel and bounded allowlist; treat `null` as insufficient.
- [CSS or large DOM work stalls display] -> Bound source, elements, depth and mutation operations; measure hostile rendering and recovery. Browser memory has no hard per-frame quota, so release claims must stay qualified.
- [Idle Worker retains state longer than intended] -> Cap events and session lifetime, cancel on ownership/navigation changes, and test resource cleanup.
- [R06 or R04 gaps are mistaken for R07A completion] -> Record technical runtime evidence separately. R06 founder review and R04 real-provider verification remain open.

## Migration Plan

Add fixed assets and adapter behind an explicit capability selection; preserve the current static preview and Phase 14 Run as defaults. Run the containment and recovery suite before any published exercise can opt in. If a gate fails, leave the mode unavailable and retain its evidence; rollback removes only the new fixed resources and adapter. No database or API migration is required. Any future curriculum enablement requires R07/R08 changes and versioned publication review.
