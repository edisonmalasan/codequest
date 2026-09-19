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
