# Spec Delta

## ADDED Requirements

### Requirement: Catalog adapts its discovery composition to real publication

The catalog SHALL combine a concise illustrated introduction with clear search/filter controls and direct Course entries. With one published Course, it SHALL give that Course a complete featured presentation and preserve an understandable path through its Journey. With additional reviewed Courses, it SHALL present a browsable collection without changing Course identity, navigation, or filter semantics. Unpublished or unreviewed topics SHALL not be presented as selectable Courses.

#### Scenario: Sparse publication

- **WHEN** the backend publishes one complete Course
- **THEN** the catalog displays that Course, its owning Journey, summary, topic, and direct entry as the real available learning offer

#### Scenario: Search yields no published Course

- **WHEN** the selected filter and search find no published Course
- **THEN** the catalog gives a clear empty result and reset without decorating the gap with placeholder cards
