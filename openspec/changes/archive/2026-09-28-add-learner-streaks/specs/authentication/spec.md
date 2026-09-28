# Spec Delta

## ADDED Requirements

### Requirement: Learner can set a validated prospective timezone

The backend SHALL offer a protected versioned self-only account operation to set a valid IANA timezone. It SHALL reject unknown, malformed, or non-IANA timezone values, use the verified principal as owner, and leave the prior setting unchanged on rejection. The current account representation SHALL return the persisted timezone. The trusted account UI SHALL let the learner set and understand that only future accepted activity uses the new timezone; historical streak days are unchanged.

#### Scenario: Valid timezone selection
- **WHEN** an authenticated learner selects a valid IANA timezone
- **THEN** the account stores that timezone for future backend acceptance and returns it

#### Scenario: Invalid timezone selection
- **WHEN** a learner sends an invalid timezone
- **THEN** the backend rejects it without changing the stored setting or historical days

#### Scenario: Another owner is supplied
- **WHEN** a client attempts to select another user's account while changing timezone
- **THEN** the verified principal still exclusively determines the updated account
