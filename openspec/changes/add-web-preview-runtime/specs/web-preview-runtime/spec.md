# Spec Delta

## Purpose

Provide a reusable browser preview for learner HTML, CSS, and JavaScript while keeping untrusted page behavior outside the authenticated CodeQuest application and learning authority.

## ADDED Requirements

### Requirement: Preview generation uses immutable bounded files

The frontend SHALL accept a lesson-independent snapshot of identified HTML, CSS, and JavaScript files and SHALL generate a fresh preview from that snapshot only. It SHALL reject duplicate or unsupported file identities, missing required entry content, and source exceeding fixed UTF-8 byte limits before sending it to the preview compartment. Preview generation SHALL NOT read unrelated drafts or silently use edits made after the snapshot.

#### Scenario: Generate a preview
- **WHEN** a caller supplies valid HTML, CSS, and JavaScript file snapshots and requests Preview
- **THEN** the displayed document reflects that exact snapshot and later edits do not mutate it until a new Preview request

#### Scenario: Invalid or oversized input
- **WHEN** the snapshot is malformed or exceeds a fixed source limit
- **THEN** no learner content runs and the workspace reports a bounded failure while preserving every source file

### Requirement: Preview runs away from application authority

The preview SHALL require a configured HTTPS origin distinct from both the authenticated application origin and the Phase 14 runner origin; loopback HTTP SHALL be permitted only for local development. Missing, malformed, same-origin, or insecure non-loopback configuration SHALL fail closed. Learner content SHALL run only in a sandboxed iframe under that dedicated preview origin and SHALL receive no session, token, account identity, API client, application storage handle, authenticated application origin capability, or privileged message port. The preview origin SHALL serve no authenticated application resources or credentialed session.

#### Scenario: Preview origin is misconfigured
- **WHEN** the configured preview origin equals the application or runner origin, is absent, or violates the transport rule
- **THEN** Preview is unavailable and no learner document is evaluated

#### Scenario: Learner probes application state
- **WHEN** learner markup or script attempts to read parent DOM, cookies, local storage, IndexedDB, authenticated API data, or a trusted channel
- **THEN** the attempt is denied and no application or session value is returned

### Requirement: Sandbox and content policy constrain capabilities

The learner iframe SHALL receive only script execution permission needed for preview and SHALL remain an opaque origin. It SHALL NOT receive same-origin, top-navigation, popup, form, download, pointer-lock, storage-access, or presentation permissions. Enforced, deny-by-default CSP SHALL permit only the minimum inline learner script/style and local data/blob visual resources needed for the approved preview, while denying network connections, external scripts/styles/resources, nested frames/workers, object embeds, form submission, and base URL changes. The trusted bootstrap SHALL be a fixed resource with its own restrictive response policy. Violations SHALL fail closed rather than relax the application or Phase 14 runtime policy.

#### Scenario: Learner requests restricted capabilities
- **WHEN** learner content attempts fetch, beacon, external image/style/script loading, form submission, child frame/worker creation, popup, download, or top-level navigation
- **THEN** the capability is denied and no request carrying learner data reaches a controlled external or authenticated sink

#### Scenario: Learner tries to remove sandboxing
- **WHEN** learner script attempts to access or modify its containing iframe or parent page
- **THEN** the parent remains inaccessible and subsequent previews remain sandboxed

### Requirement: Cross-origin messages are authenticated by context and correlated

The application and trusted preview bootstrap SHALL use an explicit target origin, verify message source and exact expected origin during bootstrap, bind one private communication channel to an unpredictable preview instance identity, and validate allowlisted packet types, identities, shapes, and byte lengths. Learner-origin messages SHALL never be accepted as trusted results. Duplicate, stale, malformed, unsupported, or oversized messages SHALL not replace current preview state; a malformed active packet SHALL cause a safe failure and compartment reset.

#### Scenario: Forged ready or result message
- **WHEN** another frame sends a ready or result packet with a guessed or copied identifier
- **THEN** the application ignores it because its window/origin/channel context is invalid

#### Scenario: Old preview reports after reload
- **WHEN** a prior preview emits a delayed packet after a newer snapshot starts
- **THEN** the current preview and its status remain unchanged

### Requirement: Preview lifecycle is explicit and recoverable

The preview SHALL distinguish unavailable, loading, ready, error, timeout, and reset states. Reload SHALL replace the learner document with a fresh instance from the current captured snapshot; requesting a newer preview SHALL invalidate the old instance. The trusted host SHALL bound startup and handshake time, remove abandoned iframes, ports, listeners, timers, and object URLs, and stop accepting packets after cancellation, supersession, navigation, or unmount. Browser syntax/runtime failures SHALL be reported as bounded untrusted text, and a failed preview SHALL preserve editor source and drafts.

#### Scenario: Reload after an error
- **WHEN** a preview fails and the learner requests Reload
- **THEN** a fresh isolated document is created from the selected snapshot and the prior document cannot update its state

#### Scenario: Component is removed
- **WHEN** the preview surface unmounts or its owner changes
- **THEN** its document and communication resources are disposed and no later packet updates the workspace

#### Scenario: Script blocks the preview thread
- **WHEN** learner script loops or prevents a timely response
- **THEN** trusted control reports timeout, tears down the affected preview, and a fresh finite preview meets the approved recovery gate before this capability is considered complete

### Requirement: Preview presentation is responsive and accessible

The preview SHALL remain usable at desktop and 390 CSS-pixel widths, zoom/reflow, and keyboard navigation without page-level horizontal overflow. It SHALL expose a named preview region, visible loading/error/reload states, and a text alternative for status and errors. Preview output SHALL never be interpreted as Check or accepted progress.

#### Scenario: Narrow workspace
- **WHEN** the workspace is viewed at 390 CSS pixels or equivalent zoom
- **THEN** editor and preview regions reflow without clipping controls or creating page-level horizontal scrolling

#### Scenario: Visual output is unavailable
- **WHEN** the preview origin cannot load or rendering fails
- **THEN** an accessible text status explains the failure and source editing remains available

### Requirement: Preview remains outside learning authority

The preview SHALL NOT evaluate assessment cases, declare a Check result, create attempts or submissions, accept completion, change progress, award rewards, unlock content, invoke backend execution, publish learner pages, or collect raw-source telemetry. It SHALL NOT change the Phase 14 JavaScript Worker contract or its isolation policy.

#### Scenario: Preview renders successfully
- **WHEN** HTML, CSS, and JavaScript produce a visible page
- **THEN** only preview status and rendered content change; no learning or reward state changes
