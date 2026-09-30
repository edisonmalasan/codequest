# Proposal

## Why

The API already has safe request correlation and structured logs, but production failures are not yet visible across the browser and backend in one operational monitoring workflow. Phase 32 adds a privacy-gated Sentry integration and a bounded incident contract before real learner deployment.

## What Changes

- Add opt-in Sentry capture for application-origin frontend failures, unexpected backend exceptions, failed API requests, latency signals, and release identity.
- Reuse backend request IDs, status, duration, and safe route categories; add a browser error boundary and bounded capture adapter without exposing learner source or authentication material.
- Document operational triage, alert and release verification expectations with synthetic local/CI evidence.
- Keep external delivery disabled by default until F06 consent, retention, deletion, and operator-access decisions are approved. Do not provision live credentials or collect learner telemetry in this phase.

## Capabilities

### New Capabilities

- `production-monitoring`: Privacy-gated operational error, latency, failed-request, and release monitoring across frontend and backend.

### Modified Capabilities

None. Existing backend request logging and analytics trust contracts remain authoritative.

## Impact

The frontend app error boundary, backend HTTP lifecycle and exception filter, deployment configuration, tests, and operational documentation are affected. A scoped Sentry SDK dependency may be added in each application. No REST or database schema changes are required. Learner Worker and preview origins retain no monitoring capability.
