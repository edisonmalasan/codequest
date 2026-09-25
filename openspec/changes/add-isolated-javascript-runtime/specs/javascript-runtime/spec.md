## Purpose

Provide reusable, bounded browser execution for beginner JavaScript while keeping learner source and results outside CodeQuest application authority.

## ADDED Requirements

### Requirement: Execution uses a reusable typed contract

The frontend SHALL expose an execution adapter that accepts a JavaScript source snapshot and optional cancellation signal and resolves one terminal result. Results SHALL identify success, syntax error, runtime error, timeout, output limit, cancellation, or internal/protocol failure and SHALL include bounded text output plus measured duration. The contract SHALL remain independent of lessons, validation, submissions, and progress.

#### Scenario: Source completes successfully

- **WHEN** a caller executes valid finite JavaScript
- **THEN** the adapter resolves a success result containing captured text output, a safely formatted return value, and non-negative execution duration

#### Scenario: Runtime is unavailable

- **WHEN** the isolated runner origin is missing, same-origin, malformed, or fails its trusted handshake
- **THEN** execution resolves a safe internal-failure result without evaluating learner source or exposing configuration details

### Requirement: Each run executes in a fresh isolated Worker

Learner JavaScript SHALL execute only in a fresh literal-URL Web Worker owned by a trusted bootstrap on a separately configured runner origin. The application SHALL communicate with that bootstrap through a private channel, and neither learner source nor results SHALL execute as markup or script in the trusted application document. A Worker SHALL never be reused for a later run.

#### Scenario: Consecutive runs are isolated

- **WHEN** one run mutates globals and a later run reads the same names
- **THEN** the later run starts in a fresh Worker and cannot observe the prior run's mutations

#### Scenario: Runner origin matches the application

- **WHEN** configuration resolves the runner to the current application origin
- **THEN** the adapter refuses to execute and reports runtime unavailability

### Requirement: Output and returned values are bounded text data

The runtime SHALL capture `console.log`, `console.info`, `console.warn`, `console.error`, and `console.debug` as ordered text entries without invoking learner getters or `toJSON`. It SHALL format the returned value as bounded text and SHALL treat unsupported, cyclic, excessively deep, excessively wide, or oversized values as an output-limit failure. Output SHALL be rendered only through trusted text presentation.

#### Scenario: Learner writes console output

- **WHEN** source writes multiple supported console calls and returns a value
- **THEN** the result preserves bounded output order and supplies a bounded text representation of the return value

#### Scenario: Learner floods output

- **WHEN** source exceeds the entry, byte, depth, width, or result-packet limit
- **THEN** the run terminates with an output-limit result and no partial result is treated as successful

### Requirement: Syntax and runtime failures remain distinct

The runtime SHALL distinguish source compilation failures from exceptions thrown while source is running. Failure messages SHALL be bounded and sanitized, SHALL NOT include trusted stack traces or configuration values, and SHALL leave the editor source and local draft unchanged.

#### Scenario: Source has invalid syntax

- **WHEN** JavaScript cannot be compiled
- **THEN** the result is a syntax error with a bounded learner-facing message and no source mutation

#### Scenario: Source throws

- **WHEN** compiled JavaScript throws during execution
- **THEN** the result is a runtime error with a bounded learner-facing message and no source mutation

### Requirement: Trusted lifecycle control terminates hostile work

The trusted runtime SHALL enforce a two-second execution deadline independently of learner code. It SHALL terminate the active Worker before accepting or forwarding any terminal result and on timeout, cancellation, malformed output, superseding execution, adapter disposal, or bootstrap failure. After termination, a fresh finite run SHALL be able to start and complete within the approved one-second recovery bound in an eligible environment.

#### Scenario: Source loops forever

- **WHEN** learner source enters a tight infinite loop
- **THEN** trusted control terminates its Worker, resolves a timeout result within the execution and recovery limits, and preserves the source snapshot

#### Scenario: Caller cancels execution

- **WHEN** the caller aborts an active execution
- **THEN** trusted control terminates the Worker, resolves a cancelled result, ignores later packets for that run, and permits a fresh run

#### Scenario: A run supersedes another run

- **WHEN** execution starts while the adapter still owns an earlier active run
- **THEN** the earlier Worker is terminated as cancelled before the new run becomes authoritative

### Requirement: Messages are correlated and strictly validated

Every command and result SHALL carry an unpredictable run identity. Trusted receivers SHALL accept messages only from the configured bootstrap window/private port, for the active run, with an allowlisted type and bounded shape. Duplicate, stale, malformed, oversized, or unsupported messages SHALL never overwrite the active result and SHALL cause safe termination when they concern the active run.

#### Scenario: Stale output arrives

- **WHEN** a packet carries a completed or superseded run identity
- **THEN** the adapter ignores it and leaves the current run state unchanged

#### Scenario: Active result is malformed

- **WHEN** the active Worker returns an unsupported or oversized packet
- **THEN** trusted control terminates it and resolves a protocol/internal failure without rendering the payload

### Requirement: Learner execution has no application authority

The learner Worker SHALL receive only its run identity and source. It SHALL receive no JWT, cookie value, API key, database detail, environment secret, account identity, authenticated API client, application storage handle, DOM, or trusted message port. The runner response policy and Worker bootstrap SHALL deny network access, dynamic imports, nested workers, shared workers, application IndexedDB/Cache Storage access, broadcast channels, and direct trusted-channel messaging. No learner code SHALL execute in Next.js server code or the NestJS process.

#### Scenario: Source probes restricted capabilities

- **WHEN** learner source attempts network requests, imports, worker creation, application storage, broadcast messaging, DOM access, or direct parent messaging
- **THEN** those capabilities are absent or denied, no request reaches the target, and no application/session value is returned

#### Scenario: Trusted application holds secrets

- **WHEN** the authenticated application executes learner source
- **THEN** the runtime request contains no session or application secret and the isolated runner has no authenticated application-origin authority

### Requirement: Limits are trusted constants

The production adapter SHALL enforce at most 64 KiB of UTF-8 source, 200 output entries, 12 KiB of combined output/value text, a 16 KiB terminal packet, a 1 KiB error message, and a two-second execution deadline. Learner source and ordinary callers SHALL NOT increase those limits. Exceeding a limit SHALL produce an explicit source/output-limit or timeout result rather than success or silent truncation.

#### Scenario: Source input is oversized

- **WHEN** UTF-8 source exceeds 64 KiB
- **THEN** execution is rejected before a Worker receives it and the result identifies the source/output limit

#### Scenario: Caller supplies no limits

- **WHEN** a caller executes source through the public adapter contract
- **THEN** trusted production constants govern the run without caller-provided weakening

### Requirement: Later learning and preview behavior remains excluded

The JavaScript runtime SHALL NOT render web previews, evaluate assessment cases, declare Check results, create attempts or submissions, accept completion, change progress, award XP/rewards, unlock content, call backend execution, collect source telemetry, or add PWA/offline-runtime promises.

#### Scenario: Successful execution finishes

- **WHEN** learner JavaScript returns successfully
- **THEN** only runtime output/status is available and no validation, submission, progress, or reward transition occurs
