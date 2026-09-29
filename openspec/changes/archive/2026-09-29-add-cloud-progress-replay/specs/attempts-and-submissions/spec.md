# Spec Delta

## ADDED Requirements

### Requirement: Stable quest replay preserves existing event outcomes

The backend SHALL expose a versioned protected attempt replay operation keyed by stable quest identity, deriving owner solely from the verified principal and applying existing submission permissions and payload bounds. It SHALL resolve an exact existing owner/event/payload before requiring current publication, so replay after slug change, version change, or retirement returns the recorded outcome without a new fact. An event reused with different quest, versions, source, or report SHALL be rejected. New events SHALL use current published quest, supported version, prerequisite, report normalization, completion, XP, and acceptance-day streak policies. No frontend identity, timestamp, completion flag, or total SHALL decide acceptance. The operation SHALL appear in OpenAPI and the generated client.

#### Scenario: Exact event after retirement
- **WHEN** a verified owner replays an identical recorded event for a retired stable quest
- **THEN** its original outcome is returned without new attempt, completion, XP, or streak day

#### Scenario: New event for unavailable quest
- **WHEN** the owner submits a new event for an unpublished stable quest
- **THEN** the backend rejects it before any learning fact is committed

#### Scenario: Altered replay
- **WHEN** an existing event is replayed with different source or context
- **THEN** the backend rejects the conflict and preserves the original attempt
