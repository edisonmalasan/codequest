# Spec Delta

## MODIFIED Requirements

### Requirement: Later learning and preview behavior remains excluded

The JavaScript runtime SHALL NOT render web previews, evaluate assessment cases, declare Check results, create attempts or submissions, accept completion, change progress, award XP/rewards, unlock content, call backend execution, or collect source telemetry. Its fixed, credential-free bootstrap and Worker resources MAY be prepared on the dedicated runner origin for offline execution, provided the same isolation, limits, and recovery guarantees hold. Offline preparation SHALL NOT grant learner code service-worker, Cache Storage, network, or application-origin access.

#### Scenario: Successful execution finishes
- **WHEN** learner JavaScript returns successfully online or offline
- **THEN** only runtime output/status is available and no validation, submission, progress, or reward transition occurs

#### Scenario: Offline resources are unavailable
- **WHEN** the dedicated runner resources are not durably available offline
- **THEN** execution reports unavailable and never falls back to evaluating learner source in the application origin
