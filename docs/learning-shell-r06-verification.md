# R06 integrated learning shell verification

## Build and scope

- Implementation commit: `a8df10c` on `feat/integrated-learning-shell`; the screenshots below were captured from these application files before the documentation-only commit.
- Date: 2026-10-04 (Asia/Manila).
- Environment: local Next.js development server and Chromium Playwright, with a synthetic published Q01 fixture. The test config uses isolated local application/runtime/preview origins. No real account or hosted beta environment was exercised.
- R05 entry gate: the founder explicitly accepted the exact PR #204 Home-to-Course visual/navigation build; [the decision row](learning-discovery-composition.md#r05-founder-acceptance) records its limits.

The desktop screen presents the authored lesson, one CodeMirror editor, and console/status/tests at once. Run, Check, Save, and Reset use one action source. The Quest route retains guest provisional language, authenticated submission hooks, hint recording, offline and pending states. Only the presentation moves; the Worker and backend authority contracts do not change.

## Visual and browser evidence

| Width       | Captured surface                                   | Observed behavior                                                                                |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1440 CSS px | [Desktop](frontend-evidence/r06-shell-1440.png)    | Lesson, code, and results visible simultaneously; no document overflow.                          |
| 1280 CSS px | [Desktop](frontend-evidence/r06-shell-1280.png)    | Three bounded regions and action strip visible; no document overflow.                            |
| 820 CSS px  | [Tablet](frontend-evidence/r06-shell-820.png)      | Lesson beside selected Code or Results region.                                                   |
| 390 CSS px  | [Mobile Code](frontend-evidence/r06-shell-390.png) | Explicit region controls, visible actions and CodeMirror; inactive regions excluded from layout. |

The same browser test checked 640 and 320 CSS pixels without document overflow. At all reviewed widths it switched Code and Results, kept one workspace heading, and showed the expected region. At 320 pixels it edited source, ran Check, read the failed local result in Results, returned to Code, and found the edit intact. The existing keyboard-access test verified the editor's Tab escape, hint disclosure, reset dialog focus return, and local Check status. The contrast/reduced-motion/target-size/reflow test passed. The editor was awaited before each capture; the images show loaded source. The development indicator is a framework overlay, not a product control.

## Checks

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass; backend 207 tests and frontend 428 tests.
- `pnpm build`: pass.
- `pnpm api:check`: pass; no API contract change.
- `openspec validate compose-integrated-learning-shell --strict`: pass.
- Chromium Playwright accessibility/reflow: 3 tests passed.
- Chromium Playwright published lesson and standalone workspace: 3 tests passed.
- Focused production PWA offline-download/Run/Check/draft recovery path: 1 test passed after the test accepted either a lazy-load button or an already-mounted editor.
- Focused production cold/subsequent Run and Check performance path: 1 test passed with the visible editor loading either automatically or through its explicit button.
- Impeccable mechanical design detector: no findings on changed UI files.

## Boundaries and remaining acceptance

These checks establish the implemented composition and local browser behavior on synthetic curriculum. They do not establish physical-device or spoken assistive-technology results, real Supabase Auth, hosted runtime isolation, or learner outcomes. The standalone workspace remains the default presentation and its existing browser Run/recovery test passed. Published JavaScript Quests do not yet mount a web preview adapter; R07 owns the complete Run/preview/Check/completion workflow. Local Check does not grant accepted account progress. The founder's exact-build R06 visual/workflow decision is recorded below; it does not mark the full product or private beta ready.

## R06 founder acceptance

| Field | Record |
| --- | --- |
| Capability/scenario | R06 desktop three-region lesson/editor/results layout and intentional tablet/mobile panel workflow shown in this record |
| Release/build/commit | Implementation `a8df10c`; Apply PR #207 merge `333e376`; Sync PR #208 merge `aecf7a2`; Archive PR #209 merge `5c6d4f0` |
| Environment | Local Chromium browser captures with synthetic published Q01 at 1440, 1280, 820, and 390 CSS pixels; 640 and 320 CSS pixels checked without document overflow |
| Tester | CodeQuest founder (visual/workflow decision); development agent (implementation and browser checks) |
| Date | 2026-10-04 (Asia/Manila) |
| Expected behavior | Lesson, CodeMirror editor, and output/results stay usable together on desktop; named smaller-screen panels retain source and current result. |
| Observed behavior | After the exact build and capture record was presented, the founder replied, “Accept exact R06 build.” The technical observations are documented above; the founder supplied no additional device or workflow notes. |
| Pass/fail | **PASS for R06 founder visual/workflow acceptance of this exact local build** |
| Defect | None reported in this decision; real-provider, hosted, physical-device, and assistive-technology behavior remain separately unverified. |
| Retest | Required if the accepted layout or workflow is materially changed; later R07 integration requires its own founder review. |
| Final founder acceptance | **ACCEPTED** for this exact R06 build and reviewed scope. This is not full V1 Founder Acceptance or release readiness. |
