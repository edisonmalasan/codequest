# Proposal

## Why

The isolated JavaScript runtime can run source, but a successful run cannot say whether it meets a quest objective. Phase 16 adds deterministic local checks that can be reused across lessons while retaining the runtime's containment and recovery guarantees.

## What Changes

- Add a lesson-independent `ValidationStrategy` contract with `output-match`, `value-test`, `function-test`, and declarative `custom-test` modes. Results include pass/fail, individual failed cases, actionable bounded feedback, and elapsed execution time.
- Evaluate learner source and function invocations only in fresh Workers on the existing credential-free runner origin. Keep strict input/result limits, correlated messages, cancellation, timeout, cleanup, and recovery; treat all browser results as untrusted local feedback.
- Extend the Editor Workspace with an optional Check action and test-results presentation driven by a parent-supplied strategy and case definition. Keep Run and Preview independent.
- Provide focused unit and cross-browser containment/recovery tests and update the runtime, frontend, and security documentation.
- Exclude LLM grading, lesson-route integration, attempts/submissions, backend completion authority, progress, XP, rewards, and unlocks.

## Capabilities

### New Capabilities

- `validation-engine`: Reusable deterministic strategy, bounded isolated case evaluation, result semantics, lifecycle, and security boundary.

### Modified Capabilities

- `editor-workspace`: Optional local Check and accessible test-result presentation without learning authority.

## Impact

Apply affects frontend validation code, fixed runner-origin resources and response policy, Editor Workspace, browser/unit tests, and docs. Published curriculum already supplies bounded declarative console/function case data through the REST/OpenAPI contract; this change neither edits backend curriculum/publication nor hand-edits generated API code. The existing Phase 14 execution contract remains unchanged.
