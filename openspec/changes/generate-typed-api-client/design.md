## Context

See [proposal](proposal.md) for motivation and [delta spec](specs/api-contract-generation/spec.md) for the contract. `backend/src/infrastructure/openapi/setup-openapi.ts` already derives and serves OpenAPI from the initialized NestJS/Fastify app at `/api/openapi.json`; `GET /api/v1/health` is the only implemented product-facing route. The global exception filter produces a safe `{ error: { code, message, status, requestId, details? } }` shape, but the route's OpenAPI metadata currently documents only its success response. `frontend/src/lib/api-base.ts` resolves the client base URL, and there is no generated client or shared package.

The Phase 7 roadmap depicts `packages/api-client`; approved C04, ADR 0002, `AGENTS.md`, and architecture/frontend docs instead require `frontend/src/lib/api/generated/`. The latter is authoritative under the repository source hierarchy. The roadmap diagram remains historical direction, not permission to create a second package or import backend DTOs.

## Goals / Non-Goals

**Goals:** Generate deterministic, checked-in frontend contract types from the same NestJS OpenAPI definition used by the running service; make the current health call type-safe; make stale output a CI failure; preserve the safe error and request-correlation contract.

**Non-Goals:** Product-facing health UI, a general API abstraction hierarchy, auth token middleware, domain routes/DTOs, direct database access, OpenAPI for hypothetical endpoints, generated API publication, and root package extraction.

## Decisions

1. **One backend OpenAPI source, no network dependency for generation.** Reuse the existing application bootstrap/Swagger document construction to export the in-memory document to a temporary local JSON file. The export command must close the application, avoid opening a listener, and use safe local test configuration without production credentials. `/api/openapi.json` must continue serving the same contract. An independently maintained YAML or copied frontend schema would drift from NestJS decorators.

2. **Frontend-local generated types and a typed fetch client.** Pin `openapi-typescript` for generation and use `openapi-fetch` with its generated `paths` type in a small hand-authored frontend transport module. The generated output lives only at `frontend/src/lib/api/generated/`; the thin wrapper lives beside it, not inside the generated directory. The selected tools support operation/path type inference from OpenAPI and a native-fetch transport without a root package ([generator documentation](https://openapi-ts.dev/introduction), [typed fetch documentation](https://openapi-ts.dev/openapi-fetch/)). Avoid creating hand-maintained DTO copies or a generic code generator of our own. Apply must pin compatible versions in the workspace lockfile and confirm the exact CLI syntax against the installed version.

3. **Explicit documented error responses.** Represent the existing exception filter's bounded safe envelope with backend-owned OpenAPI metadata for the implemented health route's relevant error statuses, including global throttling and unexpected failure, without changing runtime behavior. Preserve response header/request ID documentation. The client wrapper distinguishes typed non-2xx responses from transport/abort failures and never silently maps them to health success. Do not add a fictional auth error or invent a new wire shape.

4. **Deterministic command and drift gate.** Add named workspace scripts to export, regenerate, and check the contract. Generation feeds the local exported OpenAPI JSON to pinned tooling, normalizes nondeterministic fields if any appear, and writes the one committed generated output. The check exports afresh and uses a no-write comparison/check against committed output; an altered operation or schema must fail. Integrate the check into CI and document the regenerate-and-review sequence for later endpoint changes. Contract checks may use a temporary file outside tracked source but must clean it up.

5. **Minimal consumer proof and test seams.** Create a frontend-local typed health request using the existing `getApiBaseUrl` and an injectable fetch/test seam. Test successful data, documented HTTP errors, network/abort failures, configured base URL, and absence of credentials by default. A contract test checks the generated path and response shape against the backend document. Keep the API transport in the trusted frontend application; the Worker/preview receives no API client or token.

## Risks / Trade-offs

- **Backend decorators and runtime can diverge** -> test `/api/openapi.json` against the exported document and exercise health/error behavior with the Fastify test harness. DTO metadata must describe actual serializations, not anticipated fields.
- **Generated output is stale or nondeterministic** -> pin generator versions, compare exact output in a clean check, and fail CI on drift. Document regeneration as part of backend API changes.
- **Error schemas overpromise statuses** -> document only observed/implemented statuses and keep the generic unknown-route response outside the health operation.
- **Typed fetch is not runtime validation** -> retain backend validation and error containment; the client must treat malformed/unexpected responses as failures rather than asserting them valid.
- **Future auth needs a transport hook** -> keep the wrapper narrow; Phase 8 will add verified bearer acquisition through a separate approved change. This phase must not prebuild a token store or auth middleware.

## Migration Plan

No production data or API migration. Apply adds tooling and generated frontend output while retaining the existing health wire contract. If generation or checks fail, revert this Apply change without altering database migrations or deployed state. Future backend endpoint changes update the OpenAPI document, regenerate the client, review the generated diff, and pass the drift gate in the same PR.
