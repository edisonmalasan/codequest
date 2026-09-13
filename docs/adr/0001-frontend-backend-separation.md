# ADR 0001: Frontend/backend separation and modular monolith

## Status and evidence

Accepted documented commitment, not implemented architecture. Approval evidence: AGENTS.md Project overview/Architecture boundaries and roadmap Architectural Principles. Register: [C02/C03/C12](../decisions.md). Owner: technical owner (role; named assignee unassigned).

## Context

CodeQuest needs browser UI/execution/local persistence and authoritative authorization/learning rules. The current repository has no applications. The roadmap commits to Next.js and NestJS and postpones service extraction.

## Decision

Next.js owns client routing/UI/PWA/editor/browser runtime/drafts/API consumption. NestJS/Fastify owns authoritative application rules, authorization, application-table access, curriculum and accepted learning/reward records as a modular monolith. Applications communicate through documented REST/OpenAPI, without cross-application source imports. Next.js Route Handlers/Server Actions do not host backend business rules. Arbitrary learner code never executes inside NestJS.

## Alternatives

- Put business rules in Next.js: conflicts with authoritative backend ownership and duplicates enforcement paths.
- Start with microservices: adds boundaries/operations before scaling or security evidence justifies them.
- Shared root domain package: not justified by independent consumers; cannot become a bypass of API ownership.

## Consequences

The client can maintain provisional guest/offline state, but backend policy owns accepted account transitions. Two application foundations are planned later; none is scaffolded here. A conceptual capstone record does not force a separate service or ProjectsModule.

## Related records and revisit trigger

[Architecture](../architecture.md), [frontend](../frontend.md), [backend](../backend.md), [ADR 0002](0002-api-contract-and-client-ownership.md). Revisit only when concrete scaling/security evidence or an explicit approved product requirement justifies extraction; use a new ADR/change rather than silently moving rules.
