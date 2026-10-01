# Tasks

## 1. Original visual direction

- [ ] 1.1 Record the R02 screen hierarchy, semantic token and typography roles, responsive panel behavior, interaction states, and R03–R07 handoff in `docs/frontend-design-direction.md`; verify each representative screen and required viewport mode has a documented purpose and no production feature is claimed complete.
- [ ] 1.2 Create or select original local illustration and motif assets for the preview, record provenance and web size, and verify no research-site artwork, logo, character, copy, or private content enters the repository.

## 2. Development preview

- [ ] 2.1 Add a development-only `/design-direction` preview shell with persistent sample-status labeling and local screen navigation; verify production returns not found and no protected API, learner execution, telemetry, or backend mutation is called.
- [ ] 2.2 Build reviewable Home, Explore, and Course Map preview screens from original sample data and art; verify navigation, empty/selected visual states, semantic structure, and truthful sample labels with focused component tests.
- [ ] 2.3 Build the desktop Lesson preview with persistent lesson, editor, and output regions plus visible Run, Check, hint, Back, and Next placements; verify these are demonstrative local controls and the existing runtime/completion authority remains unused.

## 3. Responsive and accessible interaction

- [ ] 3.1 Implement tablet and mobile panel switching that preserves preview source and result state; verify narrow width and zoom reflow, bounded code/console overflow, and usable primary actions in focused tests.
- [ ] 3.2 Add keyboard, focus, reduced-motion, and contrast checks for the preview; verify screen and panel navigation work without pointer input and decorative art cannot obscure content.

## 4. Integrated review

- [ ] 4.1 Run strict OpenSpec validation, root lint/typecheck/test/build, and installed-browser desktop/tablet/mobile review of the development preview; record exact viewport results, console errors, image loading, focus, overflow, and production-route absence in the R02 design record.
- [ ] 4.2 Present the actual preview to the founder and record an explicit dated visual acceptance or defect/revision decision for the reviewed build; verify R02 remains below `FOUNDER ACCEPTED` while this decision is absent.
