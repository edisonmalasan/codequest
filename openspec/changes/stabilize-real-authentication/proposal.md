# Proposal

## Why

The authentication routes and security boundary exist, but the founder reports that email signup and Google/GitHub sign-in fail in the configured local environment. R04 must prove the complete account journey against real Supabase configuration before authentication can advance from technically implemented to integrated or founder accepted.

## What Changes

- Diagnose the configured local frontend, Supabase Auth, and backend account handshake without disclosing credentials or treating fixture tests as live evidence.
- Repair application defects in email registration and confirmation, email login/logout, Google and GitHub OAuth, callback, session refresh, password recovery/change, and first account establishment where diagnosis finds them.
- Make recoverable failures and provider configuration gaps legible in the UI and local setup guidance without exposing sensitive provider details.
- Record synthetic, dated, environment-bound verification for each real flow and a separate founder walkthrough. Leave any provider or email-delivery path open until it actually passes.
- Preserve the verified-subject ownership boundary, generated API client, origin isolation, and backend authority. Keep Phase 38 paused and NO GO.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `authentication`: Require real-environment integration evidence and recoverable account-flow behavior in addition to deterministic fixture coverage.

## Impact

Likely areas are `frontend/src/features/auth/`, auth and account routes, `backend/src/modules/identity/` only if diagnosis requires a focused repair, local setup documentation, and auth browser/integration tests. Supabase dashboard redirect, provider, email template/delivery, and token-lifetime settings are external dependencies and must be verified rather than assumed. No new identity provider, frontend application-table access, or release approval is introduced.
