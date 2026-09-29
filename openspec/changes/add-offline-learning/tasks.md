# Tasks

## 1. Offline entry and runner feasibility

- [x] 1.1 Add a static credential-free `/offline-learning` route and explicit public precache entry; verify production HTML and CacheStorage contain no session, learner, API, or dynamic navigation response.
- [x] 1.2 Add a fixed-resource `/runtime/` worker and correlated setup document under the dedicated host allowlist/CSP; verify unit tests reject arbitrary paths, messages, credentials, oversized or failed installation.
- [x] 1.3 Prove distinct-origin production Chromium cold offline reopen can load the route, runner bootstrap, and fresh JavaScript Worker after preparation; verify loop timeout and finite recovery without application-origin execution. If this gate fails, revise the approved design before advertising exercise readiness.
- [x] 1.4 Update `docs/pwa.md` and `docs/javascript-runtime.md` with the exact cache/origin/deployment boundary and browser evidence; verify links and resource names match the implementation.

## 2. Downloaded lesson storage

- [x] 2.1 Extend the existing Dexie database/repository with owner-scoped snapshot listing, exact-version lookup, bounded local illustrations, and safe removal; verify upgrade and owner/version/corruption/quota tests preserve prior drafts and outbox rows.
- [x] 2.2 Add explicit download/remove controls to the online lesson view, including partial/reading/exercise readiness and version/date labels; verify focused UI tests cover failure, retry, and no silent accepted-state claim.
- [x] 2.3 Render saved lessons and illustrations from local records in the offline library through existing lesson components; verify cold-navigation browser flow and missing/evicted/other-owner error states.
- [x] 2.4 Document download limits, eviction/recovery, version changes, and device-only retention in the learner-facing flow and `docs/offline-learning.md`; verify wording against storage behavior.

## 3. Offline practice and accepted-progress view

- [x] 3.1 Reuse owner-scoped Editor Workspace drafts and the isolated Run/Check adapters in offline mode while suppressing backend start/hint calls; verify local exercise, storage failure, cancellation, and source preservation tests.
- [x] 3.2 Add a minimal versioned owner-scoped accepted-progress projection from successful protected Journey reads and clear it on logout/switch; verify tests for owner isolation, stale labels, and no mutation from Check/pending work.
- [x] 3.3 Display last-known progress separately from provisional local activity in the offline library; verify failed protected reads never appear as an authoritative empty snapshot.
- [x] 3.4 Document offline capability limits and the unchanged Phase 25 pending-work boundary; verify AI, remote, social, account, and publishing actions are not presented as available offline.

## 4. Integration and stage verification

- [x] 4.1 Run production-browser fixtures for online download, cold offline reading/editing/Run/Check, account switch, cache eviction, and reconnection; record exact browser results and F02 evidence limits.
- [x] 4.2 Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, OpenAPI drift check, and strict OpenSpec validation; review final diff and report any failed gate before the Apply PR merge.
- [x] 4.3 Verify exercise readiness remains unclaimed while an application or runner worker update is installing/waiting, including an update discovered during correlated preparation; preserve the normal waiting lifecycle.

## Apply evidence

- Production Chromium: `pnpm --dir frontend test:pwa` passed 5/5, including cold offline launch, dedicated-origin fresh Worker timeout/recovery, downloaded reading/editing/Run/Check, retained drafts, runtime eviction and reconnect, local-session owner isolation, and waiting updates.
- Root `pnpm test`: 357 frontend tests passed; unchanged backend checks used the verified Turbo cache (161 tests plus 3 migration-history checks). Focused coverage includes Dexie v3-to-v4 preservation, transactional quota rollback, owner/version isolation, corrupted resources, minimal accepted-progress projection, and no offline backend activity.
- Production account-bucket testing exposed a browser public-env inlining failure; explicit static public env reads fixed it. Reconnect test now flushes the ready subscription before dispatch, and ESLint excludes generated browser traces.
- Physical mobile/Safari, Firefox installation, assistive technology, low-power timing, native quota/background/OS restart remain untested F02 obligations. No Phase 28 sync protocol or cloud draft behavior is added.
- Final root lint, typecheck and build passed; `pnpm api:check`, strict change validation and final diff checks passed. The earlier reconnect test race and generated-trace lint failure were resolved before opening the Apply PR. Required CI remains the merge gate.
- Follow-up readiness verification: seven regression tests cover application/runtime installing/waiting updates, updates discovered mid-preparation, correlated messages and cleanup. Final root test passed 364 frontend tests; lint, typecheck, build and production Chromium 5/5 passed. Waiting workers never activate or reload by preparation.
