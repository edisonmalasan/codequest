# Spec Delta

## Purpose

Provide a learner with a private, owner-controlled identity and a coherent view of their own trusted progress and reward facts.

## ADDED Requirements

### Requirement: Learner profile is private and owner-scoped

The backend SHALL expose an authenticated self-only profile read and update. It SHALL derive ownership only from the verified principal and SHALL reject or ignore payload-supplied owner identity. The private profile MAY contain a trimmed display name of at most 40 Unicode characters and a stable avatar identifier from the published original avatar catalog. A missing or null avatar SHALL resolve to the catalog's default avatar. Profile reads and updates SHALL NOT expose another account's fields, email credentials, or authentication provider data.

#### Scenario: Learner updates their own profile
- **WHEN** an authenticated learner sends a valid display name and published avatar identifier
- **THEN** the backend stores and returns those profile preferences for that principal

#### Scenario: Profile owner is forged
- **WHEN** a profile update supplies a different owner ID or an unknown avatar identifier
- **THEN** the request is rejected without changing either account's profile

#### Scenario: Learner clears optional preferences
- **WHEN** an authenticated learner clears their display name and avatar preference
- **THEN** the profile returns no display name and the catalog default avatar

### Requirement: Profile presentation uses existing authoritative facts

The private profile SHALL present available progress, XP, level, streak, and achievement sections from their corresponding protected backend contracts. It SHALL identify the level curve as provisional and accepted completion as personal-learning under ADR 0005. Each section SHALL expose loading, unavailable, and retry behavior without replacing failed protected data with fabricated zeroes or client-derived authority. A guest or pending offline fact SHALL NOT appear as accepted account progress or reward.

#### Scenario: Protected profile sections load
- **WHEN** a learner opens their profile and the protected progress and reward reads succeed
- **THEN** the visible values match those backend responses and preserve their trust labels

#### Scenario: A protected section fails
- **WHEN** one protected profile section cannot be loaded
- **THEN** that section is marked unavailable while the remaining successful sections stay visible

#### Scenario: Pending guest work is present
- **WHEN** a learner has local or pending work that has not been accepted by the backend
- **THEN** the profile does not count it as account progress, XP, streak, level, or achievement

### Requirement: Avatar selection uses original catalog assets

The profile SHALL render only avatar identifiers and original assets explicitly present in the published avatar catalog. Avatar selection SHALL be a private cosmetic preference, SHALL include an accessible text name, and SHALL NOT imply achievement, rank, mastery, or account verification. Learner image uploads and public profile rendering are outside this capability.

#### Scenario: Published avatar is selected
- **WHEN** a learner selects an avatar from the published catalog
- **THEN** the private profile displays the matching original asset and accessible name

#### Scenario: Avatar identity is presented
- **WHEN** the profile shows the learner's selected avatar
- **THEN** its accessible label identifies the cosmetic choice without making a skill claim
