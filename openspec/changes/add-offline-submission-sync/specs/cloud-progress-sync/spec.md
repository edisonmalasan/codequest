## MODIFIED Requirements

### Requirement: Explicit submissions are durable owner-bound pending work

The frontend SHALL save an explicit authenticated Submit as an immutable bounded snapshot with its originating owner, stable quest ID, event ID, content/assessment versions, source, and report before sending it. Repeated delivery SHALL reuse that event and payload. Local Run or Check SHALL NOT automatically submit. Storage failure SHALL preserve editable source and SHALL NOT claim durable pending work or send an unsaved snapshot. Guest records and legacy envelopes SHALL NOT be automatically replayed as account operations. Known-offline Submit SHALL persist without attempting network delivery; the local session identifies only the originating storage bucket and SHALL NOT constitute verified backend identity or acceptance. Reconnect SHALL use the existing authenticated replay contract and policies.

#### Scenario: Device goes offline after Submit
- **WHEN** an authenticated learner submits and transport is unavailable
- **THEN** the same durable event survives reload as pending, separately from accepted completion

#### Scenario: Storage is unavailable
- **WHEN** the snapshot cannot be saved
- **THEN** source stays editable and the UI reports the storage failure without claiming pending delivery

#### Scenario: Known-offline explicit Submit
- **WHEN** a signed-in local owner submits while browser connectivity indicates offline
- **THEN** the saved event remains pending without a delivery request, and later transport requires a verified matching account

## ADDED Requirements

### Requirement: Downloaded learning exposes owner-scoped recovery

The downloaded-learning view SHALL offer the same owner-scoped saved-submission recovery as the account view, including pending/uncertain, attention-needed, and delivery-confirmed states, version identity, source viewing/copying, and explicit removal. Retry SHALL be available when connected and SHALL reuse original stable events and payloads with current owner checks; offline retry SHALL make no request. Delivery confirmation SHALL NOT claim accepted completion or advance the last-known accepted-progress snapshot. Existing bounded replay, rejection retention, trusted-view refresh, and acceptance-time policies SHALL apply without background delivery or cloud draft synchronization.

#### Scenario: Offline learner recovers source
- **WHEN** the current local owner opens their saved-submission panel offline
- **THEN** saved source and original versions remain accessible, removal affects only the device envelope, and network retry is unavailable

#### Scenario: Reconnect response is uncertain
- **WHEN** reconnect delivery loses its response after backend acceptance
- **THEN** retry preserves the original event and source and backend idempotency prevents duplicate attempts, XP, or streak days

#### Scenario: Stale work is rejected
- **WHEN** reconnect receives an unsupported-version or prerequisite rejection
- **THEN** the panel identifies attention-needed work and preserves source for copying and a separate current-version Check and Submit
