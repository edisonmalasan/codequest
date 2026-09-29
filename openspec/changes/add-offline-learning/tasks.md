# Tasks

## 1. Offline entry and runner feasibility

- [ ] 1.1 Add a static credential-free `/offline-learning` route and explicit public precache entry; verify production HTML and CacheStorage contain no session, learner, API, or dynamic navigation response.
- [ ] 1.2 Add a fixed-resource `/runtime/` worker and correlated setup document under the dedicated host allowlist/CSP; verify unit tests reject arbitrary paths, messages, credentials, oversized or failed installation.
- [ ] 1.3 Prove distinct-origin production Chromium cold offline reopen can load the route, runner bootstrap, and fresh JavaScript Worker after preparation; verify loop timeout and finite recovery without application-origin execution. If this gate fails, revise the approved design before advertising exercise readiness.
- [ ] 1.4 Update `docs/pwa.md` and `docs/javascript-runtime.md` with the exact cache/origin/deployment boundary and browser evidence; verify links and resource names match the implementation.

## 2. Downloaded lesson storage

- [ ] 2.1 Extend the existing Dexie database/repository with owner-scoped snapshot listing, exact-version lookup, bounded local illustrations, and safe removal; verify upgrade and owner/version/corruption/quota tests preserve prior drafts and outbox rows.
- [ ] 2.2 Add explicit download/remove controls to the online lesson view, including partial/reading/exercise readiness and version/date labels; verify focused UI tests cover failure, retry, and no silent accepted-state claim.
- [ ] 2.3 Render saved lessons and illustrations from local records in the offline library through existing lesson components; verify cold-navigation browser flow and missing/evicted/other-owner error states.
- [ ] 2.4 Document download limits, eviction/recovery, version changes, and device-only retention in the learner-facing flow and `docs/offline-learning.md`; verify wording against storage behavior.

## 3. Offline practice and accepted-progress view

- [ ] 3.1 Reuse owner-scoped Editor Workspace drafts and the isolated Run/Check adapters in offline mode while suppressing backend start/hint calls; verify local exercise, storage failure, cancellation, and source preservation tests.
- [ ] 3.2 Add a minimal versioned owner-scoped accepted-progress projection from successful protected Journey reads and clear it on logout/switch; verify tests for owner isolation, stale labels, and no mutation from Check/pending work.
- [ ] 3.3 Display last-known progress separately from provisional local activity in the offline library; verify failed protected reads never appear as an authoritative empty snapshot.
- [ ] 3.4 Document offline capability limits and the unchanged Phase 25 pending-work boundary; verify AI, remote, social, account, and publishing actions are not presented as available offline.

## 4. Integration and stage verification

- [ ] 4.1 Run production-browser fixtures for online download, cold offline reading/editing/Run/Check, account switch, cache eviction, and reconnection; record exact browser results and F02 evidence limits.
- [ ] 4.2 Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, OpenAPI drift check, and strict OpenSpec validation; review final diff and report any failed gate before the Apply PR merge.
