## MODIFIED Requirements

### Requirement: Curriculum delivery remains read-only and phase-bounded

The curriculum API SHALL NOT add author/admin mutations, database projection or migration, enrollment, attempts, submissions, completion acceptance, progress, XP awards, levels, streaks, unlock enforcement, guest import, offline synchronization, learner execution, or analytics. Those behaviors SHALL remain owned by their approved capabilities. The API SHALL deliver separately approved instructional curriculum only through the existing reviewed publication selection and SHALL NOT publish the original draft Q01 1.0.0 fixture. Content authoring SHALL remain owned by the curriculum capabilities rather than API transport.

#### Scenario: Completed Phase 10 diff is reviewed

- **WHEN** the Apply diff and OpenAPI document are inspected
- **THEN** curriculum operations remain read-only with no new learning-state authority and deliver only selected reviewed snapshots
