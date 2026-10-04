# R07 local verification — 2026-10-05

Implementation commit: `8996a06` on `feat/published-quest-workflow`.

## Confirmed on this implementation

| Check | Result |
| --- | --- |
| `pnpm --dir frontend test` after the adapter fix | 101 files, 457 tests passed |
| `pnpm --dir backend test` alone | 33 Vitest files, 213 tests and 7 Node tests passed |
| `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm api:check` | Passed |
| `pnpm exec openspec validate integrate-published-quest-workflow --strict` | Passed |
| Published static web lesson fixture, Chromium | Passed on `5a9cdc6`: multi-file Check, edit invalidation, preview, and 390px reflow. The later fix changed only the interactive review adapter lifecycle. |
| Interactive containment suite excluding 100-cycle endurance, Chromium/Firefox/WebKit | 30 passed on `8996a06`: synthetic lesson route, local Check, isolated preview, forged-message rejection, bounds, cancellation, recovery, and cleanup |
| `100 hostile loops each allow a fresh finite session`, Chromium | Passed on `8996a06` in 5.0 minutes. An earlier run on `5a9cdc6` ended with a Playwright worker exit (`4294967295`); the cause of that exit was not established. |
| `pnpm test` | Failed on `5a9cdc6` with six and on `8996a06` with eight backend HTTP foundation cases reaching their 5-second timeout. A sequential Turbo retry on `8996a06` still timed out five of those cases. The same 12-case file and complete backend suite passed alone; the frontend suite passed separately after `8996a06`. |

The browser fixtures use the local development application origin `http://127.0.0.1:3100`, runtime origin `http://localhost:3100`, and preview origin `http://localhost:3101`. The Quest API is mocked for the static and interactive route probes. Browser engines are Playwright 1.63.0 Chromium, Firefox, and WebKit; these results do not establish physical-device or hosted behavior.

## Open gates

- **Task 4.1:** No original R08 interactive Quest is selected in the production curriculum. The exact-build published-route containment and recovery matrix cannot be closed by a mocked Quest response. The current local 100-cycle probe passed, but the earlier worker exit remains unexplained. Production interactive publication remains rejected by the curriculum loader.
- **Task 4.3:** The complete published JavaScript lesson-to-backend browser flow has not run against an isolated local database in this verification. The configured local backend database URL points to a remote host, so the synthetic-account Playwright flow was not run against it. Owner-bound accepted replay, source matching, XP idempotency, and progress/unlock behavior passed in isolated PGlite backend tests. The root `pnpm test` timeout remains recorded above.
- R04 real-provider verification and founder acceptance remain separate, open records.

No public interactive content, hosted release evidence, or founder acceptance is claimed by these local results.
