## Purpose

Define the accessible learner-facing Journey overview and Course map that turn published curriculum into truthful, prerequisite-aware primary navigation without claiming progress authority that does not yet exist.

## ADDED Requirements

### Requirement: Published Journeys have one canonical learner page

The frontend SHALL expose `/journeys/:slug` as the canonical learner page for a published Journey. It SHALL read Journey, Chapter, and Quest information only through the existing generated curriculum API boundary, preserve backend ordering, and SHALL NOT import backend source, authored content files, or application-table data. Course SHALL remain a display synonym used for the map, not a separate route-owned entity or hierarchy level.

#### Scenario: Published Journey loads

- **WHEN** a learner opens the canonical route for a published Journey
- **THEN** the page displays that Journey and its ordered chapters and quests using data returned by the generated frontend curriculum client

#### Scenario: Course terminology is displayed

- **WHEN** the page labels its primary map as a Course map
- **THEN** the page keeps the Journey identity and canonical route and does not create a second Course model or fetch a divergent representation

### Requirement: Journey overview explains the learning route from available metadata

The Journey page SHALL display the Journey title, a concise description derived from its existing title and chapter/quest counts, its entry requirements, learning outcomes, and overall completed-versus-total quest progress. It SHALL NOT fabricate authored descriptive curriculum that the API does not provide, and progress text SHALL remain understandable without relying on a percentage or color alone.

#### Scenario: Journey metadata is presented

- **WHEN** the API returns a Journey with entry requirements, outcomes, chapter count, and quest count
- **THEN** the page presents those values in a readable overview with a textual completed-quest count and progress indicator

#### Scenario: Journey has no supplied completions

- **WHEN** no authoritative or provisional completion snapshot is available
- **THEN** the page reports zero completed quests and explains that progress is not yet being restored rather than implying account progress was fetched

### Requirement: Course map preserves curriculum order and chapter structure

The Course map SHALL render chapters in Journey position order and each chapter's quests in chapter position order. Each chapter SHALL expose its objective, completed and total quest counts, chapter status, and an ordered semantic quest list, using the existing CodeQuest game-map visual language without hiding the hierarchy in decoration.

#### Scenario: Ordered curriculum becomes a map

- **WHEN** chapters and quests arrive in an arbitrary response order
- **THEN** the rendered Course map orders them by their published positions and keeps every quest associated with its owning chapter

#### Scenario: Chapter progression is displayed

- **WHEN** a supplied completion snapshot contains some or all quest IDs in a chapter
- **THEN** the chapter shows the matching completed count, total count, and a textual not-started, in-progress, or completed state

### Requirement: Quest states are derived without inventing authority

The frontend SHALL derive map presentation from published prerequisite IDs plus a supplied set of completed stable quest IDs. A completed ID SHALL render `completed`; an incomplete quest with an unmet prerequisite SHALL render `locked`; the earliest ordered eligible incomplete quest SHALL render as the active/current navigation cue; and any other eligible incomplete quest SHALL render `available`. Active/current SHALL be a map emphasis, not a stored learning status or accepted completion claim. The current Phase 11 page SHALL use an empty completion snapshot until a separately approved progress source exists, and any future provisional snapshot SHALL be labeled provisional.

#### Scenario: Prerequisites determine availability

- **WHEN** a quest depends on a stable quest ID absent from the supplied completion set
- **THEN** the dependent quest is labeled locked while prerequisite-free or satisfied incomplete quests remain eligible

#### Scenario: One eligible quest is emphasized

- **WHEN** multiple incomplete quests are eligible
- **THEN** only the earliest in Journey, Chapter, and Quest order is labeled active/current and the other eligible quests are labeled available

#### Scenario: Completed state comes from supplied evidence

- **WHEN** a stable quest ID appears in the supplied completion set
- **THEN** its node and chapter/journey counts show completion without awarding XP, persisting progress, or treating the client model as backend acceptance

### Requirement: Map nodes do not enter unimplemented lesson behavior

Phase 11 quest nodes SHALL communicate title, sequence, difficulty, reward metadata, guest eligibility, and map state where available, but SHALL NOT navigate into or simulate a Phase 12 lesson page, render lesson content or hints, edit starter code, run learner code, perform checks, submit attempts, or award progress. Locked nodes SHALL be non-interactive, and any enabled map interaction SHALL remain within Phase 11 navigation.

#### Scenario: Learner inspects a quest node

- **WHEN** the learner focuses or reads an available, active/current, completed, or locked node
- **THEN** its label and state are available in text and no lesson, editor, runtime, or submission behavior starts

### Requirement: Loading and failure states remain truthful and recoverable

The Journey page SHALL provide accessible loading feedback and distinct experiences for an unpublished or unknown Journey, an empty published Journey, and recoverable network, HTTP, or malformed-response failures. A failed or partial curriculum graph SHALL NOT be used to infer unlock state. Recoverable failures SHALL offer a retry, and user-visible messages SHALL not expose raw response bodies, request URLs, tokens, or implementation details.

#### Scenario: Journey is not published

- **WHEN** the curriculum API returns its documented not-found response
- **THEN** the page presents a stable Journey-not-found state without revealing whether draft content exists

#### Scenario: Nested curriculum request fails

- **WHEN** a Chapter or Quest request needed for the Course map fails
- **THEN** the page withholds derived map states, describes that the route could not be loaded, and offers a retry for recoverable failures

#### Scenario: Publication contains no quests

- **WHEN** a published Journey contains no renderable quests
- **THEN** the page shows an explicit empty Course-map state and does not divide by zero or invent an active node

### Requirement: Journey navigation is accessible and responsive

The page SHALL preserve logical heading and chapter/quest list structure, visible keyboard focus, WCAG AA contrast, text alternatives for essential state, at least 44-by-44 CSS-pixel primary targets, reduced-motion behavior, and readable reflow without unintended horizontal scrolling at representative desktop and mobile-reading widths. Pixel artwork SHALL remain decorative when equivalent Journey and Chapter text is present.

#### Scenario: Keyboard and reduced-motion review

- **WHEN** a keyboard-only learner uses the map with reduced motion preferred
- **THEN** all available controls remain reachable in logical order, focus stays visible, every state is conveyed in text, and content reaches its stable presentation without spatial animation

#### Scenario: Narrow viewport review

- **WHEN** the Journey page renders at a representative mobile-reading width
- **THEN** overview, chapters, progress, and ordered quest nodes reflow without clipped text, broken artwork, or horizontal page overflow

### Requirement: Phase 11 remains inside frontend presentation boundaries

The change SHALL NOT add or change backend endpoints, OpenAPI schemas, generated client files, database tables, authentication behavior, production curriculum publication, accepted progress, persisted unlocks, guest import, offline synchronization, XP/level/streak computation, lesson rendering, editor/runtime behavior, assessments, submissions, analytics, or PWA behavior. Automated verification SHALL cover the page model and states, API loading/failure behavior, accessibility semantics, responsive layout, and the existing repository checks.

#### Scenario: Phase boundary is reviewed

- **WHEN** the completed Phase 11 diff and generated contract are inspected
- **THEN** all product changes are confined to frontend Journey/Course-map presentation and tests, the generated API contract is unchanged, and no Phase 12 or later behavior is present

