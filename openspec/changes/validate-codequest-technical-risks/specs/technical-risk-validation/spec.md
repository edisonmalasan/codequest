## Purpose

Establish reproducible browser prototype behavior and evidence gates for validating CodeQuest's approved technical direction before production scaffolding begins. This capability is a technical validation harness, not a production application or independent grading service.

## ADDED Requirements

### Requirement: Bounded validation scope
Phase 1 validation SHALL use disposable prototypes, synthetic data, and controlled local services. It MUST preserve accepted Phase 0 ownership and trust boundaries and MUST NOT create production scaffolding, infrastructure, real authentication integrations, or real learner data collection.

#### Scenario: Planning is ready for review
- **WHEN** the proposal workflow finishes
- **THEN** only planning artifacts and the explicitly requested roadmap status update exist, with no experiments implemented or claimed as passed

#### Scenario: Prototype execution is authorized later
- **WHEN** a separate Apply instruction authorizes Phase 1 experiments
- **THEN** executable work remains in the prototype scope and uses no production application tables, credentials, hosted services, or learner telemetry

### Requirement: Predeclared experiment criteria
Each experiment SHALL declare its hypothesis, applicable policy, fixtures, coverage, owner, procedure, quantitative thresholds, expected behavior, and failure criteria before measurement. Threshold revisions MUST retain the original result and rationale and require affected cases to be rerun.

#### Scenario: A measured result misses its threshold
- **WHEN** an experiment exceeds a predeclared budget
- **THEN** the result is recorded as failed against that budget, and a later budget revision does not retrospectively convert the original result into a pass

### Requirement: Short-exercise editing is usable
The validation workspace SHALL permit lesson reading, source typing/selection/replacement, indentation, undo/redo, paste, reset, syntax highlighting, panel resizing, and inspection of output on declared desktop and physical-mobile environments. Essential controls and feedback MUST remain reachable with virtual and hardware keyboards, touch, zoom/reflow, and declared assistive technology.

#### Scenario: Mobile virtual keyboard is open
- **WHEN** an operator edits and corrects the short mock exercise with the virtual keyboard and changes orientation
- **THEN** the draft is retained and editor, instructions, run controls, and feedback remain reachable without a keyboard trap or unusable selection behavior

#### Scenario: Keyboard and screen-reader navigation
- **WHEN** an operator navigates instructions, editor, controls, and results using the declared accessibility configuration
- **THEN** focus is visible and escapable, instructions/errors/results are understandable, and essential information is available without decorative motion or preview imagery

### Requirement: Execution outcomes and recovery are explicit
The runtime SHALL distinguish successful execution, syntax error, runtime error, failed task check, timeout, and output/payload-limit failure. Trusted lifecycle control MUST independently terminate abusive runs, permit a fresh run within the declared budget, preserve source, and prevent stale results from replacing current results.

#### Scenario: Code runs but fails the task
- **WHEN** source executes successfully but produces a result that fails the declared task criteria
- **THEN** the workspace shows failed-check feedback and does not imply completion from successful execution

#### Scenario: Syntax or runtime error
- **WHEN** a declared fixture causes a syntax or runtime error
- **THEN** the correct error category is displayed as untrusted text/data, with source preserved for correction

#### Scenario: Infinite loop or excessive output
- **WHEN** a run loops indefinitely or exceeds declared output/payload limits
- **THEN** trusted control ends the run, reports the applicable failure within budget, and permits a fresh usable run without draft loss or silent successful truncation

#### Scenario: Run results arrive out of order
- **WHEN** a terminated or superseded run delivers a late result
- **THEN** it cannot replace current output, task/version identity, or state

### Requirement: Learner execution has no application or network authority
The learner compartment MUST receive no session/token material and MUST NOT access application storage, authenticated application resources, or learner-initiated network capability. Validation SHALL probe available network, storage, cross-context, import, and nested-execution paths and observe attempted side effects using controlled sinks and canaries. Trusted bootstrap loading MUST be separately identified; it is not permission for learner-initiated resource loading.

#### Scenario: Learner attempts outbound requests
- **WHEN** a fixture attempts network activity through available request, connection, import, or resource-loading paths
- **THEN** no learner-initiated request reaches the controlled sink, and a CORS error or unreadable response alone is not accepted as proof of blocking

#### Scenario: Learner attempts session or storage access
- **WHEN** a fixture tries to discover synthetic application session canaries, access application databases/caches, or communicate with application contexts
- **THEN** no canary is disclosed or application data accessed/mutated and no application authority is obtained

#### Scenario: Local assessment is tampered with
- **WHEN** an operator demonstrates a forged local passing report
- **THEN** evidence describes the accepted personal-learning fraud limitation without claiming independent correctness or permitting privileged host actions

### Requirement: Preview is contained and recoverable
The preview SHALL render useful supplied-shell output with a textual equivalent while containing hostile HTML/CSS/JS. It MUST NOT expose authenticated parent authority, application storage, session data, learner network capability, unauthorized navigation/popups/forms, or unsafe rendering in the trusted host. Trusted recovery from hostile preview execution MUST be demonstrated within a predeclared deadline.

#### Scenario: Preview attempts escape or external loading
- **WHEN** hostile preview content attempts parent/opener access, sandbox escape, navigation, form submission, or external resource loading
- **THEN** it gains no application authority and produces no learner-initiated outbound request

#### Scenario: Preview blocks or floods execution
- **WHEN** preview content runs a tight loop or floods its communication channel
- **THEN** trusted recovery remains operable within the declared deadline and source is preserved; an interface requiring uncontrolled browser/process termination is not a passing recovery result

