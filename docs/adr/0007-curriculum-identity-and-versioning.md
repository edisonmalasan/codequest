# ADR 0007: Curriculum identity, compatibility and history

## Status and evidence

**Accepted** compatibility/history/reward policy. Stable identity/version direction is documented in roadmap; detailed approval evidence is [AP01](../decisions.md#ap01-explicit-phase-0-approval). Register: [C05/P09/P15/F03](../decisions.md); design D5/D7. Owners: curriculum/technical owners; named assignees unassigned.

## Context

Learners may submit cached/guest source after authored material changes. Identity based only on slug/title or treating each version as a new XP source risks lost history/duplicate rewards. No implementation exists.

## Decision

Use stable quest ID separate from title/slug, with submitted content and assessment version. Backend explicitly publishes supported assessments/compatibility mapping. Editorial-only equivalent versions can remain compatible; changed assessments/objectives require CO/TO decision. Pending incompatible/retired work receives reason/current-version retry guidance without source loss or silent relabeling.

Preserve accepted historical completion/XP. Current progress derives from active requirements and explicit historical equivalence mapping; display obsolete history separately and explain changed denominator/availability. Editorial/version changes do not reissue one-per-stable-quest reward. Materially new rewarded objectives need reviewed new identity. Compatibility-window duration, schema and publication mechanism are deferred F03.

## Alternatives

- Reject every old version: simpler but unfair to offline learners even for harmless wording changes.
- Accept all old versions forever: may perpetuate invalid assessment and obsolete prerequisites.
- Retroactively regrade/revoke all history: undermines predictable progress and requires stronger verification/migration design.
- New reward for every content version: enables repeat XP through edits rather than meaningful new learning.

## Consequences

Curriculum review includes compatibility/reward/progress impact before publication. No automatic content-based migration or derived-percentage overwrite from client. Older compatible submissions still obey identity/prerequisites/trust acceptance rules. History validity and active-curriculum progress are distinct records/concepts.

## Related records and revisit trigger

[Curriculum](../curriculum.md), [backend](../backend.md), [ADR 0003](0003-curriculum-source-and-publication.md), [ADR 0006](0006-local-guest-and-cloud-state.md). Policy accepted by AP01; choose mechanisms before content capability implementation. Revisit on objective/prerequisite change, retirement, invalid published assessment, or unsupported-version replay evidence.
