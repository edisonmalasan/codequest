# Tasks

## 1. Bounded monitoring contract and delivery

- [x] 1.1 Add validated, off-by-default Sentry configuration and release labels for frontend and backend; verify invalid/missing approval, DSN or release sends nothing in focused tests.
- [x] 1.2 Add narrow Sentry adapters with fixed operational categories, safe fields, disabled automatic capture and nonblocking delivery; verify fake-sink payloads exclude canary source, token, URL, identity and free-text errors, and provider failure leaves app behavior intact. Document F06 enablement and rollback in `docs/monitoring.md`.

## 2. Backend request and exception monitoring

- [x] 2.1 Connect the existing Fastify request lifecycle to route-template, request-ID, status and duration monitoring with bounded slow threshold and low-rate routine sampling; verify 2xx, 4xx, 5xx, slow, unmatched and query-bearing paths with focused application tests.
- [x] 2.2 Capture unexpected backend exceptions once using safe class/category without changing normalized responses or structured logs; verify sensitive exception messages and bodies never reach the fake sink and delivery failures leave the 500 contract intact. Document request-ID triage and latency/failed-request views.

## 3. Frontend failure recovery

- [x] 3.1 Add an application route error boundary with a reset action and bounded category capture; verify safe recovery text and one capture with a synthetic render failure.
- [x] 3.2 Add application-origin uncaught error and promise-failure observation without original error payloads, user identity or worker/preview imports; verify canary redaction, disabled/offline behavior and isolation in focused tests. Document frontend signal limitations.

## 4. Integration and release evidence

- [x] 4.1 Verify an enabled synthetic browser/backend flow with a local fake Sentry sink and release label, no external service traffic, and no change to learner execution boundaries; record the exact result in `docs/monitoring.md`.
- [x] 4.2 Run root test/lint/typecheck/build, API/content/drift checks, existing browser suites and strict OpenSpec validation; inspect the final diff and record actual results.
