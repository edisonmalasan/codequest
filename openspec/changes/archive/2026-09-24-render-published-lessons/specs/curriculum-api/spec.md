## ADDED Requirements

### Requirement: Published Quest illustrations are delivered from the selected snapshot

The curriculum API SHALL provide a public, read-only asset operation keyed by published Quest slug, selected content version, and validated local asset path. It SHALL serve only PNG or WebP regular files that belong to the currently selected published snapshot, with the matching media type, bounded size, `nosniff` protection, and version-appropriate cache metadata. The operation SHALL omit authentication by default and SHALL NOT expose draft or historical unselected assets, directory listings, repository paths, symbolic links, arbitrary files, SVG, HTML, or executable media.

#### Scenario: Selected lesson illustration is requested

- **WHEN** a client requests an existing validated PNG or WebP asset for a published Quest and its selected content version
- **THEN** the API returns only that file with the correct image media type and safe response headers

#### Scenario: Asset request escapes the selected snapshot

- **WHEN** an asset request contains traversal, an unsupported extension, an unknown path, a draft Quest, an unselected content version, or a symbolic link
- **THEN** the API returns the same normalized not-found behavior and does not reveal filesystem or publication details
