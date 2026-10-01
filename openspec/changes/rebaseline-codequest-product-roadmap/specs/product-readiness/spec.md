# Spec Delta

## Purpose

Define how CodeQuest selects its V1 product boundary and advances each advertised capability from technical implementation to an integrated, founder-accepted, release-ready experience.

## ADDED Requirements

### Requirement: Explicit V1 inclusion contract
The product plan SHALL name every capability advertised for V1 and record whether it is required, conditional on an explicit founder decision, or deferred. Public reference-product feature categories SHALL NOT become CodeQuest V1 commitments merely because they appear in a reference inventory. Every included capability SHALL have user-visible scope, dependencies, automated and integrated verification, founder acceptance criteria, non-goals, and an owner.

#### Scenario: Reference feature has no founder scope decision
- **WHEN** a Codédex-inspired category is inventoried but its V1 inclusion is undecided
- **THEN** the roadmap labels it conditional and CodeQuest does not advertise it as a working V1 feature

### Requirement: Readiness states require distinct evidence
The project SHALL track `TECHNICALLY IMPLEMENTED`, `FEATURE COMPLETE`, `INTEGRATED`, `FOUNDER ACCEPTED`, `RELEASE READY`, `PRIVATE BETA`, `BETA ACCEPTED`, and `PRODUCTION READY` as distinct ordered states. Passing CI or archiving an engineering change SHALL NOT alone establish feature completion, integration, founder acceptance, or release readiness. Every capability advertised for V1 SHALL be feature complete, integrated, and founder accepted before private beta.

#### Scenario: Automated checks pass while a real flow fails
- **WHEN** CI passes but the intended learner flow fails against its real configured dependency
- **THEN** that capability remains below `INTEGRATED` and the product cannot advance to private beta

### Requirement: Founder-approved learning experience
The V1 acceptance contract SHALL treat the current homepage and current vertically separated lesson/workspace composition as non-final. The intended desktop lesson SHALL keep lesson content, code editor, and output or preview as a persistent, usable three-pane experience, with visible exercise navigation and Run, Check, hint, and completion feedback. Tablet and mobile SHALL have intentional alternate layouts rather than a compressed three-column desktop layout. Future implementation SHALL preserve existing learner-code isolation and backend completion authority unless separately approved specs change those boundaries.

#### Scenario: Current lesson and workspace both render
- **WHEN** the lesson and editor work individually but the learner must leave the lesson context to inspect output or complete the exercise
- **THEN** the integrated learning-shell acceptance criterion remains unmet

### Requirement: Real authentication is part of product acceptance
Email signup, email confirmation, login, logout, password recovery, Google OAuth, and GitHub OAuth SHALL be verified against the configured real Supabase environment before authentication is recorded as integrated or founder accepted. Controlled fixtures and local adapters SHALL remain useful automated evidence but SHALL NOT substitute for provider redirects, email delivery, callback, session, and recovery behavior in the target environment.

#### Scenario: Provider adapter tests pass but OAuth fails in the app
- **WHEN** automated authentication tests pass but Google or GitHub login fails in the actual configured app
- **THEN** authentication remains incomplete and private beta remains blocked

### Requirement: Mandatory founder acceptance journey
Before release readiness, the founder SHALL personally verify the real V1 app through home, course browsing, journey or course choice, supported guest learning, account creation, email confirmation, login, Google and GitHub OAuth, course and lesson opening, three-pane editing, Run, output or preview, Check, hint, submission and completion, backend-accepted progress, XP, level, streak and unlock effects, Next, map updates, refresh, browser close and reopen, logout and login, retained progress, recovery, and account or profile flows. The record SHALL identify the tested release, environment, result, and founder-critical defects. Every additional founder-approved V1 capability SHALL extend this journey with an acceptance scenario.

#### Scenario: Founder-critical defect remains
- **WHEN** the founder observes a critical failure in any required V1 journey step
- **THEN** Founder Acceptance fails and release readiness cannot begin

### Requirement: Original product expression
CodeQuest SHALL use the public Codédex product only to study general information architecture, workflows, layout concepts, learning objectives, progression patterns, and design principles. CodeQuest SHALL use original branding, artwork, curriculum prose, examples, exercises, solutions, validation tests, and implementation; private or paid reference content SHALL NOT be imported into planning or production assets.

#### Scenario: New curriculum is planned from reference topics
- **WHEN** an approved CodeQuest course covers a topic also visible in the reference product
- **THEN** its instructional material and assessments are independently authored and reviewed for originality
