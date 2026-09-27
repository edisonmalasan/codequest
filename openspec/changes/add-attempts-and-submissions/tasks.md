# Tasks

## 1. Backend contract and policy

- [ ] 1.1 Add strict bounded request/response DTOs and protected LearningModule routes; verify OpenAPI includes bearer, success, and safe errors.
- [ ] 1.2 Add server normalization of Phase 16 case results against published quest cases; verify unit tests reject forged pass flags, missing/duplicate IDs, wrong versions, and oversized data.
- [ ] 1.3 Add explicit backend permission and published quest/prerequisite lookup; verify focused tests deny wrong owner, absent auth, unpublished quests, and missing prerequisites.

## 2. Durable attempts and acceptance

- [ ] 2.1 Implement transactional published quest projection and owner-bound attempt/source/result persistence using existing schema; verify PostgreSQL-backed integration tests preserve version references, snapshots, and server timestamps.
- [ ] 2.2 Add idempotent event replay, conflicting replay denial, serialized attempt counts, and one-per-quest completion acceptance; verify concurrent/retry and failed-result tests.
- [ ] 2.3 Document API trust, privacy, and operational limitations in backend/security docs; verify wording makes client-reported acceptance and F06 gate explicit.

## 3. Frontend submission flow

- [ ] 3.1 Regenerate the frontend API contract and add a protected typed submission/history client; verify contract drift and client tests.
- [ ] 3.2 Connect published quest cases to isolated local Check and add an optional Editor Workspace submit seam that captures current source/result; verify stale Check invalidation and no automatic request.
- [ ] 3.3 Add authenticated explicit Submit and backend acceptance feedback to the published quest view; verify unit and practical Playwright coverage of the learner flow and owner isolation.
- [ ] 3.4 Document the learner flow and local-versus-accepted status in frontend/validation docs; verify no language claims independent grading.

## 4. Integrated verification

- [ ] 4.1 Run root `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, API drift, and strict OpenSpec validation; review the final diff for Phase 18+ side effects.
