# Tasks

## 1. Bounded static CSS Check

- [x] 1.1 Extend the backend authored-case schema, validator, public projection, and frontend definition contract for allowlisted CSS teaching properties and optional responsive scope; verify invalid property, selector, media, value, and over-limit fixture tests fail before publication while current cases remain valid.
- [x] 1.2 Extend the frontend static CSS parser and deterministic case evaluation with exact media-scope matching, safe normalization, fixed limits, and source-preserving failures; verify focused passing, wrong-scope, duplicate, unsupported, import/URL, and cancellation tests.
- [x] 1.3 Document the supported CSS Check grammar and source-level feedback limits in the authoring guide; verify its stated examples against the focused validation tests.

## 2. Static candidate authoring

- [x] 2.1 Extend the targeted author command to accept a separate bounded CSS file for static web snapshots and reuse the browser Check harness; verify normal, missing, symlink, wrong-path, and over-limit CLI tests without executing learner source in Node.
- [x] 2.2 Add browser candidate tests for HTML/CSS reference, alternative, and deliberate-defect sources; verify the command reports exact version and ordered case outcomes, performs no learning writes, and fails on outcome mismatch.
- [ ] 2.3 Document exact static candidate command usage and fixture handling; verify the documented command on one draft CSS Quest before selecting publication.

## 3. Responsive static Preview

- [ ] 3.1 Add named current, narrow, and wide width controls to the static Preview panel and contain overflow inside that panel; verify accessible state, same-snapshot resizing, source preservation, and no page-level overflow in component and browser tests.
- [ ] 3.2 Reprobe the exact static preview build across Chromium, Firefox, and WebKit for width changes, denied external sinks/script/storage/navigation, forged messages, timeout recovery, and cleanup; record the commit/build and failed or untested cases in the technical review worksheet.

## 4. Original Course authoring

- [ ] 4.1 Add the distinct CSS Course hierarchy, stable IDs, outcomes, concepts, and four-chapter/12-Quest plan in `backend/content/` without selecting it; verify `curriculum:validate`, authoring Course preview, and unchanged existing publication.
- [ ] 4.2 Author the three stylesheet/selector Quests with original lessons, HTML/CSS starters, hints, and normal/boundary cases; verify content validation and reference/alternative/defect browser candidates for each exact version.
- [ ] 4.3 Author the three typography/color/spacing Quests with original lessons, starters, hints, and cases; verify content validation and the same three candidate classes for each exact version.
- [ ] 4.4 Author the three box/flex/grid Quests with original lessons, starters, hints, and cases; verify content validation and the same three candidate classes for each exact version.
- [ ] 4.5 Author the three responsive/final-page Quests with original lessons, starters, hints, and cases; verify content validation, narrow/wide Preview, and the same three candidate classes for each exact version.
- [ ] 4.6 Complete a dated editorial and accessibility review of all twelve exact snapshots, prerequisite order, original writing/assets, task clarity, alternative solutions, hint progression, and final-project transfer; record findings and rerun affected candidate checks after any revision.

## 5. Reviewed publication and integrated gate

- [ ] 5.1 Select the complete reviewed CSS Course atomically in the publication manifest only after groups 1–4 pass; verify a partial/unreviewed selection fails backend tests and that the HTML/JavaScript selected identities and versions are unchanged.
- [ ] 5.2 Exercise the exact published build from catalog through CSS final project in desktop and mobile browser projects, including Preview widths, Check, Submit, trusted progress/XP/unlock, refresh/revisit, pending recovery, and source persistence; record pass/fail and retest evidence without claiming real-provider or physical-device verification.
- [ ] 5.3 Run `pnpm --dir backend curriculum:validate`, `pnpm api:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and strict OpenSpec validation; review the final diff and document remaining founder, R04, interactive-publication, hosted, and physical gates before the Apply PR merges.
