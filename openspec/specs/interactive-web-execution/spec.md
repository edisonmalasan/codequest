# Interactive Web Execution Specification

## Purpose

Let original beginner web exercises show bounded DOM changes and user interactions while learner JavaScript remains terminable, isolated, and separate from account authority.

## Requirements

### Requirement: Interactive execution is explicit and snapshot-bound

The frontend SHALL expose an opt-in interactive web execution contract for a bounded, identified HTML/CSS/JavaScript file snapshot. An interactive run SHALL capture immutable source and content versions. It SHALL report ready, unsupported, unavailable, syntax error, runtime error, timeout, output limit, cancelled, or internal failure without silently falling back to executing learner source in the application or display frame. Edits after capture SHALL make the old result stale until a new run.

#### Scenario: Finite interactive exercise runs

- **WHEN** a compatible exercise supplies valid HTML, CSS, and JavaScript and requests interactive Run
- **THEN** the displayed result and text output correspond to that captured snapshot, and a later edit does not silently change it

#### Scenario: Capability is unavailable

- **WHEN** the required isolated origin or browser feature is unavailable
- **THEN** the learner sees an unavailable result, retains source, and no learner code executes in a fallback context

### Requirement: Learner logic stays in a terminable isolated compartment

Arbitrary learner JavaScript SHALL execute only in a fresh credential-free Worker, never in a preview display frame, the authenticated application document, Next.js server code, or NestJS. The Worker SHALL receive only bounded public exercise data, source, and correlated interaction events. It SHALL have no application tokens, account identity, authenticated API, network, storage, service-worker, dynamic-import, nested-worker, or trusted-channel authority. Its supported DOM interface SHALL be an explicit beginner subset; unsupported browser APIs SHALL fail truthfully rather than acquire ambient browser authority.

#### Scenario: Learner probes authority

- **WHEN** source tries to fetch, navigate, read storage or cookies, create a worker, contact the authenticated API, or access the parent document
- **THEN** no request or privileged value reaches learner code and the attempt cannot change account state

#### Scenario: Learner requests unsupported DOM behavior

- **WHEN** source uses a DOM or browser API outside the published supported subset
- **THEN** the run reports a bounded unsupported/runtime result and preserves the source snapshot

### Requirement: Interactive display remains isolated and inert to learner script

The interactive display SHALL use a separately configured credential-free preview origin distinct from both application and runner origins and SHALL fail closed for missing, colliding, insecure non-loopback, or malformed configuration. Displayed learner markup, CSS, and Worker-produced mutations SHALL be constrained before rendering. Only fixed reviewed bridge code MAY run in the display compartment; learner-authored scripts, event attributes, JavaScript URLs, navigation, forms, popups, downloads, external resources, and application storage SHALL remain denied. The static script-disabled preview mode SHALL remain available independently.

#### Scenario: Markup attempts execution or exfiltration

- **WHEN** learner HTML, CSS, or a mutation contains active markup or an external sink
- **THEN** it is rejected or made inert and no learner data reaches that sink

#### Scenario: Origins collide

- **WHEN** interactive preview configuration resolves to the application or runner origin
- **THEN** interactive execution is unavailable before learner content is delivered

### Requirement: DOM changes and interactions use bounded validated messages

The trusted controller SHALL correlate each run and interaction with unpredictable active identities and SHALL accept packets only from expected sources through explicit target origins or private channels. It SHALL allowlist packet types and DOM operations, validate shape and byte/node/event limits, and reject duplicate, stale, malformed, oversized, or unsupported packets. The display SHALL apply only validated data operations; an event from the display SHALL identify a current permitted target and SHALL not carry arbitrary source, credentials, or privileged browser state back to the Worker.

#### Scenario: Learner changes page text

- **WHEN** finite code changes a supported element's text or class and emits a bounded mutation
- **THEN** the current display updates that element and an equivalent accessible text/status description remains available

#### Scenario: Stale event is forged

- **WHEN** a replaced frame, old run, or unrelated window sends an event or mutation packet
- **THEN** it cannot update the current display or run state

### Requirement: Execution and display recover from hostile work

Trusted control SHALL enforce the existing two-second learner execution deadline for initial source execution and each interaction independently of learner code, terminate the active Worker on timeout, cancellation, malformed output, supersession, or disposal, and permit a fresh finite run within the existing one-second recovery bound in an eligible environment. Interactive sessions SHALL have fixed event and lifetime caps, and their Workers SHALL terminate when the session ends. Reload, owner switch, route navigation, and unmount SHALL release owned frames, channels, listeners, timers, workers, and object URLs, ignore late packets, and preserve source and drafts.

#### Scenario: Handler loops forever

- **WHEN** learner source or a click handler enters a tight loop
- **THEN** trusted control terminates that Worker, reports timeout, and a fresh finite interactive run can complete within the recovery bound

#### Scenario: Learner navigates away during a run

- **WHEN** the host route or owner changes while execution or a display update is pending
- **THEN** old work is cancelled, later packets are ignored, and saved source stays scoped to its original owner

### Requirement: Interactive results are local learning feedback only

An interactive Run SHALL display bounded console/errors, a named preview region, accessible status and text alternatives for meaningful changes, and responsive controls at desktop and 390/320 CSS-pixel or zoom-equivalent widths. It SHALL NOT declare Check success, submit work, accept completion, award XP, alter progress or unlocks, or claim independently verified assessment. Curriculum SHALL advertise only the supported DOM/event subset until expanded through a reviewed change.

#### Scenario: Interactive page looks correct

- **WHEN** a learner sees a page update after Run
- **THEN** the result remains a local preview, and accepted completion still requires the separate Check and backend submission path

### Requirement: R07A safety evidence gates availability

The capability SHALL remain unavailable for published interactive learning until tests demonstrate useful finite DOM/event behavior, denied network/storage/navigation/scripting sinks, message spoof resistance, bounded source/output/mutation behavior, repeated tight-loop termination, fresh-run recovery, and cleanup in the declared browser matrix. The verification record SHALL identify exact commit/build, origin topology, browser versions, environment, failures, and untested physical/assistive setups. A failed containment or recovery probe SHALL keep R07A open; passing automation SHALL not substitute for founder acceptance or Phase 38 hosted/device evidence.

#### Scenario: Containment probe fails

- **WHEN** a required browser probe reaches an external sink or fails to recover after a hostile loop
- **THEN** the implementation is not enabled for published interactive exercises and the failure remains in the evidence record
