## MODIFIED Requirements

### Requirement: Unsupported offline actions remain explicit

The offline learning view SHALL keep AI, leaderboards, community, remote sandboxes, account changes, and publishing unavailable. It SHALL NOT invent a new sync or cloud-draft merge path. The existing owner-scoped pending-operation mechanism SHALL retain an explicit authenticated Submit from a saved lesson for later replay, but delivery and account acceptance SHALL remain visibly pending until confirmed by the backend. Guest Check SHALL remain device-local with explicit authenticated import and SHALL NOT queue account work. The downloaded library and saved lesson view SHALL expose the selected account's saved submission delivery states and source recovery without requiring a network-only account page. Changing local owner SHALL remove the previous owner's panel and selected lesson from the visible view.

#### Scenario: Learner requests unavailable action
- **WHEN** the client is offline and a network-only capability is requested
- **THEN** the UI explains that it requires a connection and does not simulate success

#### Scenario: Saved lesson is explicitly submitted offline
- **WHEN** a signed-in local owner explicitly submits a supported Check snapshot from their downloaded lesson while known offline
- **THEN** the immutable event is saved in that owner's existing outbox without transport or accepted-progress changes and appears as pending in the local recovery view

#### Scenario: Guest checks a saved lesson
- **WHEN** a guest passes a local Check on a downloaded guest-eligible lesson
- **THEN** only provisional guest state is saved and no authenticated submission is queued

#### Scenario: Pending work survives offline reload
- **WHEN** an owner reopens the downloaded library after saving a submission offline
- **THEN** their persisted submission state and source are recoverable even without an open lesson or a reachable account page

#### Scenario: Account selection changes
- **WHEN** a different local account or guest bucket becomes selected
- **THEN** the previous account's pending source is unavailable in the view and is not attached to the new owner
