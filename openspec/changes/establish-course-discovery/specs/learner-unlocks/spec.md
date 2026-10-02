# Spec Delta

## MODIFIED Requirements

### Requirement: Chapter and Journey availability derives from quest availability

The backend SHALL derive a nonempty Chapter, Course, or Journey as `available` if at least one contained published quest is available or currently completed, and `locked` only if all contained quests are locked. A locked scope SHALL explain the unmet prerequisites of its earliest ordered quest; an empty published scope SHALL be browseable as `available` with no playable quest. The legacy Course alias SHALL continue to return Journey availability, while the distinct Course read SHALL return only its own contained-quest availability. Progress status and availability SHALL remain separate concepts.

#### Scenario: Chapter entry is locked
- **WHEN** every published quest in a chapter is locked
- **THEN** the chapter is locked and names the earliest quest's unmet prerequisites

#### Scenario: Distinct Course is locked
- **WHEN** every published quest in one Course is locked while another Course has an available quest
- **THEN** the first Course is locked with its own prerequisite explanation and the other Course's availability is unaffected

#### Scenario: Course alias is read
- **WHEN** the owner reads a Journey and its legacy Course alias
- **THEN** their derived availability and explanations match
