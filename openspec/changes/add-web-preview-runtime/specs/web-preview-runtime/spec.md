# Spec Delta

## Purpose

Provide a reusable static HTML/CSS preview alongside separately isolated JavaScript computation while keeping learner content outside the authenticated CodeQuest application and all learning authority.

## ADDED Requirements

### Requirement: Preview uses a bounded immutable file snapshot

The frontend SHALL accept a lesson-independent snapshot of identified HTML, CSS, and JavaScript files. It SHALL require one HTML entry, permit at most one CSS and one JavaScript entry, reject duplicate identities and unsupported content, and enforce fixed UTF-8 source limits before sending any learner bytes to a preview or execution compartment. Later edits SHALL NOT change an existing preview until a new Preview request.

#### Scenario: Generate a preview

- **WHEN** a caller supplies valid HTML, CSS, and JavaScript file snapshots and requests Preview
- **THEN** the static page and computation result correspond to that captured snapshot and subsequent edits do not mutate them

#### Scenario: Invalid or oversized input

- **WHEN** the snapshot is malformed or exceeds a fixed limit
- **THEN** no learner content runs and the workspace reports a bounded failure while preserving every source file

### Requirement: HTML and CSS display without learner script execution

Learner HTML and CSS SHALL render only in a sandboxed iframe with no script or same-origin permission. The preview SHALL treat script elements, inline event handlers, JavaScript URLs, active SVG or embedded content, and DOM-programming attempts as inert. Learner markup SHALL not be inserted into the authenticated application DOM or a trusted preview bootstrap document. The preview SHALL not offer external asset loading, navigation, forms, popups, downloads, or storage.

#### Scenario: Static page renders

- **WHEN** the snapshot contains ordinary headings, text, layout markup, and inline CSS
- **THEN** the iframe displays the page without running learner JavaScript

#### Scenario: Active markup is supplied

- **WHEN** learner HTML includes scripts, event attributes, external resources, forms, embeds, or navigation targets
- **THEN** active behavior is denied and no learner data reaches an external or authenticated sink

### Requirement: JavaScript computation remains in the Phase 14 Worker boundary

Preview JavaScript SHALL execute only through the existing isolated, bounded JavaScript Worker contract, never inside the preview iframe or trusted application. Its output and returned value SHALL be displayed as bounded text, including an equivalent text surface outside the iframe. JavaScript SHALL have no preview DOM, browser storage, network, application origin, or authenticated API access. A JavaScript success result SHALL not imply the static page is correct.

#### Scenario: JavaScript calculates a value

- **WHEN** a preview snapshot contains finite JavaScript that logs or returns a value
- **THEN** the existing Worker returns a bounded result presented as text while the HTML/CSS page remains static

#### Scenario: JavaScript attempts DOM access or loops

- **WHEN** source references document/window DOM state or enters a tight loop
- **THEN** DOM authority remains unavailable and the Worker produces its existing error or timeout result without blocking a fresh preview

### Requirement: Preview origin has no application authority

The preview SHALL require a configured HTTPS origin distinct from both the authenticated application origin and Phase 14 runner origin; loopback HTTP SHALL be permitted only for local development. Missing, malformed, same-origin, or insecure non-loopback configuration SHALL fail closed. The preview origin SHALL serve only fixed, credential-free preview resources and SHALL not expose application sessions, tokens, account identity, API clients, protected storage, or backend learning behavior.

#### Scenario: Origin is misconfigured

- **WHEN** the preview origin is absent, malformed, equal to the application or runner origin, or insecure outside loopback
- **THEN** Preview is unavailable and no learner snapshot is delivered to a frame

#### Scenario: Markup probes application state

- **WHEN** learner content attempts to access parent DOM, cookies, local storage, IndexedDB, or authenticated resources
- **THEN** no application or session value is returned

### Requirement: Restricted sandbox and CSP deny active capabilities

The learner iframe SHALL use an empty sandbox permission set and an enforced deny-by-default content policy. The policy SHALL allow only the minimum inline style and local visual data necessary for static rendering while denying scripts, network connections, external resources, workers, nested frames, objects, forms, base URL changes, and unauthorized navigation. The trusted bootstrap SHALL have a separate fixed response policy. Any failure of effective policy or sink-denial browser tests SHALL block capability completion rather than weaken the application or Phase 14 runner policy.

#### Scenario: Markup probes external sinks

- **WHEN** learner markup or CSS requests an external script, image, stylesheet, frame, form target, link target, or redirect
- **THEN** no request carrying learner data reaches the controlled sink

### Requirement: Messages are exact-origin, private, bounded, and correlated

The application SHALL accept bootstrap messages only from the expected frame window at the exact configured origin, matching an unpredictable preview instance identity. It SHALL transfer a private channel using an explicit target origin. Commands and results SHALL use allowlisted types, active generation identities, bounded shapes, and fixed byte limits. The learner frame SHALL never receive the trusted channel. Forged, stale, duplicate, malformed, and oversized packets SHALL not change current preview state; malformed active packets SHALL fail safely.

#### Scenario: Forged or stale packet arrives

- **WHEN** another window or a prior generation sends a ready or result packet
- **THEN** the current preview and status remain unchanged

### Requirement: Lifecycle, cleanup, and failure states are explicit

The preview SHALL distinguish unavailable, loading, ready, error, timeout, and reset states. Reload SHALL replace the learner frame using the last captured snapshot; a new Preview request SHALL capture new source and invalidate the old generation. Cancellation, supersession, owner change, navigation, and unmount SHALL remove owned frames, listeners, ports, timers, and object URLs and ignore later packets. Preview failures SHALL preserve editor source and drafts. A fresh finite preview SHALL remain usable after a hostile HTML/CSS input or timed-out Worker run.

#### Scenario: Reload after failure

- **WHEN** a preview fails and the learner requests Reload
- **THEN** a fresh static frame is created from the last snapshot and the old frame cannot update state

#### Scenario: Component unmounts

- **WHEN** the preview surface unmounts or its owner changes
- **THEN** its resources are disposed and later packets cannot update the workspace

### Requirement: Preview is responsive, accessible, and outside learning authority

The preview SHALL have a named region, visible status and reload controls, and bounded text alternatives for computation and errors. At desktop, 390 CSS-pixel viewport, and zoom/reflow widths, it SHALL not create page-level horizontal overflow. Preview SHALL NOT evaluate assessment cases, declare Check results, create attempts or submissions, accept completion, change progress, award rewards, unlock content, invoke backend execution, publish learner pages, or collect raw-source telemetry.

#### Scenario: Narrow workspace

- **WHEN** the workspace is viewed at 390 CSS pixels or equivalent zoom
- **THEN** editor and preview controls reflow without page-level horizontal overflow

#### Scenario: Preview succeeds

- **WHEN** the static page renders and Worker computation completes
- **THEN** only preview and text output change; no learning or reward state changes
