# Spec Delta

## ADDED Requirements

### Requirement: Course path pairs chapter rhythm with truthful learner context

The published Course view SHALL make its chapter progression read as one connected learning path and provide a visually distinct area for the next eligible action and learner context. Course progress, XP, rewards, or unlock cues in that area SHALL use only their existing trusted or explicitly provisional sources; if protected facts are unavailable, the area SHALL state that limit. On narrow screens, the path and context SHALL reflow without losing chapter order, prerequisite explanation, or usable targets.

#### Scenario: Guest opens a published Course

- **WHEN** a guest views the Course map
- **THEN** its next supported guest exercise is clear, any local state is labeled device-local, and locked exercises retain their prerequisite explanations

#### Scenario: Account progress read fails

- **WHEN** the protected Course progress response fails
- **THEN** the Course outline remains readable but the learner-context area does not fabricate zero progress, rewards, or unlocked actions
