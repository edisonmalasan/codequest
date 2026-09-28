# Learner Levels Specification

## Purpose

Give authenticated learners a deterministic, clearly provisional level view derived solely from their backend XP ledger total.

## Requirements

### Requirement: Level and boundaries derive from total XP
The backend SHALL derive current level, XP earned within that level, XP needed for the next level, and cumulative XP boundaries from the authenticated owner's ledger total. Level 1 SHALL start at zero XP. The provisional linear curve SHALL require 100 XP per level, so each exact boundary starts the next level with zero XP within it; no terminal level is imposed. Level SHALL NOT be stored or accepted from a client as mutable authority.

#### Scenario: Initial and just-before-boundary totals
- **WHEN** total XP is 0 or 99
- **THEN** current level is 1, XP within level is respectively 0 or 99, and XP remaining is respectively 100 or 1

#### Scenario: Exact and beyond-boundary totals
- **WHEN** total XP is 100 or 235
- **THEN** current level is respectively 2 or 3, XP within level is respectively 0 or 35, and cumulative next boundaries are respectively 200 or 300

### Requirement: Protected level read extends authoritative XP response
The existing versioned owner-only XP read SHALL include total XP, current level, current-level start XP, next-level cumulative XP boundary, XP within the current level, XP remaining to the next level, a stable curve identifier, and an explicit provisional flag. All numeric fields SHALL describe the same ledger snapshot and curve. Unauthenticated or unauthorized callers SHALL receive no account level data; forged client totals or levels SHALL have no effect.

#### Scenario: Another owner's XP changes
- **WHEN** another learner earns XP and the current learner reads their level
- **THEN** the current learner's total and derived level remain unchanged

#### Scenario: Read denied
- **WHEN** a guest requests account XP and level
- **THEN** the protected operation denies the request without account data

### Requirement: Account presentation qualifies provisional progression
The authenticated account page SHALL present the backend's level, total XP, and XP toward the next level with accessible text and progress semantics. It SHALL identify the curve as provisional and SHALL NOT invent a level name or imply mastery. A failed or malformed protected read SHALL show an unavailable state, not a fabricated zero. Guest and local-only results SHALL NOT appear as accepted account levels.

#### Scenario: XP read succeeds
- **WHEN** the account is established and protected XP read succeeds
- **THEN** the page displays the server-provided level and progress against the next boundary

#### Scenario: XP read fails
- **WHEN** the protected read fails after account establishment
- **THEN** account details remain available while level progress is marked unavailable
