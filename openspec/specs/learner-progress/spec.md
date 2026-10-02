# Learner Progress Specification

## Purpose

Provide an authenticated learner with accurate, owner-scoped progress derived from published curriculum and durable backend learning facts.

## Requirements

### Requirement: Protected activity facts are owner-bound and idempotent

The backend SHALL expose versioned, authenticated operations to record a first quest start and first use of each published hint key (`question`, `concept`, `nextStep`). It SHALL derive the owner only from the verified principal, require progress-write permission, bind activity to a published quest and active content version, use server timestamps, and reject payload-supplied user identity, status, completion, counts, or timestamps. Repeating an identical start or hint use SHALL create no duplicate fact and SHALL preserve its first timestamp. Guest and local-only interactions SHALL create no backend fact.

#### Scenario: First start and repeat
- **WHEN** an authenticated learner starts a current published quest twice
- **THEN** one owner-scoped start exists with its original server timestamp

#### Scenario: Hint use is recorded
- **WHEN** an authenticated learner opens the current published `concept` hint twice
- **THEN** one `concept` use exists and the quest hint count is one

#### Scenario: Forged progress is submitted
- **WHEN** an activity request supplies an owner, completion flag, client timestamp, or unsupported hint/version
- **THEN** the backend rejects it without creating progress authority

### Requirement: Quest progress reflects durable learning facts

The backend SHALL expose a protected owner-only progress read for each published quest. It SHALL return stable quest ID, `not_started`, `in_progress`, or `completed`, nullable started/completed/last-activity timestamps, attempt count, and distinct published-hint use count. An accepted Phase 17 completion for the same owner and stable quest SHALL be the only completed signal, provided its assessed version is active or reaches the active snapshot through an explicitly approved compatible publication-transition chain. An incompatible historical completion SHALL remain durable and visible in owner attempt history but SHALL NOT claim current completion. An owned start, hint use, or attempt SHALL make an incomplete quest `in_progress`. Started time SHALL be the earliest meaningful start, hint, or attempt; current completion time SHALL be the eligible accepted-completion server timestamp; last activity SHALL be the latest durable start, hint, attempt, or completion timestamp. Existing Phase 17 attempts without a start SHALL remain visible as in progress.

#### Scenario: No learning fact exists
- **WHEN** the owner reads a published quest without an activity fact
- **THEN** status is `not_started`, counts are zero, and timestamps are null

#### Scenario: Legacy attempt exists
- **WHEN** an owner has an earlier Phase 17 attempt but no start fact
- **THEN** status is `in_progress`, started time derives from the earliest attempt, and attempt count reflects all owner attempts

#### Scenario: Completion remains authoritative
- **WHEN** a passing local Check or forged hint request occurs without backend acceptance
- **THEN** the quest is not completed; only an accepted completion fact can produce `completed`

#### Scenario: Historical completion is incompatible with current publication
- **WHEN** an accepted completion assessed an older version with an incompatible or missing transition to the active snapshot
- **THEN** current quest progress is `in_progress` with no current completion time, while the accepted historical attempt remains in owner history

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

### Requirement: Progress API and trusted frontend preserve authority

Implemented progress operations SHALL appear in backend OpenAPI and the regenerated frontend client. Protected Quest, Chapter, distinct Course, and Journey progress reads SHALL also return owner-bound, backend-derived availability and published unmet-prerequisite explanations under `learner-unlocks`, separately from learning status and counts. The authenticated Journey page SHALL use the protected Journey progress and availability response as its accepted snapshot and identify accepted personal-learning completion as client-reported under ADR 0005. The lesson page SHALL record current-version start and hint use through trusted authenticated transport only when unlocked; failed recording SHALL not hide public lesson content or claim saved progress. Guest presentation SHALL remain clearly provisional and SHALL not send credentials or progress authority to learner execution or preview origins. No progress read or write SHALL award XP, levels, rewards, streaks, or stored unlocks.

#### Scenario: Authenticated Journey opens
- **WHEN** a signed-in learner opens a published Journey
- **THEN** map counts, completed nodes, availability, and prerequisite explanations reflect only the protected backend response

#### Scenario: Protected read fails
- **WHEN** an authenticated progress request fails
- **THEN** the page does not present an empty authoritative account snapshot or a client-inferred unlock state

#### Scenario: Progress and availability differ
- **WHEN** an owner starts an available quest without completing it
- **THEN** its progress status is `in_progress` while its availability remains `available`
