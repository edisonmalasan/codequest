# Tasks

## 1. Verify Roadmap Dependencies

- [ ] 1.1 Confirm dated R04 real-auth integration evidence and founder acceptance for the R08 HTML, CSS, JavaScript, and DOM courses; verify links identify the tested commits and environment, and stop Apply before feature implementation if either dependency is open.

## 2. Add Private Profile Preferences

- [ ] 2.1 Add nullable display-name and avatar-ID fields through a new additive migration; verify `pnpm --dir backend db:check`, `pnpm --dir backend db:drift`, and migration tests pass without rewriting existing migrations.
- [ ] 2.2 Implement self-only profile read/update with verified-principal ownership and published-avatar allowlisting; verify unit/integration tests reject forged owners, unknown IDs, invalid names, and cross-account reads.
- [ ] 2.3 Export the profile contract through OpenAPI and regenerate the frontend client; verify `pnpm api:check` passes.

## 3. Derive Deterministic Achievements

- [ ] 3.1 Add the immutable initial achievement catalog for first accepted quest, first complete chapter, and first complete course using stable published scope snapshots; verify curriculum compatibility and deterministic ordering tests.
- [ ] 3.2 Implement the self-only achievement read from current-equivalent accepted learning facts; verify accepted, unaccepted, stale, replayed, guest-pending, and cross-owner cases, and confirm no XP, streak, or unlock authority changes.
- [ ] 3.3 Export achievement definitions and earned state through OpenAPI; verify `pnpm api:check` passes and generated client contains no handwritten edits.

## 4. Integrate Private Profile Presentation

- [ ] 4.1 Extend the authenticated account/profile view with editable private preferences and original avatar catalog choices; verify accessible names, default fallback, save errors, and owner-switch behavior in component tests.
- [ ] 4.2 Present achievement criteria and earned state with personal-learning labels, and refresh from trusted reads after accepted submission or confirmed outbox replay; verify pending/uncertain operations never optimistically grant an achievement.
- [ ] 4.3 Compose existing progress, XP, provisional level, streak, and unlock views without duplicate state; verify each protected section has independent loading, failure, and retry behavior and does not fabricate zeros.

## 5. Verify R09 Integration and Acceptance

- [ ] 5.1 Add synthetic account browser coverage for profile edit/read, achievement earning, account switching, refresh, replay, and protected API failures; verify another owner's profile or achievements never render.
- [ ] 5.2 Run `pnpm --dir backend curriculum:validate`, `pnpm api:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, relevant browser suites, and strict OpenSpec validation; record failures and leave the affected task open.
- [ ] 5.3 Record exact-build integrated evidence and founder review for profile and reward presentation; verify R04/R08 dependencies are closed and no mastery, competitive, beta-GO, or production-ready claim is made.
