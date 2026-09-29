# Tasks

## 1. Installation assets and build

- [ ] 1.1 Add pinned compatible Serwist dependencies and webpack configuration, generated-output ignores, and cache bounds; verify install, typecheck, and production worker build.
- [ ] 1.2 Add manifest, metadata, deterministic existing-brand PNG icons, and public offline HTML/CSS; verify metadata/icon dimensions and offline shell accessibility in focused tests and document generation/install limits.

## 2. Cache and origin security

- [ ] 2.1 Implement explicit public precache filtering and worker install/activate/fetch handlers without arbitrary cache messages; test unknown/query/protected/external/data/runtime exclusions and budget failures.
- [ ] 2.2 Extend middleware public routing and worker headers while preserving dedicated origin denials; cover these in focused tests and document cache policy/rollback in docs/pwa.md and security docs.

## 3. Application lifecycle

- [ ] 3.1 Register only in production on the application origin, show accessible network/error/waiting states, and clean up listeners without force reload or activation; test unsupported/failed/waiting/update/reconnect behavior and document user recovery guidance.
- [ ] 3.2 Add production Playwright coverage for registration, offline fallback, protected-response exclusions, compartment denials, waiting updates, and retained local records; run the focused suite and record the actual browser evidence without platform-support claims.

## 4. Integration verification

- [ ] 4.1 Run root test/lint/typecheck/build, API drift, and strict OpenSpec validation; review the final diff for Phase 27+ or authority changes and record results before the Apply PR merges.
