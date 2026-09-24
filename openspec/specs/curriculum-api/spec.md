# Curriculum API Specification

## Purpose

Expose only explicitly reviewed, versioned curriculum through safe public NestJS REST contracts and the generated frontend client.

## Requirements

### Requirement: Published curriculum is selected explicitly and loaded fail-closed

The backend SHALL build its curriculum catalog only from authored snapshots selected by the validated publication manifest. Every selected journey, chapter, quest, concept, prerequisite, content version, and assessment version SHALL resolve uniquely and carry approved curriculum and technical review evidence. Draft, unselected, unreviewed, missing, stale, or internally inconsistent material SHALL NOT enter the catalog. Invalid publication configuration SHALL make application startup and CI fail with path-scoped diagnostics that do not expose authored source or credentials.

#### Scenario: Empty publication selection starts safely

- **WHEN** the repository contains valid draft curriculum but the publication manifest selects no journey
- **THEN** the backend starts with an empty public curriculum catalog and exposes no draft content

#### Scenario: Invalid selection is configured

- **WHEN** a publication entry names a missing snapshot, omits a required review approval, or conflicts with authored hierarchy or prerequisites
- **THEN** startup and curriculum validation fail before any curriculum route can serve the invalid selection

### Requirement: Journey collection exposes published summaries only

`GET /api/v1/journeys` SHALL be public and return published journeys in deterministic position order. Each summary SHALL expose stable ID, slug, title, position, and bounded chapter/quest summary information without filesystem paths, unpublished identities, review notes, transition rationale, or database internals.

#### Scenario: Public journey list is requested

- **WHEN** a client requests the journey collection
- **THEN** it receives a successful ordered list containing only explicitly published journeys

### Requirement: Journey and Course alias resolve one canonical representation

`GET /api/v1/journeys/:slug` SHALL return the published Journey detail identified by display slug. `GET /api/v1/courses/:slug` SHALL be a documented read-only compatibility alias to the same representation and SHALL NOT establish a Course entity, identifier, table, or separate source of truth. Unknown, draft, and unpublished slugs SHALL return the normalized correlated `404` envelope.

#### Scenario: Canonical and alias routes are read

- **WHEN** both routes are called with one published Journey slug
- **THEN** both return equivalent Journey identity, outcomes, ordered chapter summaries, and active-version metadata

#### Scenario: Draft journey slug is requested

- **WHEN** a client requests a slug that exists only in authored draft content
- **THEN** the API returns the same safe `404` shape used for an unknown slug and reveals no draft metadata

### Requirement: Chapter detail preserves published hierarchy

`GET /api/v1/chapters/:slug` SHALL return one published chapter with stable identity, owning Journey summary, title, objective summary, position, and ordered published quest summaries. Published chapter slugs SHALL be globally unambiguous for the flat roadmap route. Unknown, ambiguous, draft, or unpublished chapter slugs SHALL not resolve.

#### Scenario: Published chapter is requested

- **WHEN** a client requests a globally unique published chapter slug
- **THEN** the API returns its owning Journey and ordered published quest summaries

### Requirement: Quest detail delivers one bounded active snapshot

`GET /api/v1/quests/:slug` SHALL return one globally unambiguous published quest and exactly its selected active snapshot. The response SHALL include stable quest identity, hierarchy, kind, guest-eligibility marker, content and assessment versions, title, objective/outcome, concepts, completion prerequisites, difficulty, provisional XP metadata, graduated hints, safe lesson markup, starter JavaScript, and the bounded declarative local-check cases. Browser-visible cases SHALL NOT be described as secret or independently authoritative. The response SHALL NOT include other snapshots, repository paths, publication review notes, executable server hooks, or learner/account state.

#### Scenario: Published quest is requested

- **WHEN** a client requests a published quest slug
- **THEN** it receives the selected content/assessment snapshot and declarative check contract with stable IDs and no unpublished material

#### Scenario: Unsupported quest version is inferred by the client

- **WHEN** a client attempts to select a version through the slug route
- **THEN** the backend ignores no hidden version selector and returns only the manifest-selected active snapshot

### Requirement: Curriculum reads use the generated frontend contract

Implemented curriculum routes and DTOs SHALL be represented in backend OpenAPI and reproducibly generated under `frontend/src/lib/api/generated/`. The trusted frontend wrapper SHALL expose typed, cancellable public curriculum reads with the existing distinguishable HTTP, invalid-response, network, and cancellation outcomes. Public curriculum requests SHALL omit authentication credentials by default and SHALL NOT import backend source or raw authored files.

#### Scenario: Frontend reads a quest

- **WHEN** trusted frontend code requests a quest through the generated-client wrapper
- **THEN** the route and response types come from OpenAPI and no bearer token or backend source import is required

### Requirement: Published Quest illustrations are delivered from the selected snapshot

The curriculum API SHALL provide a public, read-only asset operation keyed by published Quest slug, selected content version, and validated local asset path. It SHALL serve only PNG or WebP regular files that belong to the currently selected published snapshot, with the matching media type, bounded size, `nosniff` protection, and version-appropriate cache metadata. The operation SHALL omit authentication by default and SHALL NOT expose draft or historical unselected assets, directory listings, repository paths, symbolic links, arbitrary files, SVG, HTML, or executable media.

#### Scenario: Selected lesson illustration is requested

- **WHEN** a client requests an existing validated PNG or WebP asset for a published Quest and its selected content version
- **THEN** the API returns only that file with the correct image media type and safe response headers

#### Scenario: Asset request escapes the selected snapshot

- **WHEN** an asset request contains traversal, an unsupported extension, an unknown path, a draft Quest, an unselected content version, or a symbolic link
- **THEN** the API returns the same normalized not-found behavior and does not reveal filesystem or publication details

### Requirement: Curriculum delivery remains read-only and phase-bounded

The curriculum API SHALL NOT add author/admin mutations, database projection or migration, enrollment, attempts, submissions, completion acceptance, progress, XP awards, levels, streaks, unlock enforcement, guest import, offline synchronization, learner execution, analytics, production content authoring, or publication of the draft Q01 fixture. Those behaviors require later approved capabilities.

#### Scenario: Completed Phase 10 diff is reviewed

- **WHEN** the Apply diff and OpenAPI document are inspected
- **THEN** they contain only publication selection, read-only curriculum delivery, generated-client integration, tests, and documentation with no Phase 11+ behavior
