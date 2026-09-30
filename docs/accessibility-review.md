# Phase 35 accessibility review

Status: Phase 35 Apply review, 2026-09-30. The final local focused matrix passed 12/12 checks across the four configured browser projects. This is a code and automated browser review of the core learning path, not a spoken screen-reader or physical-device certification.

## Method and scope

The focused `pnpm --dir frontend test:accessibility` suite starts the frontend development server with bounded public curriculum fixtures and no account or learning write. It checks the home entry, `/login`, `/register`, `/journeys/javascript-foundations`, and `/quests/first-value` with the embedded Editor Workspace. It runs Playwright's downloaded Chromium, Firefox, WebKit, and mobile Chromium projects. The mobile project emulates a Pixel 7 viewport and input capabilities; it is not a physical Android device. The browser keyboard checks use focus, Tab, Enter, Ctrl+M, and Escape. WebKit's automated home-link check sets focus on the link before keyboard activation because the runner's default Tab policy did not move focus to that link; the other projects check its Tab traversal directly. This remains a browser-setting limitation, not a claim about installed Safari keyboard preferences.

Reflow checks use 1280, 640, 390, and 320 CSS-pixel viewports; 640 and 320 are 200% and 400% zoom-equivalent widths from a 1280 CSS-pixel layout. They do not exercise a browser's actual zoom UI. The gate checks page scroll width, primary action bounds and 44 by 44 CSS-pixel targets, token contrast on opaque app surfaces, reduced-motion transition duration, heading and region structure, hint focus, the CodeMirror exit path, reset-dialog focus restoration, and source preservation. The contrast matrix checks muted, ink, discovery, danger, and primary-button text against their intended surfaces, plus the focus-ring token against canvas. Representative calculated ratios include muted on raised surface 8.93:1, discovery on raised surface 8.11:1, danger on raised surface 6.74:1, primary-button ink on mint 13.64:1, and amber focus on canvas 13.14:1. Gradient and photographic backgrounds still need direct visual review.

## Findings and repairs

The initial code review found native hint summaries missing the shared focus-ring selector, a second page-level heading when the reusable workspace is embedded in a lesson, and an editor Tab-escape shortcut that was available through CodeMirror but not explained to learners. The frontend change adds a summary focus ring, nests workspace and file headings under the lesson, and places a visible, editor-associated Ctrl+M/Option+Shift+M instruction next to CodeMirror. The home placeholder also lacked a learning navigation path; it now offers named Journey and sign-in links. Home-logo links receive a 44 CSS-pixel minimum height on the auth, Journey, and lesson routes.

The first full local browser run passed 7 of 12 checks. Four failures were caused by an incorrect test-text expectation; the remaining WebKit home-link focus case exposed the runner's Tab preference. After correcting the expectation and making home-link focus explicit for that WebKit check, the final local matrix passed **12/12**. A separate local run also confirmed the lesson's Check failure is announced as local and unverified after source editing, keyboard reset cancellation, and a fresh Check. The browser gate is wired into CI after the Phase 34 learning gate; the Apply PR must pass that required run before merge.

## Remaining evidence limits

- NVDA and VoiceOver spoken reading order and announcements: **untested**. DOM roles, names, and live regions are automated proxies only.
- Physical mobile touch, keyboard, zoom, and viewport behavior: **untested**. Mobile Chromium is emulation.
- Installed Safari, installed Firefox, low-power hardware, and exact supported browser/device versions: **untested** under F02.
- Complex artwork/gradient contrast and user comprehension: require direct visual and learner review before a support claim.

No completion, XP, streak, unlock, validation, or account authority changed in this phase.

## Apply verification record

| Check | Local result |
| --- | --- |
| `pnpm --dir frontend test:accessibility` | 12/12 passed across Chromium, Firefox, WebKit, and mobile Chromium |
| `pnpm --dir frontend exec playwright test --config playwright.accessibility.config.ts --list` | 12 focused tests in the intended four projects |
| `pnpm test` | Failed locally: four pre-existing frontend test cases exceeded their 5-second timeout while frontend and backend ran concurrently on this Windows host |
| `pnpm test --concurrency=1` | Passed: 394 frontend, 196 backend, and 3 history checks |
| `pnpm lint`, `pnpm typecheck`, `pnpm build` | Passed after formatting the new browser test |
| `pnpm exec openspec validate improve-learning-accessibility --strict` | Passed |

The normal CI `pnpm test` result and the new browser gate are required before the Apply PR merges; the constrained local rerun does not replace them.
