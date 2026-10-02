# Spec Delta

## ADDED Requirements

### Requirement: Configured authentication journeys are verified as usable account journeys

Before authentication is classified as integrated, each advertised email and provider sign-in method SHALL be exercised with synthetic identities against the configured Supabase Auth environment and the corresponding CodeQuest application origin. A successful journey SHALL reach a trusted session and the verified learner's backend-owned account without relying on fixture responses. Evidence SHALL identify the tested commit, environment, date, method, observed result, and any outstanding provider or delivery dependency. An untested or failed method SHALL remain open and SHALL NOT be represented as integrated or founder accepted.

#### Scenario: Email confirmation establishes an account

- **WHEN** a synthetic learner completes email registration and the configured confirmation delivery and callback
- **THEN** the learner obtains a trusted session and can establish and read only that learner's backend account, with the tested build and environment recorded

#### Scenario: Provider authentication establishes an account

- **WHEN** a synthetic learner completes a configured Google or GitHub redirect and callback
- **THEN** the learner obtains a trusted session and can establish and read only that learner's backend account, with no provider token exposed to CodeQuest application data

#### Scenario: Integration evidence is unavailable

- **WHEN** provider configuration, email delivery, backend availability, or a real callback cannot be verified
- **THEN** that method remains explicitly unverified regardless of passing mock or fixture tests

### Requirement: Auth journey failures preserve a safe retry path

The application SHALL show a recoverable, non-sensitive failure state when a configured registration, login, callback, recovery, or account-establishment journey fails. It SHALL distinguish a confirmation-required registration from an authenticated session and SHALL NOT imply that account progress was established when the backend did not accept it. Error handling SHALL preserve the approved local return destination without leaking credentials, codes, tokens, provider payloads, or private account data.

#### Scenario: Callback exchange fails

- **WHEN** a real callback cannot exchange its one-time code or a provider returns an error
- **THEN** the learner reaches a safe retry route and no code, credential, or provider payload is shown or retained in the destination URL

#### Scenario: Backend account establishment fails after sign-in

- **WHEN** Supabase sign-in succeeds but the backend account operation is unavailable or rejects the request
- **THEN** the UI reports that the account data could not be loaded, offers a retry, and does not claim accepted progress or account establishment
