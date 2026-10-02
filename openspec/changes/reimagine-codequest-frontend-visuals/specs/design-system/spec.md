# Spec Delta

## ADDED Requirements

### Requirement: Production visual roles support varied learning surfaces

The semantic design system SHALL support a distinctive page canvas, media and illustration treatment, readable instructional surface, editor and result surfaces, navigation, and clear primary and secondary actions. Components SHALL use shared visual roles rather than route-specific duplicated color literals. Existing reward, discovery, success, danger, focus, and muted meanings SHALL remain distinguishable and meet the applicable contrast requirements.

#### Scenario: Screen family renders from shared roles

- **WHEN** Home, catalog, Course, authentication, account, and lesson views render
- **THEN** their background, text, control, and state treatments form a recognizable system while instructional prose and editor/results remain readable in their own contexts

### Requirement: Original artwork has a documented product role

New production artwork SHALL be original or have documented compatible provenance, use appropriate responsive dimensions, and support a specific course, chapter, world, or learning-story purpose. Text SHALL not depend on decorative art for legibility or meaning, and decorative assets SHALL not imitate unavailable product functionality.

#### Scenario: Original Course artwork is added

- **WHEN** a new Course or chapter illustration ships
- **THEN** its asset record identifies its source, role, dimensions, and accessibility treatment and the page remains usable if the image fails to load
