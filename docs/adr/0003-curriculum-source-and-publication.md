# ADR 0003: Backend-owned Git curriculum and API delivery

## Status and evidence

Accepted ownership/source commitment; exact publication mechanism deferred and not selected. Evidence: AGENTS.md Architecture boundaries; roadmap Phases 9/10/37 Git-first curriculum. Register: [C05/P15/F03/F07](../decisions.md). Owners: technical/curriculum owners; named assignees unassigned.

## Context

Educational material must be reviewable/versioned and delivered without client coupling to authored files. Root `content/` in roadmap trees conflicts with AGENTS.md's `backend/content/`. No authored/executable content exists today.

## Decision

Author curriculum in Git under `backend/content/`. Backend owns published availability/content versions and delivers curriculum through REST/OpenAPI. Frontend renders/caches delivered content; it cannot import raw backend curriculum or query curriculum application tables directly. Preserve stable IDs/versioned assessment direction and explicit review before publication.

Backend publication may use validated projections/metadata as needed later; Git remains authored source, not a second competing editable database source. Exact compiler, format, projection and activation mechanism are F03 decisions. Proposed compatibility/history rules are in ADR 0007, not accepted by this ownership ADR.

## Alternatives

- Root content imported by frontend: contradicts documented ownership and API delivery.
- Full editable CMS/database-first curriculum: adds tooling/competing source of truth before authoring need.
- Duplicated backend/client content copies: risks stale identity/assessment and inconsistent offline results.

## Consequences

Publication requires pedagogical and technical validation later; exact tools are not implemented here. Offline cache contains delivered versioned material rather than raw source imports. ADR 0007 must be reviewed before accepting stale/versioned submissions.

## Related records and revisit trigger

[Curriculum](../curriculum.md), [backend](../backend.md), [ADR 0007](0007-curriculum-identity-and-versioning.md). Revisit authored source only with an approved content-workflow requirement; choose publication details in the curriculum capability proposal after Phase 0, without expanding this documentation change.
