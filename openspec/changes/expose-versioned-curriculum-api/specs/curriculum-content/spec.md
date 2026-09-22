## ADDED Requirements

### Requirement: Publication selection is explicit, reviewed, and separate from drafts

The authored curriculum tree SHALL include one backend-owned publication manifest that selects active Journey and quest snapshot versions by stable identity. Selection SHALL require explicit curriculum and technical approval, SHALL preserve Git as the authored source of truth, and SHALL NOT make unselected or draft material API-visible. The manifest SHALL be deterministic, bounded, versioned, validated with the authored tree in CI, and unable to introduce hierarchy, content, assessment, prerequisite, or reward metadata not already present in selected authored snapshots.

#### Scenario: Reviewed snapshot is selected
- **WHEN** both required reviews approve an authored Journey and its complete selected quest-version set
- **THEN** validation produces one internally consistent publication selection without editing or replacing the authored snapshots

#### Scenario: Draft snapshot remains unselected
- **WHEN** valid draft content exists without an approved publication entry
- **THEN** authoring validation can pass while publication delivers none of that content

## MODIFIED Requirements

### Requirement: Curriculum architecture remains separate from delivery and learning behavior

The curriculum-content capability SHALL own authored content structure, schema/validation tooling, publication selection, draft examples, CI integration, and documentation. It SHALL NOT itself add database projections or migrations, generated frontend operations, learner execution, Check/Submit acceptance, progress, XP award computation, unlock enforcement, guest import, offline synchronization, or a completed 24-plus-capstone course. A representative authored fixture SHALL remain explicitly draft and unavailable as a product journey until separately reviewed and selected by the publication contract.

#### Scenario: Phase boundary is inspected
- **WHEN** authored and publication files are reviewed
- **THEN** they define content and reviewed visibility only, while API transport and all learning-state behavior remain owned by their respective capabilities
