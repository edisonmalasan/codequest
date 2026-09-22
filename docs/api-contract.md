# API contract generation

The backend's NestJS OpenAPI document is the source for the frontend's typed REST client. The running backend serves it at `/api/openapi.json`; the generation command exports the same document from an initialized in-memory application without opening a listener or requiring a production database credential. Today the only generated operation is `GET /api/v1/health`. New operations enter the client only after their backend capability implements and documents them.

Run these commands from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm api:generate
pnpm api:check
```

`api:generate` builds the backend, exports a temporary OpenAPI document, and writes `frontend/src/lib/api/generated/schema.d.ts` through pinned `openapi-typescript`. Commit and review this generated diff with the backend DTO/route change. Do not edit the generated file by hand. `api:check` rebuilds and exports the current backend contract, then checks the committed generated output without rewriting it. CI runs that check on each PR and fails on drift. Both commands remove their temporary document when done.

The hand-authored `frontend/src/lib/api-client.ts` uses `openapi-fetch` with the generated `paths` type and the existing API base URL. Its current health call distinguishes success, safe HTTP errors, malformed responses, network failures, and cancellation. It sends no credentials by default. Future authenticated operations need a separate approved token-handling design and must stay outside the learner execution compartment.

The roadmap's `packages/api-client` diagram predates [decision C04](decisions.md) and [ADR 0002](adr/0002-api-contract-and-client-ownership.md). The approved frontend-local path takes precedence. Frontend code must not import backend source, database schema, or raw curriculum; no root API package is justified by a second consumer today.

## Apply verification (2026-09-22)

The frozen install, backend and frontend lint/typecheck/tests/build, root lint/typecheck/tests/build, strict OpenSpec validation, and `api:check` passed locally. The frontend ran 106 tests and the backend ran 33. Generating twice produced identical output. A temporary change to health DTO OpenAPI metadata made `api:check` fail without rewriting the committed artifact; restoring the DTO made it pass. Backend test files run serially because parallel database initialization repeatedly delayed the existing HTTP startup test past its unchanged five-second timeout on the development machine.
