Apply was explicitly authorized by the user on 2026-09-13 after merging the approved proposal into main. See [design](design.md) for E01–E06, budget hypotheses, coverage, ownership and failure handling; [spec](specs/technical-risk-validation/spec.md) defines acceptance. Delivering a no-go investigation report does not satisfy the successful Phase 1 progression gate or authorize Phase 2.

## 1. Declare execution scope and criteria

- [x] 1.1 Record named experiment owners and technical/security/product reviewers in `docs/technical-risk-validation/charter.md`, with E01–E06 hypotheses, fixtures, procedures, policy links and outcomes; verify every experiment has expected/failure behavior and an accountable owner before execution.
- [x] 1.2 Inventory exact physical devices, OS/browser versions, install modes, lower-powered hardware and accessibility configurations; verify the charter covers the required matrix and explicitly marks unavailable equipment as untested/inconclusive.
- [x] 1.3 Freeze numerical budgets, measurement boundaries/sample counts and any measurable retained-memory tolerance before trials; verify the charter distinguishes proposal hypotheses, selected criteria and hard limits that cannot be established, and defines revision/retest recording.
- [x] 1.4 Record prototype topology, trusted bootstrap resource allowlist, local HTTPS/device access and teardown procedure; verify no production services/accounts/secrets or real learner data are required, and update roadmap stage to Apply without claiming completed evidence.

## 2. Create the disposable harness after authorization

- [x] 2.1 Create the self-contained TypeScript/React prototype under `prototypes/technical-risk-validation/` with pinned local dependencies and documented install/dev/test/lint/typecheck commands; verify installation and checks run within that directory without root production scaffolding or application imports.
- [x] 2.2 Add the Q01-aligned task/starter/check/hint and small function/record preview fixture; verify fixture review maps to approved concepts and DOM/event plumbing is supplied rather than assessed.
- [x] 2.3 Add controlled local app/compartment/sink services and synthetic canaries; verify trusted positive-control requests and isolated permissive negative controls are observed, and services never execute learner code or expose real credentials.
- [x] 2.4 Add repeatable automated Chromium/Firefox/WebKit procedures and evidence capture IDs; verify browser builds, commands, fixture IDs and environment metadata are emitted and physical/manual cases are not falsely marked automated passes.

## 3. E01 — Editor usability

- [x] 3.1 Implement the minimal editor/instructions/results workspace and edit/reset/resize controls; verify focused checks cover source preservation, undo/paste/indentation, output reachability and explicit reset behavior.
- [ ] 3.2 Execute desktop and real Android/iPhone typing/selection/touch/virtual-keyboard/rotation procedures; verify recordings/notes and input-latency samples report each case against frozen criteria with failures retained.
- [ ] 3.3 Execute keyboard-only, NVDA, VoiceOver, zoom/reflow and reduced-motion checks; verify focus can escape the editor, instructions/errors/results are understandable and visual preview has a textual equivalent.

## 4. E02 — Worker lifecycle and bounds

- [x] 4.1 Implement bounded Worker run/check/output/error/stop/restart behavior with trusted run/task/version correlation; verify success, syntax/runtime error, wrong-but-running code and stale result fixtures produce distinct correct states.
- [x] 4.2 Add input/output/message bounds, trusted deadline and backpressure handling; verify loop, flood, oversized/deep/cyclic output and hostile serialization probes cannot silently succeed or erase source, and record host-side allocation limitations.
- [ ] 4.3 Run frozen timeout/fresh-run and repeated-cycle trials on required desktop/mobile environments; verify raw timings, source comparisons, retained-resource observations and failures/retests support or reject each budget without averages hiding boundary failures.

## 5. E03 — Execution containment

- [x] 5.1 Implement the isolated negative control and at most two restricted Worker candidates from D3; verify each has recorded origins, bootstrap loading, effective policies and available API inventory rather than assumed compatibility.
- [ ] 5.2 Execute online request/import/nested-worker/storage/cache/channel/session-canary probes on required engines and physical environments; verify sink records show zero learner-initiated requests for passing candidates and no application access, with instrumentation controls retained.
- [x] 5.3 Execute malformed/oversized/wrong-source/stale/replayed message and local-check tampering probes; verify messages gain no host privilege, output is untrusted text/data and forged completion is described only as accepted P06 fraud.
- [x] 5.4 Produce a candidate comparison and preferred containment recommendation or no-go report; verify conclusions link each required case and any failure blocks production progression without silently reducing scope or adding runners.

