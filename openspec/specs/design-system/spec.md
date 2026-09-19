# design-system Specification

## Purpose
The CodeQuest visual identity and reusable component library that every product UI phase builds on: pixel-game design tokens, a pixel/game styling language alongside conventional control styling, presentational core and game components, and an accessibility baseline with no pixel-theme exceptions.

## Requirements

### Requirement: Design tokens define the visual identity

The frontend SHALL define design tokens for color (dark pixel-game palette with surface, ink, primary ascent, reward, success, danger, and muted ramps), typography (display, body, and mono scales), spacing, borders (pixel-corner and conventional radii), shadows (hard offset and soft elevation), interactive states (hover, active, focus, disabled), animation rules (stepped game motion and smooth UI motion, both collapsible under reduced motion), and responsive breakpoints, exposed through the Tailwind theme so components consume tokens instead of hardcoded values.

#### Scenario: Token-driven build output

- **WHEN** the production frontend build runs
- **THEN** the emitted stylesheet contains the token values and no component source contains hardcoded color, spacing, or shadow literals that duplicate a token

### Requirement: Pixel styling language marks game identity surfaces

The frontend SHALL provide a CSS-only pixel styling language (pixel-corners, hard offset shadows, stepped state changes, emblem/badge motifs) applied to game identity surfaces such as the logo mark, XP displays, badges, quest nodes, and chapter art frames.

#### Scenario: Game surface renders pixel identity

- **WHEN** a game component renders
- **THEN** its pixel treatment is visible via shape, shadow, and stepped motion only, with all meaning also carried by text or shape so color and decoration alone never convey state

### Requirement: Core interactive components are conventional and accessible

The frontend SHALL provide presentational core components — Button, Input, Select, Dialog, Drawer, Tabs, Tooltip, Toast, Card, Badge, Progress, Skeleton, and Dropdown — styled with conventional readable controls (not pixel-distorted), each supporting its documented variants and states (including loading, error, empty, and disabled where applicable), full keyboard operation, visible focus, and appropriate ARIA roles, labels, and live announcements.

#### Scenario: Keyboard-only form and dialog flow

- **WHEN** a keyboard-only user tabs through the core components, opens the dialog and dropdown, and submits with an error present
- **THEN** every interactive element is reachable and operable, focus is visible and trapped in the modal dialog, and the error is announced as text adjacent to the relevant field

### Requirement: Game components are display-only with no domain logic

The frontend SHALL provide presentational game components — XPBar, LevelBadge, QuestNode, QuestPath, ChapterCard, AchievementCard, and RewardPopup — that render strictly from display props (numeric values, status strings, labels); they SHALL NOT compute levels, XP totals, unlock availability, streaks, or rewards, and SHALL NOT fetch data or call APIs.

#### Scenario: Quest map renders from props

- **WHEN** QuestPath renders with quest nodes carrying `not_started`, `in_progress`, `completed`, and `locked` display statuses plus labels
- **THEN** each status is visually and textually distinct, and no node derives its status from any rule, store, or network source

### Requirement: Motion respects reduced motion everywhere

All component motion (entry transitions, progress animation, reward reveal) SHALL collapse to instant static presentation under `prefers-reduced-motion`, with no infinite loops, parallax, or scroll-hijack patterns anywhere in the component library.

#### Scenario: Reduced-motion render

- **WHEN** components render with reduced motion preferred
- **THEN** all animated values appear in their final state immediately and no animation loop runs

### Requirement: Text contrast meets WCAG AA with no theme exception

All component text, placeholder, focus-indicator, and state-color combinations SHALL meet WCAG AA contrast against their backgrounds, including game components and decorative pixel surfaces.

#### Scenario: Contrast audit

- **WHEN** each component variant is inspected against its background
- **THEN** body text meets 4.5:1 and large text meets 3:1 minimum, and state is never conveyed by color alone

### Requirement: Design system is verified by automated checks

The frontend SHALL verify the token system and every component with automated tests (variant rendering, state behavior, keyboard interaction, display-only game props, reduced-motion handling), and `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` SHALL pass.

#### Scenario: Full check suite gates the change

- **WHEN** install, lint, typecheck, tests, and the production frontend build run
- **THEN** each completes with a zero exit code and every design-system test passes

### Requirement: Phase 5+ boundaries are not leaked into

The change SHALL NOT introduce backend modules, API calls, auth flows, curriculum content or business logic, XP/level/streak/unlock computation, execution runtimes, validation logic, telemetry product logic, PWA registration, or generated raster art assets.

#### Scenario: Boundary review

- **WHEN** the final diff is reviewed
- **THEN** no files exist under `backend/`, no network or auth code paths are added, game components contain no rule evaluation or derived reward state, and no binary image assets are committed
