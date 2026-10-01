# Tasks

## 1. Study protocol

- [x] 1.1 Write `docs/private-beta-study.md` with the eight Phase 39 observation questions, the existing measurement definitions and trust caveats, and a synthetic rehearsal path; verify every metric and route reference against the roadmap, analytics guide, and canonical specs.
- [x] 1.2 Add blank participant observation, issue triage, and weekly pattern review templates with privacy minimization and no arbitrary F05 values; verify they do not request raw code, credentials, protected responses or unapproved identity linkage.

## 2. Release boundary

- [x] 2.1 Add a pre-invitation checklist that references each open Phase 38 gate and requires dated owner evidence and release candidate approval; verify the study guide remains NO GO while F06 or hosted gates are open.
- [x] 2.2 Update the roadmap with a link to the study protocol and honest Phase 39 status; verify it does not claim recruitment, observations, targets or live telemetry occurred.

## 3. Integration verification

- [x] 3.1 Run strict OpenSpec validation, `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `git diff --check`; review final staged diff and report exact results.
