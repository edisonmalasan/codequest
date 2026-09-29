## MODIFIED Requirements

### Requirement: Curriculum architecture remains separate from delivery and learning behavior

The curriculum-content capability SHALL own authored content structure, schema/validation tooling, publication selection, draft examples, CI integration, and documentation. It SHALL NOT itself add database projections or migrations, generated frontend operations, learner execution, Check/Submit acceptance, progress, XP award computation, unlock enforcement, guest import, or offline synchronization. Complete instructional courses SHALL be owned by separately approved curriculum capabilities and selected only through the reviewed publication contract. Historical representative snapshots SHALL remain immutable and unselected unless explicitly reviewed; a new reviewed snapshot MAY replace their public selection without overwriting them. The Phase 30 capstone SHALL remain separate from Phase 29 instructional publication.

#### Scenario: Phase boundary is inspected

- **WHEN** authored and publication files are reviewed
- **THEN** they define content and reviewed visibility only, while API transport and all learning-state behavior remain owned by their respective capabilities
