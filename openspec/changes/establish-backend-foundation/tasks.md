## 1. Dependencies and configuration

- [ ] 1.1 Add and lock the minimum Nest-compatible validation, OpenAPI, Fastify CORS, and throttling dependencies; verify `pnpm install --frozen-lockfile` succeeds from the repository root.
- [ ] 1.2 Replace the minimal environment parser with an immutable validated backend configuration contract for environment, host, port, allowed origins, body limit, and throttling; verify focused unit tests cover defaults, production origin requirements, malformed origins, and numeric bounds.

## 2. Modular application structure

- [ ] 2.1 Create provider-free Identity, Curriculum, Learning, Progress, and Gamification modules under `backend/src/modules/`; verify module metadata contains no endpoints, persistence, external clients, or business providers.
- [ ] 2.2 Move health behavior into a Health module and define its bounded process-readiness response; verify `GET /api/v1/health` reports only status, service identity, and API version.
- [ ] 2.3 Compose the initial modules in the application root without frontend imports or shared-package extraction; verify the Nest testing module compiles with all six boundaries.

## 3. HTTP bootstrap and safety controls

- [ ] 3.1 Extract reusable application creation/configuration from the process entry point, enable `/api` plus URI version 1, body limits, graceful shutdown, and Fastify initialization; verify assembled application startup and the versioned/unknown-route behavior through Fastify injection.
- [ ] 3.2 Install global DTO transformation and strict allowlist validation; verify a test-only typed endpoint accepts valid input and rejects wrong types and unknown fields before handler behavior.
- [ ] 3.3 Implement the stable exception envelope for validation, known HTTP, throttling, not-found, and unexpected failures; verify status/code/message/request ID/details behavior and absence of stacks or raw inputs.
- [ ] 3.4 Implement request-ID validation/generation and response propagation; verify valid caller IDs survive and invalid/oversized IDs are replaced.
- [ ] 3.5 Implement structured request-completion logs with allowlisted metadata only; verify tests retain request ID/method/path/status/duration while excluding query values, headers, bodies, and authorization data.
- [ ] 3.6 Configure validated origin-based CORS with no wildcard production mode; verify allowed-origin preflight/requests receive grants and disallowed origins do not.

## 4. Documentation and traffic controls

- [ ] 4.1 Generate OpenAPI 3 output and interactive documentation at `/api/openapi.json` and `/api/docs`; verify the document declares `/api/v1` and the implemented health response without later-domain endpoints.
- [ ] 4.2 Register configurable process-local global throttling and normalize its rejection path; verify exceeding a test-configured limit returns correlated `429` without changing health semantics below the limit.

## 5. Verification and status

- [ ] 5.1 Add focused unit and assembled Fastify integration tests covering configuration, modules, health, routing/versioning, validation, errors, IDs, logs, CORS, OpenAPI, throttling, and shutdown-safe bootstrap; verify backend coverage passes without opening a real network port.
- [ ] 5.2 Run `pnpm --dir backend lint`, `pnpm --dir backend typecheck`, `pnpm --dir backend test`, and `pnpm --dir backend build`; record exact successful results.
- [ ] 5.3 Run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; record exact successful results.
- [ ] 5.4 Run strict OpenSpec validation, dependency/boundary scans, credential-pattern checks, local-link checks, and `git diff --check`; verify no database, auth, curriculum, business-rule, learner-execution, frontend, deployment, or Phase 6 implementation entered the change.
- [ ] 5.5 Update the roadmap Project Status and retained verification evidence for Apply completion pending Sync/Archive; verify the completed design-system archives and canonical specs remain unchanged.
