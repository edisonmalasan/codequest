# Proposal

## Why

Authors currently validate the whole Git curriculum and use browser tests against published snapshots, but cannot inspect an unpublished Quest or Journey as a complete authored unit or run a candidate solution against its draft cases before review. Phase 37 needs a small local authoring loop without introducing a CMS or a second publication path.

## What Changes

- Keep the existing `backend/content/` validator and immutable-history check as the required authoring gate, with an explicit content-validator command and actionable file-path diagnostics.
- Add local, read-only Quest and Course/Journey previews for a selected authored snapshot, including lesson, starter, hints, cases, hierarchy, versions, prerequisites, and review/publication state. Draft previews remain clearly unapproved and cannot make content public.
- Add a targeted test runner for candidate reference, alternative, and defect source files against the selected authored cases. It uses the existing isolated browser Check runtime, records per-case results and bounded failure feedback, and exits nonzero when expectations fail.
- Document author commands and a review sequence that keeps Git snapshots and `publication.yaml` authoritative.

## Capabilities

### New Capabilities

- `curriculum-authoring-tools`: Local content validation, authored Quest and Journey previews, and isolated candidate-case testing without publication or learning-state effects.

### Modified Capabilities

None. Existing curriculum, publication, runtime, and learner validation contracts remain unchanged.

## Impact

The implementation will touch backend-owned content tooling, a local preview renderer, a browser test harness using existing frontend runtime seams, commands/tests, and author documentation. It will not add a production author API, `/admin/content`, CMS, database authority, learner-facing publication path, account progress, or new execution boundary.
