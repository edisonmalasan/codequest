# AGENTS.md

## Project overview

CodeQuest is a pixel-themed, game-like coding education platform for learning, practicing, building, and eventually using modern AI-assisted development workflows. The repository contains two applications: `frontend/` is the Next.js Web/PWA client and `backend/` is the NestJS authoritative application API. Keep the backend as a modular monolith until a concrete scaling or security requirement justifies extraction.

## Stack

- Language: TypeScript
- Frontend: Next.js, React, Tailwind CSS, shadcn/ui + Base UI, Motion, CodeMirror 6, TanStack Query, Zustand, Dexie, Serwist
- Backend: NestJS, Fastify, REST, OpenAPI, Drizzle ORM
- Data/Auth/Storage: PostgreSQL via Supabase, Supabase Auth, Supabase Storage
- Testing: Vitest, Testing Library, Playwright
- Ops: pnpm workspace, Turborepo, GitHub Actions, PostHog, Sentry
- Execution: JavaScript Web Workers; sandboxed iframe for web previews; Pyodide later; isolated remote runners later

## Setup & commands
These are the repository command contract. Keep the root `package.json` scripts aligned with them and remove/update any command that no longer works.

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

Application-specific checks:
```bash
pnpm --dir frontend test
pnpm --dir frontend lint
pnpm --dir frontend typecheck
pnpm --dir backend test
pnpm --dir backend lint
pnpm --dir backend typecheck
```

Add a verified single-test command here after the first real test exists; do not invent a path.

## Architecture boundaries
- `frontend/` owns UI, routing, PWA behavior, IndexedDB, CodeMirror, browser-safe execution, local drafts, and API consumption.
- `backend/` owns business rules, authorization, database access, curriculum, submissions, progress, gamification, AI orchestration, remote execution orchestration, and integrations.
- Frontend and backend communicate only through the documented REST/OpenAPI contract.
- Frontend must not import backend source; backend must not import frontend source.
- Frontend must not directly read or mutate CodeQuest application tables.
- Backend curriculum lives under `backend/content/`; frontend consumes it through the API.
- Generated API client code lives under `frontend/src/lib/api/generated/`.
- Do not create root shared packages unless at least two real independent consumers justify extraction.
- Never execute arbitrary learner code inside the NestJS process.

## Code style
- TypeScript strict mode; do not add `any`, `@ts-ignore`, or unchecked casts to bypass type errors.
- Prefer domain-oriented names and small explicit functions over generic helpers.
- Imports stay within the owning application/module; do not reach across architectural boundaries.
- Handle errors explicitly; never swallow failures.

```ts
const quest = await questRepository.findById(questId);
if (!quest) throw new QuestNotFoundError(questId);
```

- Remove dead code, unused imports, debug logs, commented-out implementations, and temporary compatibility shims before finishing.

## Testing
- Bug fixes require a regression test when practical.
- New backend rules/endpoints require unit or integration coverage.
- Changes to execution, validation, progress, XP, streaks, unlocks, auth, or offline sync require focused tests.
- User-critical flows require Playwright coverage where practical.
- Run `pnpm test`, `pnpm lint`, and `pnpm typecheck` before finishing.
- Do not claim a check passed unless it was actually run.
- If a required check cannot run, report the exact command and reason.

## Boundaries — do not touch
- Never commit `.env`, `.env.*`, secrets, credentials, tokens, or service-role keys.
- Never hand-edit `frontend/src/lib/api/generated/`; regenerate it from backend OpenAPI.
- Never rewrite an already-applied database migration; create a new migration.
- Never manually edit generated OpenSpec skills under `.agents/skills/`.
- Do not move backend business logic into Next.js Route Handlers or Server Actions.
- Do not add microservices, Redis, queues, GraphQL, tRPC, WebContainers, or remote runners unless the active spec explicitly requires them.

## Change scope
- Make the smallest coherent change that satisfies the task/spec.
- Do not perform unrelated refactors or modify unrelated files.
- Do not upgrade dependencies without a task-specific reason.
- Do not rename/reorganize code unless required.
- Preserve existing behavior unless the active requirement changes it.
- Prefer adding to an existing module over inventing a new architectural layer.

## Git / PR conventions
- Commits use Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Branches: `feat/<change-id-or-short-name>`, `fix/<change-id-or-short-name>`, `chore/<short-name>`.
- Use one branch per coherent feature/change; merge only after required checks pass.
- Prefer squash merge unless the task/repository explicitly requires another strategy.

### Git safety
- Check `git status` before significant work and `git diff` before finishing.
- Never discard existing user changes.
- Never use destructive Git operations or rewrite history without explicit authorization.

## Source of truth

When deciding behavior, use this order:

1. Explicit user/task requirements
2. Approved OpenSpec change/spec
3. Existing architecture and behavior
4. Tests
5. Repository documentation
6. Agent assumptions

When sources conflict, do not silently invent a resolution.

## Existing / brownfield work
- Inspect the relevant implementation before changing it.
- Read the relevant OpenSpec spec and check `openspec/changes/` for an active change.
- Continue an existing relevant change instead of creating a duplicate.
- Understand current behavior before redesigning it.
- Do not rewrite working systems merely because they are unfamiliar.

## Spec-driven development (OpenSpec)

This project uses OpenSpec for nontrivial changes.

```text
openspec/
├── config.yaml
├── specs/
└── changes/
```

- `openspec/specs/` defines current agreed behavior; read the relevant spec before changing a capability.
- `openspec/changes/` holds in-flight changes; implementation must follow the active change.
- If no relevant change exists for nontrivial work, create one before implementation.
- Do not silently diverge from an active change; update its artifacts when requirements/design/tasks change.
- Do not expand a change with unrelated work.
- Use installed OpenSpec workflows: Explore → Propose → Apply → Verify → Sync → Archive.
- Explore is for investigation, not permission to implement.
- Use `/opsx:update` when planning artifacts need revision and `/opsx:sync` when approved specs should update the main spec set.
- Use the OpenSpec archive workflow rather than manually moving files.
- Regenerate OpenSpec AI instructions with `openspec update`; never hand-edit generated `.agents/skills/`.
- Durable project engineering rules belong here; OpenSpec capability behavior belongs in OpenSpec.

## Multi-agent development
- Determine file/module ownership before editing.
- Avoid multiple agents modifying the same files unless intentionally coordinated.
- Respect dependency order; do not parallelize dependent work just for speed.
- Review upstream agent output before building dependent work on top of it.
- Use OpenSpec artifacts as the shared plan and source of truth.
