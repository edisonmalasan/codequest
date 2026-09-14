# Proposed dedicated-bootstrap experiment revision

**Proposed only; not approved, implemented or selected for production.** Active change: [validate-codequest-technical-risks](../../openspec/changes/validate-codequest-technical-risks/proposal.md). This is a follow-up experiment decision within Phase 1, not a new OpenSpec proposal or authorization for Phase 2.

## Evidence and hypothesis

The [native stage diagnostic](evidence/native-startup-diagnostics-2026-09-14T08-56-25.686Z.json) reproduced fresh-run misses after hostile loops: 1031.5ms and 1904.9ms. The latter waited approximately 1863ms for replacement opaque-bootstrap readiness; Worker construction to output then took approximately 20ms. Missing cleanup acknowledgments trigger the unchanged 100ms fallback, which removes the document and forces another startup. This establishes a measured delay in these cases, not an upstream or OS root cause.

The [existing dedicated-origin comparison](evidence/native-startup-diagnostics-2026-09-14T08-57-34.732Z.json) also fails: seven valid-run timeouts and three other fresh-run misses. Simply changing origin while recreating a document per run is not a passing correction. The opaque bootstrap permits Blob child Workers; retained target descriptors do not independently prove live execution, but the existing target/recovery failures remain unresolved. Local memory observations are context, not proof of causation.

Hypothesis: a persistent dedicated-origin document can avoid repeated document startup, while HTTP Worker responses with independently enforced `worker-src 'none'` can deny child execution through browser policy. Unlike opaque Blob Workers, those responses can carry a different Worker-specific CSP. Both startup reliability and actual child-constructor denial must be measured; neither is presumed to pass.

## Proposed contract

- Revise only the existing D3 dedicated candidate; retain the opaque candidate and permissive comparison. Do not introduce a third restricted candidate.
- Retain at most one trusted dedicated-origin bootstrap per existing runtime instance. Create a fresh learner Worker for every run. First bootstrap loading remains inside the original execution/startup measurements; no hidden prewarming, reused learner Worker or extra idle grace period.
- Use the existing isolated loopback runner origin, without application cookies, session, authenticated storage or backend access. The trusted document contains fixed public scripts and never evaluates learner code. Learner computation remains in a Worker; presentation remains a fixed script-disabled iframe and text equivalent.
- Bind the one-time private MessagePort handshake to the actual current iframe Window and exact runner origin. Never transfer the private port to learner execution. Bind cleanup to run/task/content/assessment and ticket; retain the same 100ms missing-ack removal fallback within the original recovery allowance.
- Retain generation-bound, bounded untrusted output and independent host validation. Release terminal Workers before forwarding their output; acknowledgments continue to mean trusted termination invocation/handle cleanup, not a hard resource quota.
- Load only a literal public Worker URL. Its online and cached responses must enforce the same restrictive CSP: no learner network/import capability and `worker-src 'none'`. Do not rely on deleting JavaScript globals as the security boundary. Denied nested construction is a measured unavailable capability, never a falsely claimed child-loop execution/recovery pass.
- Prepare an exact public allowlist on the runner origin for its fixed bootstrap, Worker bytes and an isolated service worker if required. Cache no learner source, commands, output, draft, receipt, token-bearing response, application API or user data. Cached Worker responses must preserve the restrictive CSP headers. No production service worker or infrastructure is created.
- Keep P11 and all B01-B09 limits/sample counts unchanged, including 2s execution plus at most 1s recovery, fresh runs <=1s, source/output/message bounds and exact persistence-cycle mix. This revision does not approve S01-S06 or waive any failed available gate.

## Required evidence before recommendation

Record the revised D3/charter approval and frozen source/script/build hashes before trials. Test actual installed Windows Chrome and all accessible bundled engines, retaining original failures.

Verify first/fresh startup, ten witnessed parent/preview loops, immediate Stop, missing/forged/stale cleanup, actual superseded-output replay, 100 desktop Worker/preview cycles, source identity and explicit disposal. Record active execution, idle trusted frames and target/resource observations separately. Validate a permissive positive control for child execution, restrictive CSP denial for every accessible candidate path, zero learner sink requests, no application storage/session/channel authority and malformed/oversized output rejection.

Validate online and prepared-offline fixed resource loading and response CSP, cold-process origin refusal, exact public cache inventory, generation/version compatibility, the 8/6/6 update/persistence mix and integrated provisional Q01/preview flows. Changing the offline topology requires new online security probes after caching/update; existing passes cannot be inherited. Preserve WebKit emulation failures and test controls explicitly. Missing physical/assistive technology remains untested.

Any unchanged-budget miss, permitted learner network/application authority, cached sensitive data, lost source or unbounded cleanup remains no-go. Failed initialization must return a truthful bounded error and retain source. Do not select this mechanism or claim supported environments without dated owner technical/product/security self-review; security review is not an independent audit.

## Decision requested

The project owner must explicitly approve revising D3/charter for this persistent dedicated-origin/public-offline-bootstrap experiment and implementing/retesting it. Approval authorizes an experiment only, not F01 production selection, F02 support scope, S01-S06, Proceed, PR merge with failed checks, Phase 2, Sync or Archive.
