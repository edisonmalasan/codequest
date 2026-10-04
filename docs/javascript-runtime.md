# JavaScript runtime

R07A's [interactive web execution candidate](interactive-web-execution.md) uses separate fixed runner resources and a fresh Worker per interactive session. It does not change the Phase 14 `ExecutionAdapter`, Run limits, or validation authority. The capability is development-review-only pending its own evidence decision.

Phase 16 adds a separate [local validation engine](validation-engine.md) on the same credential-free runner origin. It uses dedicated fixed bootstrap and Worker resources for deterministic assessment cases while leaving the Phase 14 `ExecutionAdapter` Run contract and its limits unchanged. Local Check results have no completion authority.

Status: Phase 14 implementation complete. The browser computation boundary is synced to the canonical OpenSpec capabilities and the completed change is archived.

## Contract and ownership

The frontend exposes a lesson-independent `ExecutionAdapter`. `execute` accepts one immutable JavaScript source snapshot and an optional `AbortSignal`, then resolves exactly one `ExecutionResult`. Results distinguish `success`, `syntax-error`, `runtime-error`, `timeout`, `output-limit`, `cancelled`, and `internal-error`; each includes ordered text output, a text return value, a bounded message, and trusted elapsed duration.

`JavaScriptWorkerAdapter` is browser computation only. It does not render a preview, run assessment cases, determine correctness, submit work, accept completion, change progress, or award rewards. Those remain later capabilities. The Editor Workspace supplies Run and Cancel and presents results through its existing console and runtime-status surfaces without owning execution policy.

## Required configuration

`NEXT_PUBLIC_RUNTIME_ORIGIN` is a public origin, not a credential. It must be an HTTPS origin distinct from the application origin; loopback HTTP is accepted for local development. Values with credentials, paths, query strings, or fragments are rejected. Missing, malformed, insecure non-loopback, or same-origin configuration leaves execution unavailable and does not evaluate learner source.

Deploy `/runtime/bootstrap.html`, `/runtime/bootstrap.js`, and `/runtime/javascript-worker.js` at that origin with the response headers defined in `frontend/next.config.ts`. The bootstrap policy permits only its fixed same-origin script and Worker while denying connections. The learner Worker policy permits dynamic compilation with `script-src 'unsafe-eval'` but allows no script URL source, connection, nested Worker, frame, object, or base capability. The `unsafe-eval` token is required solely to compile the supplied source inside the isolated learner Worker; it is never added to the trusted application document.

## Isolation and lifecycle

The application creates a sandboxed hidden bootstrap iframe and validates the configured window origin before transferring a private `MessagePort`. The bootstrap creates a fresh literal-URL Worker for every run. Learner code receives only the run identity, source text, and a captured console object. It receives no token, cookie value, account identity, API client, application storage handle, DOM, trusted port, or application configuration.

The Worker bootstrap removes network, storage, import/spawn, broadcast, and direct messaging primitives before compiling source. CSP supplies the enforceable network and child-resource boundary. Commands and results carry unpredictable run IDs and pass bounded shape and UTF-8 checks at both bootstrap and application receivers. The bootstrap terminates the Worker before forwarding a terminal result. Cancellation, timeout, malformed active output, supersession, adapter disposal, and bootstrap failure all terminate or invalidate active work; stale packets cannot replace the current result.

The trusted deadline is two seconds. The application requests termination independently of the learner event loop and resets an unresponsive bootstrap within one additional second. A new run uses a fresh Worker and must not observe globals from an earlier run.

## Fixed limits

| Resource | Limit |
| --- | ---: |
| UTF-8 source | 64 KiB |
| Console entries | 200 |
| Combined output and return text | 12 KiB |
| Terminal packet | 16 KiB |
| Error message | 1 KiB |
| Execution deadline | 2 seconds |
| Recovery bound | 1 second |

Callers cannot raise these values. Console arguments and return values are formatted through property descriptors so getters and `toJSON` are not invoked. Cycles, excessive depth/width, entry floods, and oversized output produce `output-limit`; no partial output is accepted as success. Learner errors expose bounded messages without trusted stacks or configuration values.

Browsers do not offer a dependable hard per-Worker memory quota. Source, output, packet, and lifetime bounds reduce exposure, and termination contains continuing CPU work, but allocation pressure before termination remains a browser-process limitation. This runtime is suitable for the approved beginner JavaScript computation scope, not hostile high-assurance multi-tenant execution.

## Phase boundary

Phase 15's [static web preview](web-preview-runtime.md) consumes a separate instance of this adapter for optional JavaScript computation. It does not change the Phase 14 Worker boundary or give learner code DOM access. Runtime execution itself provides no validation/checking, submissions, progress, XP, unlocks, analytics, or backend execution.

## Phase 27 offline preparation

Explicit lesson download embeds `/runtime/offline-setup.html` on the configured runner origin with a nonce and exact parent origin. Its fixed script registers `/runtime/offline-sw.js` with scope `/runtime/`, waits for activation, checks the prepared six-resource cache, and sends only correlated `ready`/`unavailable` status. The application accepts status only from that frame and origin. Setup gets its own restrictive script/worker/connect policy; learner bootstrap and Worker CSP remain unchanged. The runtime host allowlist adds only these three setup/worker files; application shell/worker/auth/API routes remain denied there, and runtime files remain denied on the application origin.

The runner worker installs only the six fixed bootstrap/JavaScript/validation resource URLs. Requests omit credentials and redirects. It checks literal SHA-256 bytes, exact bootstrap/Worker CSP, MIME, 64 KiB per entry and 256 KiB combined bytes before caching. A failed installation clears only that runtime cache. Reads prefer a version-matched pinned network response and fall back to verified cached bytes/CSP. Only bootstrap documents accept the single `parentOrigin` query; unknown paths, other queries, authorization headers, mutations and external origins are excluded. It accepts no cache/activation messages, learner source or account identity. Install/activate never touches application IndexedDB. Runtime cache releases require a new cache version and matching literal resource hashes; old resources must remain coherent during deployment. Activation claims only runtime clients after the natural waiting lifecycle and never reloads them or terminates learner work.

Offline execution uses the same adapter, private message channel, fresh Worker and trusted timers. Production Chromium cold new-page and tight-loop/fresh-run tests cover the prepared path. Cache eviction, storage blocking or incompatible browser behavior reports unavailable; it never evaluates source in the application origin. Physical/native and other F02 support obligations remain untested. See [offline learning](offline-learning.md).
