# Tasks

## 1. R05 entry gate and composition seam

- [ ] 1.1 Confirm the exact R05 Home-to-Course build has explicit founder acceptance recorded before starting R06 Apply; verify the acceptance worksheet identifies build, environment, date, observed behavior, and any defects.
- [ ] 1.2 Add an optional Editor Workspace presentation seam for distinct editor and result regions while keeping one controller and its standalone default; verify focused tests retain source, active file, draft status, Run/Check correlation, and action count during region changes.
- [ ] 1.3 Document the reusable composition seam and its ownership boundary in `docs/frontend.md`; verify standalone workspace tests and documentation links still pass.

## 2. Integrated published Quest layout

- [ ] 2.1 Compose the existing lesson document, hints, Quest context, Editor Workspace, output/results, and working actions into one desktop learning shell; verify a component test shows three simultaneous named regions and one active workspace controller.
- [ ] 2.2 Preserve current Quest loading, not-found, retry, guest restriction, offline, pending submission, and failed local-save messaging in the new shell; verify focused state tests and existing lesson/workspace tests pass.
- [ ] 2.3 Align visual tokens, typography, pane dimensions, scroll boundaries, and action placement with the frontend visual contract in `docs/frontend-visual-refresh.md` and this change's design; verify real desktop screenshots at 1280 and 1440 CSS pixels show lesson, code, and output together without page-level overflow.

## 3. Tablet, mobile, and accessibility behavior

- [ ] 3.1 Add intentional tablet and mobile Lesson/Code/Results panel controls without remounting the editor; verify edit -> switch -> Run/Check -> return keeps source, result, and draft state at 820, 640, 390, and 320 CSS pixels.
- [ ] 3.2 Implement semantic region names, keyboard selection/focus, hidden-panel exclusion, editor escape, reduced-motion, touch targets, and zoom-equivalent reflow; verify focused browser/accessibility checks and no page-level horizontal scrolling.
- [ ] 3.3 Document responsive behavior and qualified browser/physical-device evidence limits in the R06 verification record; verify its screenshots and reported conditions match the tested build.

## 4. Integrated verification and handoff

- [ ] 4.1 Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, focused Playwright Quest flows, existing accessibility and learning gates, and strict OpenSpec validation; record exact results and any API drift check if a contract changed.
- [ ] 4.2 Review source/draft preservation, guest versus account labels, Worker/preview origin boundaries, backend completion authority, and exact final diff; record technical integration and founder acceptance as separate states and leave the founder gate open until an explicit decision.
