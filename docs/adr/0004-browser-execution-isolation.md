# ADR 0004: Untrusted browser execution boundary

## Status and evidence

**Accepted** isolation policy. Legacy executable-HTML preview feasibility is **reviewed no-go** (AP02); Worker-backed supplied-shell core automation passes, but its recommendation is **pending review** and overall production selection remains **blocked**. Browser Worker/iframe direction and no NestJS execution are confirmed C06 from AGENTS.md/roadmap. Approval evidence for P11 capabilities: [AP01](../decisions.md#ap01-explicit-phase-0-approval). Register: [C06/P11/F01/F02](../decisions.md); design D6/D9. Owners: technical/security owners, product owner for experience promise; Phase 1 named reviewer: Edison, project owner (technical/product/security self-review).

## Context

Beginner JavaScript runs locally; web previews use a sandboxed iframe. Those technology choices alone do not demonstrate isolation from the authenticated application. Phase 1 now has disposable prototypes and adversarial evidence; see the feasibility addendum below.

## Decision

Treat learner source, output and assessment reports as untrusted. No session/tokens/secrets, authenticated origin/API, application storage or network capability in the learner compartment. Trusted application controls bounded messages/run correlation and independent timeout/termination/reset. Render output as data; constrain preview permissions/content and reject spoofed/stale messages.

Exact origin/capability mechanism, iframe/CSP flags and numeric limits are deferred to Phase 1 evidence. Approval of this requirement does not verify containment. Never execute arbitrary learner code/tests in NestJS.

## Alternatives

- Assume default Worker isolation suffices: not supported by evidence and risks conflating execution context with authority.
- Give preview authenticated origin/capabilities: violates approved boundary and requires explicit new risk/scope approval.
- Remote isolated grading/runtime: outside MVP scope and not introduced here.

## Consequences

Phase 1 must test successful/error code, loops/output abuse, restart, fake messages, network/session/storage access attempts and parent-origin preview access. Failed boundary evidence blocks production runtime approval and requires a scoped redesign. Fixtures/tests shipped to browser cannot prove tamper-resistant grading (ADR 0005).

## Related records and revisit trigger

[Security](../security.md), [frontend](../frontend.md), [ADR 0005](0005-assessment-trust-and-completion.md). Revisit on prototype evidence, runtime capabilities requested by curriculum, or failed containment. Policy approval is AP01; the separate AP02 feasibility addendum records the evaluated previews as reviewed no-go.

## Phase 1 feasibility addendum - 2026-09-13

Approval evidence: [AP02](../decisions.md#ap02-reviewed-phase-1-no-go). The project owner approved the [report's no-go conclusion](../technical-risk-validation/report.md) in response to the explicit no-go review question. Policy remains Accepted; approval does not establish feasibility.

Focused Chromium 153.0.8010.12 and Firefox 155.0 Worker/network/storage/message cases passed. Baseline preview self-navigation reached the controlled sink. Restricted parent/dedicated comparisons denied tested navigation, but opaque and dedicated preview tight loops required emergency owned-process termination after learner execution was observed, missing the 2-second deadline plus 1-second recovery criterion. See the report's timestamped original/retest evidence and prospective build hashes.

No evaluated preview mechanism is approved for production. F01 remains blocked pending a scoped containment/recovery redesign and retest. Required physical/assistive coverage and native quota/background evidence remain incomplete; F02 is inconclusive. No hard browser memory quota, production framework integration or independent security audit is established. Phase 2 remains blocked; no remote runner, reduced preview scope or weakened P11 is introduced. P06 fraud and disclosed local-data-loss limitations remain the approved residuals.

## Worker-backed preview continuation - 2026-09-13

The explicit redesign instruction authorizes continuation, not new production approval. Learner functions/records now execute only in the restricted opaque Worker. Bounded results are escaped into a fixed script-disabled, opaque supplied-shell iframe and the same text is shown in the trusted UI. Learner HTML/CSS is data; no general DOM-programming capability is promised. Existing function/record curriculum and P11 remain unchanged.

Core automated useful-output/inert-markup, ten verified loop deadlines and 100 executed reset cycles passed in Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6. Separate owned watchdogs recovered without emergency termination. WebKit simulated-offline new-page/reload gates still fail; public cache/controlled-origin-outage diagnostics do not waive them. See the [current report and raw evidence](../technical-risk-validation/report.md#worker-preview-redesign-continuation---2026-09-13).

F01 is a candidate recommendation pending review and required integration/physical evidence; F02 remains inconclusive. AP02 approves only the earlier no-go. No hard browser memory quota, independent security audit, production framework integration, P11 exception or Phase 2 selection is established.
