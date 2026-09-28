# Spec Delta

## MODIFIED Requirements

### Requirement: Phase 17 has no later learning side effects

Attempt creation and completion acceptance SHALL NOT compute progress aggregates, issue rewards beyond the specified first-completion XP event and qualifying streak day, or unlock content. First accepted completion SHALL atomically award the Phase 19 quest XP event under the `quest-xp` specification and MAY create one Phase 21 qualifying day under the `learner-streaks` specification; no other attempt SHALL award XP or create a streak day. Local Run and Check SHALL remain browser-isolated feedback and SHALL NOT submit automatically. No LLM grading or remote runner SHALL be introduced.

#### Scenario: Local check passes
- **WHEN** a local Check returns passing feedback without an explicit authenticated Submit
- **THEN** no backend learning, XP, or streak record changes