### Requirement: Cross-compartment communication is bounded
Trusted receivers SHALL validate the sender/channel, bounded payload shape, run identity, task identity, and content/assessment version before using compartment output. Unsupported, malformed, oversized, spoofed, replayed, or stale messages MUST NOT gain privileged actions or corrupt current state. Output MUST be rendered as untrusted text/data.

#### Scenario: A forged sender requests a host action
- **WHEN** an unrelated frame or malformed compartment message requests privileged host behavior or sends HTML-like output
- **THEN** the receiver rejects the unauthorized behavior and no executable content is inserted into the trusted host

### Requirement: Offline and persistence behavior is truthful
After deliberate preparation, cached lessons, confirmed saved drafts, and local JavaScript execution SHALL work from a cold offline launch on the declared supported baseline. The workspace MUST distinguish saved from unsaved source, unavailable resources, cached accepted from provisional state, and storage loss from successful persistence. Updates MUST preserve confirmed saved work and coherent task/assessment versions; protected token-bearing responses MUST NOT enter service-worker caches.

#### Scenario: Prepared quest is relaunched offline
- **WHEN** the operator closes and relaunches the browser or installed application without network after preparing a cached quest
- **THEN** the lesson and exact confirmed saved source are available, local JavaScript runs, and new local completion remains provisional

#### Scenario: Storage is unavailable or full
- **WHEN** a save fails because storage is unavailable or full
- **THEN** the workspace does not claim the source was saved and provides an in-memory/copy recovery path where possible

#### Scenario: No offline preparation or browser data is cleared
- **WHEN** required resources were never cached or local browser data was removed
- **THEN** the limitation is explicit and the workspace does not invent a saved draft or promise recovery from deleted storage

#### Scenario: An update arrives during editing
- **WHEN** a new service worker/content version waits or activates with unsaved edits, pending work, or multiple open clients
- **THEN** update handling protects source, avoids mixed incompatible versions, and makes retry-required states explicit

### Requirement: Owner and version transitions remain explicit
Synthetic guest/account and acceptance transitions SHALL keep pending source snapshots immutable, drafts device-local, and local completion provisional until simulated acceptance. Account switching MUST isolate owners and stop old work; version rejection MUST preserve editable source. Simulations MUST NOT be presented as evidence of production authorization, transaction integrity, or sync correctness.

#### Scenario: Account switch or expired identity
- **WHEN** synthetic identity changes or expires while work is pending
- **THEN** old events are not reassigned or sent as the new owner and protected display state is cleared or paused as appropriate

#### Scenario: Duplicate or incompatible pending work
- **WHEN** the mock service reports a duplicate completion or incompatible assessment version
- **THEN** the UI reflects the simulated outcome without repeated simulated rewards, source relabeling, or draft deletion

### Requirement: Integrated mock quest validates the learning loop
One short Q01-aligned mock quest SHALL exercise reading, editing, Run, failed-check feedback, hint/correction, local check, provisional completion, save/reload, offline continuation, and runtime recovery on desktop and real mobile devices. A separate function/record fixture SHALL validate supplied preview plumbing without assessing DOM/events or authoring the full curriculum.

#### Scenario: Integrated short exercise completes
- **WHEN** the operator follows the declared desktop or mobile procedure including a deliberate failure and correction
- **THEN** the complete loop and recovery paths work together with accurate saved/provisional state labels and no claim of independently verified learning

### Requirement: Coverage and evidence are reproducible
Validation SHALL include automated Chromium/Firefox/WebKit coverage and declared physical Windows desktop, macOS Safari, Android Chrome, and iPhone Safari/home-screen environments, with at least one lower-powered physical device and declared accessibility checks. Each capability/environment result MUST be classified as passed, failed, unsupported, or untested, with exact versions and evidence. Physical-device and installation evidence MUST NOT be inferred from viewport emulation or automated WebKit.

#### Scenario: Required physical environment is unavailable
- **WHEN** a required physical-device case cannot be executed
- **THEN** it remains untested, with the overall required coverage gate inconclusive rather than assumed to pass

#### Scenario: Installation is unavailable in an environment
- **WHEN** a browser genuinely does not provide the tested installation capability
- **THEN** installation is recorded as unsupported with evidence, ordinary browser-learning results remain separate, and no installability promise is inferred

### Requirement: Production gate requires reviewed evidence
The final packet SHALL include the experiment charter, reproducible commands/versions/fixtures, coverage matrix, raw measurements, containment/request-sink evidence, accessibility observations, failure/retest history, limitations, and proceed/redesign/inconclusive recommendation. Proceed MUST require passing required integrated, containment, recovery, offline/update, and device gates, evidence-backed F01/F02 recommendations, and explicit technical/security/product review. Passing Phase 1 MUST NOT authorize Phase 2 execution or change approved product policies implicitly.

#### Scenario: Required containment gate fails
- **WHEN** any required probe exposes application authority, learner-initiated network, unsafe host rendering, or uncontrolled execution
- **THEN** the result is no-go/redesign and production scaffolding remains blocked; remote execution or reduced required scope is not introduced automatically

#### Scenario: Required gates pass but review is absent
- **WHEN** required cases have passing evidence but named reviewer approval is missing
- **THEN** the recommendation remains awaiting review and Phase 1 is not reported as reviewed complete

#### Scenario: Reviewed validation supports proceeding
- **WHEN** all required gates and F01/F02 evidence are explicitly reviewed and approved
- **THEN** the status snapshot and evidence-backed decision/ADR records are updated, while Phase 2 still requires separate planning/execution authorization
