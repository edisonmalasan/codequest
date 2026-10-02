# Tasks

## 1. Reproduce and classify local integration failures

- [x] 1.1 Run `pnpm dev`, verify frontend routes and backend health, isolate the observed backend watch restart if reproducible, and record sanitized results with date, commit, and environment in an R04 verification record.
- [x] 1.2 Check only the shape and reachability of configured Supabase URL, publishable key, issuer/JWKS, redirect allowlist, email and OAuth provider settings; record missing external settings without committing values or secrets, and verify no raw credentials appear in the record.
- [x] 1.3 Trace registration, confirmation, login, callback, account establishment, logout, recovery, and password update with synthetic identities where the configured service permits; record each method's observed result, blocker and retry, leaving unexercised paths explicitly open.

## 2. Repair application-owned failures

- [x] 2.1 Apply the smallest confirmed local startup repair if backend availability blocks the account handshake; verify `pnpm dev` serves frontend and backend health without weakening production validation.
- [x] 2.2 Repair confirmed auth/callback/session/return-path defects in existing frontend modules; verify focused component and browser regressions cover success, confirmation pending, safe callback failure, refresh and sign-out.
- [x] 2.3 Repair confirmed account handshake or JWT verification defects in existing backend identity modules only when evidence points there; verify focused ownership, invalid-token, and two-account tests plus API drift if the contract changes.
- [x] 2.4 Update local Auth setup and troubleshooting docs for confirmed configuration requirements and safe retry behavior; verify documented commands and redirect paths match the implemented flow, without publishing provider values or secrets.

## 3. Real integration and founder gate

- [ ] 3.1 Run synthetic email signup, delivered confirmation, login/logout, refresh/relogin, recovery/password change, and self-owned backend account on the exact candidate commit and environment; record dated pass/fail and retest for every path.
- [ ] 3.2 Run synthetic Google and GitHub OAuth journeys, including real redirect/callback and backend account read, on the exact candidate commit and environment; record separate dated pass/fail and external provider blockers.
- [ ] 3.3 Run root lint, typecheck, tests, build, focused browser Auth coverage, strict OpenSpec validation, and API drift if affected; record exact commands and results.
- [ ] 3.4 Have the founder walk through every R04 Auth method on the intended real environment and record individual acceptance or defects; keep R04 below founder accepted while any critical path fails.
