# Spec Delta

## Purpose

Provide an authenticated learner with accurate, owner-scoped progress derived from published curriculum and durable backend learning facts.

## ADDED Requirements

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

The backend SHALL expose a protected owner-only progress read for each published quest. It SHALL return stable quest ID, `not_started`, `in_progress`, or `completed`, nullable started/completed/last-activity timestamps, attempt count, and distinct published-hint use count. Accepted Phase 17 completion for the same owner and stable quest SHALL be the only completed signal and SHALL take precedence over starts, hints, and attempts. An owned start, hint use, or attempt SHALL make an incomplete quest `in_progress`. Started time SHALL be the earliest meaningful start, hint, or attempt; completion time SHALL be the accepted-completion server timestamp; last activity SHALL be the latest durable start, hint, attempt, or completion timestamp. Existing Phase 17 attempts without a start SHALL remain visible as in progress.

#### Scenario: No learning fact exists
- **WHEN** the owner reads a published quest without an activity fact
- **THEN** status is `not_started`, counts are zero, and timestamps are null

#### Scenario: Legacy attempt exists
- **WHEN** an owner has an earlier Phase 17 attempt but no start fact
- **THEN** status is `in_progress`, started time derives from the earliest attempt, and attempt count reflects all owner attempts

#### Scenario: Completion remains authoritative
- **WHEN** a passing local Check or forged hint request occurs without backend acceptance
- **THEN** the quest is not completed; only an accepted completion fact can produce `completed`

### Requirement: Hierarchy progress is derived from current publication

Protected chapter and Journey progress reads SHALL use the current published catalog as the ordered denominator and the owner's accepted stable-quest completions as the numerator. Each read SHALL return completed and total quest counts, a percentage derived as `floor(100 * completed / total)` (zero for an empty denominator), status, and ordered nested progress. Aggregate status SHALL be `completed` only when the nonempty scope is fully completed, `in_progress` when any contained quest has durable activity, and `not_started` otherwise. The Course route SHALL be a read-only alias for the identical Journey representation; it SHALL NOT create a separate Course identity or stored aggregate. Obsolete/unpublished quest history SHALL remain durable but SHALL NOT inflate current published counts.

#### Scenario: Partial chapter
- **WHEN** one of four currently published chapter quests is accepted as complete
- **THEN** chapter counts are 1/4, percentage is 25, and status is `in_progress`

#### Scenario: Empty published Journey
- **WHEN** a published Journey has no quests
- **THEN** its count and percentage are zero and status is `not_started`

#### Scenario: Owner isolation
- **WHEN** another learner's accepted completion exists for the same quest
- **THEN** the current learner's progress remains unaffected

### Requirement: Progress API and trusted frontend preserve authority

Implemented progress operations SHALL appear in backend OpenAPI and the regenerated frontend client. The authenticated Journey page SHALL use the protected Journey progress response as its accepted completion snapshot and identify accepted personal-learning completion as client-reported under ADR 0005. The lesson page SHALL record current-version start and hint use through trusted authenticated transport; failed recording SHALL not hide lesson content or claim saved progress. Guest presentation SHALL remain clearly provisional and SHALL not send credentials or progress authority to learner execution or preview origins. No progress read or write SHALL award XP, levels, rewards, streaks, or unlocks.

#### Scenario: Authenticated Journey opens
- **WHEN** a signed-in learner opens a published Journey
- **THEN** map counts and completed nodes reflect only their protected backend progress

#### Scenario: Protected read fails
- **WHEN** an authenticated progress request fails
- **THEN** the page does not present an empty authoritative account snapshot as saved progress
