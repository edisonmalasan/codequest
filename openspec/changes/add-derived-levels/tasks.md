# Tasks

## 1. Backend derived level contract

- [x] 1.1 Add a versioned provisional linear policy and pure level derivation from total XP; verify 0, 99, 100, 235, and larger exact boundaries with focused unit tests.
- [x] 1.2 Extend the existing owner-only XP response with consistent level/boundary fields, leaving the ledger as sole authority; verify service integration, owner isolation, unauthenticated route denial, and OpenAPI contract tests.
- [x] 1.3 Document policy, provisional F04 status, and future balancing obligation in `docs/gamification.md`; verify the examples match derivation tests.

## 2. Trusted account presentation

- [x] 2.1 Regenerate the frontend API schema and add a trusted XP read with runtime response checks; verify success, no-token, malformed-response, and failure cases in API-client tests.
- [x] 2.2 Present server-derived level and XP progress on the authenticated account page, with provisional label and unavailable state; verify accessible UI, retry, and sign-out clearing in component tests.

## 3. Integration verification

- [x] 3.1 Run root test, lint, typecheck, build, API drift, strict OpenSpec validation, and relevant database checks; review the final diff for Phase 21+ exclusions.
