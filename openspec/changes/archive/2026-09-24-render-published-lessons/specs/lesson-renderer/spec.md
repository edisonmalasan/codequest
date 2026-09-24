## Purpose

Present one published Quest as safe, accessible instructional reading through the generated curriculum contract before any editor or learner-execution workspace is introduced.

## ADDED Requirements

### Requirement: Published Quest lesson route uses the generated curriculum contract

The frontend SHALL expose `/quests/[slug]` and load exactly one published Quest through the typed curriculum API wrapper. The page SHALL present the Quest title, objective, Journey and Chapter context, difficulty, provisional XP metadata, guest eligibility, concepts, and content version without importing backend source, raw curriculum files, starter code, or assessment cases into the rendered lesson experience.

#### Scenario: Published Quest is opened

- **WHEN** a learner follows a non-locked Course-map link or opens a published Quest slug directly
- **THEN** the page presents the selected published snapshot and identifies its owning Journey and Chapter from the API response

### Requirement: Approved static lesson markup renders semantically without execution

The renderer SHALL support the approved static Markdown subset: paragraphs, logical headings, emphasis, thematic breaks, line breaks, ordered and unordered lists, inline code, fenced code blocks, blockquote callouts, links, and local illustrations. It MUST NOT evaluate raw HTML, MDX imports, JSX/components, expressions, scripts, event handlers, or executable content, and MUST NOT use an HTML-injection rendering path.

#### Scenario: Instructional structures are rendered

- **WHEN** published lesson markup contains headings, explanatory text, an ordered task, a blockquote callout, inline code, and a fenced JavaScript example
- **THEN** the page exposes matching semantic headings, paragraphs, list structure, callout text, inline code, and a labeled scroll-contained code block

#### Scenario: Executable markup is received unexpectedly

- **WHEN** a malformed response contains raw HTML, a script, or an MDX expression
- **THEN** that material is displayed only as inert text or omitted and no authored code executes in the application origin

### Requirement: Lesson links and illustrations remain inside the approved safety boundary

The renderer SHALL allow fragment links and HTTPS links while rejecting unsupported protocols. A published local `./assets/` illustration SHALL resolve only through the version-pinned curriculum asset route for the current Quest, SHALL retain its required non-empty text alternative, and SHALL be presented with bounded responsive dimensions. An illustration MUST NOT be the only source of an instruction or outcome.

#### Scenario: Local illustration is rendered

- **WHEN** validated lesson markup references `./assets/scope-chain.webp` with alternative text
- **THEN** the browser requests the image from the current Quest and content-version asset route and the image reflows within the reading column without horizontal page overflow

#### Scenario: Unsupported media source is received

- **WHEN** lesson markup references a remote image, data URL, missing alternative, path traversal, or unsupported file type
- **THEN** the renderer makes no request to that source and presents a safe unavailable-illustration fallback where useful

### Requirement: Graduated hints remain learner-controlled

The page SHALL present the Quest's question, concept, and next-step hints in that order as separate, keyboard-operable disclosures. Later hints SHALL remain collapsed until the learner chooses to reveal them, and revealing a hint SHALL NOT run code, record progress, award XP, or send a submission.

#### Scenario: Learner reveals hints progressively

- **WHEN** a keyboard learner opens the hint area and reveals the question hint followed by the concept hint
- **THEN** each selected hint becomes readable in order while the next-step hint remains collapsed

### Requirement: Lesson loading and failure states are truthful and recoverable

The route SHALL provide accessible loading feedback and distinct safe experiences for unpublished or unknown Quest slugs, recoverable network or HTTP failures, malformed success responses, and failed illustration loads. Recoverable Quest failures SHALL offer a retry. User-visible errors SHALL NOT expose response bodies, request URLs, tokens, repository paths, or backend implementation details.

#### Scenario: Published Quest cannot be loaded

- **WHEN** the typed curriculum read fails with a network error or recoverable HTTP error
- **THEN** the page explains that the lesson is unavailable and offers a retry without displaying internal diagnostics

#### Scenario: Quest is not published

- **WHEN** the curriculum API returns its normalized not-found response
- **THEN** the page presents a stable lesson-not-found state that does not reveal whether draft content exists

### Requirement: Lesson reading is accessible and comfortable on mobile

The lesson page SHALL use readable body typography and line length, logical heading order, semantic lists and disclosures, visible keyboard focus, WCAG AA contrast, at least 44-by-44 CSS-pixel primary targets, text alternatives, and reduced-motion behavior. At representative desktop and mobile-reading widths and at zoom/reflow, prose SHALL wrap without unintended page-level horizontal scrolling; wide code SHALL scroll within its own labeled region.

#### Scenario: Narrow viewport reading

- **WHEN** a lesson renders at a 390 CSS-pixel viewport with long prose and a long code line
- **THEN** prose, metadata, callouts, hints, and illustrations reflow within the viewport while only the code region can scroll horizontally

#### Scenario: Keyboard and reduced-motion reading

- **WHEN** a keyboard-only learner uses the page with reduced motion preferred
- **THEN** navigation, links, retry controls, and hint disclosures are reachable in logical order with visible focus and no required spatial animation

### Requirement: Phase 12 remains a reading capability

The lesson route SHALL NOT render or persist starter code, add an editor, run learner code, expose local check cases, validate an answer, submit an attempt, accept completion, compute or award XP, change unlock state, add analytics, or implement Phase 13 or later behavior.

#### Scenario: Phase boundary is reviewed

- **WHEN** the completed Phase 12 diff and browser behavior are inspected
- **THEN** the learner can read published instructional content and hints but cannot edit, run, check, submit, complete, or earn from the lesson page
