This checklist is for a later, explicitly authorized Apply workflow. All tasks remain unchecked during proposal creation. See [design](design.md) for E01–E06, budget hypotheses, coverage, ownership and failure handling; [spec](specs/technical-risk-validation/spec.md) defines acceptance. Delivering a no-go investigation report does not satisfy the successful Phase 1 progression gate or authorize Phase 2.

## 1. Declare execution scope and criteria

- [ ] 1.1 Record named experiment owners and technical/security/product reviewers in `docs/technical-risk-validation/charter.md`, with E01–E06 hypotheses, fixtures, procedures, policy links and outcomes; verify every experiment has expected/failure behavior and an accountable owner before execution.
- [ ] 1.2 Inventory exact physical devices, OS/browser versions, install modes, lower-powered hardware and accessibility configurations; verify the charter covers the required matrix and explicitly marks unavailable equipment as untested/inconclusive.
- [ ] 1.3 Freeze numerical budgets, measurement boundaries/sample counts and any measurable retained-memory tolerance before trials; verify the charter distinguishes proposal hypotheses, selected criteria and hard limits that cannot be established, and defines revision/retest recording.
- [ ] 1.4 Record prototype topology, trusted bootstrap resource allowlist, local HTTPS/device access and teardown procedure; verify no production services/accounts/secrets or real learner data are required, and update roadmap stage to Apply without claiming completed evidence.

## 2. Create the disposable harness after authorization

- [ ] 2.1 Create the self-contained TypeScript/React prototype under `prototypes/technical-risk-validation/` with pinned local dependencies and documented install/dev/test/lint/typecheck commands; verify installation and checks run within that directory without root production scaffolding or application imports.
- [ ] 2.2 Add the Q01-aligned task/starter/check/hint and small function/record preview fixture; verify fixture review maps to approved concepts and DOM/event plumbing is supplied rather than assessed.
- [ ] 2.3 Add controlled local app/compartment/sink services and synthetic canaries; verify trusted positive-control requests and isolated permissive negative controls are observed, and services never execute learner code or expose real credentials.
- [ ] 2.4 Add repeatable automated Chromium/Firefox/WebKit procedures and evidence capture IDs; verify browser builds, commands, fixture IDs and environment metadata are emitted and physical/manual cases are not falsely marked automated passes.

## 3. E01 — Editor usability

- [ ] 3.1 Implement the minimal editor/instructions/results workspace and edit/reset/resize controls; verify focused checks cover source preservation, undo/paste/indentation, output reachability and explicit reset behavior.
- [ ] 3.2 Execute desktop and real Android/iPhone typing/selection/touch/virtual-keyboard/rotation procedures; verify recordings/notes and input-latency samples report each case against frozen criteria with failures retained.
- [ ] 3.3 Execute keyboard-only, NVDA, VoiceOver, zoom/reflow and reduced-motion checks; verify focus can escape the editor, instructions/errors/results are understandable and visual preview has a textual equivalent.

## 4. E02 — Worker lifecycle and bounds

- [ ] 4.1 Implement bounded Worker run/check/output/error/stop/restart behavior with trusted run/task/version correlation; verify success, syntax/runtime error, wrong-but-running code and stale result fixtures produce distinct correct states.
- [ ] 4.2 Add input/output/message bounds, trusted deadline and backpressure handling; verify loop, flood, oversized/deep/cyclic output and hostile serialization probes cannot silently succeed or erase source, and record host-side allocation limitations.
- [ ] 4.3 Run frozen timeout/fresh-run and repeated-cycle trials on required desktop/mobile environments; verify raw timings, source comparisons, retained-resource observations and failures/retests support or reject each budget without averages hiding boundary failures.

## 5. E03 — Execution containment

- [ ] 5.1 Implement the isolated negative control and at most two restricted Worker candidates from D3; verify each has recorded origins, bootstrap loading, effective policies and available API inventory rather than assumed compatibility.
- [ ] 5.2 Execute online request/import/nested-worker/storage/cache/channel/session-canary probes on required engines and physical environments; verify sink records show zero learner-initiated requests for passing candidates and no application access, with instrumentation controls retained.
- [ ] 5.3 Execute malformed/oversized/wrong-source/stale/replayed message and local-check tampering probes; verify messages gain no host privilege, output is untrusted text/data and forged completion is described only as accepted P06 fraud.
- [ ] 5.4 Produce a candidate comparison and preferred containment recommendation or no-go report; verify conclusions link each required case and any failure blocks production progression without silently reducing scope or adding runners.

