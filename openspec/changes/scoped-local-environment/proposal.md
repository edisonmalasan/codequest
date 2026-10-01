# Proposal

## Why

Local setup currently relies on shell-exported backend configuration, while the frontend has no committed template for its separate public settings. This makes `pnpm dev` harder to reproduce and risks placing backend credentials in a root file visible to the frontend process.

## What Changes

- Add scoped, credential-free `frontend/.env.example` and `backend/.env.example` templates; continue ignoring real environment files.
- Load optional `backend/.env.local` for local backend start and database commands without changing production validation or CI-provided variables.
- Bind the frontend development server so the existing application, Worker runtime, and preview loopback origins reach it; retain hostname-based asset isolation.
- Replace the README's shell-export guidance with the two-file setup, Supabase configuration, migration commands, and verification steps.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repository-foundation`: local boot and command contract use scoped environment files and support the three isolated development origins.

## Impact

Root ignore rules, frontend/backend package scripts, backend startup and Drizzle configuration entry points, README, and focused local configuration/origin tests. No API, database schema, dependency, production origin policy, or beta decision changes.
