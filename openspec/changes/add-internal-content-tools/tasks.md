# Tasks

## 1. Validator and author selection

- [ ] 1.1 Add an explicit `content:validate` command that preserves the existing structural/publication/history gate; verify valid content exits zero and a malformed fixture exits nonzero with its authored path.
- [ ] 1.2 Add bounded Quest/Journey identity and snapshot selection over the validated authored catalog, with exact published-version comparison; verify current versus explicit historical selection, ambiguity, missing version, and unselected draft cases in unit tests.

## 2. Read-only previews

- [ ] 2.1 Implement an inert, escaped local Quest HTML preview from the selected snapshot, with lesson, local images, starter, hints, cases, hierarchy, versions, and draft/publication label; verify script/URL injection cannot execute and no source or manifest file changes.
- [ ] 2.2 Implement an ordered Course/Journey HTML preview with authored and published versions, prerequisites, and review labels; verify draft items are visibly unselected and no learner availability is inferred.
- [ ] 2.3 Add strict CLI arguments and exclusive output-file behavior for both previews, then document author usage and cleanup; verify the documented commands produce readable files and reject absent IDs, traversal, and overwrite.

## 3. Candidate case runner

- [ ] 3.1 Build a bounded selected-Quest fixture using the current authored parser and DTO projection without exposing drafts through production routes; verify fixture shape against a published Quest and reject malformed or oversized input.
- [ ] 3.2 Add an on-demand Playwright harness that loads the fixture in the existing Quest workspace and runs candidate source through local Check at the dedicated runtime origin; verify ordered per-case reports, expected-pass/expected-fail exits, no backend writes, and fresh-Worker timeout recovery.
- [ ] 3.3 Document reference/alternative/defect review commands and result limits; verify the documented candidate workflow runs on one published snapshot and an unselected historical or draft snapshot.

## 4. Integration

- [ ] 4.1 Run root `pnpm test`, `pnpm lint`, `pnpm typecheck`, build, existing curriculum/history validation, targeted preview/test-runner browser tests, and strict OpenSpec validation; review the final diff for Git/publication and execution authority boundaries.
