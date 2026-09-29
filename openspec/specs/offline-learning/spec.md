# Offline Learning Specification

## Purpose

Let learners deliberately keep published lessons and use a bounded local reading and practice experience through a cold offline launch without implying account acceptance.

## Requirements

### Requirement: Explicit downloads have truthful readiness and version identity

The application SHALL save only explicitly requested, bounded public published lesson snapshots under the current local owner and stable quest, content, and assessment identity. A download SHALL report reading-ready only after its lesson document and required local assets are durable, and exercise-ready only after the public offline shell and isolated runner resources are verified available. It SHALL show saved version, date, and distinct partial/failed/storage-full states; it SHALL NOT silently replace or relabel an older snapshot as the active publication. Learners SHALL be able to remove a downloaded lesson without removing drafts or pending submissions.

#### Scenario: Download succeeds
- **WHEN** a learner downloads a published lesson and all required fixed resources are prepared
- **THEN** its version appears in the device library as ready for offline reading and local exercises

#### Scenario: Runner preparation fails
- **WHEN** lesson bytes persist but the isolated runner cannot be prepared
- **THEN** reading remains available and the UI does not claim offline Run or Check readiness

#### Scenario: Publication changes
- **WHEN** an older saved version exists after the current publication changes
- **THEN** the older content remains identifiable as saved, without claiming current publication or accepted completion

### Requirement: Cold offline navigation opens saved lessons without protected response caching

An installed client SHALL offer a credential-free offline library reachable after an offline cold navigation. It SHALL load only a saved lesson owned by the selected local owner, render its bounded public content and downloaded illustrations safely, and restore its owner-scoped draft. Missing, corrupt, evicted, or owner-mismatched records SHALL fail visibly without exposing another owner's data. Ordinary authenticated pages and dynamic navigation SHALL remain network-only.

#### Scenario: Offline cold launch
- **WHEN** a controlling installed shell has prepared a lesson and network is unavailable
- **THEN** the learner can open the offline library, read that lesson, and edit its saved draft without a protected API response

#### Scenario: Different account is selected
- **WHEN** the local selected owner differs from a saved lesson's owner
- **THEN** that lesson and its cached progress are not displayed for the selected owner

### Requirement: Offline Run and Check preserve isolation and provisional authority

Offline Run and deterministic Check SHALL use the existing dedicated-origin fresh-Worker execution and validation limits, protocols, CSP, cleanup, and timeout/recovery rules. They SHALL never evaluate learner JavaScript in the authenticated application origin or NestJS. Local Check results and offline editing SHALL remain provisional and SHALL NOT assert accepted completion, XP, streak, unlock, or backend activity. If the runner, assessment version, or local storage is unavailable, the UI SHALL preserve source and report the unavailable capability.

#### Scenario: Offline exercise
- **WHEN** an exercise-ready saved JavaScript lesson is opened offline
- **THEN** Run and Check provide bounded local feedback while account completion remains unchanged

#### Scenario: Infinite loop offline
- **WHEN** learner source loops in an offline Run or Check
- **THEN** trusted control terminates it within existing limits and a later finite run can recover

### Requirement: Offline progress is a labeled snapshot of accepted facts

The application SHALL show only a minimal owner-scoped, timestamped snapshot derived from a successful protected backend progress read, labeled as last known accepted account state. Local attempts, Checks, pending submissions, and guest activity SHALL be visually separate and SHALL NOT alter accepted counts, unlocks, XP, or streaks in this snapshot. Logout or account switch SHALL make the prior owner's cached view unavailable. No raw protected response, token, or learner source SHALL enter service-worker CacheStorage.

#### Scenario: Cached progress is read offline
- **WHEN** a signed-in learner previously fetched progress and later opens the local view offline
- **THEN** the view identifies its capture time and accepted status without claiming it is current

#### Scenario: Pending work exists
- **WHEN** an offline local Check passes or a submission remains pending
- **THEN** the accepted progress snapshot does not advance

### Requirement: Unsupported offline actions remain explicit

The offline learning view SHALL keep AI, leaderboards, community, remote sandboxes, account changes, and publishing unavailable. It SHALL NOT invent a new sync or cloud-draft merge path. The existing owner-scoped pending-operation mechanism MAY retain an explicit authenticated Submit for later replay, but delivery and account acceptance SHALL remain visibly pending until confirmed by the backend.

#### Scenario: Learner requests unavailable action
- **WHEN** the client is offline and a network-only capability is requested
- **THEN** the UI explains that it requires a connection and does not simulate success
