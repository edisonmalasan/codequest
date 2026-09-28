# Spec Delta

## MODIFIED Requirements

### Requirement: Local-persistence skeleton isolates owners and drafts from outbox

The frontend SHALL evolve its existing IndexedDB-backed local database with separate `drafts` and `outbox` stores into the owner-scoped Phase 23 persistence foundation described in `local-persistence`. It SHALL preserve earlier draft and outbox data during schema upgrades, keep stable event IDs unique, and SHALL NOT add sync, merge, guest migration, or acceptance logic. Workspace preferences, downloaded public lessons, and guest-local state SHALL use this database rather than a parallel browser store.

#### Scenario: Drafts and outbox stay separated per owner
- **WHEN** drafts and outbox records are written for two different owners
- **THEN** queries scoped to one owner never return the other owner's records and outbox entries retain stable unique event IDs

#### Scenario: Schema upgrade retains old work
- **WHEN** an existing version-one or version-two local database is upgraded
- **THEN** source drafts and legacy outbox rows remain recoverable, with no automatic submission or authority claim
