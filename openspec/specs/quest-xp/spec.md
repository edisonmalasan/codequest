# Quest XP Specification

## Purpose

Award and expose durable personal-learning XP from first accepted quest completions while preventing repeated or forged reward-source writes.

## Requirements

### Requirement: First accepted completion awards one owner-bound XP event
The backend SHALL create a positive XP event in the same logical transaction as the first accepted completion for a learner and stable quest ID. The event SHALL record an immutable unique reward source, owner, amount from the published quest snapshot at acceptance, and server award time. Failed acceptance, local Check, start, hint use, and practice after completion SHALL create no XP event. The client SHALL NOT specify event owner, source, amount, or time.

#### Scenario: First eligible completion
- **WHEN** the backend first accepts an eligible published quest completion for an authenticated learner
- **THEN** one owner-bound quest-completion XP event is committed with that completion

#### Scenario: Acceptance fails
- **WHEN** a report or prerequisite is rejected or the award cannot be committed
- **THEN** no completion and no XP event are partially committed

### Requirement: Reward-source uniqueness prevents replay farming
The backend SHALL enforce at most one XP event per owner and stable quest-completion reward source independently of client attempt event IDs, across retries, concurrent submissions, content versions, and devices. Replays SHALL preserve the original amount and time. Historical awards SHALL remain after publication edits or retirement.

#### Scenario: New attempt after completion
- **WHEN** an owner submits another passing attempt for the same stable quest with a new event ID
- **THEN** it may be saved as practice but grants no further XP

#### Scenario: Exact retry
- **WHEN** the same accepted attempt is retried
- **THEN** its original accepted outcome is returned without a new award

### Requirement: Protected total XP is derived from ledger
The backend SHALL expose a versioned, authenticated self-only XP read with nonnegative total XP derived from the owner's durable XP events. It SHALL NOT accept a client-supplied total or expose another owner's events. The response SHALL identify the accepted personal-learning nature of the XP under ADR 0005. No level, streak, achievement, unlock, or broader reward behavior is included.

#### Scenario: Owner reads total
- **WHEN** an authenticated owner with two XP events reads their XP
- **THEN** the response total equals the sum of those events and excludes other owners

#### Scenario: No authenticated principal
- **WHEN** a guest requests account XP
- **THEN** the protected operation denies the request without revealing account data