## 6. E04 — Preview containment and recovery

- [x] 6.1 Implement the supplied-shell preview behind the evaluated restricted boundary and bounded communication; verify function/record output is useful and textually equivalent without authenticated parent authority or learner network capability.
- [ ] 6.2 Execute hostile HTML/CSS/JS parent/opener/sandbox/navigation/popup/form/resource-loading and injection probes; verify sink records, host state and effective sandbox/policy evidence demonstrate denial on each required environment.
- [ ] 6.3 Execute tight-loop, flood and repeated-preview-reset probes; verify trusted recovery and source preservation meet the frozen deadline, explicitly recording browser/process termination or host starvation as failures.

## 7. E05 — Persistence, PWA and offline recovery

- [x] 7.1 Add prototype-local saved drafts/versioned downloaded lessons and Serwist service-worker handling; verify focused tests distinguish successful save, in-memory unsaved state, missing resources and provisional progress, with no token-bearing response caching.
- [ ] 7.2 Execute installation where supported, browser/home-screen relaunch and prepared cold-offline lesson/edit/local-JS cases; verify physical-device evidence, source/version hashes and timing trials, classifying unsupported installation separately from required browser learning.
- [ ] 7.3 Execute full/unavailable/cleared storage, interrupted saves and background/restart cases; verify no false saved state, source recovery where possible and explicit approved local-loss limitations.
- [ ] 7.4 Execute waiting/activation/content-update cases with unsaved edits, pending work and multiple open clients over the frozen persistence cycles; verify exact confirmed source and assessment identity survive and incompatible versions are never silently mixed.

## 8. E06 — Integrated mock quest and transitions

- [x] 8.1 Add explicitly synthetic acceptance/guest/account/version responses without production endpoints; verify immutable snapshot, lost-response retry, explicit import, owner switch/expiry, stable-quest duplicate and compatible/incompatible/retired-version cases preserve source and truthful state labels.
- [ ] 8.2 Run the integrated Q01-aligned read/edit/fail/hint/correct/check/provisional/save/reload/offline/recovery procedure on required desktop and physical-mobile configurations; verify component and integrated evidence both meet their gates and no independent learning/acceptance claim is made.
- [ ] 8.3 Run integrated preview-fixture and PWA update/recovery cases against the selected containment candidate; verify the combined bootstrap/cache/version arrangement still blocks online learner network and application authority after offline preparation and updates.

## 9. Evidence and progression review

- [x] 9.1 Assemble coverage and final report with reproduction commands/commit/dependencies, raw results, topology/policy/sink evidence, manual accessibility observations, limitations and failure/retest history; verify every required experiment/environment has an explicit verdict and no missing case is inferred to pass.
- [x] 9.2 Run documented prototype test/lint/typecheck and appropriate automated integration/probe checks; attempt `pnpm test`, `pnpm lint`, and `pnpm typecheck` under the repository command contract and report exact unavailable-command/package reasons, verifying no check is claimed passed unless run and no production scripts are invented for this spike.
- [ ] 9.3 Obtain explicit technical/security/product review of the report, F01/F02 recommendations and unresolved limitations; verify dated reviewer evidence supports Proceed, Redesign/no-go or Inconclusive, and leave review-dependent completion pending if approval is absent.
- [x] 9.4 After applicable approval, update the decision register, ADR 0004 feasibility addendum and affected frontend/security/architecture notes with measured selections and evidence; verify accepted policies/AP01 and F03–F09 deferrals remain intact, and no failed mechanism is marked verified.
- [x] 9.5 Update the roadmap status to the observed reviewed outcome and next gate; verify Phase 0 remains archived, Phase 1 success is claimed only for reviewed passing gates, and Phase 2 still requires separate authorization. For no-go/inconclusive, retain the blocked status and explicit next action.
- [x] 9.6 Teardown temporary services/profiles/certificate setup according to the charter and inspect the final diff; verify retained artifacts contain only reproducible synthetic evidence/prototype work and authorized documentation, with no secrets, production scaffolding, infrastructure, generated-skill edits or reopened Phase 0 change.

## Available-work checkpoint — 2026-09-13

