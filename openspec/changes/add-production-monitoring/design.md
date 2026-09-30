# Design

## Context

See [proposal.md](proposal.md). The NestJS/Fastify API already assigns request IDs, returns normalized errors, and writes structured `request.completed`/`request.failed` logs. Those records currently use a query-free path. The Next.js app has no route error boundary or Sentry adapter. Phase 31 established an F06-gated, disabled-by-default analytics precedent. The Worker and preview origins have restrictive CSP and must remain separate from authenticated application monitoring.

## Goals / Non-Goals

**Goals:**

- Provide useful incident and latency signals from current application seams, with strict field allowlists and release context.
- Make the disabled default and fake-sink verification observable in tests.
- Preserve existing API responses, logging and learner error presentation.

**Non-Goals:**

- Turning on live Sentry collection, provisioning projects or publishing credentials.
- Automatic SDK instrumentation, tracing propagation, session replay, profiling, source-map upload or user identity linking.
- Monitoring learner code errors as application exceptions or expanding Phase 33 security hardening.

## Decisions

### One narrow capture adapter per application

Use scoped Sentry browser and Node SDKs only behind validated approval, HTTPS DSN and release configuration. Initialize with automatic integrations and default PII collection disabled; call capture through app-owned builders that construct fixed messages and allowlisted tags. Never pass an original `Error`, request, response, URL or arbitrary object into Sentry. A fake transport/sink test will inspect the actual configured payload. A custom HTTP client was considered but would need to maintain Sentry envelope semantics and delivery behavior itself.

### Backend uses existing HTTP lifecycle seams

Extend the application hook and exception filter with an optional monitoring adapter. Use Fastify's registered route template for telemetry, falling back to a fixed `unmatched` category, while preserving the existing completion log contract. Capture unexpected 5xx once at the exception filter with error class and request ID. Completion handling records failed status classes and duration; slow requests above a fixed, configurable threshold are always recorded, while ordinary successful requests are deterministically sampled at a low rate. Capture is nonblocking and failures are isolated. Preserve the same safe response envelope and existing JSON logs.

### Browser uses application-origin error seams

Add App Router error UI and one small client-side listener for uncaught `error` and `unhandledrejection`. The route boundary reports a generic category and provides reset; a handled boundary error is not forwarded again by the listener. The adapter uses the configured release and safe class/category only, with no URL, breadcrumb, user context, captured exception object or automatic identity. It is never imported by Worker or preview code. An application route recovery view is preferable to silently reporting a render crash.

### Release and privacy operation

Both adapters require an explicit `MONITORING_CAPTURE_APPROVED`-style flag, scoped DSN and bounded release. Browser configuration is build-time; server configuration is startup-time. Document that F06 policy, Sentry project scrub/IP settings, authorized operator access, retention/deletion, deployment configuration, alert recipients and synthetic verification are external prerequisites. The repository ships disabled. Deployment rollback clears the approval flag or DSN; no database migration is needed.

## Risks / Trade-offs

- [SDK defaults can leak URL, headers, breadcrumbs or original exception text] → Disable automatic integrations and build every event from fixed allowlisted fields; verify the final fake sink payload with canary secrets.
- [Route-template lookup may be absent for 404 or early failures] → Emit a fixed `unmatched` label rather than a concrete path.
- [A slow Sentry endpoint may add response latency] → Enqueue capture without awaiting and bound transport timeout; failures never change API outcomes.
- [Browser global errors can include extension or cross-origin noise] → Observe only trusted application-origin categories and never pass raw event data.
- [Disabled delivery limits production visibility until F06] → Keep existing structured backend logs and document the outstanding enablement gate without claiming live alerts.
