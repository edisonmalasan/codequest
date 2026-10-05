# R07 local verification — 2026-10-05

Latest implementation commit: `0c3b95e` on `feat/published-quest-workflow`.

## Confirmed on this implementation

| Check | Result |
| --- | --- |
| `pnpm --dir frontend test` after the adapter fix | 101 files, 457 tests passed |
| `pnpm --dir backend test` alone | 33 Vitest files, 213 tests and 7 Node tests passed |
| `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm api:check` | Passed |
| `pnpm --dir frontend test:performance-budget` | Passed on `75b8ae9`: Quest 1,064,797 / 1,200,000 raw JS bytes; offline 1,086,926 / 1,225,000. Web-only adapters load by mode. |
| `pnpm exec openspec validate integrate-published-quest-workflow --strict` | Passed |
| Published static web lesson fixture, Chromium | Passed on `5a9cdc6`: multi-file Check, edit invalidation, preview, and 390px reflow. The later fix changed only the interactive review adapter lifecycle. |
| Interactive containment suite excluding 100-cycle endurance, Chromium/Firefox/WebKit | 30 passed on `8996a06`: synthetic lesson route, local Check, isolated preview, forged-message rejection, bounds, cancellation, recovery, and cleanup |
| Static and interactive published-route fixtures after mode-based loading | 4 passed on `75b8ae9`: static Chromium and interactive Chromium, Firefox, and WebKit |
| `100 hostile loops each allow a fresh finite session`, Chromium | Passed on `8996a06` in 5.0 minutes. An earlier run on `5a9cdc6` ended with a Playwright worker exit (`4294967295`); the cause of that exit was not established. |
| `pnpm test` | Failed on `5a9cdc6` with six and on `8996a06` with eight backend HTTP foundation cases reaching their 5-second timeout. A sequential Turbo retry on `8996a06` still timed out five of those cases. The same 12-case file and complete backend suite passed alone; the frontend suite passed separately after `8996a06`. |
| GitHub CI run `37226058401` for `75b8ae9` | Passed: database check/drift/migration, API contract, curriculum validation, lint, typecheck, `pnpm test`, production build and performance budget, home/PWA/performance/curriculum/analytics/learning/accessibility browser checks. |
| GitHub CI run `37250044616` for `bae3e21` | Passed all required checks, including isolated PostgreSQL learning E2E. That flow now verifies authenticated Q02 submission, refreshed course map showing Q02 completed and Q03 available, reopening Q02, Next navigation, and unchanged attempt count. |
| GitHub CI run `37251202501` for `183dba0` | Failed the learning suite because the first test-only server used `tsx`, which did not emit Nest decorator metadata; Quest GET requests returned 500. The fixture was changed to use the repository TypeScript build, then checked locally with 200 responses for Q01 and WEB01 before the successful CI rerun. |
| GitHub CI run `37252046312` for `0c3b95e` | Passed all required checks. The isolated PostgreSQL learning E2E also exercised a test-only synthetic static web Quest through local Check, owner-bound backend submission, exact replay, completed progress, refreshed course map, and revisit without another attempt across Chromium, Firefox, WebKit, and mobile Chromium. The fixture is injected by a test-only compiled server and is not part of production publication. |

The browser fixtures use the local development application origin `http://127.0.0.1:3100`, runtime origin `http://localhost:3100`, and preview origin `http://localhost:3101`. The Quest API is mocked for the static and interactive route probes. Browser engines are Playwright 1.63.0 Chromium, Firefox, and WebKit; these results do not establish physical-device or hosted behavior.

## R07 completion and R08 publication handoff

Task 4.3 completed on `0c3b95e` with CI run `37252046312`. The browser used the compiled test-only catalog server and isolated PostgreSQL; it did not select or publish a web Quest in the production catalog. The configured local backend database URL points to a remote host, so synthetic-account Playwright writes were not run against it. R04 real-provider verification and founder acceptance remain separate, open records.

The founder approved moving selected-Quest exact-build evidence to R08 on 2026-10-05. Task 4.1 records that mandatory gate; it does not claim the following evidence has passed. The production curriculum loader still rejects interactive selection even when synthetic review fields are present. R08 must retain failures and untested setups rather than infer success from R07/R07A fixtures.

| R08 publication requirement | Current status / required record |
| --- | --- |
| Original Quest and assessment | **Open.** Select complete original interactive content and assessment versions, with dated curriculum and technical/security reviewers. No R08 interactive Quest is selected. |
| Exact build and origins | **Open.** Record the selected commit/build, application, runner, and preview origins, CSP/sandbox configuration, browser versions, and supported setup matrix. R07 probes used local development origins and a mocked Quest response. |
| Containment and message correlation | **Open on selected build.** Probe runner/preview isolation, allowlisted assets, opaque display child, network/storage/navigation denial, forged and stale messages, and exact window/origin/nonce/generation correlation. |
| Source, output, and mutation bounds | **Open on selected build.** Probe oversized source/output, unsupported DOM APIs, malformed packets, event sequence, and mutation flood without partial display updates or source loss. |
| Repeated recovery and lifecycle | **Open on selected build.** Probe repeated source and handler tight loops, bounded termination, fresh finite Run/Check, cancellation, navigation, unmount, and cleanup across Chromium, Firefox, WebKit, and the declared mobile setup. The earlier local worker exit remains unexplained. |
| Review and change control | **Open.** Record each pass/fail/untested result with date and exact versions. Re-run affected probes after adapter, host, origin, policy, or snapshot changes before publication. |

No public interactive content, hosted release evidence, or founder acceptance is claimed by these local results.
