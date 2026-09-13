# ADR 0008: Authentication transport and data-access boundary

## Status and evidence

**Accepted** Auth transport/Storage/privacy policy; backend-owned application tables/verification are confirmed C03. Approval evidence for accepted details: [AP01](../decisions.md#ap01-explicit-phase-0-approval). Sources: AGENTS.md, roadmap Auth/Security phases, exploration, design D9. Register: [C03/P01/P12/P13/U01/F03/F06](../decisions.md). Owners: technical/security/product owners; named assignees unassigned.

## Context

Supabase Auth/Storage are stack directions, not permission for frontend application-table access. Browser runtime must not receive sessions. Audience/privacy/retention choices and exact transport implementation are not yet selected.

## Decision

Allow trusted-client Supabase Auth identity flows and bearer identity on protected REST requests to NestJS. NestJS verifies token issuer/audience/signature/expiry, derives principal and enforces ownership/permissions/bounds. Learner-supplied user IDs/roles never authority. Tokens stay outside learner runtime, preview, content, URLs, protected-response service-worker caching, logs and telemetry. Exact refresh/session storage details deferred F03.

All CodeQuest application-table reads/writes go through NestJS. No MVP learner uploads/direct Storage/public source sharing. Private submissions have owner access and bounded authorized operator access for explicit purposes. Minimize metadata telemetry; no raw source/session or editor replay by default. Owner-isolated local drafts/progress/outbox, explicit guest import and logout/switch cleanup apply.

Age/privacy/consent and numeric retention/deletion/legal operational decisions must be settled before real learner data collection, including beta. Adult primary audience is approved; minors/classrooms are outside the MVP baseline, while applicable operational privacy/legal details remain F06.

## Alternatives

- Frontend direct database/service-role access: violates confirmed boundaries and exposes authority.
- Cookie-based API session: possible alternative but needs explicit transport/risk review preserving isolation; not selected silently.
- Direct Storage uploads/public projects: add file/ownership/publication scope, deferred without a need.
- Collect all source/error/session replay for analytics: conflicts with minimization/private-code policy.

## Consequences

Auth/API/session handling is trusted application work, never learner fixture data. Stack Storage may remain unused in MVP. No credentials/infrastructure are provisioned. Privacy/legal/retention implementation and production transport configuration require later verification; no compliance claim is made here.

## Related records and revisit trigger

[Security](../security.md), [frontend](../frontend.md), [backend](../backend.md), [ADR 0006](0006-local-guest-and-cloud-state.md). AP01 approves transport/data/adult audience policy; F06 still gates data collection. Revisit on uploads/public sharing/minor audience/transport changes or operational privacy findings with an approved scoped change.