## 6. E04 — Preview containment and recovery

- [ ] 6.1 Implement the supplied-shell preview behind the evaluated restricted boundary and bounded communication; verify function/record output is useful and textually equivalent without authenticated parent authority or learner network capability.
- [ ] 6.2 Execute hostile HTML/CSS/JS parent/opener/sandbox/navigation/popup/form/resource-loading and injection probes; verify sink records, host state and effective sandbox/policy evidence demonstrate denial on each required environment.
- [ ] 6.3 Execute tight-loop, flood and repeated-preview-reset probes; verify trusted recovery and source preservation meet the frozen deadline, explicitly recording browser/process termination or host starvation as failures.

## 7. E05 — Persistence, PWA and offline recovery

- [ ] 7.1 Add prototype-local saved drafts/versioned downloaded lessons and Serwist service-worker handling; verify focused tests distinguish successful save, in-memory unsaved state, missing resources and provisional progress, with no token-bearing response caching.
- [ ] 7.2 Execute installation where supported, browser/home-screen relaunch and prepared cold-offline lesson/edit/local-JS cases; verify physical-device evidence, source/version hashes and timing trials, classifying unsupported installation separately from required browser learning.
- [ ] 7.3 Execute full/unavailable/cleared storage, interrupted saves and background/restart cases; verify no false saved state, source recovery where possible and explicit approved local-loss limitations.
- [ ] 7.4 Execute waiting/activation/content-update cases with unsaved edits, pending work and multiple open clients over the frozen persistence cycles; verify exact confirmed source and assessment identity survive and incompatible versions are never silently mixed.

## 8. E06 — Integrated mock quest and transitions

- [ ] 8.1 Add explicitly synthetic acceptance/guest/account/version responses without production endpoints; verify immutable snapshot, lost-response retry, explicit import, owner switch/expiry, stable-quest duplicate and compatible/incompatible/retired-version cases preserve source and truthful state labels.
- [ ] 8.2 Run the integrated Q01-aligned read/edit/fail/hint/correct/check/provisional/save/reload/offline/recovery procedure on required desktop and physical-mobile configurations; verify component and integrated evidence both meet their gates and no independent learning/acceptance claim is made.
- [ ] 8.3 Run integrated preview-fixture and PWA update/recovery cases against the selected containment candidate; verify the combined bootstrap/cache/version arrangement still blocks online learner network and application authority after offline preparation and updates.

## 9. Evidence and progression review

- [ ] 9.1 Assemble coverage and final report with reproduction commands/commit/dependencies, raw results, topology/policy/sink evidence, manual accessibility observations, limitations and failure/retest history; verify every required experiment/environment has an explicit verdict and no missing case is inferred to pass.
- [ ] 9.2 Run documented prototype test/lint/typecheck and appropriate automated integration/probe checks; attempt `pnpm test`, `pnpm lint`, and `pnpm typecheck` under the repository command contract and report exact unavailable-command/package reasons, verifying no check is claimed passed unless run and no production scripts are invented for this spike.
- [ ] 9.3 Obtain explicit technical/security/product review of the report, F01/F02 recommendations and unresolved limitations; verify dated reviewer evidence supports Proceed, Redesign/no-go or Inconclusive, and leave review-dependent completion pending if approval is absent.
- [ ] 9.4 After applicable approval, update the decision register, ADR 0004 feasibility addendum and affected frontend/security/architecture notes with measured selections and evidence; verify accepted policies/AP01 and F03–F09 deferrals remain intact, and no failed mechanism is marked verified.
- [ ] 9.5 Update the roadmap status to the observed reviewed outcome and next gate; verify Phase 0 remains archived, Phase 1 success is claimed only for reviewed passing gates, and Phase 2 still requires separate authorization. For no-go/inconclusive, retain the blocked status and explicit next action.
- [ ] 9.6 Teardown temporary services/profiles/certificate setup according to the charter and inspect the final diff; verify retained artifacts contain only reproducible synthetic evidence/prototype work and authorized documentation, with no secrets, production scaffolding, infrastructure, generated-skill edits or reopened Phase 0 change.
