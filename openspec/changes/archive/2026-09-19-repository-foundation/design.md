## Context

No production workspace exists (see proposal.md - Why). Roadmap Phase 2 prescribes the structure and CI order; AGENTS.md plus decisions C02–C06 constrain boundaries (no root `packages/`/`content/`, no cross-app imports, NestJS/Fastify modular monolith, Next.js App Router). Verified 2026-09-19: Node v24.21, npm registry reachable, pnpm via corepack. Proven dependency majors selected over bleeding-edge majors for foundation stability (see Decisions).

## Goals / Non-Goals

**Goals:** bootable minimal workspace satisfying the Phase 2 completion criterion (`pnpm dev` starts frontend and backend) with enforced static checks, smoke tests, and CI.

**Non-Goals:** product UI/styling (Phases 3–4), API versioning/OpenAPI/CQRS-free module design beyond a health controller (Phase 5), database/Supabase (Phase 6), auth/curriculum/gamification (Phases 8+), E2E (Phase 34), Git hooks (optional, skipped).

## Decisions

- **Hand-authored minimal apps over framework generators**: full control of every file, no generator bloat or opinionated extras (Tailwind, example tests) that belong to later phases. Alternative: `create-next-app`/`nest new` — rejected for scope creep and review surface.
- **Proven majors, exact-pinned**: Next 15.5.x + React 19, NestJS 11.2.x + `@nestjs/platform-fastify`, TypeScript 5.9.x, ESLint 9.x + `typescript-eslint`, Vitest 3.2.x, turbo 2.x, pnpm 10. Alternatives: latest majors (Next 16, TS 7 native rewrite, ESLint 10, Nest 12) — rejected: ecosystem lag (parsers, adapters) on a foundation that must last; upgrades later follow AGENTS.md with task-specific reasons.
- **Turborepo orchestration**: root scripts delegate to `turbo run`; `dev` tasks persistent/uncached, `build` with `dependsOn: ["^build"]`.
- **Health at root `/health`, no `/api/v1` prefix yet**: API versioning is Phase 5 scope; introducing the prefix now would preempt it.
- **Per-app lint = `eslint . && prettier --check .`**: keeps the AGENTS.md command contract unchanged while enforcing formatting in CI.
- **Smoke tests without DOM or HTTP**: frontend tests a pure API-base-URL helper (also the env-validation surface); backend tests the config helper plus the health controller via `@nestjs/testing` (no supertest/network). Vitest `node` environment in both.
- **No Playwright, no Supabase, no DB drivers** in Phase 2: nothing exercises them yet; adding them would be speculative surface.

## Risks / Trade-offs

- [Pinned majors age] → Mitigation: exact pins plus lockfile make upgrades deliberate; Dependabot explicitly out of scope.
- [Next 15 vs future Phase 3 needs] → Mitigation: minimal App Router page only; Phase 3 owns Tailwind/shadcn/CodeMirror integration.
- [Windows + CI (Linux) path differences] → Mitigation: no OS-specific scripts; turbo/pnpm handle both; CI runs on ubuntu-latest to prove portability.
