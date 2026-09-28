# Tasks

## 1. Timezone account setting

- [ ] 1.1 Add validated IANA timezone policy and protected self-only account update, including same-user serialization; verify service/API tests reject invalid zones and foreign owner selection.
- [ ] 1.2 Add timezone setting to the authenticated account view using the generated client and explain prospective effect; verify component tests for success, pending, and failure states.

## 2. Qualifying day persistence

- [ ] 2.1 Insert a qualifying day inside first-completion acceptance using server timestamp, current profile timezone, unique local date, and 24-hour changed-zone guard; verify focused database tests for atomicity, same-day completions, replay, local midnight, timezone changes, and no backdating.
- [ ] 2.2 Document the precise day-credit rule and ADR 0005 trust limit in gamification/API docs; verify examples against the integration tests.

## 3. Derived streak read

- [ ] 3.1 Implement date-sequence current/longest derivation and protected self-only `GET /api/v1/streaks`; verify unit and integration tests for empty, today/yesterday, gap, owner separation, and historical timezone days.
- [ ] 3.2 Regenerate the OpenAPI client, display derived streak values in the account view, and update API documentation; verify generated-contract check and frontend component tests.

## 4. Integration verification

- [ ] 4.1 Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm api:check`; review the final diff and test results before the Apply PR.
