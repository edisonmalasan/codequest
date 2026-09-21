# Backend foundation verification

Date: 2026-09-22

## Delivered boundary

The Apply implementation establishes one NestJS 11/Fastify modular monolith with provider-free Identity, Curriculum, Learning, Progress, and Gamification modules plus an operational Health module. It adds the versioned `/api/v1` boundary, strict global DTO validation, normalized errors, request correlation, redacted structured completion logs, validated environment/CORS/body/rate settings, process-local throttling, OpenAPI, and graceful lifecycle configuration.

It adds no persistence, migrations, Supabase integration, authentication behavior, domain business rules, curriculum content, generated frontend client, learner execution, analytics, PWA behavior, or deployment infrastructure.

## Dependency and supply-chain record

The implementation locks Nest-compatible validation, OpenAPI, Fastify CORS/static, and throttling dependencies. Direct Fastify is pinned to `5.11.3`, matching the existing `@nestjs/platform-fastify@11.2.5` dependency tree and avoiding duplicate runtime types. The transitive `@scarf/scarf` install script is explicitly disabled in `pnpm-workspace.yaml`; no telemetry setup script was approved or executed.

`pnpm install --frozen-lockfile` passed with pnpm 12.4.1 after the lockfile update.

## Behavioral evidence

The assembled Fastify tests use injection and open no network port. They verify:

- `/api/v1/health` returns only process status, service identity, and API version.
- unsupported versions and unknown routes use the stable correlated JSON error envelope.
- strict transformation/allowlist DTO validation rejects wrong and extra properties before handler behavior.
- unexpected failures return no stack or private failure text.
- valid request IDs propagate; invalid IDs are replaced with UUIDs.
- completion logs contain only request ID, method, query-free path, status, duration, and service context.
- configured origins receive CORS grants while unlisted origins do not.
- `/api/openapi.json` and `/api/docs` expose only the implemented health surface.
- a test-configured request limit produces a correlated normalized `429` response.
- all six initial Nest module boundaries compile and the five domain placeholders remain provider-free.

## Command results

- `pnpm --dir backend lint`: pass.
- `pnpm --dir backend typecheck`: pass.
- `pnpm --dir backend test`: pass, 4 files and 22 tests.
- `pnpm --dir backend build`: pass.
- `pnpm lint`: pass for frontend and backend.
- `pnpm typecheck`: pass for frontend and backend.
- `pnpm test`: pass, 29 frontend files/101 tests and 4 backend files/22 tests.
- `pnpm build`: pass for frontend and backend. Next.js retained its existing advisory that its ESLint plugin is not explicitly configured.
- `openspec validate establish-backend-foundation --strict`: pass.

The root commands used the machine-local pnpm 12.4.1 launcher because the installed global Windows executable cannot load its Visual C++ runtime. This does not change repository configuration or the command contract.

## Scope and security checks

- Apply paths are limited to `backend/`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, roadmap status, and active change tracking/evidence.
- Backend imports do not cross into frontend source.
- No dynamic evaluation primitive or learner-code execution path exists in backend source.
- No Drizzle, PostgreSQL, Supabase, authentication, or database dependency/implementation was added.
- Credential-signature scan found no key or token material.
- Canonical specs and both completed design-system archives remain unchanged.
- Local documentation links and `git diff --check` pass.

The rate limiter is intentionally process-local and does not claim distributed enforcement. Health intentionally does not claim database, identity-provider, storage, curriculum, or other dependency readiness.
