# Spec Delta

## Purpose

Recognize personal learning milestones through stable, explainable achievements derived from backend-accepted learning facts.

## ADDED Requirements

### Requirement: Achievement catalog is stable and explainable

The backend SHALL publish an ordered achievement catalog with stable identifiers, original titles and descriptions, accessible presentation metadata, and explicit deterministic criteria tied only to eligible accepted learning facts. A published criterion SHALL remain immutable for its achievement version; a materially changed criterion SHALL use a new version or identifier and SHALL NOT silently rewrite previously earned outcomes. The catalog SHALL NOT advertise rarity, mastery, certification, job readiness, or competitive rank.

The initial catalog SHALL include recognition for the first accepted quest completion, the first completed published chapter, and the first completed published course. Chapter and course completion SHALL use the stable quest identities in the corresponding published scope snapshot; historical facts SHALL qualify only when current-equivalent under the existing curriculum compatibility rules.

#### Scenario: Learner reads the catalog
- **WHEN** a learner requests the published achievement catalog
- **THEN** the response contains stable definitions and learner-readable criteria in deterministic order

#### Scenario: Achievement criteria change
- **WHEN** a milestone definition needs a material criteria change
- **THEN** the published definition version remains unchanged and the revised criterion receives a new version or identifier

#### Scenario: Published scope content changes
- **WHEN** quests are added to or removed from a chapter or course after an achievement scope snapshot is published
- **THEN** the existing achievement criterion keeps its original stable quest set and a changed scope uses a new achievement identifier

### Requirement: Earned achievements derive from accepted learning facts

The authenticated achievement read SHALL derive earned state and earned time from that verified owner's backend-accepted, current-equivalent stable quest completions and other explicitly named durable learning facts. Local Check results, attempts that were not accepted, starts, hints, app opens, client timestamps, guest timestamps, and pending offline operations SHALL NOT satisfy achievement criteria. Derivation SHALL be deterministic, replay-safe, and owner-scoped; the client SHALL NOT submit achievement IDs, earned flags, totals, or timestamps as authority.

#### Scenario: Milestone is met by accepted completions
- **WHEN** a learner's accepted current-equivalent completions satisfy a published criterion
- **THEN** the protected read reports that achievement as earned with a deterministic backend-fact time

#### Scenario: Client reports an unaccepted pass
- **WHEN** a client supplies a passing Check, a completion claim, or a client timestamp without backend acceptance
- **THEN** no achievement is earned from that report

#### Scenario: Another owner's facts exist
- **WHEN** another learner has satisfied the same criterion
- **THEN** the current learner's achievement result remains based only on their own facts

### Requirement: Achievement claims preserve personal-learning trust

Achievement presentation SHALL label completion-based awards as personal-learning recognition under ADR 0005. It SHALL NOT describe them as independently graded ability or verified mastery. Earning an achievement SHALL grant no XP, streak credit, unlock, competitive score, certificate, or other reward unless a separately approved capability defines that award source.

#### Scenario: Accepted completion produces a milestone
- **WHEN** an achievement is earned from a first backend-accepted quest completion
- **THEN** the UI presents its personal-learning meaning and does not change the XP ledger or streak policy

#### Scenario: Achievement is shown on the profile
- **WHEN** an owner opens their private achievements view
- **THEN** earned and unearned states include text and accessible semantics and expose no other owner's result

### Requirement: Achievement state refreshes from trusted reads

The frontend SHALL refresh achievement state after backend acceptance and after an outbox replay is confirmed. Failed, pending, duplicate, or uncertain operations SHALL retain truthful pending or unavailable states and SHALL NOT optimistically show an earned account achievement.

#### Scenario: Accepted replay earns an achievement
- **WHEN** reconnect replay is confirmed by the backend and satisfies a published criterion
- **THEN** the refreshed protected read shows the earned state

#### Scenario: Submission response is uncertain
- **WHEN** the client cannot determine whether a completion was accepted
- **THEN** the achievement remains pending or unavailable until a trusted read confirms the backend fact
