# Design

## Context

The production frontend already has semantic color tokens, an original CodeQuest mark, a panorama, accessible UI primitives, and working Home-to-Course routes. R05 local browser evidence shows one published Course and a complete seven-chapter map; its founder visual gate is open. R06 has a merged proposal for a persistent three-region lesson shell, but Apply is gated on the R05 visual decision. R04 provider verification is independently open. This change addresses presentation on the real routes without changing publication, identity, or learning authority.

The current screenshots show a dark page with repeated near-black rectangles, oversized pixel-display headings, extensive blank catalog space, and a long Course map whose quest labels appear small relative to its chapter panels. Existing responsive behavior avoids overflow but does not yet offer a distinct, high-quality mobile reading or map rhythm. Authentication, account, and lesson views use related tokens but do not feel composed as part of the same product journey.

## Goals / Non-Goals

**Goals:** Give the current production screens a memorable, original art direction; make published learning the obvious next action; preserve readable exercise and account information; make tablet/mobile layouts intentional; and establish visual roles R06 can reuse.

**Non-Goals:** New Courses, new Course facts, route changes, rewritten lesson content, auth provider configuration, progression rules, interactive DOM execution, telemetry activation, public project surfaces, or Phase 38 evidence. The redesign does not claim R04 or R06 founder acceptance.

## Decisions

### 1. Use a "field guide to code worlds" visual language

Keep the existing CodeQuest mark and recognizable pixel-game cues. Replace the current uniform dark-card composition with a richer hierarchy: a deep midnight outer canvas, an expressive original world illustration at major entry points, warm high-contrast reading surfaces where long prose appears, and sharply bounded dark code/result areas. Mint remains the primary action/progress hue; sky guides discovery; amber marks earned reward; coral marks errors. Recalibrate neutrals and add semantic surface roles rather than scattering page-specific hex values. Avoid gradient mesh, decorative dashboard tiles, and repeated tiny uppercase eyebrows.

The art direction is exploration through a connected world, expressed through a route line, waypoints, chapter landmarks, and crafted pixel or illustrated environments. Art conveys place and chapter identity; it never substitutes for Course metadata, unlocks, or results. Generate original assets for specific placements, optimize them, and record provenance. Keep the existing panorama where it remains useful; do not add filler images solely to occupy empty space.

Alternative considered: switching to a generic bright SaaS palette. That would weaken the existing identity and make editor and game surfaces feel disconnected. A uniform dark arcade treatment was also considered; it preserves the current readability and density problems.

### 2. Give typography jobs rather than applying pixel display everywhere

The mark, compact section labels, chapter numbers, and selected reward moments may use the pixel face. Long headlines, Course and exercise titles, body text, forms, and lesson instructions use a clean readable face with intentional scale and line length. Code and output retain monospace. The implementation should rely on the current local/system font stack unless a new font is justified, bundled, licensed, and measured against the PWA/performance budget.

### 3. Compose each route around its real user task

| Surface                 | Desktop composition                                                                                                                                      | Narrow composition                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Shared shell            | Compact one-line mark, primary learning navigation, account entry, active location.                                                                      | Deliberate menu with current location, large targets, Escape and focus behavior retained.      |
| Home                    | Editorial promise paired with original world art; first published learning route visible early; distinct proof of how read, code, and feedback work.     | One clear headline/action before art; learning entry follows without a full-screen empty hero. |
| Catalog                 | A purposeful featured published Course treatment when publication is sparse, then a scalable result layout as courses grow. Search/filter remain useful. | Search/filter and each Course entry stack with clear topic, Journey, summary, and target.      |
| Journey                 | Summary, outcomes, and ordered Course route.                                                                                                             | Short summary and Course entry before secondary details.                                       |
| Course                  | Readable chapter landmarks with substantial quest rows, state text, and a clear next action.                                                             | Compact stacked chapters; no miniature map labels or horizontal maze.                          |
| Auth/account            | Shared visual frame; forms and private account facts get calm surfaces and clear status hierarchy.                                                       | Full-width fields, safe status messaging, no artwork obscuring controls.                       |
| Offline/feedback/errors | Shared surface and status language with clear recovery paths; feedback remains local-only.                                                               | Short, direct message and action first; art cannot separate state from recovery.               |
| Published lesson        | This change may refresh the current reading/Workspace styling, but R06 remains responsible for the persistent lesson/editor/results composition.         | R06 owns panel switching; its regions inherit these typography and surface roles.              |

Alternative considered: one reusable card template for every route. That would make the screens uniform but would preserve the current monotony and make the learning map behave like another catalog list.

### 4. Keep state and authority outside presentation

Visual components consume the existing public curriculum and owner-scoped data. No hardcoded available Course, locally inferred account completion, fake reward, or client unlock rule is introduced. Existing guest/provisional, failed protected read, pending submission, and offline labels remain explicit. Existing route slugs, links, auth form names, API calls, and analytics event names remain stable. R06's one-controller editor seam remains its own Apply task; the redesign supplies visual roles and review criteria, not a second workspace controller.

### 5. Verify screenshots as part of the implementation, not as a proxy for acceptance

Implement in coherent passes: shared tokens/shell, Home, catalog/Journey/Course, auth/account/onboarding, offline/feedback/error states, then published lesson presentation and R06 handoff. For each pass, inspect actual local routes in an installed browser at desktop, tablet, mobile, zoom-equivalent narrow width, keyboard focus, and reduced motion. Review copy, image loads, page overflow, console errors, and routes after refresh. Run focused component/Playwright checks plus root lint, typecheck, test, and build. Record exact commit, browser, viewport, environment, and screenshots. R05 and revised R03 founder visual gates remain open until explicit review of the real build.

## Risks / Trade-offs

- [The visual overhaul regresses trusted state wording] -> Keep loading/error/provisional/accepted labels and test them at the route level.
- [Large artwork delays the first learning action or hurts performance] -> Reserve dimensions, optimize formats, use media only for purposeful placements, and compare emitted assets and browser timing to existing budgets.
- [The Course map becomes decorative at the expense of access] -> Keep semantic ordered lists, textual status and prerequisites, 44-pixel targets, and a readable next-action path.
- [Shared tokens cause unrelated workspace contrast regressions] -> Add semantic roles rather than globally reassigning every legacy token; inspect design-system and editor states after each token change.
- [R06 is implemented against stale art direction] -> Keep R06 Apply gated; update its design/tasks for the approved visual roles before implementation.
- [Browser screenshots are mistaken for founder approval] -> Maintain a separate founder worksheet row and do not close the gate on CI alone.

## Migration Plan

The frontend deployment changes presentation only. Preserve published URLs, curriculum IDs, persisted drafts, backend schema, and protected API contracts. Roll back the presentation commits if a visual defect blocks the real route; durable learner facts and drafts remain compatible. After the revised build is technically integrated, seek founder review of the exact Home-to-Course journey and then reconcile R06 planning before its Apply.
