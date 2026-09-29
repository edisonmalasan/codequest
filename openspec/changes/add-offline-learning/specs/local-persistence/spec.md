# Spec Delta

## ADDED Requirements

### Requirement: Offline library and accepted-progress cache remain owner-scoped

The local database SHALL support bounded listing and lookup of explicitly saved public lesson snapshots by owner, stable quest identity, and exact content/assessment version. It SHALL keep a separate minimal versioned, owner-scoped accepted-progress summary derived from a successful protected backend read, with capture time and publication identity. Reads SHALL reject malformed, oversized, unsupported-version, and owner-mismatched records. Clearing an owner session SHALL prevent another owner from seeing its cached summary without deleting that owner's drafts or pending operations. Neither local record SHALL become backend completion authority.

#### Scenario: Owner lists downloaded lessons
- **WHEN** a learner opens the offline library for their selected local owner
- **THEN** only that owner's saved lesson versions appear

#### Scenario: Account switches
- **WHEN** a different authenticated owner becomes active
- **THEN** the previous owner's cached accepted-progress summary is unavailable to the new owner
