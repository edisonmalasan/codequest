# Design

## Context

See proposal.md for motivation. Phase 31 names PostHog and event families; `docs/product.md` already defines source trust, funnel denominators and elapsed D1/D7 windows. NestJS owns accepted attempts, completions and streak days. The trusted browser owns Run/Check and guest activity. ADR 0008/P12 require minimized telemetry, and F06 blocks real learner collection until consent, retention, deletion and operator policy is approved. Phase 32 separately owns Sentry and monitoring.

## Goals / Non-Goals

**Goals:** A testable event contract, explicit source classification, stable fact-derived event IDs, bounded PostHog delivery, and documented queries that do not pretend local interaction is accepted learning.

**Non-Goals:** Live project provisioning, enabling collection, identity stitching, raw-source analytics, session replay, surveys, pageview/autocapture, Sentry, a new analytics table, durable delivery queue, account deletion operations, numerical targets or grading.

## Decisions

### 1. Capture explicit custom events through a small PostHog HTTP adapter

Use PostHog's custom-event ingestion endpoint with a typed allowlist and a narrow payload constructor, rather than a general browser SDK. The adapter never accepts caller-provided URL, headers or arbitrary properties. Browser requests omit credentials and referrer; backend requests use an explicit short timeout. This avoids accidental page/form/editor capture and extra SDK products, but means provider delivery is best effort. Official PostHog documentation supports explicit custom events through its capture API ([custom events](https://posthog.com/docs/data/actions), [ingestion example](https://posthog.com/docs/product-analytics/group-analytics)).

The allowlist is duplicated in each application at its owning boundary because the frontend must not import backend source and the small contracts do not justify a root package. Tests compare intended names and prohibited keys. The backend uses an owner UUID as its pseudonymous distinct ID; an enabled browser uses that same verified-session subject for observed account events, while guests get an ephemeral session identifier. No email or person-identifying properties are sent. Guest events are not aliased on signup. PostHog can connect anonymous and identified histories when `identify` is used, so this change deliberately does not call it ([PostHog people](https://posthog.com/docs/data/persons)).

### 2. Require an explicit external-collection gate

Both applications default to a no-op adapter. A key and HTTPS ingestion origin are insufficient: an explicit analytics approval switch must also be present. The deployment checklist forbids setting it until F06 is decided; local tests inject a fake collector and never contact PostHog. Invalid host, malformed key or missing gate yields no network request or guest identifier. No browser-visible consent UI is invented before the F06 policy decision. Removing the switch or key stops new delivery without altering learning facts.

### 3. Derive authoritative events after commit

Account establishment, progress start/hint and learning submission paths expose whether they inserted a new fact. `signup_completed` uses the first verified CodeQuest owner-row insert across these paths because learning may precede an explicit account-page establishment request; it is an account-activation proxy, not the Supabase registration instant. The analytics adapter receives only safe identifiers/versions, after the database transaction resolves. The submission path distinguishes new attempt, new accepted completion, first accepted completion and newly credited streak day; exact replay and practice do not emit completion milestones. Per-fact `event_id` comes from the stable account/quest/fact identity, not client timestamp or attempt count. An uncertain provider response may still create duplicates outside CodeQuest; dashboards use distinct `event_id`/quest identity rather than claiming provider exactly-once delivery. Analytics errors are caught outside transactions and logged only as event name/category without payload, never returned as a learning failure.

### 4. Keep local interactions observational

The reusable Editor Workspace exposes a parent callback for bounded Run outcomes, matching its Check seam. Quest pages capture `first_code_run`, every non-cancelled `code_run`, every completed `validation_checked`, `execution_error` and `validation_failed` without source, output or report. The two additional observed events are required because first-run and failure-only events cannot measure later successful Run/Check activity in the D1/D7 windows. They never represent backend acceptance. Guest Q01-Q04 start/hint events stay `client_observed`; account start/hint come from NestJS only, avoiding two asserted sources for the same durable action. Browser event identities are session-scoped and are not queued offline. Auth owner switches reset account analytics context; no guest-to-account merge happens automatically.

### 5. Define reports from events, not counters

PostHog query definitions filter by cohort and trust: account signup from first established account, first run from client observation, first accepted quest/five distinct quest IDs/chapter completion/capstone completion from backend first-completion facts. Daily and weekly meaningful activity are unique days/weeks of run/check/submission or accepted completion, not app opens. D1/D7 use elapsed 24-48/168-192 hours with completed observation windows, independently from timezone streak policy. No mutable analytics counters or account-progress authority are added.

## Risks / Trade-offs

- [Provider loss or duplicates] -> best-effort delivery is isolated from learning; stable event IDs and dashboard distinct counts expose uncertainty. A durable analytics outbox is deferred because adding a table/queue is not justified for pre-beta metadata.
- [Accidental collection] -> no-op default, explicit gate, strict allowlists, no SDK autocapture, mock transport tests and F06 release checklist.
- [Cohort gaps] -> guest session identifiers are ephemeral and never automatically linked to accounts; reports disclose browser clearing, multiple devices and ad blockers.
- [Client fabrication] -> browser events are labeled observed and never drive accepted funnels, rewards or progress.
- [PII via URL or SDK defaults] -> fixed ingestion host, no referrer/cookies, explicit payload keys, no automatic capture or runtime adapter.

## Migration Plan

Merge the proposal before implementation. Add the typed contract and no-op gated adapters, then instrument backend commits and browser interactions with focused tests. Verify provider payloads only against an in-process fake and check disabled defaults/no-network, replay, account separation and source exclusion. Run root test/lint/typecheck/build, API/content gates, browser suites and strict OpenSpec validation before the Apply PR. Sync the new capability spec on its own PR and archive on another. No project key, external destination or live learner collection is configured in this phase. Rollback removes instrumentation and leaves all authoritative learning facts intact.

## Open Questions

F06 must select actual consent language, retention periods, deletion/backup handling and operator access before any external collection is enabled. F05 must set targets, recruitment and review windows before metrics are interpreted. These do not change the disabled-by-default implementation contract.
