# Spec Delta

## ADDED Requirements

### Requirement: Published distinct Courses have read-only catalog contracts

The backend SHALL expose ordered public Course collection and detail reads under `/api/v1/catalog/courses` and `/api/v1/catalog/courses/:slug`. Each Course response SHALL identify its stable Course ID and owning Journey ID, selected published metadata, ordered chapters and counts; it SHALL not expose unpublished files, review notes, private account data, or a partial Course. Journey detail SHALL identify its ordered published Courses. Unknown, draft, ambiguous, or unselected slugs SHALL return the normalized safe not-found response. The existing `/api/v1/courses/:slug` Journey read alias SHALL remain unchanged until a separately reviewed API version transition.

#### Scenario: Published Course is read
- **WHEN** a client requests a published Course from the catalog
- **THEN** it receives only the selected Course and its owning Journey identity with chapters in publication order

#### Scenario: Legacy Course alias is read
- **WHEN** a client requests `/api/v1/courses/javascript-foundations`
- **THEN** it still receives the existing Journey representation rather than a response whose meaning silently changed

#### Scenario: Draft Course is requested
- **WHEN** a client requests an unpublished or ambiguous Course slug
- **THEN** it receives the same safe not-found response as an unknown slug

### Requirement: Frontend Course reads use the generated contract

The new Course operations SHALL appear in OpenAPI and be consumed through the regenerated frontend API client. Public catalog reads SHALL omit credentials by default; owner progress reads SHALL use the protected authenticated boundary. Frontend code SHALL not import backend curriculum source or directly query application tables.

#### Scenario: Catalog uses published data
- **WHEN** the catalog loads
- **THEN** its Course cards come from generated public API types, not hardcoded unpublished content
