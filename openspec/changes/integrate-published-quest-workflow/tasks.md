# Tasks

## 1. Published exercise contract

- [x] 1.1 Add a versioned, bounded, mode-specific descriptor to backend curriculum authoring and publication validation; verify existing JavaScript snapshots and invalid file/mode/case fixtures with backend tests and the curriculum validation command.
- [x] 1.2 Expose the optional descriptor in Quest OpenAPI and regenerate the frontend client; verify `pnpm api:check` and that current Quest responses remain compatible.
- [x] 1.3 Document authored mode, file, version, assessment, and publication-review rules with an original synthetic fixture; verify the fixture is not selected as a public course.

## 2. Local web checks and source transport

- [ ] 2.1 Implement bounded inert static HTML/CSS assertions and deterministic case feedback; verify malformed definitions, external-resource denial, byte/count limits, and a finite Check in focused tests.
- [ ] 2.2 Implement supported interactive-state/event assertions through the isolated R07A adapter without executable test programs; verify finite interaction, unsupported APIs, malformed packets, hostile loops, and fresh-check recovery in browser tests.
- [ ] 2.3 Add the canonical multi-file source envelope and backend descriptor comparison under the existing 64 KiB `source` limit; verify legacy source, version mismatch, duplicate/extra files, owner isolation, exact replay, and no second reward in backend tests.
- [ ] 2.4 Extend the owner-scoped outbox/guest-local source handling only where an authored mode permits it; verify uncertain-response replay and account switching preserve original source and event IDs in focused tests.

## 3. Published lesson integration

- [ ] 3.1 Map the selected descriptor to one owner/version-bound Editor Workspace and its allowed Run, Preview, and Check adapters; verify JavaScript compatibility, static mode, unavailable mode, draft restoration, and source preservation in component tests.
- [ ] 3.2 Wire Check snapshot correlation and explicit Submit to the published assessment and private source format; verify edit-after-pass, cancellation, blocked/stale/offline replay, backend acceptance refresh, and no local false completion in component and API tests.
- [ ] 3.3 Add ordered Back/Next navigation using published hierarchy and owner-scoped unlock data, with provisional guest states and unsaved-work handling; verify locked, unavailable, cross-chapter, guest, and revisit paths in component/browser tests.
- [ ] 3.4 Update the R07 workflow documentation and accessible desktop/tablet/mobile states; verify keyboard/reflow and source/error/status presentation in Playwright against the published route.

## 4. Published interactive gate and integration review

- [ ] 4.1 Run exact-build published-route containment, origin, message-spoof, source/output bound, repeated tight-loop, fresh-run, cancellation, navigation, and cleanup probes across the declared browser matrix; record dated build, origins, versions, failures, and untested setups. Keep publication disabled if any required probe fails.
- [ ] 4.2 Define and verify the curriculum and technical/security publication review gate with a synthetic test-only descriptor; confirm production publication rejects missing reviews and remains off until a separately reviewed R08 snapshot and exact-build evidence exist.
- [ ] 4.3 Exercise the complete synthetic and existing published JavaScript paths from lesson through accepted backend replay, map/progress refresh, and revisit; verify `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm api:check`, strict OpenSpec validation, and focused Playwright. Record R04 real-provider and founder acceptance separately if still unavailable.
