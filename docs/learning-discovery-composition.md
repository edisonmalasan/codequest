# Learning discovery composition

This record guides the production Home, catalog, Journey, and Course revision under `refine-learning-discovery-composition`. The current visual-refresh screenshots are the before state. Public-product research informed general density, illustrated-world, and course-path principles; no external screenshot or asset is included here. The R05 founder gate remains open.

| Route                                                        | Current composition                                                                                                     | Revision target                                                                                                                                                                           | Review widths                    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| [Home](frontend-evidence/visual-refresh-home-1440.png)       | A contained, dark panorama and a large sparse Journey card separate the first action from the available learning offer. | A bright original world stage leads directly to real published learning; the single Journey receives a substantial, concise entry, followed by working exercise and account explanations. | 1440, 1280, 820, 390, 320 CSS px |
| [Catalog](frontend-evidence/visual-refresh-catalog-1440.png) | Large headline and filter box precede one wide Course card, leaving a long low-information opening.                     | A compact illustrated introduction, close search/filter controls, and a featured real Course entry. Additional published Courses fit the same model.                                      | 1440, 1280, 820, 390, 320 CSS px |
| [Journey](frontend-evidence/visual-refresh-journey-1440.png) | Hero, warm outcomes slab, and Course card read as separate large blocks.                                                | One connected world overview with outcomes and ordered Course entry visible as parts of the same path.                                                                                    | 1440, 1280, 820, 390, 320 CSS px |
| [Course](frontend-evidence/visual-refresh-course-1440.png)   | A dark hero and warm outcomes slab sit above repetitive chapter slabs that fill the page width.                         | Course identity leads into a connected chapter path with a separate truthful learner-context area; semantic chapter/quest lists and lock explanations remain.                             | 1440, 1280, 820, 390, 320 CSS px |

## Visual roles and assets

- `daybreak-frontier.webp` is an original, text-free CodeQuest Home panorama with a bright sky, green valley, circuit path, and observatory. It was generated for this project on 2026-10-03 and converted to WebP at quality 75 without resizing. It is decorative behind real heading and action text. Its 2164×727 dimensions and 242,472-byte output keep it within the existing individual visual-asset bound.
- Existing `foundations-valley.webp`, `signal-road.webp`, and `beacon-city.webp` retain their documented roles. The new Home scene gives discovery a distinct daylight entry while Course-specific art remains tied to the published Course.
- Text and controls use a stable contrast backing that still works if an image fails. The image is not a source of Course title, availability, or progression facts.

## Interaction and truth contract

The Home and catalog render only backend-published public data. Search, filters, empty and failure states, direct Course links, and stable identities remain. The Journey and Course keep backend ordering and semantic lists. The Course context area may display only existing owner-scoped account progress or clearly labeled device-local guest facts; it cannot infer saved completion, XP, or unlocks. An unavailable protected read stays visibly unavailable. Desktop can pair the chapter path with context; tablet and mobile restore a single readable order without hiding locked explanations or shrinking targets.

## Implemented hierarchy

- **Home:** a daylight world scene frames the primary entry to the published catalog. The first published Journey follows directly below, with compact exercise-flow and account explanations. The server-supplied Journey list alone determines which path appears; loading, empty, and error states stay explicit.
- **Shared navigation:** real Home, Courses, onboarding, and Account destinations remain keyboard-accessible. The desktop active route uses an underline and the Account destination has a separate treatment. The mobile menu retains Escape dismissal and focus return. No unimplemented destination is advertised.
- **Catalog:** a shorter illustrated introduction leads to search, topic filtering, and an API-backed Course list. One published Course receives a full-width entry; further published Courses use the same list without manufactured cards.
- **Journey:** a shared illustrated introduction places source-backed outcomes alongside the Journey identity. An ordered Course map follows with stable links and backend positions.
- **Course:** the banner introduces a chapter path. Desktop places chapter and exercise links beside a distinct learner-context panel; narrow screens place the context before the path. Account completion and availability come only from an owner-scoped protected read. Device-local guest work is labeled provisional. A failed protected read explicitly withholds availability instead of implying completion or an unlock.

## Browser review evidence

The following synthetic-curriculum captures show implementation commit `97d168c` on the Apply branch. They verify composition and responsive behavior; they are not hosted data, real account acceptance, or founder acceptance.

| Route | 1440 px | 390 px |
| --- | --- | --- |
| Home | [Desktop](frontend-evidence/composition-home-1440.png) | [Mobile](frontend-evidence/composition-home-390.png) |
| Catalog | [Desktop](frontend-evidence/composition-catalog-1440.png) | [Mobile](frontend-evidence/composition-catalog-390.png) |
| Journey | [Desktop](frontend-evidence/composition-journey-1440.png) | [Mobile](frontend-evidence/composition-journey-390.png) |
| Course | [Desktop](frontend-evidence/composition-course-1440.png) | [Mobile](frontend-evidence/composition-course-390.png) |

The browser reflow sweep also captured all four routes at 1280, 820, and 320 CSS pixels in local test output and found no document overflow. Screenshots hide only the framework's development indicator. The test retains the public API fixture, real route navigation, heading checks, and overflow assertions. The local fixture has one Course and one exercise, so the images cannot establish visual density for later multi-Course publication.

## Verification and remaining gate

On 2026-10-03 the Apply branch passed `pnpm test` (including 426 frontend tests), `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm api:check`, and `openspec validate refine-learning-discovery-composition --strict`. The Home and Journey Chromium browser suites passed after selectors were updated for the new visible copy. The Chromium accessibility suite's keyboard, contrast, reduced-motion, target-size, and reflow checks passed; one initial run failed solely on the retired Home link label and the focused rerun passed after correction. The 20-route-width capture test passed with no horizontal document overflow. No API contract or backend application behavior changed.

The founder visual acceptance row for R05 remains **open**. These local captures use synthetic curriculum and cannot prove live published-content density, real Auth, or hosted behavior. R06 implementation remains gated by the existing acceptance workflow.
