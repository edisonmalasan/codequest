# Spec Delta

## ADDED Requirements

### Requirement: Local configuration is scoped to its owning application

The repository SHALL provide committed, credential-free environment templates for the frontend and backend while ignoring real environment files. The frontend SHALL use its own local configuration, and backend startup and database commands SHALL optionally load backend-local configuration without requiring a file when CI or hosting supplies the environment. Backend database credentials and secret keys SHALL NOT be exposed as frontend public configuration. Existing production configuration validation SHALL remain enforced.

#### Scenario: Developer starts with scoped local files

- **WHEN** a developer fills the frontend and backend local files from their respective templates and runs the documented database commands and `pnpm dev`
- **THEN** each application receives only its scoped settings, both applications start through the root command, and the backend health endpoint responds

#### Scenario: CI supplies variables without a local file

- **WHEN** a backend database command runs with environment variables supplied by CI and no backend local file
- **THEN** it uses those variables without requiring the local file

#### Scenario: Production configuration is incomplete

- **WHEN** backend production startup lacks a required or valid database, Auth, or CORS value
- **THEN** startup fails under the existing configuration validation rules

### Requirement: Local development origins retain execution isolation

The ordinary frontend development command SHALL serve the application, runtime, and preview resources on their configured, distinct loopback origins. The application origin SHALL deny runtime and preview resources; the runtime origin SHALL serve only allowlisted runtime resources; the preview origin SHALL serve only allowlisted preview resources. Production SHALL continue to require separate secure origins for those compartments.

#### Scenario: Local origins reach one development server

- **WHEN** the frontend development server starts with the documented loopback origins
- **THEN** the application is reachable at `localhost:3000`, runtime assets at `127.0.0.1:3000`, and preview assets at `127.0.0.2:3000`

#### Scenario: Origin requests an unauthorized resource

- **WHEN** the application requests runtime or preview assets, or either isolated origin requests an application or other non-allowlisted route
- **THEN** the request is denied without exposing application sessions or protected resources
