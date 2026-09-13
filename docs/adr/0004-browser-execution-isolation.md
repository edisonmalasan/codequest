# ADR 0004: Untrusted browser execution boundary

## Status and evidence

**Proposed** isolation policy, feasibility **unverified**. Browser Worker/iframe direction and no NestJS execution are confirmed C06 from AGENTS.md/roadmap. Approval evidence for P11 capabilities: none. Register: [C06/P11/F01/F02](../decisions.md); design D6/D9. Owners: technical/security owners, product owner for experience promise; named assignees unassigned.

## Context

Beginner JavaScript runs locally; web previews use a sandboxed iframe. Those technology choices alone do not demonstrate isolation from the authenticated application. No Phase 1 prototype or adversarial evidence exists.

## Proposed decision

Treat learner source, output and assessment reports as untrusted. No session/tokens/secrets, authenticated origin/API, application storage or network capability in the learner compartment. Trusted application controls bounded messages/run correlation and independent timeout/termination/reset. Render output as data; constrain preview permissions/content and reject spoofed/stale messages.

Exact origin/capability mechanism, iframe/CSP flags and numeric limits are deferred to Phase 1 evidence. Approval of this requirement does not verify containment. Never execute arbitrary learner code/tests in NestJS.

## Alternatives

- Assume default Worker isolation suffices: not supported by evidence and risks conflating execution context with authority.
- Give preview authenticated origin/capabilities: violates proposed boundary and requires explicit new risk/scope approval.
- Remote isolated grading/runtime: outside MVP scope and not introduced here.

## Consequences

Phase 1 must test successful/error code, loops/output abuse, restart, fake messages, network/session/storage access attempts and parent-origin preview access. Failed boundary evidence blocks production runtime approval and requires a scoped redesign. Fixtures/tests shipped to browser cannot prove tamper-resistant grading (ADR 0005).

## Related records and revisit trigger

[Security](../security.md), [frontend](../frontend.md), [ADR 0005](0005-assessment-trust-and-completion.md). Revisit on prototype evidence, runtime capabilities requested by curriculum, or failed containment. Record policy approval and feasibility evidence separately; neither currently exists.
