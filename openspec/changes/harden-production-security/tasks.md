# Tasks

## 1. Token and deployment configuration

- [x] 1.1 Validate a bounded `SUPABASE_AUTH_MAX_TOKEN_AGE_SECONDS` with a provider-aligned default; test invalid values and safe configuration errors.
- [x] 1.2 Require present, current `iat` and `exp` claims and a positive lifetime within that bound in the existing Supabase verifier; cover missing, future, overlong, expired, and valid tokens with focused tests and safe `401` behavior.
- [x] 1.3 Reject plaintext production CORS origins before listening while preserving explicit development/test origins; cover both paths with configuration and HTTP tests.

## 2. Browser boundary

- [x] 2.1 Add defensive response headers to trusted application responses through existing middleware, leaving dedicated runtime and preview host paths separate; add middleware regressions for each surface.
- [x] 2.2 Exercise application headers and isolated Worker/preview bootstrap behavior in the existing browser security/PWA suite.

## 3. Security review

- [x] 3.1 Audit protected routes, owner checks, request validation, and rate limits against the canonical specs; add a focused regression for any uncovered invariant and record process-local/ingress limits.
- [x] 3.2 Audit Worker/preview separation, migration privilege source, absence of upload routes, and secret exposure in tracked configuration; document repository evidence and deployment-only checks in a dated security review, including F06 obligations.

## 4. Verification

- [x] 4.1 Run root tests, lint, typecheck, build, API/content drift and targeted browser checks; validate the OpenSpec change strictly, review the final diff, and record actual results and remaining limitations.
