## 1. Backend contract source

- [x] 1.1 Expose a reusable in-memory OpenAPI document/export path from the existing NestJS setup without starting a listener or requiring production credentials; verify the exported document and `/api/openapi.json` describe the same implemented paths and schemas.
- [x] 1.2 Document the current health success, request ID, and implemented safe error responses in backend-owned OpenAPI metadata without changing their wire behavior; verify Fastify response tests and OpenAPI schema assertions agree.

## 2. Frontend generation and transport

- [x] 2.1 Add pinned `openapi-typescript` and `openapi-fetch` dependencies and named export/generate/check commands; verify a clean workspace install and two successive generations produce identical checked-in output under `frontend/src/lib/api/generated/`.
- [x] 2.2 Add a thin trusted-frontend typed client using generated `paths` and the existing API base URL; verify a typed health call and compile-time rejection of an undocumented operation without importing backend source.
- [x] 2.3 Distinguish success, documented HTTP error, malformed response, network failure, and cancellation in the health transport; verify focused frontend tests cover these cases, configured base URL, and no credentials sent by default.

## 3. Drift and boundary verification

- [x] 3.1 Add a non-writing contract-drift check to CI that regenerates from the current backend and fails on stale committed output; verify unchanged output passes and a deliberate temporary DTO/contract mismatch fails before restoring the fixture.
- [x] 3.2 Document the regenerate/review workflow and resolved `frontend/src/lib/api/generated/` precedence in the appropriate API documentation; verify paths and commands are accurate and no root `packages/api-client` or direct cross-app source import is introduced.
- [x] 3.3 Run frontend/backend lint, typecheck, tests, builds, root lint, typecheck, tests, build, strict OpenSpec validation, contract-drift, boundary/credential checks, and `git diff --check`; record actual results and verify no Phase 8+ behavior entered the Apply diff.