See [preliminary report](../../../docs/technical-risk-validation/report.md), [coverage](../../../docs/technical-risk-validation/coverage.md) and [manual checklist](../../../docs/technical-risk-validation/manual-checklist.md). Focused automation includes the earlier 28-case Chromium run, 28 passed Firefox cases with one CDP-only skip, and 18 unit tests. Diagnostic collection passes do not turn failed preview policies into passing gates. E04 self-navigation and tight-loop recovery require scoped redesign/no-go review. Unchecked tasks retain their full acceptance criteria: required physical/engine/accessibility coverage, comprehensive containment combinations, real storage-loss scenarios, required-environment execution of the frozen update-cycle mix, integrated preview/offline coverage, owner review and approved ADR selections are outstanding. No Phase 2, Sync or Archive was started.

Continuation checkpoint: 18/34 tasks complete. Task 7.1 is fully implemented and verified. Chromium task-data clearing, failed-save reload recovery, downloaded identity rejection and B09's exact 20-cycle mix are now evidenced. Remaining unchecked tasks still require their full physical/engine/accessibility coverage or owner review; the isolated preview failed CPU recovery with and without additional memory flags, and the bounded quota diagnostic did not establish native full-storage failure. Teardown and final diff inspection were repeated. No acceptance criterion or approved policy was reduced.

Firefox continuation: actual downloaded Firefox 155.0 is available despite the dependency preflight warning. Its corrected full run passed 28 cases with one explicitly diagnostic CDP skip, and the later reset/save-failure regression passed. Both Firefox preview candidates failed verified tight-loop recovery. Required physical/browser/accessibility and native quota/background cases remain incomplete; owner review and F01/F02 decisions are not implied by Continue.

Latest available verification: 29/29 Chromium cases passed against 7c08a6a, plus the corrected full Firefox 28-pass/one-skip run and subsequent reset regression. Overall completion stays 18/34: missing physical and assistive evidence, failed preview recovery, actual native quota/background coverage, selected-candidate integration and explicit review still prevent the remaining full tasks from completion.

## Owner-approved no-go checkpoint - 2026-09-13

