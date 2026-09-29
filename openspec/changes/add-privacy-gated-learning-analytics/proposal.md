# Proposal

## Why

Phase 31 needs trustworthy activation, learning, retention and capstone measurements, but the current application has no analytics event contract or PostHog delivery. Unbounded client capture would expose private learning data and blur local interactions with backend-accepted facts.

## What Changes

- Define a small, versioned allowlist for the Phase 31 event names, safe properties, event identities, source trust and guest/account cohorts.
- Capture browser-observed quest starts, runs, hints and local failures only from trusted application seams; derive accepted attempts, completions and capstone transitions from newly committed backend facts. Replays and repeated actions do not become new authoritative milestones.
- Add a bounded PostHog capture adapter that is inert by default. External delivery requires explicit deployment configuration after the F06 consent, retention and deletion decisions; tests use a local fake collector. No live learner data is collected by this change.
- Document PostHog funnel and D1/D7 query definitions, source limitations, deduplication by stable event identity, and F05 target-setting obligations.
- Exclude source, written responses, tokens, email, URLs, editor replay, free text, automatic page/click/error capture and learner-runtime traffic. Keep Phase 32 Sentry/monitoring, account deletion operations and independent grading out of scope.

## Capabilities

### New Capabilities

- `learning-analytics`: Privacy-gated PostHog event contract and capture for observed interactions and backend learning facts, with cohort and funnel definitions.

### Modified Capabilities

None. Existing authentication, learning, progress, streak and runtime authority requirements remain unchanged.

## Impact

Touches trusted frontend learning/auth seams, backend account/progress/learning seams, bounded analytics adapters/configuration and measurement documentation. No new application table, migration, learner-code execution, protected-response cache or product API is required. PostHog project provisioning and live collection remain blocked by F06.
