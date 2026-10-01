# Spec Delta

## ADDED Requirements

### Requirement: Email learners can recover and update a password safely
The frontend SHALL offer a recovery request for email learners with a generic success response that does not reveal whether an account exists. Recovery links SHALL use the configured trusted application origin and a bounded one-time code exchange before presenting the password update form. The update form SHALL require a current trusted session, validate the new password locally, report provider failures safely, and avoid placing email, password, code or tokens in logs, telemetry, or the destination URL. OAuth-only users SHALL retain their provider sign-in route.

#### Scenario: Recovery request is accepted
- **WHEN** a visitor requests recovery for an email address
- **THEN** the UI reports that an email will arrive if the account is eligible, without disclosing account existence

#### Scenario: Recovery callback succeeds
- **WHEN** a valid one-time recovery code is exchanged through the trusted callback
- **THEN** the learner reaches a session-protected password update form with no code in its URL

#### Scenario: Recovery callback fails
- **WHEN** the code is missing, invalid or expired
- **THEN** the learner receives a safe retry path and no password update is attempted

#### Scenario: Signed-in learner changes password
- **WHEN** a signed-in email learner submits a valid new password
- **THEN** the approved identity provider handles the change and the UI reports success without persisting password material in CodeQuest tables

