# repository-foundation Specification

## Purpose
The production workspace, toolchain, and CI gates that every later CodeQuest phase builds on: one workspace, one command contract, reproducible installs, and a local boot proof.

## Requirements

### Requirement: Workspace layout follows the approved architecture

The repository SHALL provide a root pnpm workspace with `frontend` and `backend` members, and SHALL NOT provide root `packages/` or root `content/` directories.

#### Scenario: Workspace members resolve
- **WHEN** `pnpm install` completes at the repository root
- **THEN** both `frontend` and `backend` dependencies are installed from their own manifests and `pnpm --filter` addresses each app

#### Scenario: No premature shared layers
- **WHEN** the repository tree is inspected
- **THEN** no root `packages/`, `content/`, or `tooling/` directory exists and no database, auth provider, or API client code exists outside its owning application

### Requirement: Single command contract

The root `package.json` SHALL expose `install`, `dev`, `build`, `test`, `lint`, and `typecheck` scripts that delegate to the workspace through Turborepo.

#### Scenario: Contract commands exist
- **WHEN** each of `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck` is invoked from the root
- **THEN** it runs without an "unknown script" error and delegates to the corresponding per-app task

### Requirement: Local boot proof

`pnpm dev` SHALL start the frontend and backend locally, and the backend SHALL answer a health endpoint while the frontend SHALL render its placeholder page.

#### Scenario: Both apps boot
- **WHEN** `pnpm dev` runs
- **THEN** the frontend serves HTTP 200 on its configured port and the backend answers `GET /health` with `{"status":"ok"}`

### Requirement: Strict static checks

The workspace SHALL enforce TypeScript strict mode in both apps, ESLint with zero warnings tolerance, Prettier formatting checks, and at least one passing unit test per app run through CI.

#### Scenario: Checks gate changes
- **WHEN** `pnpm lint`, `pnpm typecheck`, or `pnpm test` runs
- **THEN** any error fails the command with a non-zero exit code

### Requirement: CI verifies every PR

Every pull request SHALL run install, lint, typecheck, tests, frontend build, and backend build in GitHub Actions.

#### Scenario: CI pipeline order
- **WHEN** a PR is opened or updated
- **THEN** the CI workflow executes install, then lint, typecheck, and tests, then both production builds, failing fast on the first failure

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
