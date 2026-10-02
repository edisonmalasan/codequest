# Spec Delta

## MODIFIED Requirements

### Requirement: Published Journeys have one canonical learner page

The frontend SHALL expose `/journeys/:slug` as the canonical learner overview for a published Journey. It SHALL read Journey, Course, Chapter, and Quest information only through the generated curriculum API boundary, preserve backend ordering, and SHALL NOT import backend source, authored content files, or application-table data. Course SHALL be a distinct stable curriculum identity with its own canonical `/courses/:slug` learner map; existing Journey URLs SHALL remain useful and link to their published Courses.

#### Scenario: Published Journey loads

- **WHEN** a learner opens the canonical route for a published Journey
- **THEN** the page displays that Journey and its ordered published Courses using data returned by the generated frontend curriculum client

#### Scenario: Course terminology is displayed

- **WHEN** the page labels a Course map
- **THEN** the page uses the Course identity and canonical Course route rather than deriving a second model from the Journey alias

### Requirement: Journey overview explains the learning route from available metadata

The Journey page SHALL display its published title, authored summary, entry requirements, outcomes, ordered Courses, and overall completed-versus-total quest progress where the backend supplies a trusted snapshot. It SHALL NOT fabricate descriptive curriculum absent from the API, and progress text SHALL remain understandable without relying on a percentage or color alone.

#### Scenario: Journey metadata is presented

- **WHEN** the API returns a Journey with entry requirements, outcomes, Course count, and Quest count
- **THEN** the page presents those values in a readable overview with each published Course and a textual completed-quest count when authoritative progress is available

#### Scenario: Journey has no supplied completions

- **WHEN** no authoritative or provisional completion snapshot is available
- **THEN** the page explains that progress is not yet restored rather than implying account progress was fetched

### Requirement: Course map preserves curriculum order and chapter structure

The Course map SHALL render only the selected Course's chapters in published position order and each chapter's quests in chapter position order. Each chapter SHALL expose its objective, completed and total quest counts, chapter status, and an ordered semantic quest list, using the existing visual language without hiding the hierarchy in decoration.

#### Scenario: Ordered curriculum becomes a map

- **WHEN** chapters and quests arrive in an arbitrary response order
- **THEN** the rendered Course map orders them by published positions, keeps every quest with its owning chapter, and excludes chapters belonging to another Course

#### Scenario: Chapter progression is displayed

- **WHEN** a supplied completion snapshot contains some or all quest IDs in a chapter
- **THEN** the chapter shows the matching completed count, total count, and a textual not-started, in-progress, or completed state

### Requirement: Quest states are derived without inventing authority

For an authenticated learner, the Course map SHALL render quest locks and prerequisite explanations from the protected backend Course availability response, and completion from protected backend progress; it SHALL NOT recompute accepted eligibility from browser completion IDs. A currently completed published quest SHALL render `completed`; an incomplete backend-locked quest SHALL render `locked`; the earliest ordered backend-available incomplete quest SHALL render as the active/current navigation cue; any other backend-available incomplete quest SHALL render `available`. Active/current SHALL be map emphasis, not a stored learning status. For a guest, the map MAY derive navigation from published prerequisites and clearly labeled provisional device facts, without claiming accepted unlock authority. A failed protected read SHALL not become an authoritative empty or unlocked state.

#### Scenario: Prerequisites determine availability

- **WHEN** the protected response marks a quest locked and names an unmet published prerequisite
- **THEN** the Course map shows a non-interactive locked node with that explanation even if browser state claims completion

#### Scenario: One eligible quest is emphasized

- **WHEN** multiple incomplete quests are backend-available in a Course
- **THEN** only the earliest in Course, Chapter, and Quest order is labeled active/current and the other eligible quests are labeled available

#### Scenario: Completed state comes from supplied evidence

- **WHEN** backend progress marks a published quest currently completed
- **THEN** its node and chapter/Course counts show completion without awarding XP or persisting progress in the client

#### Scenario: Protected progress is unavailable

- **WHEN** an authenticated Course's protected progress or availability read fails
- **THEN** the page shows a recoverable unavailable state instead of asserting zero saved completion or local unlocks

### Requirement: Loading and failure states remain truthful and recoverable

The Journey overview and Course map SHALL provide accessible loading feedback and distinct experiences for unpublished or unknown content, an empty published scope, and recoverable network, HTTP, or malformed-response failures. A failed or partial curriculum graph SHALL NOT be used to infer unlock state. Recoverable failures SHALL offer a retry, and user-visible messages SHALL not expose raw response bodies, request URLs, tokens, or implementation details.

#### Scenario: Journey is not published

- **WHEN** the curriculum API returns its documented not-found response
- **THEN** the page presents a stable Journey-not-found state without revealing whether draft content exists

#### Scenario: Nested curriculum request fails

- **WHEN** a Chapter or Quest request needed for the Course map fails
- **THEN** the Course page withholds derived map states, describes that the route could not be loaded, and offers a retry for recoverable failures

#### Scenario: Publication contains no quests

- **WHEN** a published Course contains no renderable quests
- **THEN** the page shows an explicit empty Course-map state and does not divide by zero or invent an active node

### Requirement: Map nodes enter only approved lesson reading behavior

Quest nodes SHALL communicate title, sequence, difficulty, reward metadata, guest eligibility, and map state where available. An active/current, available, or completed published node SHALL be a semantic link to `/quests/[slug]`; a locked node SHALL remain non-interactive. Following an enabled node SHALL enter the published Quest lesson and its already approved workspace behavior. The map link itself SHALL NOT write a start, attempt, completion, XP, or unlock fact; those actions remain governed by their own authenticated and guest-learning contracts.

#### Scenario: Learner opens an eligible Quest

- **WHEN** the learner activates an available, active/current, or completed quest node
- **THEN** navigation opens that published Quest's lesson route with the node label and state available in text

#### Scenario: Learner inspects a locked Quest

- **WHEN** the learner focuses or reads a locked quest node
- **THEN** its label and locked state are available in text and it provides no lesson link or later-phase behavior

## ADDED Requirements

### Requirement: Course routes preserve map authority and navigation

The Course route SHALL load the published Course graph, use backend owner-bound progress and availability for authenticated map state, and clearly mark guest-local provisional state. A failed protected read SHALL not be replaced by a client-inferred unlocked map. The Course map SHALL link enabled quests to existing lesson routes and provide an understandable return path to its Journey and catalog.

#### Scenario: Account Course map loads
- **WHEN** an authenticated learner opens a Course
- **THEN** quest states and Course counts come from a complete owner-scoped backend snapshot

#### Scenario: Course progress is unavailable
- **WHEN** protected Course progress fails
- **THEN** the public outline remains readable but saved status and unlock actions are not falsely asserted
