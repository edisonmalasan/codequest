# Learning Performance

## Purpose

Keep the core learning path responsive and byte-conscious through measured loading behavior and bounded public assets while preserving accessibility, offline readiness, and isolated execution.

## Requirements

### Requirement: Learning routes avoid unnecessary initial editor work

The Journey, Quest reading, and offline-library entry experiences SHALL load without downloading or initializing code-editor language tooling until a coding workspace is needed. A deferred editor SHALL present an accessible loading state and SHALL preserve source, selected file, focus usability, and Run/Check availability once ready. A loading or chunk failure SHALL leave the lesson and source recovery usable and show a retryable error.

#### Scenario: Learner opens the Journey
- **WHEN** a learner opens a Journey without opening a coding workspace
- **THEN** the route does not initialize editor tooling or start a learner Worker

#### Scenario: Editor loads after lesson content
- **WHEN** a learner reaches a Quest workspace while its editor code is loading
- **THEN** lesson content remains available, the workspace communicates loading, and the editor becomes operable without losing the current draft

#### Scenario: Editor code fails to load
- **WHEN** the editor's deferred code cannot be loaded
- **THEN** the learner sees a recoverable error and existing draft/source is not discarded

### Requirement: Production learning payloads and assets have reproducible budgets

The repository SHALL measure production first-load JavaScript for core learning routes, the public shell, font, sprite, image, and published-content payload sizes with repeatable commands. It SHALL enforce selected deterministic byte ceilings in CI against built artifacts while recording the baseline, measured improvements, and exclusions. Budgets SHALL be engineering regression limits for this build, not a claim about supported low-end hardware or network speed.

#### Scenario: Built route exceeds its budget
- **WHEN** a production route or selected public asset exceeds its documented byte ceiling
- **THEN** the performance gate fails with the route or asset identity and measured bytes

#### Scenario: Asset audit finds an already-small source
- **WHEN** a sprite or image is below its budget and has no evidenced delivery defect
- **THEN** the review records its size without requiring a visual or format change

### Requirement: Public shell stays small and authority-safe

The offline public shell SHALL continue to cache only approved, versioned, credential-free resources and SHALL enforce an explicit aggregate and per-entry byte budget. Performance work SHALL NOT add authenticated responses, learner source, account state, runtime-origin files, or arbitrary curriculum to the application service-worker cache. A cache-budget failure SHALL fail the production build rather than silently drop required offline resources.

#### Scenario: Shell grows beyond its ceiling
- **WHEN** a generated public precache entry or total exceeds its approved budget
- **THEN** the production build fails while retaining the approved offline and protected-cache boundaries

### Requirement: Isolated worker startup is measured without weakening containment

The core Run and local Check path SHALL retain fresh isolated Workers, their existing timeouts, cleanup, and recovery guarantees. Performance evidence SHALL include a repeatable cold-start and subsequent-run timing probe with its browser and host conditions; no prewarm, reuse, or trusted-origin execution SHALL be introduced solely to lower startup time.

#### Scenario: Worker startup is profiled
- **WHEN** the production-like browser probe runs finite Run and Check operations
- **THEN** it records observed startup and completion timing while verifying a fresh isolated execution and usable subsequent run

### Requirement: Performance evidence remains qualified

The Phase 36 review SHALL distinguish deterministic build-byte gates from variable browser timings and identify tested hardware, browser engines, network conditions, and untested low-end or physical devices. It SHALL record regressions and limits without asserting an F02 support matrix or production speed guarantee.

#### Scenario: Low-end hardware was not tested
- **WHEN** only development-host or emulated browser results are available
- **THEN** the review labels physical low-end performance as untested and makes no device-support claim
