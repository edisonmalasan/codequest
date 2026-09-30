# Tasks

## 1. Core-path audit and browser coverage

- [ ] 1.1 Add a repeatable frontend browser accessibility suite for home, auth, Journey, lesson, and workspace semantic names, landmarks, keyboard order, visible focus, and status announcements; verify the focused suite passes against stable fixtures.
- [ ] 1.2 Extend the suite with computed contrast, reduced-motion, 320/390 CSS-pixel and zoom-equivalent reflow, and primary touch-target checks; verify failures name the route and control or color pair.
- [ ] 1.3 Record the audit method and initial findings in `docs/accessibility-review.md`; verify each claim identifies its engine and interaction method and marks physical/AT F02 obligations untested.

## 2. Frontend remediation

- [ ] 2.1 Repair any evidenced keyboard, focus, semantic-label, status, or CodeMirror escape defects in their owning frontend components; verify targeted unit/browser regressions and source preservation.
- [ ] 2.2 Repair any evidenced contrast, reduced-motion, reflow, or touch-target defects in existing tokens or route components; verify focused browser checks at desktop, 390, and 320 CSS-pixel widths.
- [ ] 2.3 Update the accessibility review with fixes and remaining limitations; verify it separates automated evidence from manual and physical tests.

## 3. Required integration gate

- [ ] 3.1 Wire the focused browser suite into repository CI without weakening existing gates; verify the CI command uses the same tested fixture and browser projects.
- [ ] 3.2 Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, production build, the accessibility browser suite, and strict OpenSpec validation; review the final diff and record exact outcomes.
