# Spec Delta

## MODIFIED Requirements

### Requirement: Hierarchy progress is derived from current publication

Protected Chapter, distinct Course, and Journey progress reads SHALL use the current published catalog as the ordered denominator and the owner's current-equivalent accepted stable-quest completions as the numerator. Each read SHALL return completed and total quest counts, a percentage derived as `floor(100 * completed / total)` (zero for an empty denominator), status, and ordered nested progress appropriate to its scope. Aggregate status SHALL be `completed` only when the nonempty scope is fully completed, `in_progress` when any contained quest has durable activity, and `not_started` otherwise. The legacy `/api/v1/courses/:slug/progress` route SHALL remain a read-only alias for the identical Journey representation during migration; the distinct Course progress route SHALL be `/api/v1/catalog/courses/:slug/progress`. No separate mutable Course aggregate SHALL be stored. Obsolete/unpublished quest history SHALL remain durable but SHALL NOT inflate current published counts.

#### Scenario: Partial chapter
- **WHEN** one of four currently published chapter quests is accepted as complete
- **THEN** chapter counts are 1/4, percentage is 25, and status is `in_progress`

#### Scenario: Course with multiple chapters
- **WHEN** a Course contains accepted and unfinished current quests across chapters
- **THEN** its owner-only Course progress derives the sum from only those published chapters and is `in_progress`

#### Scenario: Empty published Journey
- **WHEN** a published Journey has no quests
- **THEN** its count and percentage are zero and status is `not_started`

#### Scenario: Owner isolation
- **WHEN** another learner's accepted completion exists for the same quest
- **THEN** the current learner's progress remains unaffected

#### Scenario: Legacy progress alias
- **WHEN** an existing client reads `/api/v1/courses/:slug/progress` with a Journey slug
- **THEN** it receives the same Journey progress representation as before
