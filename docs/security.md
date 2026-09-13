# Security and privacy boundaries

Status: approved Phase 0 threat/policy definition, not a security certification or configured infrastructure. Backend ownership and no NestJS learner execution are confirmed C03/C06/C11. Trust, capabilities, transport, data and age policies P01/P06/P08/P11–P13/U01 are approved by AP01 in the [register](decisions.md). No prototype evidence exists. Exact containment/configuration/limits are F01/F03; operational retention/legal decisions are F06.

Approval evidence: [AP01 — explicit user approval](decisions.md#ap01-explicit-phase-0-approval).

## Assets, actors and boundaries

Assets: session/token material, account/profile identity, private learner source/submissions, drafts/outboxes, accepted progress/rewards, curriculum/assessment versions, privileged author/operator capabilities, operational logs and analytics. A corrupted progress record is different from a stolen session; accepting personal-learning fraud must not imply accepting authorization or execution escape.

Actors: unauthenticated guest, signed-in learner, malicious guest/learner, trusted curriculum author/reviewer, bounded authorized operator, and external identity/telemetry services. Trusted authored content is still reviewed for rendering/runtime hazards. Learner code and browser-reported grading data are always untrusted. Possession of a resource ID or a client role claim confers no authority.

Trust crossings: Auth provider → trusted client session boundary; client → verified NestJS API; API → database; authored Git content → publication/rendering; trusted client → learner compartment and back; device-local guest/account cache → authenticated sync; application → analytics/monitoring. [Architecture](architecture.md) maps owners. No application tables are accessed directly by frontend; allowed identity flows are not a general Supabase data-access exemption.

## Threat and mitigation requirements

| Threat | Required boundary/mitigation policy | Verification gate / residual risk |
| --- | --- | --- |
| Forged or expired token, client-chosen user ID/role | Verify identity and authorize each protected resource/action in NestJS; derive principal, reject spoofed identity | Later auth/ownership integration tests; no acceptance of this risk |
| Cross-account profile/submission/sync access | Ownership checks independent of payload IDs; least privilege; bounded privileged access | Later cross-account tests/audit; not a client UI check |
| Forged passing result/source | Explicit personal-learning client-report trust P06; enforce policy/uniqueness but do not claim regrading | AP01 accepts residual personal-learning completion fraud; high-stakes/verified claims excluded |
| Learner compartment reaches session/API/storage/network | No secrets/authenticated origin/session/application storage/network; separate untrusted capability boundary | Phase 1 evidence required; mechanism unverified, escape risk not accepted for launch |
| Infinite loop/huge output/payload abuse | Time/output/input limits, independent termination/reset, bounded result rendering and API requests | Phase 1 limit/termination probes then focused tests; numeric limits F01 |
| Spoofed/stale preview or runtime messages | Validate sender/channel/run correlation and bounded message shape; treat output as data, not HTML/code | Phase 1 safe message/escape tests; no implicit trusted `postMessage` payload |
| Preview accesses authenticated origin or unsafe content | Restricted sandbox/CSP/capabilities, no authenticated origin exposure, no learner HTML executing in app UI | Phase 1 adversarial preview tests; exact flags/origin topology F01 |
| Unsafe lesson/MDX/custom tests | Trusted repository authoring/review, restricted approved rendering/components/test context; no arbitrary learner execution in NestJS | Content parser/rendering/fixture review in later capability; format/tooling F03 |
| Account switch leaks cached progress/outbox/drafts | Owner-separated storage, protected-state cleanup, stopped old sync, explicit guest import | Later logout/switch/import/browser-clear tests; local storage not confidential by itself |
| Duplicate/stale/offline replay corrupts progress/XP | Stable events/quest identity, supported versions, explicit compatibility and logical acceptance consistency | Later sync/version/reward integration tests; timestamp reports not authority |
| Raw code/session/PII reaches telemetry/logs | Minimized allowlisted metadata; no raw source/token by default; editor replay excluded | Before data collection review SDK/config/event allowlists and error redaction |
| Unauthorized uploads/public code | No MVP learner uploads/public publishing; private snapshots, authorized access only | Capability/security review before any future Storage/public sharing |
| Excessive API use or secret/operator compromise | Request bounds/rate limits, environment-separated backend secrets, least privilege, recovery/backups process | Before beta operational/security review; no credentials created here |

## Approved learner execution policy

P11 recommends no learner network access, application storage access, authenticated API access, session/cookie/token access, or cross-compartment application authority. Provide only learner source, public instructional fixtures/contracts, and bounded output/result channel. Worker and iframe are execution directions, not proof that their default privileges satisfy this policy. Exact capability/origin isolation must be demonstrated in Phase 1 before production runtime approval.

The trusted application controls lifecycle and rejects messages with wrong run/task/version or unsupported shape/size. Console/error/output is rendered as untrusted text/data. A run timeout/limit/termination is explicit failure feedback, not success or silent truncation accepted as assessment. Learner modifications to fixtures/test harness cannot become backend verification evidence; fraud boundary remains P06. Preview shell is untrusted-content containment, not an authenticated application extension.

Phase 1 must test benign output, syntax/runtime errors, infinite loops, huge output, repeated restart, forged/stale messages, attempts to obtain session/application storage, attempts to call authenticated resources or network, and preview attempts to reach parent origin. Choose/revise isolation mechanism using evidence. If browser-only containment cannot meet P11, stop the production runtime proposal and revise scoped architecture; do not add remote runners in this change. Numeric CPU/time/output/payload/cache budgets await device evidence, but limits are required from the first executable prototype.

## Authentication, transport and data access

P13 establishes Supabase Auth identity flows on the trusted client and bearer identity on protected REST requests to NestJS. Tokens only reach Auth handling and authorized API request transport; no runtime/preview/lesson messages, source fixtures, telemetry, URLs, service-worker protected-response cache or learner-controlled code. Session refresh/storage specifics require separate auth design; alternate cookie/session transport must preserve the same boundary and receive review.

NestJS verifies token signature/issuer/audience/expiry and derives user identity/permissions. HTTPS/session expiration/CORS/request validation/rate limits are requirements for later production configuration, not configured by this definition. No frontend user ID/role is trusted; no learner code executes in NestJS. Backend table access uses least privilege; author/operator operations need explicit authorization and audit boundaries. Secrets/service-role keys stay backend-only and out of source, generated clients and logs.

Direct Supabase Auth is the approved permitted client integration; CodeQuest table reads/writes always go through NestJS. P12 excludes direct learner Storage/uploads from MVP. Future uploads would require explicit ownership/file validation/signed scope decisions before implementation, not broad service-role access. Public learner source/profiles/hosting are deferred.

## Source, cache and telemetry handling

P12 establishes private learner code/submissions: accessible to their owner and only authorized bounded operators for an explicit support/content-review purpose, with access traceability. No public sharing, model-provider transfer, or raw-source analytics by default. Snapshot storage supports learning records; it is not an indefinite code-archive promise.

| Data | Purpose / minimization | Local/cloud and deletion principle |
| --- | --- | --- |
| Session credentials | Identity only; never instructional/runtime/analytics payload | Clear/revoke under account/logout policy; final transport/storage F03 |
| Local drafts/preferences | Avoid edit loss | Owner-isolated device state; disclose no cloud backup; offer local removal; retention details F06 |
| Guest progress | Low-friction trial; provisional | Q01–Q04 local state/import only by explicit action; browser clearing can lose it |
| Account progress cache | Offline display of minimal learning state | Owner-isolated derived fields in IndexedDB, not raw token-bearing protected-response/service-worker cache; clear protected state on switch/logout |
| Pending submissions/outbox | Reconnect replay of bounded snapshot | Belong to originating owner; never reassign on login; explain retry/rejection and cleanup |
| Cloud snapshots/profile/progress | Account learning/acceptance and support | Authorized access, bounded collection/retention, account-deletion process before real users |
| Analytics/errors/logs | Friction/health and qualified success evidence | Metadata/event IDs/versions only by default; redact identity/session/raw-source; numeric periods and consent F06 |

Logout removes session/protected in-memory/cache state; owner-isolated local drafts/pending work may remain only under disclosed local-retention policy and cannot sync as another account. Account deletion must address cloud learning data, local retained data, telemetry and backup-retention limitations with a defined user-facing process before real data collection. Exact numeric periods, legal text, consent and operator access implementation are deferred F06, not permission to gather data indefinitely. Do not begin learner beta data collection before those policies are settled.

P01/U01 approve an adult primary audience; minors/classrooms are outside this MVP baseline. Applicable privacy/consent/legal operational decisions remain F06 before real learner data collection, including recruitment/beta. Adult positioning does not itself prove legal compliance; this document does not invent jurisdiction-specific obligations.

## Quality, evidence and accepted limitations

Security/tests/accessibility start with first executable design; late roadmap phases harden/verify. Later tests cover authorization, submission/progress/reward consistency, version/sync duplicates, guest account migration and runtime/cache separation. Keyboard/focus/screen-reader/contrast/reduced motion/zoom/touch/editor and low-end behavior require evidence, not theme exceptions. Backups, migration/recovery, monitoring, account recovery and security review are beta gates.

Approved residual limitations are personal-learning client completion fraud P06 and disclosed local-data loss/unsupported offline capabilities; approval evidence is AP01. Session leakage, cross-account authorization failure, unsafe execution or unbounded resource use are not acceptable residuals for launch. ADRs [0004](adr/0004-browser-execution-isolation.md), [0005](adr/0005-assessment-trust-and-completion.md), and [0008](adr/0008-authentication-and-data-access.md) are accepted policies; isolation/operational feasibility evidence remains unverified/deferred.
