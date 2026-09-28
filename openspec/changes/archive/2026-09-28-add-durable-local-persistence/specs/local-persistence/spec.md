# Spec Delta

## Purpose

Keep bounded learner work and public lesson material on one device through reloads and offline periods while isolating owners and preserving backend learning authority.

## ADDED Requirements

### Requirement: Device records are owner-scoped and versioned

The frontend SHALL persist editor drafts, workspace preferences, downloaded public lesson snapshots, guest-local state, and pending operations in one local database. Every record SHALL have a stable identity and schema or content version appropriate to its kind, and reads and removals SHALL be scoped to its originating owner. A guest bucket SHALL remain separate from authenticated owner buckets. Existing stored drafts and outbox rows SHALL survive a forward schema upgrade without silently becoming accepted learning facts or replayable new-format operations.

#### Scenario: Account changes on one device
- **WHEN** two owners use the same workspace or lesson identity
- **THEN** each owner reads only its own saved records, and guest records remain separate

#### Scenario: Existing database upgrades
- **WHEN** a database containing older draft and outbox rows is opened with the new schema
- **THEN** the old rows remain recoverable without being misrepresented as new-format pending operations

### Requirement: Draft and preference storage has bounded, explicit behavior

The frontend SHALL save and restore bounded source drafts by owner, workspace, and file and bounded workspace preferences by owner and workspace. It SHALL reject oversize or malformed writes before replacing a previously valid value, return a clear storage failure when IndexedDB is unavailable or full, and SHALL NOT report a failed write as saved. Unchanged draft snapshots SHALL NOT cause duplicate durable writes.

#### Scenario: Preference restores independently
- **WHEN** an owner reopens a workspace with a saved active file preference
- **THEN** that file is selected when still present without replacing independently saved source

#### Scenario: Storage refuses a draft
- **WHEN** a draft exceeds the local bound or storage rejects a write
- **THEN** the current editable source remains available in memory and the previously durable record is not replaced by the rejected payload

### Requirement: Downloaded lessons are public version-pinned snapshots

The frontend SHALL provide owner-scoped storage and lookup of bounded public published lesson snapshots by stable quest identity and content and assessment version. A lookup for a different or unsupported version SHALL NOT return a stale snapshot as current. Storage SHALL exclude session credentials, protected progress responses, and backend authority claims. Persisting a snapshot SHALL NOT by itself assert offline account completion, unlocks, or freshness of later publications.

#### Scenario: Publication version changes
- **WHEN** a caller requests a lesson version different from the locally stored version
- **THEN** the old snapshot is not presented as that version and remains separately identifiable for explicit handling

### Requirement: Guest-local and pending-operation primitives do not claim authority

The frontend SHALL provide bounded guest-local keyed state and durable pending-operation envelopes with stable event ID, originating owner, operation type, payload version, content and assessment versions where relevant, creation time, and bounded payload. Creating, listing, or removing these records SHALL be owner-scoped and SHALL NOT send a request, import guest progress, choose an account target, accept completion, or award progress or rewards. A duplicate event ID with different content SHALL be rejected without overwriting the original envelope; an identical retry SHALL preserve it.

#### Scenario: Duplicate pending event
- **WHEN** the same event ID is queued twice with different payloads or owners
- **THEN** the first durable envelope remains unchanged and the conflicting write is rejected

#### Scenario: Guest state is recorded
- **WHEN** a guest stores a provisional local value
- **THEN** it can be read from that device without becoming authenticated progress or a submitted attempt

### Requirement: Local failure and retention remain truthful

The frontend SHALL expose local storage unavailability, quota, and malformed-record errors to callers without deleting editable source or silently discarding pending work. Local records SHALL be described as device-only and removable by their owner scope; clearing browser data MAY remove them. No source, token, protected response, or pending payload SHALL be sent to analytics or a learner execution compartment as a side effect of local persistence.

#### Scenario: IndexedDB is unavailable
- **WHEN** a local read or write fails because browser storage is unavailable
- **THEN** the caller receives a failure and the UI does not claim the work was saved or synchronized