[AP02](../../../docs/decisions.md#ap02-reviewed-phase-1-no-go) explicitly approves the report's no-go conclusion. Tasks 9.3-9.5 are now complete: dated technical/product/security owner self-review, evidence-backed register/ADR/document updates, and truthful reviewed no-go roadmap status. **21/34 tasks complete; 13 remain incomplete.** Earlier pending-review checkpoints above are retained history. Approval neither supplies missing physical evidence nor converts failed recovery to passing behavior. Remaining acceptance criteria are unchanged; no Phase 2, Sync or Archive is authorized.

## Worker-preview redesign checkpoint - 2026-09-13

The owner explicitly authorized the scoped continuation from updated main on remote `spike/worker-preview-recovery`, draft PR #6. Task 6.1 is now fully implemented: restricted Worker function/record execution, bounded decoded output, fixed script-disabled inert result iframe and matching text equivalent. Core automation passes in Chromium/Firefox/WebKit, including ten verified infinite loops and 100 executed reset cycles per engine; no emergency process termination is needed. P11 and B01-B09 are unchanged.

Task 9.3 is reopened for review of the new recommendation; AP02 remains approval of the historical executable-HTML no-go only. Tasks 9.4/9.5 retain their completed historical approved no-go updates, with current documents explicitly recording pending new selection. **21/34 complete; 13 incomplete.** Tasks 6.2/6.3 still require full physical/environment coverage, and WebKit simulated-offline failures keep 8.3 incomplete. Missing physical inventory/input/accessibility, native quota/background/cold-launch/update/integrated evidence is not inferred from headless runs. See the [current report](../../../docs/technical-risk-validation/report.md#worker-preview-redesign-continuation---2026-09-13) and [Windows step-by-step checklist](../../../docs/technical-risk-validation/manual-checklist.md). No Phase 2, Sync or Archive was started.

## Offline-diagnostic checkpoint - 2026-09-14

Minimal fixed-response worker controls reproduce WebKit offline-emulation failure before fetch-handler delivery, independent of React/Serwist/IndexedDB/learner execution. Single headless cold-origin functional checks pass in all three engines; WebKit needs a shorter task profile after retained online preparation/filesystem failures. These are diagnostic subsets, not physical B07 or missing hardware/accessibility evidence. Existing failed assertions remain unchanged; **21/34 tasks complete**. See the [current diagnostic evidence](../../../docs/technical-risk-validation/report.md#offline-emulation-and-cold-origin-diagnostics---2026-09-14). PR #6 remains draft; F01/F02 and full required gates remain incomplete. No Phase 2, Sync or Archive.


## Native Chrome and no-manual-validation continuation - 2026-09-14

Task 1.2 inventory is complete: the confirmed Windows machine and installed Chrome 153.0.8010.37 have dated exact inventory; missing installed Firefox, physical mobile/Safari and AT availability remain explicitly unconfirmed/untested, and lower-powered designation is unselected. This completes inventory reporting, not missing device experiments. **22/34 complete; 12 incomplete.**

Codex performs available native Chrome/Win32/Playwright/CDP work without manual user requests. Keyboard/zoom/reflow/motion/frame-proxy timing, security, persistence/update, PWA installation and process-cold origin-refusal diagnostics are retained separately from physical input, AT, mobile/Safari and OS restart evidence. Normal headed Chrome has intermittent valid-run/fresh-preview/lifecycle failures; passing retests or an optional occlusion control do not erase them. Required original gates remain unchanged. The [proposed scope adjustment](../../../docs/technical-risk-validation/proposed-scope-adjustment.md) is not approved or applied. No inaccessible test is marked completed by this checkpoint; new recommendation/results review remains pending. PR #6 stays draft; no Phase 2, Sync or Archive.


Final available-environment checkpoint: installed Chrome full suite 42/42 passed, strengthened nested Blob policy/child recovery and instrumented 20 reloads passed, and all six initial-load/B09 cases passed across bundled engines. Independent default native lifecycle retained two valid-run timeouts and one missed preview readiness; natural-idle comparison still missed readiness at 1004.3ms while resources settled. Three WebKit offline-emulation failures remain. Inventory refines Windows to 22H2 19045.6466; installed Firefox/physical mobile/Safari/AT/lower-power validation remain unconfirmed/untested. S01-S06 and the bootstrap-lifetime follow-up are recommendations, not approved/applied requirements. Progress remains 22/34; all 12 environment/review-dependent tasks stay unchecked. Current candidate is startup/fresh-preview Redesign/no-go; new technical/product/security self-review is pending. No manual user validation request, Phase 2, Sync, Archive or PR merge.


Persistent-bootstrap revision authorized 2026-09-14 by the project owner's explicit "Yes i approve" response to the D3/charter revision and experimental implementation/retest question. Apply now carries that bounded lifecycle/control-channel revision under existing E02/E03/E04/E05 tasks. No gate is marked passed before its retest; S01-S06, F01/F02 selection and progression remain pending. See the authorized contract in design/charter.


## Authorized bootstrap experiment retest - 2026-09-14

Explicit owner approval authorizes revised D3/charter experiment only. Private cleanup control and captured run-identity output implemented/retested through `e9e8436`. Final native suite **45 passed / 4 failed**; independent valid Worker runs **96/100 success**, four timeouts and next fresh run **1101.9ms**. Parent loop/independent preview/PWA/source/security subsets pass; native reliability, bundled target-lifetime and retained WebKit offline failures prevent Proceed. Chrome cold-process substitute fails before 0/10 completed trials. Passing isolated WebKit focus retest does not erase prior failure. [Report](../../../docs/technical-risk-validation/report.md#authorized-persistent-bootstrap-checkpoint---2026-09-14) retains actual commands, hashes and all failed results. **22/34 complete, 12 incomplete**; no task is checked off from unavailable equipment, proposed S01-S06 or experiment authorization. New result selection/self-review is pending. PR #6 remains draft; no Phase 2, Sync or Archive.


## Latest Apply continuation - 2026-09-15

Terminal-output Worker termination ordering was corrected and verified by 20 unit tests; lint/typechecks/build pass. Full installed Chrome remains **34 passed / 15 failed**; affected bundled engines **31 passed / 4 failed / 1 skipped**, followed by two explicit unsupported-CDP skips. Independent 100 Worker/100 preview cycles and PWA/20 persistence cycles pass, but four post-loop fresh runs time out, the ten-cold-process probe completes 0/10 trials, and the 400% local Check times out. [Latest evidence](../../../docs/technical-risk-validation/report.md#final-continuation-evidence-and-progression---2026-09-15) retains original failures and exact hashes. **Phase 1 stays 22/34 and Redesign/no-go**. The [dedicated-bootstrap follow-up](../../../docs/technical-risk-validation/proposed-bootstrap-revision.md) and S01-S06 are proposed only; new owner technical/product/security self-review and production/support selection remain pending. Security review is self-review, not an independent audit. Accepted Phase 0 policies/AP01/AP02 remain unchanged. No Phase 2, Sync or Archive.
