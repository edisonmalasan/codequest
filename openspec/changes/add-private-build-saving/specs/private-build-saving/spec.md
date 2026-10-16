# Spec Delta

## Purpose

Let a signed-in learner deliberately save and reopen a private bounded web Build across devices while retaining local source recovery and backend-enforced ownership.

## ADDED Requirements

### Requirement: Private Build snapshots are authenticated and owner-bound

The backend SHALL expose versioned private Build create/save, list, read, and delete operations. It SHALL derive the owner only from the verified principal and SHALL return no Build source or metadata to a different owner or an anonymous caller. A Build SHALL retain a stable identity across devices, and a private snapshot SHALL NOT create a public page.

#### Scenario: Owner reopens on another device

- **WHEN** a signed-in learner saves a Build and later reads the same Build from a different device under the same verified account
- **THEN** the backend returns that learner's saved snapshot and revision

#### Scenario: Another account requests a Build

- **WHEN** a different signed-in account guesses the Build ID or supplies the first owner's ID in a request
- **THEN** it cannot read, update, delete, or enumerate that Build and the supplied owner value has no authority

### Requirement: Cloud snapshots have bounded compatible content

The backend SHALL accept only the reviewed Build manifest and supported version with exactly the identified HTML, CSS, and JavaScript files, bounded source and metadata, and a valid stable Build ID. It SHALL reject malformed, oversized, or unsupported snapshots without replacing a previously saved version. Saving or reading a Build SHALL NOT execute its code.

#### Scenario: Unsupported project is saved

- **WHEN** a client submits an extra file, an unsupported manifest version, or source beyond the reviewed bound
- **THEN** the backend rejects the write and preserves the last accepted snapshot

### Requirement: Save conflicts and uncertain responses preserve source

Each accepted private Build write SHALL advance a server revision only when the submitted snapshot differs and the expected revision matches. Repeating the exact snapshot against its immediately succeeding revision SHALL be idempotent. A stale or competing write SHALL return a conflict with safe revision metadata and SHALL NOT overwrite the accepted snapshot. The frontend SHALL retain local editable source and present an explicit reconciliation choice when local and cloud versions differ or a response is uncertain; it SHALL NOT silently use last-write-wins.

#### Scenario: A save response is lost

- **WHEN** the backend accepts a save but the client loses the response and retries the same snapshot against the original revision
- **THEN** the retry does not create another revision or replace a newer different snapshot, and the client can reconcile by reading the current owner-bound snapshot

#### Scenario: Two devices edit from one revision

- **WHEN** one device saves a new version before another device submits a different snapshot based on the old revision
- **THEN** the second device receives a conflict, keeps its editable local source, and is not told its work was cloud saved

### Requirement: Local, guest, and account save states are truthful

Existing Build drafts SHALL remain owner-scoped and device-local; local autosave SHALL NOT imply account backup. Cloud saving SHALL require an explicit signed-in action and a confirmed backend response or owner-bound reconciliation. Guest Builds SHALL NOT automatically attach to an account at signup or login; an explicit copy into the account scope SHALL preserve the guest original until the account copy is safely durable. Offline, authentication, quota, and API failures SHALL leave current source editable and communicate whether the cloud state is confirmed, pending, conflicted, or unavailable.

#### Scenario: Guest signs in with a local Build

- **WHEN** a guest with an existing local Build signs in
- **THEN** the guest Build remains in the guest bucket until the learner explicitly copies it, and no backend project is created by the sign-in event

#### Scenario: Device is offline after local edits

- **WHEN** the learner edits a Build while account saving is unavailable
- **THEN** local persistence continues according to its own status and the interface does not claim those edits are present on another device

### Requirement: Private deletion and learning authority remain separate

Deleting a private cloud Build SHALL require an explicit action and affect only the verified owner's cloud record. The interface SHALL distinguish deleting the cloud copy from removing a device-local Build. Build create, Run, save, open, and delete SHALL NOT submit a Quest, grant completion or rewards, affect progress or unlocks, publish source, or send raw source to analytics or monitoring.

#### Scenario: Cloud copy is deleted

- **WHEN** an owner confirms deletion of a private cloud Build
- **THEN** the owner's cloud record is removed without deleting another owner's record, a Quest draft, or the device-local source unless a separate local removal is confirmed

### Requirement: R11B acceptance uses real account and multi-device evidence

R11B SHALL remain below integrated and founder accepted until exact-build synthetic account tests demonstrate save, relogin, second-device reopen, conflict and uncertain-response recovery, owner switching, and cross-account denial on the intended environment. Automation and local fixtures SHALL be recorded separately from real Supabase Auth evidence and founder review; missing R04 or privacy/release evidence SHALL remain open.

#### Scenario: Only fixture-based account tests pass

- **WHEN** backend and browser fixtures pass but real configured email Auth or founder review remains untested
- **THEN** the change may be technically implemented but SHALL NOT be described as integrated, founder accepted, or beta ready
