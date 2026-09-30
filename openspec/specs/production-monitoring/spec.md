# Production Monitoring

## Purpose

Make CodeQuest production failures and release regressions observable through bounded operational signals without exposing learner work or enabling live telemetry before the approved privacy policy.

## Requirements

### Requirement: External monitoring is explicitly gated

Sentry delivery SHALL be off by default in browser and backend. It SHALL require an explicit deployment approval flag, a valid HTTPS Sentry destination and a bounded release identifier. Missing or invalid configuration SHALL send nothing. The approval flag SHALL only be set after F06 consent, retention, deletion and operator-access decisions are settled; this phase SHALL NOT enable real learner collection. Monitoring failures SHALL never alter learning, authentication, API responses or local draft behavior.

#### Scenario: Default deployment

- **WHEN** the applications run without monitoring approval
- **THEN** they create no Sentry request or monitoring identity

#### Scenario: Destination fails

- **WHEN** an approved capture attempt cannot reach Sentry
- **THEN** the original application outcome remains unchanged and no private payload is logged as fallback

### Requirement: Operational payloads exclude learner and identity data

Monitoring SHALL send only fixed event categories, bounded release/environment labels and safe request metadata: generated or validated request ID, method, route template, response status, duration and error class where applicable. It SHALL NOT send learner source, validation output, submission body, response body, query string, URL parameters, headers, cookies, tokens, email, account ID, IP address, free-text error message, stack local variables or session replay. Browser monitoring SHALL not link guest and account identities. Runtime Worker and preview origins SHALL have no monitoring capability.

#### Scenario: Exception embeds learner source

- **WHEN** a frontend or backend error message contains learner code or a secret
- **THEN** a capture contains only its allowed category and class, with neither the message nor the original exception object

#### Scenario: Dynamic API path fails

- **WHEN** a request to a quest-specific route fails
- **THEN** the monitoring record uses the route template rather than the concrete path, query or learner identifier

### Requirement: Frontend application failures are observable

The authenticated application origin SHALL observe uncaught browser errors, unhandled promise failures and rendered route errors through safe bounded categories. A route error SHALL have a usable recovery action. Monitoring SHALL avoid duplicate reports for a single handled boundary failure and SHALL not capture errors from learner execution compartments as application exceptions.

#### Scenario: Route render fails

- **WHEN** a route component throws during rendering
- **THEN** the learner sees a safe recovery view and an enabled monitoring sink receives a bounded frontend failure category and release

#### Scenario: Learner code fails

- **WHEN** isolated learner code returns an execution or validation failure
- **THEN** it remains a learning result, not a frontend application exception

### Requirement: Backend failures and API health are correlated

The backend SHALL retain its existing structured request-completion log and normalized error response. Enabled monitoring SHALL observe unexpected exceptions and sampled API completion latency, plus failed-request status categories, using the same request ID and route template. Expected 4xx outcomes SHALL remain distinguishable from unexpected 5xx failures. Sampling and bounded thresholds SHALL prevent routine successful traffic from flooding Sentry, and a monitoring failure SHALL not delay or change the response beyond a bounded capture budget.

#### Scenario: Unexpected request failure

- **WHEN** a backend request throws an unexpected exception
- **THEN** its safe 500 response and existing structured log remain intact while monitoring receives the request ID, route template, status and error class without the exception payload

#### Scenario: Slow successful request

- **WHEN** a successful API request exceeds the configured slow threshold
- **THEN** enabled monitoring records its bounded duration, status and route template without request or response content

### Requirement: Releases and triage are reproducible

Captured monitoring records SHALL carry a bounded release and environment so an operator can separate deployments. Operational documentation SHALL define the enablement checklist, synthetic verification, failed-request and latency views, alert routing expectations, correlation by request ID, and rollback by disabling delivery. It SHALL make no claim that alerts, live dashboards or privacy policy are operational until configured and checked outside the repository.

#### Scenario: Deployment regression

- **WHEN** a synthetic failure is captured under an approved test release
- **THEN** its release/environment and request category permit comparison with another deployment without exposing learner data
