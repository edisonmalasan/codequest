# Proposal

## Why

Phases 0–28 provide the learning infrastructure, but the publication manifest is empty. Phase 29 supplies the approved 24 instructional JavaScript Foundations quests so learners can use the existing guest and authenticated learning paths with real content.

## What Changes

- Author seven chapters and Q01–Q24 following P04/P05, with clear objectives, explanations, worked examples, tasks, starter source, deterministic normal/boundary cases, graduated hints and explicitly provisional XP metadata.
- Preserve Q01 1.0.0 byte-for-byte; add an editorial 1.1.0 snapshot with the unchanged 1.0.0 assessment and an explicit compatible transition.
- Review the instructional sequence and technical contracts, verify reference and alternative solutions in the existing isolated browser runtime, and select the complete reviewed instructional inventory through the publication manifest.
- Verify real public API delivery and guest Q01–Q04 Check behavior using published content. Keep client checks unverified and backend acceptance unchanged.
- Document AI-assisted instructional/technical self-review and remaining learner-feedback, F02 device/accessibility and F04 balancing obligations. Repository publication does not authorize deployment or F06 real-learner data collection.

## Capabilities

### New Capabilities

- `javascript-foundations`: The reviewed 24-quest instructional course, sequencing, observable contracts and publication evidence.

### Modified Capabilities

- `curriculum-content`: Replace the historical completed-course exclusion with separation between generic authoring infrastructure and separately reviewed instructional curriculum; preserve immutable drafts and Phase 30 capstone scope.
- `curriculum-api`: Permit delivery of separately approved authored curriculum while preserving read-only transport and keeping the original draft Q01 snapshot unselected.

## Impact

Backend Git content and publication, curriculum regression fixtures, isolated browser curriculum verification, CI and course documentation. No schema migration, new API fields, runtime permissions, grading modes or dependencies. No Phase 30 capstone, DOM/events, AI grading, cloud drafts, mastery gates, reward-policy changes or new learning authority.
