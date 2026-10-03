# Spec Delta

## ADDED Requirements

### Requirement: Home presents an immersive public learning entry

The production Home SHALL open with a prominent CodeQuest learning scene and a clear action into currently published curriculum, followed by a scannable real learning offer and supporting explanations of the working exercise flow. Its content SHALL only link to available routes, SHALL distinguish present features from future ambitions, and SHALL retain useful actions during curriculum loading, empty, and failure states.

#### Scenario: One Journey is published

- **WHEN** Home receives one published Journey
- **THEN** that Journey receives a substantial, navigable presentation without fabricated peer Journeys or unavailable feature links

#### Scenario: Curriculum is unavailable

- **WHEN** the public curriculum request fails
- **THEN** the opening learning action and following section communicate the unavailable state without claiming a Course was loaded
