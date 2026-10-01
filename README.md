# CodeQuest

A pixel-themed, game-like coding education platform for learning, practicing, and building with modern development workflows.

## Tech stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, TanStack Query, Zustand, Dexie, CodeMirror 6
- **Backend:** NestJS 11, Fastify, TypeScript, Drizzle ORM, PostgreSQL
- **Tooling:** pnpm workspaces, Turborepo, Vitest, ESLint, Prettier, GitHub Actions

## Repository structure

```text
frontend/   Next.js web client (UI, editor, local state, API consumption)
backend/    NestJS API (business rules, authorization, data access)
docs/       Product, architecture, and development documentation
openspec/   Spec-driven planning artifacts and specs
```

## Prerequisites

- Node.js 24 or newer
- pnpm 12 or newer (the repo pins `pnpm@12.4.1`; with Corepack enabled it is picked up automatically)
- `engine-strict` is enabled, so mismatched Node/pnpm versions fail fast

## Installation

```bash
corepack enable
pnpm install
```

## Environment setup

Use a separate local file for each application. Turborepo starts both processes;
do not use a root `.env` or pass backend secrets to the frontend process.

```powershell
# Windows (PowerShell)
Copy-Item frontend/.env.example frontend/.env.local
Copy-Item backend/.env.example backend/.env.local
```

```bash
# macOS / Linux
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env.local
```

Fill both `.env.local` files before starting the apps. Next.js automatically
loads `frontend/.env.local`. The backend loads `backend/.env.local` for local
dev/start and database commands; supplied shell or CI variables take precedence,
and the file is not required in CI. Both real files are ignored by Git.

From the Supabase dashboard, copy the **Project URL** and **publishable key**
into the frontend file. The publishable key is safe to expose to the frontend;
the Supabase secret and service-role keys are not. Set the backend Auth issuer
and JWKS URLs using that project's reference as shown in the backend template.
Copy the project's PostgreSQL connection URI into backend `DATABASE_URL` and
replace every placeholder. `DATABASE_URL` is backend-only: never put it in a
`NEXT_PUBLIC_*` variable or the frontend file. Configure Supabase Auth's local
redirect allowlist to include `http://localhost:3000/auth/callback`.

The templates also show optional PostHog and Sentry settings. Keep analytics
and monitoring disabled until the beta privacy, consent, provider, and telemetry
gates explicitly approve them. Do not uncomment their approval switches for
ordinary local setup.

After filling both files, run these from the repository root:

```bash
pnpm --dir backend db:check
pnpm --dir backend db:drift
pnpm --dir backend db:migrate
pnpm dev
```

`pnpm dev` runs frontend and backend together through Turborepo. The frontend
development server binds all local interfaces so these three distinct loopback
origins reach the same Next.js process:

| Purpose | Local origin |
| --- | --- |
| Authenticated application | `http://localhost:3000` |
| Isolated JavaScript runtime | `http://127.0.0.1:3000` |
| Static web preview | `http://127.0.0.2:3000` |

The app origin denies `/runtime/*` and `/preview/*`. The runtime and preview
hosts serve only their fixed allowlisted resources. Keep the local development
server on a trusted network; production still requires separate secure origins.

Verify the backend at `http://127.0.0.1:3001/api/v1/health` and load
`http://localhost:3000/login` without a missing Supabase configuration error.
Check origin isolation: `/runtime/bootstrap.html` must return 200 only from the
runtime origin, `/preview/bootstrap.html` must return 200 only from the preview
origin, and application pages must return 404 from both isolated origins. Then
run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. Run
`pnpm api:check` when API or OpenAPI output is affected.

## Development

Start both apps together from the repository root after environment setup:

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend health check: http://127.0.0.1:3001/api/v1/health → `{"status":"ok","service":"codequest-api","version":"1"}`

Run a single app:

```bash
pnpm --dir frontend dev
pnpm --dir backend dev
```

## Build

```bash
pnpm build                  # both apps via Turborepo
pnpm --dir frontend build   # Next.js production build
pnpm --dir backend build    # compiles to backend/dist, run with pnpm --dir backend start
```

## Test

```bash
pnpm test                 # all workspace tests
pnpm --dir frontend test  # Vitest, frontend unit and component tests
pnpm --dir backend test   # Vitest, backend tests
```

## Lint / typecheck

```bash
pnpm lint       # ESLint with zero-warning tolerance + Prettier check
pnpm typecheck  # strict TypeScript, no emit
```

Both accept the same per-app form: `pnpm --dir frontend lint`, `pnpm --dir backend typecheck`, and so on. Every pull request runs install, lint, typecheck, tests, and both production builds in CI.

## Useful scripts

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start frontend and backend for local work |
| `pnpm build`     | Production builds for both apps           |
| `pnpm test`      | Run all tests                             |
| `pnpm lint`      | Lint and formatting check                 |
| `pnpm typecheck` | Strict type check                         |

Database migration and verification commands are documented in [docs/database.md](docs/database.md).

## License

MIT — see [LICENSE](LICENSE).
