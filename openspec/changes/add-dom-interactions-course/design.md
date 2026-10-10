# Design

## Context

See `proposal.md` and the `dom-foundations` delta. `interactive-web-execution` already confines learner JavaScript to a fresh credential-free runner Worker and displays bounded mutations through fixed code on a separate preview origin. `published-quest-workflow` already hosts identified multi-file Run, Check, Submit, and navigation. The content schema permits `interactive-web` and `interactive-text`, but `curriculum-catalog.ts` unconditionally rejects selected interactive Quests even when review metadata is present. The published Course loader requires complete authored inventory. The R07 evidence used synthetic/mocked selected routes and explicitly left R08's selected-build gate open.

## Goals / Non-Goals

**Goals:**

- Publish one complete original Course, with a beginner sequence that uses only supported operations and an integrated final project.
- Turn the existing hard rejection into a fail-closed review/evidence condition only after the exact selected build passes the R08 gate.
- Make evidence reproducible and bind it to immutable content/assessment selections, origin configuration, runtime behavior, and a specific candidate build.

**Non-Goals:**

- A general browser DOM, script-capable learner iframe, network or storage access, new runtime, independent grading, verified skill claims, real-provider Auth verification, physical-device support claim, or Phase 38 clearance.
- Changes to JavaScript Foundations, HTML Foundations, or CSS Foundations snapshots, accepted histories, or the Q01–Q04 guest boundary.

## Decisions

### Course and prerequisite model

Add `COURSE-DOM-FOUNDATIONS` as the third Course in `WEB-FOUNDATIONS`, with stable IDs `DOM01`–`DOM12`, four chapters of three Quests, and `guestEligible: false` throughout. Entry requires accepted `HTML12`, `CSS12`, and `Q24`; each later Quest requires the preceding DOM ID. This uses the existing multi-prerequisite graph and makes the assumed HTML, CSS, and JavaScript preparation visible. A new Journey or a hidden UI-only course lock would duplicate established hierarchy and authority.

Proposed original sequence, subject to exact authored review:

| Chapter                 | Quests      | Learning move                                                                                           |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| Reading a live page     | DOM01–DOM03 | Select supplied elements by ID/class/tag, read and replace text, distinguish one from many matches.     |
| Listening to controls   | DOM04–DOM06 | Handle click, input, and change events; use declared text-input values.                                 |
| Keeping interface state | DOM07–DOM09 | Use classes, limited attributes, and allowlisted styles to present a consistent bounded state.          |
| Signal Garden project   | DOM10–DOM12 | Combine controls, handle empty/repeated input, and build an accessible original status-board interface. |

The first interactive Quest uses supported selection and initial text changes. Its selected published route is the security-gate anchor; the later event Quests provide real learner interaction coverage. Each lesson states the supported facade and avoids implying native DOM parity. Supplied HTML/CSS can include only sanitized local display structure. All cases are literal data and public to the browser.

### Publication sequence and evidence binding

Author the complete draft tree and cases first, then validate it without selecting the Course. Extend the existing candidate browser authoring harness to run interactive files/cases if its current static-only path cannot cover reference, alternative, and defect candidates. Keep those candidates outside authored snapshots. Reviewers record exact content and assessment versions before any selection.

For integration, prepare a candidate branch that includes the complete manifest selection, existing production catalog/lesson path, and the narrow catalog-gate revision. Run the required probes against that candidate's production build and three distinct local origins, using synthetic accounts and backend facts where applicable. The candidate is **not merged** while any row is failed or absent. The manifest's `interactiveEvidence` identifies a code/content candidate commit and dated record; the verification record also identifies the exact final tested head/build and explains any metadata-only follow-up commit so a self-referential commit hash is not mistaken for proof. Re-run affected probes after changes to code, content, selection, or origin policy. Only then merge the publication PR. A test-only route or standalone development adapter is not a substitute for this selected production route.

Change `curriculum-catalog.ts` only at its unconditional rejection: require approved Quest review and evidence metadata for every selected interactive snapshot, and keep missing/stale evidence fail closed. Extend the internal `interactiveEvidence` manifest object with selected content and assessment versions; validate their equality to the selected snapshot and the record path's existence. The dated review record binds those versions to the candidate and final tested build; a changed code build requires affected retest even when the internal fields still match. Preserve the public DTO and explicit mode dispatch. Do not add a global enable flag that could accidentally publish unreviewed future interactive Quests.

### Verification and authority

Run authoring validation, immutable-history checks, API drift, root lint/typecheck/test/build, and strict OpenSpec validation. Browser probes use the selected production route in Chromium, Firefox, WebKit, and emulated mobile Chromium, recording exact browser versions. The matrix exercises benign Run/Check/Submit/Next, reference/alternative/defect cases, all three origins and effective policy, external sinks, app data isolation, forged/stale/oversize packets, unsupported APIs, output/mutation caps, repeated source and handler loops, fresh-run recovery, cancellation, reload, owner switch, navigation and cleanup. Existing 2-second execution and eligible 1-second recovery bounds remain unchanged. Record any measured failure and rerun its affected probe after a fix; never convert a failure to an untested row. CI's isolated PostgreSQL account tests verify accepted progress and XP, duplicate replay, source retention, and a locked entry prerequisite; they do not independently prove code correctness. Separate founder and hosted/physical gates stay open.

## Risks / Trade-offs

- **Long multi-browser endurance tests** → Partition slow runs and identify the exact selected build for each result; keep required rows open if a suite is skipped or flakes without a successful affected retest.
- **Manifest evidence hash depends on the commit containing the manifest** → Record both a code/content candidate commit and the final tested head/build, with the exact diff between them. Any executable or selected-content change demands affected retesting.
- **Facade gaps make a lesson unsolvable** → Author within the documented subset and require reference plus independently written alternative browser Checks before selection.
- **Client-reported Check can be forged** → Keep ADR 0005's personal-learning label and backend acceptance rules; exclude ranking/certification claims.
- **Large prerequisite chain delays manual access** → Make all three stable prerequisite requirements and locked reasons visible; synthetic account traversal can create accepted prerequisites using the existing test-only learning fixture.

## Migration Plan

Add a new Course and Quest IDs; no existing snapshot or database migration changes. Deploy only after the candidate gate passes. Roll back publication by restoring the prior manifest selection and catalog gate from a reviewed commit; accepted learner history and local drafts retain stable identities and are not deleted. If a selected interactive snapshot becomes unsafe, stop serving that selection and preserve source for recovery rather than silently switching modes.
