## Why

No production workspace exists: the repository holds documentation, OpenSpec artifacts, and disposable Phase 1 prototypes only. Roadmap Phase 2 (Repository Foundation) is the next required phase, and its completion criterion (`pnpm dev` starts frontend and backend locally) cannot be met without a real workspace, toolchain, and CI.

## What Changes

- Root pnpm workspace (`pnpm-workspace.yaml`) with `frontend` and `backend` members and a root `package.json` implementing the AGENTS.md command contract (`install`, `dev`, `build`, `test`, `lint`, `typecheck`)
- Turborepo pipeline (`turbo.json`) orchestrating per-app `build`, `test`, `lint`, and `typecheck`, plus persistent `dev`
- Strict TypeScript base configuration extended by both apps; flat ESLint configs; Prettier configuration
- Minimal bootable Next.js frontend (App Router placeholder page; no product UI, no Tailwind/shadcn yet — those are Phase 3/4)
- Minimal bootable NestJS backend on the Fastify adapter with a root health endpoint (no versioned API, no OpenAPI, no database — those are Phases 5–7)
- Environment validation helpers (frontend API-base helper, backend port/config helper) each with unit coverage
- GitHub Actions CI running install → lint → typecheck → tests → frontend build → backend build on every PR
- Extended `.gitignore` for workspace artifacts; `pnpm-lock.yaml` committed
- Small documentation consistency updates (`architecture.md` current-state line, roadmap Project Status during Apply)

## Capabilities

### New Capabilities

- `repository-foundation`: production workspace existence, toolchain behavior, CI gates, and local boot contract

### Modified Capabilities

(none — no existing specs exist)

## Impact

- New top-level files: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `pnpm-lock.yaml`, `.github/workflows/ci.yml`
- New directories: `frontend/`, `backend/` (minimal apps only; full foundations remain Phase 3/5 scope)
- No changes to `prototypes/`, `docs/` behavior, or AGENTS.md rules
- Explicitly out of scope: root `packages/` (AGENTS.md/C04 — no second consumer), root `content/` (C05 — curriculum lives under `backend/content/` in Phase 9+), database/Supabase/OpenAPI/auth (Phases 5–8), product UI/styling (Phases 3–4)
