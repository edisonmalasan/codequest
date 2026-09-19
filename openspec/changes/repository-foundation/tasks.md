## 1. Root workspace and toolchain

- [ ] 1.1 Create root `package.json` (private, packageManager pin, contract scripts), `pnpm-workspace.yaml` (frontend/backend), `turbo.json` (build/lint/typecheck/test/dev pipeline), `tsconfig.base.json` (strict), `.prettierrc`, and extend `.gitignore`; verify `corepack pnpm install` resolves with a committed lockfile
- [ ] 1.2 Create `.github/workflows/ci.yml` running install → lint → typecheck → tests → frontend build → backend build; verify the workflow YAML parses and job order matches the spec

## 2. Minimal backend

- [ ] 2.1 Scaffold `backend/` (NestJS 11 + Fastify adapter, `AppModule`, root `GET /health` returning `{"status":"ok"}`, port/config helper with validation); verify `pnpm --filter backend dev` boots and the health endpoint answers
- [ ] 2.2 Add backend unit tests (config helper validation, health controller via `@nestjs/testing`) and flat ESLint + Vitest configs; verify `pnpm --filter backend test`, `lint`, `typecheck` pass and `build` emits `dist/`

## 3. Minimal frontend

- [ ] 3.1 Scaffold `frontend/` (Next.js 15 App Router placeholder page, API-base helper with default, strict tsconfig extending the base); verify `pnpm --filter frontend dev` serves HTTP 200 and `build` succeeds
- [ ] 3.2 Add frontend unit test (API-base helper) and flat ESLint + Vitest configs; verify `pnpm --filter frontend test`, `lint`, `typecheck` pass

## 4. Integration and close-out

- [ ] 4.1 Run the full root contract (`pnpm install`, `lint`, `typecheck`, `test`, `build`, `dev` boot proof for both apps) and fix any failure without weakening checks; verify all six commands succeed
- [ ] 4.2 Update `architecture.md` current-state line and roadmap Project Status to the Phase 2 outcome; verify links resolve and strict OpenSpec validation passes
