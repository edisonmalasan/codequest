# Learner Unlocks Specification

## Purpose

Make published completion prerequisites the backend authority for learner availability, with explainable self-only results across quests, chapters, and Journeys.

## Requirements

### Requirement: Quest availability uses current published prerequisites

For an authenticated owner, the backend SHALL derive each published quest's `available` or `locked` state from its active snapshot's stable prerequisite quest IDs and that owner's accepted completions. A completion SHALL satisfy a prerequisite only when its assessed version is active or has an explicitly approved compatible transition chain to the currently published prerequisite snapshot. A completed quest SHALL remain available for review when its completion is current-equivalent. A missing, incompatible, retired, or other-owner completion SHALL NOT satisfy a prerequisite. The backend SHALL return ordered, published quest identity and title for each unmet prerequisite and SHALL persist no mutable unlock flag.

#### Scenario: First quest has no prerequisites
- **WHEN** an owner reads availability for a published prerequisite-free quest
- **THEN** it is available with no unmet prerequisites

#### Scenario: Prerequisite is absent or incompatible
- **WHEN** a prerequisite has no owner completion or only an incompatible historical completion
- **THEN** the dependent quest is locked with a published explanation naming that prerequisite

#### Scenario: Compatible historical completion
- **WHEN** an older accepted prerequisite completion reaches the current snapshot through approved compatible transitions
- **THEN** it satisfies the dependent quest without rewriting history

### Requirement: Chapter and Journey availability derives from quest availability

The backend SHALL derive a nonempty chapter or Journey/Course as `available` if at least one contained published quest is available or currently completed, and `locked` only if all contained quests are locked. A locked scope SHALL explain the unmet prerequisites of its earliest ordered quest; an empty published scope SHALL be browseable as `available` with no playable quest. The Course alias SHALL return the same availability as its Journey. Progress status and availability SHALL remain separate concepts.

#### Scenario: Chapter entry is locked
- **WHEN** every published quest in a chapter is locked
- **THEN** the chapter is locked and names the earliest quest's unmet prerequisites

#### Scenario: Course alias is read
- **WHEN** the owner reads a Journey and its Course alias
- **THEN** their derived availability and explanations match

### Requirement: Locked account activity cannot bypass prerequisites

The backend SHALL reject a new authenticated start, hint-use, or attempt submission for a locked published quest before writing an activity or completion fact. It SHALL check availability against current publication and owner-bound, version-compatible accepted completions. A retry of an already-recorded client event SHALL preserve its original outcome and SHALL NOT create a new attempt or unlock. Public lesson reading and browser-local Check SHALL remain available under their existing boundaries, without claiming accepted access.

#### Scenario: New locked attempt
- **WHEN** an owner submits a new passing or failing attempt for a locked quest
- **THEN** the backend rejects it without recording an attempt, completion, XP, streak day, or unlock

#### Scenario: Replay after publication changes
- **WHEN** an owner retries an identical previously recorded event after prerequisite publication changes
- **THEN** the original idempotent result is returned without a new learning fact

### Requirement: Availability reads are owner-bound and guest claims are provisional

Protected availability SHALL derive owner exclusively from the verified principal and SHALL expose no other learner's completions. It SHALL appear through versioned OpenAPI and the generated trusted client. A guest map MAY use published prerequisites and device-local provisional facts for navigation, but SHALL label this as provisional and SHALL NOT claim backend unlocks, persist an accepted unlock, or send credentials to learner execution. A failed protected read SHALL NOT become an authoritative unlocked or empty account snapshot.

#### Scenario: Other owner's completion exists
- **WHEN** another learner completes the required quest
- **THEN** the current learner's dependent quest remains locked

#### Scenario: Guest views the map
- **WHEN** a guest views curriculum without accepted account facts
- **THEN** any displayed eligibility is explicitly provisional
