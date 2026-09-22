## Why

CodeQuest has approved JavaScript Foundations outcomes and a database hierarchy, but no authored curriculum format or validation gate. Before the Phase 10 curriculum API, authors need a Git-first, backend-owned contract that makes identity, learning intent, assessment versions, and cross-quest references reviewable and rejects invalid content in CI.

## What Changes

- Define the authored `Journey → Chapter → Quest` tree under `backend/content/`, with Course remaining a display synonym and no root `content/` directory. This resolves the Phase 9 roadmap sketch in favor of AGENTS.md, C05, architecture, and ADR 0003.
- Define journey and chapter metadata plus versioned quest snapshots; lesson content and starter-code files; hint and deterministic validation definitions; stable IDs, slugs, ordering, concepts, objectives, prerequisites, difficulty, XP award metadata, and completion-prerequisite unlock definitions.
- Add a Zod-based authoring validator and CI gate that checks file schemas plus cross-file identity, version, prerequisite, and content integrity without executing learner code.
- Include a small representative JavaScript Foundations fixture and authoring documentation to demonstrate the contract, without publishing the 24 instructional quests or capstone as production curriculum.
- Keep Phase 10+ delivery and learning behavior out of scope: no curriculum REST endpoints, database projection/activation, generated client update, eligibility or reward computation, local assessment execution, guest sync, or learner-facing course UI.

## Capabilities

### New Capabilities

- `curriculum-content`: Backend-owned Git authoring structure, metadata and version contract, instructional/assessment file requirements, cross-reference checks, and CI validation.

### Modified Capabilities

None. Existing database, backend, and API-contract specs retain their current boundaries; this change does not alter those capabilities' behavior.

## Impact

The later Apply stage affects `backend/content/`, backend-local validation tooling/tests and dependencies, CI, and curriculum authoring documentation. It does not change runtime routes, application tables or migrations, frontend source or generated API types, production infrastructure, or the historical Phase 0 curriculum approval.
