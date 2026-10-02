# Spec Delta

## Purpose

Make the real CodeQuest entry and navigation routes usable, responsive, and truthful while the full V1 course and learning surfaces are built in later phases.

## ADDED Requirements

### Requirement: Production application shell offers coherent navigation

The frontend SHALL provide a shared, original CodeQuest application shell for production-facing pages with a home link, links to currently available learning and onboarding, an account entry, a current-route cue, and a keyboard-reachable skip target. The shell SHALL not claim a user identity, accepted progress, reward, or unlock without its authoritative source. It SHALL not expose unfinished destinations as active navigation.

#### Scenario: Visitor navigates from a production page

- **WHEN** a visitor opens Home, onboarding, a published Journey, or an account entry route
- **THEN** the shell provides consistent navigation to real destinations and the visitor can reach the page's main content without traversing the full header

#### Scenario: Account status is unknown

- **WHEN** the shell has no verified account state
- **THEN** it shows a neutral Account entry and lets the protected account route handle authentication without inventing a signed-in badge

### Requirement: Navigation adapts without losing access

The shell SHALL provide an intentional narrow-screen navigation mode with the same reachable destinations as desktop, a discernible open/closed state, keyboard operation, Escape dismissal, visible focus, and no horizontal page overflow at supported review widths and zoom. Decorative media SHALL not block controls or main text.

#### Scenario: Mobile visitor opens the menu

- **WHEN** a visitor opens the narrow-screen menu by keyboard or touch
- **THEN** all current destinations are reachable, selecting one closes the menu, and the underlying page remains readable

### Requirement: Home explains the real learning entry

The root page SHALL use the accepted original visual direction and link to currently available learning, onboarding, registration, and account access without representing sample content as published curriculum. Its language SHALL distinguish local Run/Check feedback from backend-accepted account progress and SHALL not promise completion, XP, or cross-device state to anonymous visitors.

#### Scenario: New visitor begins learning

- **WHEN** a visitor opens Home and selects an available published Journey
- **THEN** they reach its canonical Journey route through a visible, descriptive call to action

### Requirement: Published learning entry uses public curriculum facts

The home-page learning entry SHALL use the existing public curriculum API contract and render only published Journey summaries returned by that contract. It SHALL present distinct loading, empty, failure, and success states, retain useful non-curriculum navigation during failure, and SHALL NOT substitute hardcoded available-course claims for a failed read.

#### Scenario: No published Journey is returned

- **WHEN** the public curriculum request succeeds with an empty list
- **THEN** Home states that no path is currently available and still offers onboarding or account access

#### Scenario: Curriculum cannot be loaded

- **WHEN** the public curriculum request fails or returns an invalid response
- **THEN** Home shows an understandable unavailable state with a retry path and does not render a fabricated course card

### Requirement: R03 evidence separates technical completion from acceptance

The repository SHALL verify shell navigation, menu keyboard behavior, home curriculum states, and responsive layout with focused automated tests and installed-browser checks. Founder review of the actual production Home and shell SHALL be recorded against an exact build, separately from automated results. R03 SHALL not be recorded as founder accepted until that decision is explicit, and R03 checks SHALL not close Phase 38 or certify R04–R07 integrations.

#### Scenario: CI passes before founder review

- **WHEN** all automated R03 checks pass but the founder has not reviewed the real home and navigation
- **THEN** technical implementation may be recorded, while founder acceptance and release readiness remain open
