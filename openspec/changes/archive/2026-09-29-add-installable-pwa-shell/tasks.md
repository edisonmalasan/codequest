# Tasks

## 1. Installation assets and build

- [x] 1.1 Add pinned compatible Serwist dependencies and webpack configuration, generated-output ignores, and cache bounds; verify install, typecheck, and production worker build.
- [x] 1.2 Add manifest, metadata, deterministic existing-brand PNG icons, and public offline HTML/CSS; verify metadata/icon dimensions and offline shell accessibility in focused tests and document generation/install limits.

## 2. Cache and origin security

- [x] 2.1 Implement explicit public precache filtering and worker install/activate/fetch handlers without arbitrary cache messages; test unknown/query/protected/external/data/runtime exclusions and budget failures.
- [x] 2.2 Extend middleware public routing and worker headers while preserving dedicated origin denials; cover these in focused tests and document cache policy/rollback in docs/pwa.md and security docs.

## 3. Application lifecycle

- [x] 3.1 Register only in production on the application origin, show accessible network/error/waiting states, and clean up listeners without force reload or activation; test unsupported/failed/waiting/update/reconnect behavior and document user recovery guidance.
- [x] 3.2 Add production Playwright coverage for registration, offline fallback, protected-response exclusions, compartment denials, waiting updates, and retained local records; run the focused suite and record the actual browser evidence without platform-support claims.

## 4. Integration verification

- [x] 4.1 Run root test/lint/typecheck/build, API drift, and strict OpenSpec validation; review the final diff for Phase 27+ or authority changes and record results before the Apply PR merges.

## Apply evidence — 2026-09-29

- `pnpm test`: 335 frontend tests passed; unchanged backend result reused by Turbo (161 tests and 3 migration-history script tests).
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm api:check`, and `openspec validate add-installable-pwa-shell --strict`: passed.
- `pnpm --dir frontend test:pwa`: final production Chromium 2/2 passed (27.2 s including build/start). Checks include registration, manifest, explicit cache keys, excluded auth/data/API/query traffic, dedicated host denial, offline fallback and keyboard retry, real waiting release, ignored activation message, retained fixture draft/outbox and in-memory source. Added this suite to CI.
- Focused unit coverage: 36 tests for shell budget/route exclusions, installation/icon dimensions, worker message/fetch behavior, middleware and client lifecycle. Existing editor/runtime/replay tests remain green.
- Initial browser fixture used HTTP Auth/Site configuration rejected by the existing production HTTPS policy; corrected the fixture to synthetic HTTPS public configuration without weakening that policy. A later assertion incorrectly treated a public static account JavaScript chunk as account HTML; corrected to check anchored response paths. Original failing runs are not platform-support evidence; final corrected runs pass.
- Visual inspection of the generated maskable icon preserves the existing pixel mark. Final diff adds no backend/schema/authority changes, downloaded lessons, cached progress, cloud drafts or background replay. Physical/native installation and other F02 obligations remain untested.
