# Tasks

## 1. Bounded semantic Check contract

- [x] 1.1 Add an allowlisted data-only semantic HTML case to backend authoring validation with exact ID, tag, safe attributes, and strict bounds; verify normal, malformed, unsafe URL, executable-test, and duplicate-case fixtures in focused backend tests.
- [x] 1.2 Add the matching deterministic inert parser check in the frontend while retaining existing static cases; verify correct tag/attribute/label relationships, alternative valid markup, failure feedback, cancellation, source retention, and active-content denial in focused frontend tests.
- [x] 1.3 Regenerate the OpenAPI frontend client and document the author-facing semantic case contract; verify `pnpm api:check`, `pnpm --dir backend curriculum:validate`, and representative compatible JavaScript/static fixtures.

## 2. Inert HTML teaching preview

- [x] 2.1 Extend only the static sanitizer's safe form-control display subset and keep destinations/actions inert; verify safe label/input/fieldset rendering and hostile form, link, script, resource, and URL filtering in unit tests.
- [x] 2.2 Probe the actual separate-origin preview in Chromium, Firefox, and WebKit for no form submission, navigation, network/storage/application access, script execution, or forged message acceptance; retain any failed result and verify current static preview and source recovery.
- [x] 2.3 Document the inert link/form behavior and exact tested origins/build in the preview and course authoring guides; verify the published lesson states do not imply that links or submissions execute inside Preview.

## 3. HTML Foundations first half

- [x] 3.1 Author the new Web Foundations Journey, HTML Course outline, stable IDs, concepts, four-chapter coverage map, and exact 12-Quest plan as original material; verify global identity, order, prerequisites, and draft structural validation.
- [x] 3.2 Author and review HTML01–HTML03 on page structure and text with original lessons, starters, hints, normal/boundary cases, reference/alternative/defect examples; verify focused content validation and candidate Checks.
- [x] 3.3 Author and review HTML04–HTML06 on safe links, bounded images with text alternatives, and lists; verify content validation, candidate Checks, and static preview text/visual behavior without external loading.

## 4. HTML Foundations second half and project

- [x] 4.1 Author and review HTML07–HTML09 on landmarks, figures/captions, and tables; verify semantic assessment coverage, candidate Checks, and keyboard/text alternatives.
- [x] 4.2 Author and review HTML10–HTML11 on labels, fields, and grouped questions with explicitly inert form behavior; verify normal/boundary cases, alternative/defective candidates, and preview sink denial.
- [x] 4.3 Author and review HTML12 as an original integrated one-page field guide project using prior outcomes; verify complete instructions, starter, hints, declared cases, candidate passes/failures, and that no untaught CSS/JavaScript is required.

## 5. Reviewed publication and end-to-end course

- [x] 5.1 Record dated curriculum and technical review for all exact content/assessment versions, original writing, accessibility, safe static behavior, candidate checks, and open evidence; verify every selected Quest and chapter is reviewed and the manifest rejects incomplete or unsafe Course selection.
- [x] 5.2 Select only the complete HTML Course in `publication.yaml` and preserve all prior JavaScript selections/versions; verify catalog API and generated frontend routes show the whole Course in order while draft or invalid variants stay hidden.
- [x] 5.3 Exercise catalog → Course map → lesson → edit → Preview → Check → explicit authenticated Submit → backend accepted progress/XP/unlock → Next → revisit against synthetic isolated state; verify Chromium, Firefox, WebKit, and mobile browser coverage plus refresh/replay/source recovery.
- [ ] 5.4 Run `pnpm --dir backend curriculum:validate`, `pnpm api:check`, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, focused browser probes, and strict OpenSpec validation; document exact commit/build, pass/fail/untested evidence and keep the separate interactive publication and Phase 38 gates open.
