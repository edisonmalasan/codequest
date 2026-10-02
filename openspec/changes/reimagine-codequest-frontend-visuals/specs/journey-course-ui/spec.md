# Spec Delta

## ADDED Requirements

### Requirement: Course map exposes readable chapter and exercise rhythm

The Course map SHALL make chapter order, chapter objective, exercise order, exercise title, state, and next eligible action easy to scan at desktop and mobile widths. The design MAY use a route or world motif, but it SHALL preserve semantic chapter and quest lists, meaningful text labels, prerequisite explanations, and existing link versus locked-node behavior.

#### Scenario: Learner scans a long Course

- **WHEN** a learner reviews a Course with multiple chapters and exercises
- **THEN** chapter boundaries and the current or next eligible exercise are visually clear without reducing exercise names or state labels to miniature text

#### Scenario: Learner inspects a locked exercise

- **WHEN** a quest is backend-locked or provisionally unavailable to a guest
- **THEN** its larger visual target still communicates the locked state and prerequisite explanation without becoming an active link
