# Proposal

## Why

The learning MVP has reached Phase 38, but a learner cannot yet recover a password or find a clear first-use path, and operators lack one release record that distinguishes repository evidence from hosted and policy decisions. Private beta cannot begin until F06 and deployment checks are settled.

## What Changes

- Add a concise onboarding path for guest learning, account creation, provisional work and explicit import, reusing existing routes and authority.
- Add email password recovery and authenticated password change through the trusted Supabase Auth boundary, with safe callback handling and no credential exposure.
- Add a feedback form that retains a draft only on the current device; submission to CodeQuest stays unavailable until approved collection, retention and deletion policy exists.
- Record a beta readiness matrix and operator runbook for analytics, monitoring, backups and restore, security, migrations, balancing and physical-device evidence. Mark external and F06 gates open and prohibit a beta-ready claim until evidence is attached.
- Update Phase 38 roadmap status to technical preparation in progress; no invitation or live learner collection is authorized.

## Capabilities

### New Capabilities

- `beta-preparation`: first-use guidance, local feedback draft and auditable release gates.

### Modified Capabilities

- `authentication`: safe password recovery and authenticated password change.

## Impact

Frontend auth and account UI, first-use navigation, local browser storage and focused tests; deployment/readiness documentation and OpenSpec. The backend learning authority, database schema, generated API client, and default-disabled telemetry remain unchanged.
