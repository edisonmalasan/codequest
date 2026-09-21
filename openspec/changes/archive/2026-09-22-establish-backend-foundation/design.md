## Context

The repository already has a bootable NestJS 11 application using Fastify, a minimal environment parser, and a root health controller. It does not yet have domain modules, a versioned API, a global validation/error contract, request correlation, safe structured access logs, CORS policy, OpenAPI, or throttling. The approved architecture requires a modular monolith, REST/OpenAPI, strict frontend/backend separation, backend-only application authority, and no learner execution in NestJS. The next roadmap section after this work owns database setup, so this design cannot depend on PostgreSQL, Supabase, or Drizzle.

## Goals / Non-Goals

**Goals:**

- Make one application bootstrap path reusable by production startup and integration tests.
- Establish small, explicit domain boundaries without inventing domain services or shared packages.
- Make HTTP failures, request correlation, logs, configuration, CORS, throttling, and documentation consistent before feature endpoints exist.
- Keep the health contract honest about current process-only readiness.
- Provide focused tests that exercise the assembled Fastify application, not only isolated helpers.

**Non-Goals:**

- Persistence, migrations, repositories, Supabase clients, or readiness checks for dependencies that do not exist.
- Supabase Auth integration, guards, roles, ownership rules, or user/profile endpoints.
- Curriculum parsing/content, assessment acceptance, progress, XP, streak, unlock, or sync logic.
- Frontend API generation or changes to frontend behavior.
- Distributed rate limiting, production telemetry vendors, deployment manifests, or remote execution.

## Decisions

### Use one bootstrap configurator for startup and tests

`createApplication` will construct the Fastify-backed Nest application and a separate `configureApplication` step will install global prefix/versioning, validation, filters, correlation/logging hooks, CORS, OpenAPI, body limits, and shutdown behavior. `main.ts` will only load configuration, create the application, and listen. Integration tests can initialize the same configured application with Fastify injection, which prevents a second test-only HTTP contract.

Alternative considered: configure controls directly in `main.ts`. That is shorter initially but makes assembled behavior difficult to verify without opening a real port and encourages test drift.

### Use module folders without placeholder services

Identity, Curriculum, Learning, Progress, and Gamification will each contain only a Nest module class. Health will contain its controller and response DTO. This records the roadmap ownership seams without fake repositories, service interfaces, or endpoints. `AppModule` imports these modules and cross-cutting infrastructure only.

Alternative considered: one generic placeholder module or prebuilt services. A generic module loses the approved boundaries; speculative services would create interfaces with no behavior or consumer.

### Combine `/api` global prefix with Nest URI versioning

The application will set `api` as the global prefix, enable URI versioning, and mark health as version `1`, producing `/api/v1/health`. OpenAPI UI and JSON are explicit unversioned documentation endpoints under `/api` and are excluded from the versioned application-resource rule.

Alternative considered: hardcode `/api/v1` as one prefix. Nest URI versioning makes unsupported versions explicit and lets later versions coexist without rewriting the base prefix.

### Keep configuration parsing explicit and dependency-light

An immutable configuration object will parse and validate `NODE_ENV`, `HOST`, `PORT`, `CORS_ORIGINS`, `BODY_LIMIT_BYTES`, `RATE_LIMIT_TTL_MS`, and `RATE_LIMIT_MAX` before application creation. Development defaults allow the documented local frontend origins; production requires an explicit non-wildcard origin list. Numeric bounds will prevent disabled-by-accident controls and impractical allocations.

Alternative considered: add a schema/configuration framework. The current setting set is small, and explicit pure functions preserve strict types and easy unit tests without a framework abstraction. This can be replaced later if configuration breadth creates a concrete need.

### Use Nest validation primitives and a single exception filter

The global validation pipe will enable transformation, whitelist known DTO fields, reject non-whitelisted input, and avoid implicit conversion. A catch-all HTTP exception filter will map validation, throttling, known HTTP failures, and unexpected errors into `{ error: { code, message, status, requestId, details? } }`. Unexpected errors are logged server-side and return a generic message.

Alternative considered: retain Nest default errors. Default shapes vary by exception and do not carry the CodeQuest request ID contract.

### Correlate requests at the Fastify hook boundary

An early hook will accept request IDs matching a conservative printable identifier pattern and length or generate a UUID. It will place the ID on the request, echo it as `x-request-id`, and record start time. A completion hook will emit one structured log with the method, route pathname without query values, status, duration, request ID, and service name. It will never serialize headers or bodies.

Alternative considered: AsyncLocalStorage request context. There is no downstream service logging consumer yet, so adding global async context would be speculative. The request object and filter host provide the correlation needed by this scope.

### Add conservative process-local throttling

Nest throttling will be registered globally from validated configuration. A custom guard/filter integration will preserve the stable error envelope and request ID. This is a foundation only; process-local counters are intentionally not described as distributed protection.

Alternative considered: Redis-backed throttling. Redis and distributed infrastructure are explicitly outside the current architecture and lack a scaling requirement.

### Generate OpenAPI from the configured application

Swagger setup will run after global routing is configured and before initialization. The document will use `/api/v1` as its server, describe only the health operation and shared response schemas currently implemented, expose JSON at `/api/openapi.json`, and serve UI at `/api/docs`. Later client generation remains a separate API capability task.

Alternative considered: commit a handwritten OpenAPI document. Generation from decorated endpoints reduces drift while the application surface grows.

## Risks / Trade-offs

- [Process-local throttling differs across replicas] → State the limit explicitly as a foundation and require a later scaling/security decision before multi-instance claims.
- [Public API documentation could reveal future internal routes] → Generate only from explicitly decorated implemented controllers; no admin or business controllers exist in this scope.
- [Caller-provided request IDs can pollute logs] → Enforce a strict character set and length, generate a UUID for invalid values, and serialize logs as JSON.
- [A global catch-all filter can hide debugging detail] → Log unexpected failures through the server logger with correlation while keeping client responses safe.
- [Empty modules can encourage premature dependencies] → Keep them provider-free and verify import boundaries; add behavior only under later capability specs.
- [CORS is not authentication] → Treat it only as browser-origin policy and retain the approved requirement for backend identity verification in the later auth change.

## Migration Plan

1. Add and lock the minimum validation, OpenAPI, CORS, and throttling dependencies compatible with the existing Nest/Fastify versions.
2. Introduce configuration and bootstrap utilities, then move health into its module and add inert domain modules.
3. Install global HTTP controls and generate the OpenAPI surface.
4. Replace the old root health tests with configuration, unit, and assembled Fastify integration coverage.
5. Run backend and repository lint, typecheck, test, build, strict OpenSpec validation, and boundary scans.

Rollback is the Apply branch or merge commit: this change creates no persisted data, migrations, remote resources, or compatibility state. The former root `/health` route is intentionally replaced by the roadmap contract at `/api/v1/health` before any external production consumer exists.
