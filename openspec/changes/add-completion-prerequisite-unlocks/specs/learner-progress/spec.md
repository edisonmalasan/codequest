# Spec Delta

## MODIFIED Requirements

### Requirement: Progress API and trusted frontend preserve authority

Implemented progress operations SHALL appear in backend OpenAPI and the regenerated frontend client. Protected quest, chapter, and Journey/Course progress reads SHALL also return owner-bound, backend-derived availability and published unmet-prerequisite explanations under `learner-unlocks`, separately from learning status and counts. The authenticated Journey page SHALL use the protected Journey progress and availability response as its accepted snapshot and identify accepted personal-learning completion as client-reported under ADR 0005. The lesson page SHALL record current-version start and hint use through trusted authenticated transport only when unlocked; failed recording SHALL not hide public lesson content or claim saved progress. Guest presentation SHALL remain clearly provisional and SHALL not send credentials or progress authority to learner execution or preview origins. No progress read or write SHALL award XP, levels, rewards, streaks, or stored unlocks.

#### Scenario: Authenticated Journey opens
- **WHEN** a signed-in learner opens a published Journey
- **THEN** map counts, completed nodes, availability, and prerequisite explanations reflect only the protected backend response

#### Scenario: Protected read fails
- **WHEN** an authenticated progress request fails
- **THEN** the page does not present an empty authoritative account snapshot or a client-inferred unlock state

#### Scenario: Progress and availability differ
- **WHEN** an owner starts an available quest without completing it
- **THEN** its progress status is `in_progress` while its availability remains `available`
