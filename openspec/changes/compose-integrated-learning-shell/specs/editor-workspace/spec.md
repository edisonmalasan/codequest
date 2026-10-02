# Spec Delta

## ADDED Requirements

### Requirement: Optional host composition preserves reusable workspace behavior

The Editor Workspace SHALL allow an approved parent to present its editor and output/result surfaces in distinct host regions while preserving one owner-scoped source, draft, active file, execution, preview, validation, and submission state machine. Standalone workspace usage SHALL continue to work without a curriculum parent. Layout changes, responsive panel switches, and host navigation SHALL NOT duplicate execution, Check, or submission actions or release current source solely because a region changes visibility.

#### Scenario: Quest host presents three regions

- **WHEN** the Quest host places lesson, editor, and output in separate visible desktop regions
- **THEN** the Editor Workspace keeps one active file and one correlated set of runtime and validation results across those regions

#### Scenario: Standalone workspace remains available

- **WHEN** the reusable workspace is opened without a Quest host
- **THEN** its existing editing, panels, local actions, and owner-scoped draft behavior remain available
