# design-system Specification

## Purpose
The CodeQuest visual identity and reusable component library that every product UI phase builds on: pixel-game design tokens, a pixel/game styling language alongside conventional control styling, presentational core and game components, and an accessibility baseline with no pixel-theme exceptions.

## Requirements

### Requirement: Design tokens define the visual identity

The frontend SHALL define design tokens for a dark-first "debugger's frontier" identity: semantic color ramps for canvas, surfaces, ink, mint progress, amber reward, coral fault, sky discovery, success, danger, and muted states; a readable body face, compact pixel display face, and code face; an 8 CSS-pixel base rhythm with documented half- and double-step exceptions; pixel and conventional borders; hard game shadows and restrained application elevation; interactive states; stepped game motion and smooth control motion; and responsive breakpoints. Components SHALL consume semantic tokens rather than duplicate visual literals, and pixel imagery SHALL render at integer source-grid multiples where practical.

#### Scenario: Token-driven build output

- **WHEN** the production frontend build and source audit run
- **THEN** the emitted styles expose the documented semantic tokens, components do not duplicate token literals, and pixel assets remain crisp at the showcase's representative sizes

### Requirement: Pixel styling language marks game identity surfaces

The frontend SHALL provide a coherent pixel-game styling language based on the CodeQuest mark, 8-pixel construction grid, circuit-route motif, hard inset highlights, stepped silhouettes, and patch-like emblems. It SHALL visibly govern the logo and wordmark treatment, quest maps and paths, avatar framing, badges, XP and level displays, chapter artwork and frames, achievements, rewards, and decorative game-world elements. Every semantic state SHALL also be conveyed by text, shape, icon, or pattern rather than color or decoration alone.

#### Scenario: Game surface renders pixel identity

- **WHEN** a reviewer views the design-system showcase without surrounding product context
- **THEN** the logo, map, chapter, avatar, reward, achievement, and HUD examples read as parts of one recognizable CodeQuest pixel-game system rather than conventional dark cards with incidental pixel corners

### Requirement: Core interactive components are conventional and accessible

The frontend SHALL provide presentational Button, Input, Select, Dialog, Drawer, Tabs, Tooltip, Toast, Card, Badge, Progress, Skeleton, and Dropdown components using clean conventional control geometry and readable body typography. Each component SHALL support its documented variants and relevant loading, error, empty, selected, open, and disabled states; preserve native semantics or correct ARIA patterns; support full keyboard operation; expose a high-contrast focus indicator at least equivalent to a two-CSS-pixel perimeter; and maintain at least 44-by-44 CSS-pixel pointer targets for primary interactive examples. Pixel display typography SHALL NOT be used for long body copy, form values, editor text, console text, tables, or dense menus.

#### Scenario: Keyboard-only form and dialog flow

- **WHEN** a keyboard-only user traverses the showcase form, tabs, dropdown, dialog, drawer, tooltip, toast, and action controls
- **THEN** every control is reachable and operable in a logical order, focus remains visible, modal focus is trapped and restored, error and status text are announced, and no decorative game layer obstructs interaction

### Requirement: Game components are display-only with no domain logic

The frontend SHALL provide presentational XPBar, LevelBadge, QuestNode, QuestPath, ChapterCard, AchievementCard, and RewardPopup components that express the coherent CodeQuest game language and render strictly from display props. Quest paths SHALL support a visually meaningful map composition; chapter cards SHALL support original artwork or motifs with text alternatives; achievements and level surfaces SHALL support emblem artwork and locked/unlocked states; and avatar treatment SHALL be demonstrated without adding a profile-domain component. These components SHALL NOT compute levels, XP totals, unlock availability, streaks, rewards, or curriculum rules and SHALL NOT fetch data or call APIs.

#### Scenario: Quest map renders from props

- **WHEN** QuestPath renders supplied quest nodes in completed, current, available, and locked states alongside decorative map art
- **THEN** node order and state remain semantically available, each state is textually and visually distinct, decorative art is hidden or described appropriately, and no component derives state from a rule, store, or network source

### Requirement: Motion respects reduced motion everywhere

