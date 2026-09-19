# CodeQuest

A pixel-themed, game-like coding education platform for learning, practicing, and building with modern development workflows.

## Tech stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, TanStack Query, Zustand, Dexie, CodeMirror 6
- **Backend:** NestJS 11, Fastify, TypeScript
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

No environment files are required to boot locally. Two optional variables have built-in defaults:

| Variable              | Used by  | Default                 |
| --------------------- | -------- | ----------------------- |
| `PORT`                | backend  | `3001`                  |
| `NEXT_PUBLIC_API_URL` | frontend | `http://127.0.0.1:3001` |

Set them in your shell when you need non-default values:

```bash
# Windows (PowerShell)
$env:PORT = "3001"

# macOS / Linux
export PORT=3001
```

## Development

Start both apps together from the repository root:

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend health check: http://127.0.0.1:3001/health → `{"status":"ok"}`

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

## License

MIT — see [LICENSE](LICENSE).
