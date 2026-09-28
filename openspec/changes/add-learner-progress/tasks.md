# Tasks

## 1. Durable progress facts

- [x] 1.1 Add the forward Drizzle hint-use migration and schema constraints; verify schema drift and isolated PostgreSQL migration tests.
- [x] 1.2 Add owner-scoped, idempotent start and current-version hint recording in ProgressModule with focused auth, validation, retry, and concurrency tests.

## 2. Derived progress API

- [x] 2.1 Implement quest, chapter, Journey, and Course-alias reads using published catalog plus owner facts; test statuses, timestamps, counts, empty scope, retired IDs, compatible/incompatible version transitions, and owner isolation.
- [x] 2.2 Document versioned protected DTOs and route errors in OpenAPI, regenerate the frontend client, and verify contract drift.
- [x] 2.3 Document activity and derivation semantics in `docs/progress.md`; verify links and examples against implemented routes.

## 3. Trusted learner views

- [x] 3.1 Add typed protected frontend API methods and response guards for progress reads/writes; test auth, malformed response, and cancellation behavior.
- [x] 3.2 Load accepted Journey progress into the existing map for authenticated users and keep guest/failure states truthful; test nodes, counts, and retry behavior.
- [x] 3.3 Record authenticated lesson start and first hint disclosure without blocking reading; test owner/session changes and failed recording.

## 4. Integration verification

- [x] 4.1 Run root test, lint, typecheck, build, API drift, and strict OpenSpec validation; review the final diff for Phase 19+ exclusions.
