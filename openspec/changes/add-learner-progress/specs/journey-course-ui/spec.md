# Spec Delta

## MODIFIED Requirements

### Requirement: Quest states are derived without inventing authority

The frontend SHALL derive map presentation from published prerequisite IDs plus a supplied set of completed stable quest IDs. A completed ID SHALL render `completed`; an incomplete quest with an unmet prerequisite SHALL render `locked`; the earliest ordered eligible incomplete quest SHALL render as the active/current navigation cue; and any other eligible incomplete quest SHALL render `available`. Active/current SHALL be a map emphasis, not a stored learning status or accepted completion claim. An authenticated Journey page SHALL obtain its accepted completion snapshot from the protected backend progress response; a guest snapshot SHALL remain explicitly provisional. A failed protected read SHALL not be interpreted as an authoritative empty completion set.

#### Scenario: Prerequisites determine availability
- **WHEN** a quest depends on a stable quest ID absent from the supplied completion set
- **THEN** the dependent quest is labeled locked while prerequisite-free or satisfied incomplete quests remain eligible

#### Scenario: One eligible quest is emphasized
- **WHEN** multiple incomplete quests are eligible
- **THEN** only the earliest in Journey, Chapter, and Quest order is labeled active/current and the other eligible quests are labeled available

#### Scenario: Completed state comes from supplied evidence
- **WHEN** a stable quest ID appears in the supplied accepted completion set
- **THEN** its node and chapter/journey counts show completion without awarding XP, persisting progress, or treating the client model as backend acceptance

#### Scenario: Protected progress is unavailable
- **WHEN** an authenticated Journey's protected progress read fails
- **THEN** the page shows a recoverable unavailable state instead of asserting zero saved completion

