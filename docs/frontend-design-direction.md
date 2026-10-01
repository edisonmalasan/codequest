# R02 frontend design direction

**Status:** development preview implemented; founder visual verdict **OPEN**. This record defines a proposed CodeQuest screen language. It does not certify production journeys, auth, progress, course publication, device support, or release readiness. Phase 38 remains paused and `NO GO`.

## Visual and screen hierarchy

The direction is a **frontier atlas**: original circuit-route art, waypoints, restrained pixel headings, and a dark learning canvas. The existing CodeQuest mark, emblems, and Foundations Valley panorama supply the illustration. The persistent application bar identifies the destination; the development preview adds a green sample-status strip that states actions do not save progress.

| Screen     | Purpose                                                                        | Primary route through the sample preview                                         |
| ---------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Home       | Explain the learning promise and offer an immediate start.                     | Explore courses, view a lesson, or choose a sample path.                         |
| Explore    | Establish a journey/course catalog hierarchy, search, and a clear empty state. | Select a sample course to view its map.                                          |
| Course map | Show chapter and exercise sequence with unearned sample state.                 | Choose one of three sample exercises.                                            |
| Lesson     | Compose reading, source, output, hint, and action navigation in one workspace. | Switch panels or sample actions; no learner code runs and no result is accepted. |

The screen order is Home → Explore → Course map → Lesson. The header also allows direct review navigation. All screen content is local sample data. Neither catalog cards nor sample XP labels represent published courses or earned rewards.

## Tokens and interaction rules

- **Canvas and surfaces:** `--color-canvas`, `--color-surface`, `--color-surface-raised`, and `--color-surface-sunken` distinguish the app background, reading areas, and code/result work areas.
- **Meaningful accents:** mint `--color-ascent` marks primary route and action; sky `--color-discovery` marks exploration/navigation; amber `--color-reward` marks sample reward placement. Fault red remains reserved for errors.
- **Type:** Pixelify Sans (`--font-display`) appears only in short headlines, wordmark, and numerals. Body and interface text use `--font-sans`; source and console use `--font-mono`.
- **Spacing and surfaces:** the 8-pixel rhythm and hard shadow reference the established design system. Cards have one border and a single surface layer; dense lesson tools favor compact separators over nested cards.
- **States:** selected navigation has a mint underline and `aria-current`; search has an explicit no-results state; the course map labels all nodes incomplete; sample Run and Check produce distinct simulated messages; hints disclose inline; Back/Next change only local sample exercise state.
- **Accessibility:** semantic headings, nav, labels, keyboard buttons, CodeMirror accessible name, visible focus outline, live result message, text-safe art overlay, reduced-motion handling, and bounded editor/result overflow. Decorative image instances use empty alternative text because nearby copy carries the meaning.

## Responsive operating modes

| Width                | Lesson arrangement                                                                                 | Review purpose                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Above 1100 CSS px    | Lesson, editor, and output visible simultaneously; bottom action rail.                             | Persistent three-pane desktop direction.                         |
| 701–1100 CSS px      | Lesson stays visible beside either editor or output; explicit panel controls choose the companion. | Preserve reading context while inspecting code or feedback.      |
| 700 CSS px and below | One focused lesson/editor/output panel; labeled switcher; actions reflow beneath the panel.        | Keep primary controls reachable without squeezing three columns. |

Source and simulated result are React state within the preview session, so switching panels or exercises does not discard them. Long code and console text scroll within labeled regions. These widths are design breakpoints, **not** a final physical-device support promise or evidence for F02.

## Original assets and provenance

The preview reuses existing local project assets documented in [`frontend/public/assets/design-system/ASSETS.md`](../frontend/public/assets/design-system/ASSETS.md): `brand/codequest-mark.svg` (571 bytes) and `worlds/foundations-valley.webp` (207,522 bytes, 2172×724). Those assets were created for CodeQuest and are not derived from a research product. The motif glyphs and backgrounds in the preview are CSS/text authored for this change. No third-party artwork, character, logo, lesson prose, solution, validation test, or private content was added. The panorama has a dark text-safe overlay; image rendering stays decorative.

