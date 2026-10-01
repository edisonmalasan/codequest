# Design

## Context

The root `dev` task already runs both apps through Turborepo. Next.js automatically reads `frontend/.env.local` when launched from its package directory. Backend entry points currently read `process.env` directly; Drizzle Kit and migration drift are separate processes. Middleware already restricts runtime and preview hosts by exact configured host and path. See the proposal and repository-foundation delta for the intended local contract.

## Goals / Non-Goals

**Goals:** Make local configuration reproducible with application-scoped files and preserve CI/production environment behavior.

**Non-Goals:** New configuration dependencies, root secret files, Auth/provider provisioning, production origin routing changes, or beta telemetry approval.

## Decisions

- Use a small backend Node preload script with `process.loadEnvFile` for backend-local `.env.local` in non-production processes. Resolve the path relative to the backend package, skip missing files, and let already supplied environment variables win. Invoke it with Node's `--import` for startup and database commands. Drizzle Kit's installed JS entry point can be invoked directly through Node; the drift subprocess inherits the loaded environment. This avoids a cross-platform shell assignment or a configuration framework.
- Keep backend validation in the existing `loadBackendConfig` path. The preload provides values but does not loosen required fields, URL checks, or production CORS rules.
- Run Next.js development with an explicit all-interface bind, allowing the three loopback hostnames to reach the same server. Keep the existing middleware host/path allowlists and runtime/preview origin validators unchanged.
- Ignore all `.env*` files with two exact template exceptions. Document Supabase dashboard sources and the local Auth callback in README.

## Risks / Trade-offs

- Binding all interfaces can expose a local development server on a reachable network interface. The README will describe it as a development-only setting; production keeps separate secure origins and deployments must apply their own ingress controls.
- A missing or malformed local file may not be noticed until backend validation or a database command runs. The documented `db:check`/`db:drift`/`db:migrate` sequence gives an early check; CI remains file-independent.

## Migration Plan

Existing shell-supplied backend variables continue to work. Developers can copy the two templates into ignored `.env.local` files, fill their own values, then run the documented commands. Reverting the script and templates restores the previous shell-only backend setup without a data migration.
