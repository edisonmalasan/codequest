# Spec Delta

## MODIFIED Requirements

### Requirement: Quest states are derived without inventing authority

For an authenticated learner, the frontend SHALL render quest locks and prerequisite explanations from the protected backend availability response, and completion from protected backend progress; it SHALL NOT recompute accepted eligibility from browser completion IDs. A currently completed published quest SHALL render `completed`; an incomplete backend-locked quest SHALL render `locked`; the earliest ordered backend-available incomplete quest SHALL render as the active/current navigation cue; any other backend-available incomplete quest SHALL render `available`. Active/current SHALL be map emphasis, not a stored learning status. For a guest, the map MAY derive navigation from published prerequisites and clearly labeled provisional device facts, without claiming accepted unlock authority. A failed protected read SHALL not become an authoritative empty or unlocked state.

#### Scenario: Backend locks a prerequisite
- **WHEN** the protected response marks a quest locked and names an unmet published prerequisite
- **THEN** the map shows a non-interactive locked node with that explanation even if browser state claims completion

#### Scenario: One eligible quest is emphasized
- **WHEN** multiple incomplete quests are backend-available
- **THEN** only the earliest in Journey, Chapter, and Quest order is labeled active/current and the other eligible quests are labeled available

#### Scenario: Completed state comes from protected evidence
- **WHEN** backend progress marks a published quest currently completed
- **THEN** its node and chapter/Journey counts show completion without awarding XP or persisting progress in the client

#### Scenario: Protected progress is unavailable
- **WHEN** an authenticated Journey's protected progress or availability read fails
- **THEN** the page shows a recoverable unavailable state instead of asserting zero saved completion or local unlocks
