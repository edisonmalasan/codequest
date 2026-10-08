# Spec Delta

## ADDED Requirements

### Requirement: Static Preview offers bounded responsive inspection widths
The static preview surface SHALL provide named narrow and wide viewport choices for a current HTML/CSS snapshot, expose the selected width to assistive technology, and fit or contain the displayed frame without page-level horizontal overflow. Switching widths SHALL retain the same source snapshot, preserve drafts, and avoid learner-code execution, submission, or learning-state mutation. The dedicated origin, empty learner-frame sandbox, deny-by-default CSP, bounded correlated channel, and cancellation/cleanup rules SHALL remain in force for every width. If a requested width cannot be displayed, Preview SHALL report a recoverable error instead of silently changing its security mode.

#### Scenario: Learner compares media styles
- **WHEN** a learner switches a ready static Preview from wide to narrow
- **THEN** the same HTML/CSS snapshot is displayed at the named width without requiring a new Check or changing account facts

#### Scenario: Width changes after a failed preview
- **WHEN** the current preview has failed or timed out and the learner selects another width
- **THEN** old frames and messages cannot update the new preview, and editable source remains available
