# Spec Delta

## Purpose

Make the original CodeQuest V1 visual direction reviewable across the main frontend journeys before their production integration is built.

## ADDED Requirements

### Requirement: Representative V1 screens share an original visual language
The R02 design preview SHALL show a coherent CodeQuest-specific visual language for home, navigation, course discovery, course map, and learning workspace. It SHALL use original branding, visual motifs, artwork, and sample copy, while applying the existing semantic design-system tokens and readable pixel-display/body/code typography roles. Research references SHALL NOT be shipped as assets or reproduced as proprietary copy or character designs.

#### Scenario: Reviewer traverses representative screens
- **WHEN** a reviewer moves through home, discovery, course map, and lesson preview
- **THEN** the screens visibly belong to one original CodeQuest system and their hierarchy and primary actions are understandable without a design document

### Requirement: Preview is development-only and visibly demonstrative
The frontend SHALL expose the R02 preview only in local development. Every preview screen SHALL identify sample content and simulated controls, and SHALL NOT claim that a course, account, completion, reward, or project has been created or accepted. The preview SHALL NOT mutate backend state, call protected application APIs, execute learner code, or collect telemetry.

#### Scenario: Learner reaches production build
- **WHEN** the application runs in production mode
- **THEN** the R02 preview route is unavailable and no unfinished preview navigation is advertised from production routes

#### Scenario: Reviewer tries a sample action
- **WHEN** a reviewer selects a representative navigation or workspace action in development
- **THEN** the preview updates only local demonstration state and keeps its non-authoritative status visible

### Requirement: Screen composition communicates the intended learning flow
The preview SHALL show the planned desktop lesson, editor, and output or preview as persistent simultaneous regions with a clear exercise action and navigation bar. It SHALL also show how home leads to discovery and a course map, and how a learner reaches a representative lesson. The preview SHALL distinguish the proposed composition from the currently implemented real learning flow.

#### Scenario: Desktop learning review
- **WHEN** a reviewer opens the lesson preview at a representative desktop width
- **THEN** lesson, editor, and output or preview remain visible together without horizontal page overflow, and Run, Check, hint, Back, and Next have discernible locations

### Requirement: Tablet and mobile designs are intentional alternatives
The preview SHALL define a tablet and mobile panel strategy that preserves lesson, source, and output context without squeezing three desktop columns. Primary navigation and actions SHALL remain operable at narrow widths and high zoom, while long code or console lines MAY scroll inside bounded labeled regions.

#### Scenario: Mobile learning review
- **WHEN** a reviewer opens the lesson preview at a narrow mobile width
- **THEN** they can switch between lesson, code, and result views without losing demonstration source or leaving controls clipped

### Requirement: Direction is documented and checked before handoff
The repository SHALL record screen hierarchy, semantic token and typography usage, interaction states, responsive rules, original-asset provenance, and the boundary between R02 preview and R03–R07 production work. Browser review SHALL include desktop and mobile captures, keyboard, focus, reduced-motion, and overflow checks. Founder visual acceptance SHALL be recorded separately from automated results and SHALL remain open until the founder explicitly reviews the actual preview.

#### Scenario: Automated checks pass without founder review
- **WHEN** build and browser checks pass but the founder has not approved the actual screen direction
- **THEN** R02 remains below `FOUNDER ACCEPTED` and its visual handoff is marked pending