## Production handoff

- **R03:** adopt the accepted header, navigation, and Home hierarchy in production routes after accessible auth-aware states are specified.
- **R05:** replace sample Explore and map data with published, backend-owned journey/course/chapter relationships, real search, loading, empty, and error states.
- **R06:** integrate the three-pane composition with the actual lesson renderer and Editor Workspace; preserve source drafts, keyboard access, and intentional responsive modes.
- **R07:** connect Run, output/preview, Check, hints, and completion through the existing isolated runtime, deterministic validation, and backend acceptance contracts. The current preview cannot execute or submit code.

The development route is `/design-direction`. Its server page calls `notFound()` in production mode. It is absent from the production navigation. Preview components import no API client, auth, runtime, telemetry, or backend modules. The shared provider omits account sync and monitoring lifecycles on this route, including for a signed-in reviewer; the connection-status display remains informational.

## Verification and founder review

The technical verification record below must be completed against the actual implementation commit before R02 technical handoff. Browser viewport checks are implementation QA, not physical device or assistive-technology certification.

| Evidence                                           | Result                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact commit/build                                 | Preview implementation commits `22705c7` and `db4c2f9`; local optimized Next.js build on 2026-10-02. The second commit excludes shared account sync and monitoring lifecycles from the preview route.                                                                                                                                                                                                                                           |
| OpenSpec strict validation                         | `openspec validate define-codequest-frontend-design-direction --strict` and `openspec validate --all --strict`: passed; 39/39 canonical/active items.                                                                                                                                                                                                                                                                                           |
| Root lint/typecheck/test/build                     | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`: passed. Frontend Vitest: 410/410; backend Vitest: 205/205.                                                                                                                                                                                                                                                                                                                            |
| Desktop browser, viewport and composition          | Installed Chromium, 1440×900 CSS px: three visible lesson regions, no horizontal page overflow, action rail bottom at 901 px (1 px rounding), sample Run feedback visible.                                                                                                                                                                                                                                                                      |
| Tablet browser, viewport and panel behavior        | Installed Chromium, 820×1180 CSS px: lesson plus editor visible; result available through the panel switcher; no horizontal page overflow; action rail bottom at 1181 px (1 px rounding).                                                                                                                                                                                                                                                       |
| Mobile browser, viewport and panel behavior        | Installed Chromium, 390×844 and 320×700 CSS px: one focused region, panel switcher and action buttons present, no horizontal page overflow; action rail bottoms at 819 and 695 px. The 320 CSS px case also exercises narrow reflow comparable to high browser zoom on a wider display, but is not a physical zoom or device certification.                                                                                                     |
| Keyboard/focus, reduced motion, contrast, overflow | Chromium keyboard focus showed a solid 2 px outline; Enter opened Lesson and selected Output with `aria-pressed=true`. Browser contexts requested reduced motion. Core palette ratios calculated from token values: ink/surface 17.13:1, muted/surface 9.75:1, mint/surface 13.61:1, mint-button ink/background 13.64:1, reward/raised surface 11.52:1. Code/console areas are bounded; no page-level horizontal overflow at the tested widths. |
| Browser console/image loads                        | No page errors at the four viewports; the Home panorama loaded at each width. Local auth status warned that account services may be unavailable, consistent with this unauthenticated sample-only preview.                                                                                                                                                                                                                                      |
| Production route absent                            | Production-mode page unit test passed. The optimized build's prerendered `/design-direction` output contains the Next.js not-found page and no sample preview content. A live local `next start` HTTP probe returned 500 before routing because the existing local `NEXT_PUBLIC_SITE_URL` is HTTP and production auth configuration requires HTTPS; this is not evidence of a live production 404 response.                                     |

**Founder verdict:** OPEN. Founder review must identify the exact commit/build, environment, tester, date, expected/observed behavior, pass/fail, defects and retest, then explicitly accept or request revision. Until then, R02 is below `FOUNDER ACCEPTED`; no production design handoff or private-beta readiness is implied.
