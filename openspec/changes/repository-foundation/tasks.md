## 1. Root workspace and toolchain

- [x] 1.1 Root `package.json` (packageManager pnpm@12.4.1, contract scripts, `onlyBuiltDependencies` for esbuild/unrs-resolver), `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json` (strict), `.prettierrc`, `.npmrc` (engine-strict), extended `.gitignore`; `pnpm install` resolves with committed lockfile (verified 2026-09-19)
- [x] 1.2 `.github/workflows/ci.yml` runs install → lint → typecheck → tests → frontend build → backend build; job order verified by reading the workflow (AGENTS.md contract order)

## 2. Minimal backend

- [x] 2.1 `backend/` (NestJS 11.2.5 + Fastify 5.12.5, `AppModule`, root `GET /health`, validated port helper defaulting to 3001); `pnpm dev` boots Nest and `/health` answers `{"status":"ok"}` (verified 2026-09-19)
- [x] 2.2 Backend unit tests (config helper 3 cases, health controller via `@nestjs/testing`), flat ESLint (`@eslint/js` + `typescript-eslint` strict, decorated-class allowance) + Vitest configs, `tsconfig.build.json` excluding specs; `test` 4/4, `lint`, `typecheck`, `build` emit clean `dist/` (verified 2026-09-19)

## 3. Minimal frontend

- [x] 3.1 `frontend/` (Next.js 15.5.25 App Router placeholder page, API-base helper defaulting to local backend, strict tsconfig extending the base); `pnpm dev` serves HTTP 200 and `build` prerenders (verified 2026-09-19)
- [x] 3.2 Frontend unit test (API-base helper 3 cases) and flat ESLint + Vitest configs; `test` 3/3, `lint`, `typecheck` pass (verified 2026-09-19). `eslint-config-next` (legacy eslintrc format, needs compat shim) deferred to Phase 3 per AGENTS.md shim rule

## 4. Integration and close-out

- [x] 4.1 Full root contract green 2026-09-19: `pnpm install`, `lint`, `typecheck`, `test` (7 tests), `build` (both apps) via turbo; `pnpm dev` boots backend + frontend together (Nest `/health` ok, Next 200). Environment note: local `corepack enable` fails without admin, so pnpm 12.4.1 was installed via `npm i -g` (machine setup, not a repo change); CI uses `pnpm/action-setup` and is unaffected
- [ ] 4.2 Update `architecture.md` current-state line and roadmap Project Status to the Phase 2 outcome; verify links resolve and strict OpenSpec validation passes
