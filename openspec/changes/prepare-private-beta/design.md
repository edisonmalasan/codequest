# Design

## Context

See proposal.md. Supabase Auth already owns credential operations and `/auth/callback` exchanges PKCE codes. `/account` is session protected and already edits timezone. Phase 31/32 telemetry is disabled by default. F06 is unresolved and blocks real collection.

## Goals / Non-Goals

**Goals:** A first-use explanation, recovery and self-service password change through existing Auth, an honest feedback draft, and an auditable no-go release record.

**Non-Goals:** Provider account linking, account deletion, legal policy text, hosted infrastructure provisioning, live telemetry, beta invitation, backend feedback ingestion or changing learning authority.

## Decisions

1. Add an `/onboarding` route linked from home and account entry points. Reuse the public journey, register and guest-import routes. Do not create a second progress store or change Q01–Q04 guest constraints.
2. Use Supabase `resetPasswordForEmail` and `updateUser` from the trusted client. Recovery email redirects through the configured `/auth/callback?next=/account/password`; callback exchanges the one-time code and strips it via redirect. The password page requires the existing server-side trusted session. Use a generic recovery acknowledgment; provider errors are not echoed.
3. Keep feedback as an explicitly unsent browser draft with a bounded length, local save and clear. Do not create a backend table or endpoint until F06 specifies lawful collection and retention. Using the existing Dexie architecture is considered, but this form has no account association and no sync requirement; a single browser-local key avoids creating a misleading backend operation. Local storage failure keeps visible text.
4. Add `docs/beta-readiness.md` with a gate matrix and evidence checklist. Reuse current analytics, monitoring, security and database runbooks, naming missing hosted checks rather than asserting they passed. Treat terms/privacy publication as F06 owner work, not template legal prose.

## Risks / Trade-offs

- Provider email delivery and redirect allowlists depend on hosted Supabase configuration -> document a deployment check and retain a generic recovery failure path.
- Local feedback can be lost on device reset -> label it as a local draft and support copying; do not imply CodeQuest received it.
- Passing repository tests can be mistaken for launch approval -> keep a prominent no-go decision with each external gate open.

## Migration Plan

No schema migration. Deploy auth redirect configuration before exposing recovery to real learners. Revert frontend links/routes if the provider flow fails hosted verification. Keep telemetry disabled and invite no real learners until all readiness gates close.
