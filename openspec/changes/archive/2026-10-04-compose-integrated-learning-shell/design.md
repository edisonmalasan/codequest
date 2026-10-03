# Design

## Context

See `proposal.md` for motivation. `LessonPageView` currently renders a two-column article/briefing inside a `max-w-6xl` page, then mounts `QuestWorkspace` below the grid. `QuestWorkspace` supplies one JavaScript file, a Worker execution adapter, local validation, owner-scoped drafts, guest provisional state, and an explicit authenticated Submit callback to `EditorWorkspace`. The reusable workspace currently places console and optional preview beneath the editor, while status, tests, and actions occupy a narrow internal aside. R05 adds a distinct Course map, but `QuestDetail` still contains Journey and Chapter context only; this change will not invent a Course link from a slug or alter the API.

## Goals / Non-Goals

**Goals:**

- Keep one mounted editor/workspace controller while composing lesson, source, and output/results into stable regions.
- Make the existing actions and status understandable at desktop, tablet, and mobile widths.
- Preserve standalone Editor Workspace use and existing owner, draft, runtime, validation, and submission behavior.

**Non-Goals:**

- New curriculum hierarchy or API fields, new lesson sequencing/Back/Next behavior, multi-file authoring, DOM scripting, or runtime and grading changes.
- Completing R04 real-provider evidence, R05 founder acceptance, or any Phase 38 release gate.

## Decisions

### Visual contract inherited from the frontend refresh

The revised production visual roles are recorded in `docs/frontend-visual-refresh.md`. R06 should put lesson prose on the warm reading surface, the single editor and results on bounded dark work surfaces, and the shared context/action strip on the midnight world canvas. Use readable sans for lesson and exercise headings; reserve the pixel face for compact game labels. The original world images belong to discovery and should not compete with long lesson prose or editor output. Desktop shows lesson, editor, and results together. Tablet preserves the lesson/editor relationship while giving results a direct named control. Narrow layouts use explicit Lesson, Code, and Results access without remounting CodeMirror or losing source, output, focus, or status. CSS reflow must not imply that a local Check is backend accepted. This contract is a design handoff; current production Quest presentation is still vertically separated and R05 founder acceptance remains the R06 Apply entry gate.

### 1. Use a Quest-owned composition shell and workspace presentation seam

The Quest route owns curriculum context, lesson reading, hints, breadcrumbs, guest labels, and error/loading states. The existing Editor Workspace continues to own files, source, autosave, Run, Check, preview, and current results. Add an optional presentation mode or render-region seam inside Editor Workspace so a parent can place editor and result regions separately without creating a second controller. Keep its default standalone layout intact. Avoid duplicating source and validation state in the Quest parent; that would create stale result and autosave races.

### 2. Keep all panes mounted across responsive mode changes

Use one responsive CSS grid at desktop widths with three bounded columns and a shared exercise context/action strip. At tablet widths, use a two-region arrangement with named access to results; at narrow widths and high zoom, use explicit Lesson, Code, and Results selectors. Hide inactive regions from focus/assistive navigation but do not unmount the editor or result state. Panel changes update presentation and focus only. The exact breakpoint should follow actual content width rather than an arbitrary device class; verify at 1280, 1024, 820, 640, 390, and 320 CSS pixels. An all-stacked alternative was considered but retains the current context-loss problem.

### 3. Keep action semantics attached to the existing workspace controller

The exercise strip can host or visually align the existing Run, Check, Save, Reset, and eligible Submit controls, with outcome status near the Results region. One action source remains responsible for enabled/disabled state and correlation. Hints remain in the lesson region and retain their existing activity rules. Do not render placeholder Next/Complete controls; R07 will define progression and its trust implications. Use the published Journey link as the safe fallback route because the current Quest detail does not carry stable Course identity.

### 4. Preserve security and authority boundaries during re-layout

Continue using the configured isolated Worker for Run/Check and the existing script-disabled preview adapter only when supplied. Do not move learner code into the Next.js or NestJS execution context. Keep the local Check label, pending outbox state, guest provisional wording, and backend acceptance distinct. Do not log source, tokens, or protected responses. The visual shell itself performs no learning write; existing hints/start/Submit hooks remain explicit and unchanged.

### 5. Verify the actual composition and record acceptance separately

Add focused component tests for region selection, source/result preservation, keyboard focus, and truthful states; add a Playwright path using published curriculum through the real local frontend/backend pair where available, plus controlled failure fixtures for states hard to induce reliably. Capture desktop/tablet/mobile screenshots tied to an exact implementation commit. Run root lint/typecheck/test/build, focused browser/accessibility checks, API drift if a contract changes unexpectedly, and strict OpenSpec validation. This establishes technical and local integration evidence only. Founder acceptance needs an explicit review of the exact build; physical device and spoken assistive technology remain separate R13/R16 evidence.

## Risks / Trade-offs

- [Moving panels accidentally remounts CodeMirror or drops unsaved source] -> Keep one controller instance; test edit, switch, Run/Check, draft restore, and failed-save behavior across breakpoints.
- [A visually sticky action strip obscures lesson, editor, or results] -> Bound its height, preserve scroll reachability, and test narrow/zoomed layouts and on-screen keyboard conditions where available.
- [Hidden panel remains keyboard-focusable or announced] -> Use semantic panel selection and visibility rules; test focus transitions and editor escape behavior.
- [Quest lacks Course identity for direct Course-map return] -> Link to its published Journey now; reserve exact Course and sibling navigation for an approved R07 contract if needed.
- [Local CI and browser checks are mistaken for product acceptance] -> Keep readiness evidence and founder decision fields separate.

## Migration Plan

Implement on the published Quest route without changing persisted drafts or backend contracts. Preserve the standalone Editor Workspace default view and existing `/quests/:slug` deep links. Rollback is reverting the presentation composition; owner-scoped drafts and backend learning facts remain compatible. Do not start Apply while the R05 founder gate is open.
