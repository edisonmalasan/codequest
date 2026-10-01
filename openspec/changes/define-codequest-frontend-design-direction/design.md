# Design

## Context

See [proposal.md](proposal.md). The current root page is a centered three-link entry; `/design-system` is already development-only; the published Journey, Quest renderer, Editor Workspace, Worker runtime, and backend learning contracts exist separately. The Phase 4 system establishes a dark canvas, mint progress, amber reward, sky discovery, readable body face, pixel display face, 8-pixel rhythm, and original circuit-route motif. R02 must make these pieces feel like one future product without claiming the R03–R07 integrations exist.

## Goals / Non-Goals

**Goals:** Produce a screen-level CodeQuest direction that the founder can open in a browser, compare across viewport sizes, and either accept or revise. Keep all preview content original, visibly sample-only, and isolated from account and learning authority.

**Non-Goals:** Replace production home or Quest routes, publish new courses, change Auth, design a paid plan, execute code in the preview, change accepted progress, or resolve hosted beta gates.

## Decisions

### 1. Use a distinct “frontier atlas” expression on the existing token base

Use dark navy as the stable application canvas, luminous mint for the active route, amber for earned or primary calls to action, sky for discovery, and coral only for faults. The original visual motif is a circuit-map landscape with route lines, waypoints, and small game emblems rather than borrowed characters or scenes. A decorative hero illustration may be generated or authored as an original local asset; retain its source/provenance record and provide a text-safe backing. Pixel display typography is reserved for concise labels and headings. Body and editor text remain conventional and readable. Alternative: replace all tokens with a new theme; rejected because the approved design-system contract and shipped components already use them.

### 2. Build one development-only design preview

Add a route such as `/design-direction` gated the same way as `/design-system`. Keep preview-specific components and styles together, with no backend or generated-client imports. Navigation between Home, Explore, Map, and Lesson is local demonstrative state; the route never pretends those screens are production pages. Show a persistent “Design preview · sample content” banner and use neutral original sample course/exercise names. Alternative: publish mock pages at real production URLs; rejected because they would advertise unfinished features and risk confusing account/progress authority.

### 3. Prototype the complete composition before wiring production flows

Home communicates the product promise and a route to discovery; Explore shows journey and course hierarchy; Map shows chapter/exercise state without computing unlocks; Lesson shows a top identity/progress rail, lesson/editor/output regions, and a bottom action/navigation rail. Buttons for Run, Check, hint, Back, and Next demonstrate placement and local visual states only. Later phases wire those controls to existing runtime, validation, published curriculum, and backend facts. Alternative: implement the production shell during R02; rejected because R05's distinct Course model and R07's connected workflow are not yet specified for production.

### 4. Give each viewport a designed operating mode

Desktop keeps all three learning regions present. Tablet retains two useful regions at a time and makes the third reachable through a clear switcher. Mobile presents one focused region at a time with a sticky, accessible panel switcher and actions that remain visible without covering source. Preserve local demonstration text while switching. The documentation records widths as design breakpoints, not yet a final F02 device-support promise. Alternative: let CSS collapse three columns into an unstructured vertical stack; rejected because it obscures the current task and makes output inspection slow.

### 5. Separate automated evidence from founder approval

Unit/component checks cover preview gating, labels, panel switching, keyboard and source preservation. Browser captures at representative desktop/tablet/mobile widths verify actual composition, focus, contrast and overflow. A `docs/frontend-design-direction.md` record includes intended screen hierarchy, token roles, asset provenance and review fields, with founder verdict **OPEN** until the founder sees the preview. Alternative: infer visual acceptance from passing CI; rejected by the product-readiness contract.

## Risks / Trade-offs

- **Prototype looks like a finished course** → persistent sample banner, non-authoritative controls, development-only route, no production links.
- **Decorative art harms readability or loads slowly** → original optimized local asset, stable text backing, image alternatives, size review and reduced-motion checks.
- **Responsive shell design is mistaken for device certification** → record viewport tests only; R13/R16 physical and assistive-technology evidence stays open.
- **A later real Course model differs from sample hierarchy** → keep preview data local and define handoff interfaces in documentation; R05 owns the production model.
- **Visual direction changes after founder review** → update this change's design and preview before closure; no production contract is silently changed.

## Migration Plan

The preview is additive and development-only. R03–R07 can adopt accepted tokens and compositions incrementally while preserving current production routes until each replacement passes integrated checks. Removing the preview later does not migrate learner data. Phase 38 remains paused and `NO GO`.
