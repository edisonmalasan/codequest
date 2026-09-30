# Design

## Context

See [proposal.md](proposal.md). Existing canonical design-system, Journey, lesson, and editor specs already require accessible controls, but tests are spread across component and route suites. The core path uses Next.js client pages, a CodeMirror editor, native hint disclosures, and backend-owned completion. F02 reserves physical device and spoken assistive-technology support claims.

## Goals / Non-Goals

**Goals:** Repair evidenced issues in the existing frontend and make core-path accessibility regressions visible in CI. Distinguish automated semantic coverage from direct assistive-technology use.

**Non-Goals:** Redesign the pixel identity, change backend learning rules, establish a production support matrix, or declare manual AT/physical-device tests passed from emulation.

## Decisions

1. **Extend the browser gate at the frontend boundary.** Use Playwright and existing route/learning fixtures for keyboard, focus, computed style, semantic structure, reflow, and target-size checks across Chromium, Firefox, WebKit, and mobile Chromium where practical. A separate focused accessibility suite may share the Phase 34 real-backend web servers. This exercises rendered behavior without adding a runtime dependency. Component tests cover any discovered control defects. An external automated scanner could broaden static rule coverage but would not replace keyboard, zoom, or spoken AT review; add one only if a demonstrated gap needs it.
2. **Repair components at their owning seam.** Correct shared focus and CodeMirror behavior in reusable components, route-specific structure in route components, and colors in semantic tokens or relevant states. Do not suppress failing checks or change learning authority to satisfy visual assertions.
3. **Qualify the evidence.** Record browser engines, viewport and zoom-equivalent sizes, keyboard actions, computed contrast pairs, failures and fixes in `docs/accessibility-review.md`. Keep NVDA/VoiceOver, installed browsers, physical mobile, and exact F02 support scope explicitly untested until observed directly.

## Risks / Trade-offs

- **Browser automation cannot prove spoken reading order** → inspect accessible names/structure and retain manual NVDA/VoiceOver as a pre-beta obligation.
- **Browser zoom emulation differs from device zoom** → test CSS-pixel reflow and browser zoom where available, naming the exact method and limitation.
- **A broad route sweep can be flaky around async curriculum/auth data** → reuse bounded seeded fixtures and wait for stable, learner-visible states before assertions.
- **Global token edits can affect game styling** → prefer targeted fixes and rerun existing visual, unit, and browser checks.

## Migration Plan

Deploy frontend-only changes through the existing CI gate. Revert the focused frontend changes if they regress navigation; no data migration or API transition is required.
