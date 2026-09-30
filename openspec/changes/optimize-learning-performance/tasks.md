# Tasks

## 1. Production baseline and regression budget

- [x] 1.1 Add a repeatable production-build byte report for home, Journey, Quest, offline learning, fixed public assets, and PWA precache; verify it prints source paths and exact byte totals from emitted artifacts.
- [x] 1.2 Set conservative initial-route and asset ceilings based on the measured baseline, wire the byte gate into CI, and test over-budget and missing-manifest failures; verify the normal production build passes and an injected oversized fixture fails.
- [x] 1.3 Record the baseline, hardware/build conditions, curriculum response size sample, and byte-gate scope in `docs/performance-review.md`; verify the report distinguishes raw and transfer/first-load estimates.

## 2. Deferred editor loading and assets

- [x] 2.1 Defer CodeMirror tooling at the reusable Editor Workspace seam with a named loading state and retryable failure while retaining parent-owned source; verify editor tests cover load, failure, retry, and source preservation.
- [x] 2.2 Audit Pixelify font, map art, sprite/emblem assets, and lesson illustrations for eager delivery and size. Apply only evidence-backed asset or delivery changes, update provenance if bytes change, and verify visual/accessibility tests and the byte report.
- [x] 2.3 Measure the Quest and offline initial chunk graphs after the split, update the byte ceilings and performance review, and verify both routes load lesson/library content before editor tooling plus existing Run/Check and draft flows in browser tests.

## 3. Worker and shell behavior

- [x] 3.1 Add a repeatable production-like cold and subsequent finite Run/Check browser timing probe that records conditions without a fixed timing pass threshold; verify fresh Worker identity and existing timeout/recovery tests still pass.
- [x] 3.2 Record actual generated service-worker precache entries and bytes, preserve the 2 MiB/12 MiB hard ceilings and protected-cache exclusions, and verify PWA/offline browser coverage after the route changes.

## 4. Integration

- [x] 4.1 Run root `pnpm test`, `pnpm lint`, `pnpm typecheck`, production build, focused learning/offline/accessibility browser gates, the byte gate, and strict OpenSpec validation; review the final diff and record exact results and F02 untested device limits.