All motion SHALL distinguish short, purposeful game feedback from conventional control transitions. Motion SHALL avoid infinite loops, parallax, scroll hijacking, disruptive flashes, and layout-dependent interaction; SHALL use transform or opacity where practical; and SHALL collapse to an instant stable final presentation under `prefers-reduced-motion` without losing content, state, focus, or operability.

#### Scenario: Reduced-motion render

- **WHEN** the showcase renders with reduced motion preferred and interactive examples are triggered
- **THEN** map, progress, reward, dialog, drawer, tooltip, toast, and state transitions present their final state without looping or spatial animation and remain fully operable

### Requirement: Text contrast meets WCAG AA with no theme exception

All text, placeholder, icon, component-boundary, focus-indicator, and semantic-state combinations SHALL meet the applicable WCAG 2.2 AA contrast requirements on every background used in the showcase, including pixel artwork and decorative surfaces. Body text SHALL meet 4.5:1, large text and meaningful non-text graphics SHALL meet 3:1, focus SHALL remain discernible across mixed artwork, and no state SHALL depend on color alone.

#### Scenario: Contrast audit

- **WHEN** each documented component state and text overlay is audited at desktop and mobile showcase widths
- **THEN** applicable contrast thresholds pass, artwork uses a stable text backing where needed, and state remains understandable in grayscale

### Requirement: Design system is verified by automated checks

The frontend SHALL verify the token and asset systems and every component with automated tests for variants, state behavior, keyboard interaction, modal focus, display-only game props, reduced motion, asset loading, and responsive overflow. The redesign SHALL also be inspected in an installed browser at representative desktop and mobile widths using screenshots against the approved visual direction, with runtime, hydration, console, broken-image, focus, and layout issues repaired before completion. Frontend and root lint, typecheck, test, and production build commands plus strict OpenSpec validation SHALL pass.

#### Scenario: Full check suite gates the change

- **WHEN** the redesign is ready for sync
- **THEN** all required commands exit successfully and retained browser evidence shows a coherent identity, usable keyboard flow, reduced-motion behavior, loaded assets, and no unintended horizontal overflow or runtime errors at the reviewed widths

### Requirement: Phase 5+ boundaries are not leaked into

The change SHALL NOT introduce backend modules, API calls, authentication flows, curriculum or quest business logic, XP/level/streak/unlock computation, execution runtimes, validation rules, analytics, PWA behavior, or production quest data. Showcase data SHALL remain local, static, and visibly demonstrative; visual assets SHALL carry no executable content or learner data.

#### Scenario: Boundary review

- **WHEN** the final redesign diff is reviewed
- **THEN** no backend or later-phase product behavior is added, game components contain no domain rules or data access, and the showcase remains a development-only visual review artifact

### Requirement: Visual assets are purposeful, original or license-safe, and traceable

The frontend SHALL keep production design-system assets under a documented `public/assets/design-system/` structure, optimize them for web delivery, and give each asset a defined logo, map, chapter, avatar, badge, achievement, reward, HUD, or decorative role. CodeQuest-specific identity assets SHALL be original. Any committed third-party asset MUST have a verified reuse license and recorded source, author, license, modification, and attribution requirements; research-only references SHALL NOT be shipped as product assets.

#### Scenario: Asset provenance review

- **WHEN** the production asset directory and manifest are reviewed
- **THEN** every file has a documented role and provenance, all shipped third-party files have compatible licenses and required attribution, research references are excluded, and browser checks report no missing or oversized assets

### Requirement: Development showcase exposes the complete visual system

The frontend SHALL provide a development-only `/design-system` route that renders the CodeQuest mark and wordmark, tokens, typography, palette, pixel grid and motifs, asset examples, every core and game component with important variants and states, a composed quest map, badge and achievement systems, XP and level HUD, chapter artwork and frame, avatar treatment, motion and reduced-motion examples, and responsive review guidance. The route SHALL remain separate from the real homepage and SHALL be unavailable in production builds.

#### Scenario: Reviewer can judge the complete identity locally

- **WHEN** a reviewer opens `/design-system` in development at representative desktop and mobile widths
- **THEN** the full hybrid pixel-game and modern-application system is visible, interactive examples work, every roadmap pixel surface is represented, and the route returns not found in production mode
