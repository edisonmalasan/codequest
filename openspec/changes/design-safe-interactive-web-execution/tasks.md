# Tasks

## 1. Isolated interactive contract

- [x] 1.1 Add a separate typed interactive adapter, immutable multi-file snapshot validation, fixed resource ceilings, and explicit unsupported/unavailable results; verify unit tests reject duplicates, oversize input, origin collisions, and implicit fallback while existing static preview tests stay green.
- [x] 1.2 Add a development-only review surface that supplies synthetic files and names the interactive mode without publishing curriculum; verify a component test shows a finite run and truthful unavailable state.
- [x] 1.3 Document the supported beginner DOM/event subset and adapter lifecycle in `docs/`; verify every claimed operation has a named focused test and the static-mode description remains accurate.

## 2. Worker DOM and event engine

- [x] 2.1 Implement a fresh runner-origin Worker and bounded DOM facade for the approved selector, text, class, attribute, style, console, and event subset; verify unit tests for finite interaction, unsupported APIs, malformed selectors, and no native document access.
- [x] 2.2 Add independent initial-run and per-event watchdogs, session/event caps, termination, supersession, and fresh-run recovery; verify repeated loop, handler-loop, cancellation, malformed-result, and source-preservation tests against the numeric gates.
- [x] 2.3 Add exact-session, ordered, bounded mutation and event protocols; verify forged, duplicate, stale, malformed, and oversized packets cannot alter current state.

## 3. Isolated display bridge

- [x] 3.1 Add only fixed interactive bootstrap/bridge resources to the credential-free preview and runner host allowlists with separate CSP and opaque child permissions; verify middleware/header and browser tests deny app/auth/API routes, external loads, storage, navigation, and learner-authored script execution.
- [x] 3.2 Render sanitized initial HTML/CSS and apply only validated data mutations; verify DOM node/depth/mutation limits, active-markup filtering, sink-denial probes, and accessible text alternatives in the focused browser suite.
- [x] 3.3 Delegate bounded click/input/change events from the fixed bridge and correlate them through preview and runner channels; verify useful finite counter/input examples and source/window/nonce spoof rejection in Chromium, Firefox, and WebKit.
- [x] 3.4 Dispose frames, ports, listeners, workers, timers, and object URLs on reload, owner change, route change, and failure; verify 100 hostile-loop/fresh-run cycles and cleanup probes with original failures retained in the evidence record.

## 4. Reusable workspace and qualified evidence

- [x] 4.1 Wire optional interactive mode into Editor Workspace without replacing static Preview, ordinary Run, Check, drafts, or Submit; verify focused component and browser tests keep source and correlated results through file/panel switches at desktop, 390, and 320 CSS pixels.
- [x] 4.2 Exercise the full hostile corpus against the real three-origin local app, including network/storage/navigation/HTML/CSS sinks, spoofed packets, event loops, flood limits, recovery, keyboard/focus, and reduced motion; record exact build, browser versions, origin topology, commands, timings, pass/fail and untested physical/hosted conditions.
- [x] 4.3 Update ADR 0004 and runtime/preview/security docs with the measured R07A result and supported subset; verify the decision explicitly blocks published interactive use if any containment or recovery gate failed and leaves R04/R06/Phase 38 statuses untouched.

## 5. Integration decision

- [x] 5.1 Run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm api:check`, existing runtime/preview/workspace browser suites, and strict OpenSpec validation; verify the commands and actual results are recorded without converting local evidence into hosted or founder acceptance.
- [x] 5.2 Review the final diff and a dated technical/security/product decision on the exact implementation build; enable the opt-in capability only when every required containment and recovery probe passes, otherwise record R07A blocked with the static mode intact.
