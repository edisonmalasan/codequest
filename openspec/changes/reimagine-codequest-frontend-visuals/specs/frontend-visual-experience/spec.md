# Spec Delta

## Purpose

Give the production CodeQuest routes one recognizable and usable visual language while retaining truthful learning states, existing navigation, and the accessibility of the underlying controls.

## ADDED Requirements

### Requirement: Production routes share a coherent visual hierarchy

Home, onboarding, catalog, Journey, Course, authentication, account, published and offline lesson, feedback, and shared error routes SHALL use a consistent CodeQuest visual language for navigation, page headings, artwork, content surfaces, actions, and state messages. The logo and existing route identities SHALL remain recognizable. Short pixel typography MAY mark game identity, but long headings, instructional prose, exercise labels, forms, editor text, and results SHALL remain comfortably readable.

#### Scenario: Visitor crosses route families

- **WHEN** a visitor moves from Home through a Course into a lesson and later opens account or authentication
- **THEN** the navigation, typography roles, action priority, and semantic state treatment remain recognizable while each route retains a composition suited to its task

### Requirement: Visual presentation does not fabricate learning facts

Artwork, promotional sections, catalog cards, progress decoration, and account presentation SHALL distinguish published curriculum, device-local guest work, unavailable protected data, and backend-accepted account facts. A route SHALL NOT create a fake Course, reward, completion, unlock, account identity, or successful result to fill visual space.

#### Scenario: Only one Course is published

- **WHEN** the public catalog returns one complete published Course
- **THEN** the layout presents that Course meaningfully without cards implying additional available Courses

#### Scenario: Protected progress cannot load

- **WHEN** public Course content loads but protected progress fails
- **THEN** the visual treatment shows an unavailable account state without suggesting zero accepted progress or an unlocked Course

### Requirement: Responsive presentation follows the learner task

Desktop, tablet, and mobile presentations SHALL use intentional layouts for discovery, chapter scanning, authentication, account information, and lesson work. Content SHALL remain readable and primary actions reachable at 320, 390, 820, 1280, and 1440 CSS pixels and at zoom-equivalent narrow widths without page-level horizontal overflow. Motion SHALL preserve meaning under reduced-motion preference.

#### Scenario: Narrow Course navigation

- **WHEN** a learner browses a Course at a narrow viewport or equivalent zoom
- **THEN** chapter context, quest sequence, state, and the next eligible action remain readable and operable without tiny text or clipped controls

### Requirement: Visual acceptance is tied to the revised real routes

The repository SHALL retain browser captures and a review record for the revised production Home, catalog, Journey, Course, authentication, account, offline learning, feedback, and lesson surfaces against an exact build and environment. Automated checks and visual captures SHALL remain distinct from founder acceptance, and the earlier R05 visual decision SHALL not close the revised gate.

#### Scenario: Automated redesign checks pass

- **WHEN** local lint, tests, build, and browser checks pass but the founder has not reviewed the revised implementation
- **THEN** the redesign may be technically integrated while its founder visual acceptance remains open
