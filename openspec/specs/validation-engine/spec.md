# Validation Engine Specification

## Purpose

Provide reusable, deterministic local JavaScript correctness feedback through the isolated browser runner without creating authoritative learning records.

## Requirements

### Requirement: Validation uses a reusable typed strategy

The frontend SHALL accept a captured JavaScript source and a bounded, parent-supplied `ValidationStrategy` with stable case IDs and one of `output-match`, `value-test`, `function-test`, or `custom-test`. It SHALL return one terminal result with an overall pass flag, per-case pass/fail and bounded feedback, failed case IDs, and non-negative elapsed execution time. Invalid definitions SHALL fail closed before learner source runs. Case order and result order SHALL be deterministic.

#### Scenario: Valid cases complete
- **WHEN** a finite source is checked against valid ordered cases
- **THEN** each case has a stable result and the overall pass flag is true only when every case passes

#### Scenario: Definition is malformed
- **WHEN** a strategy has duplicate IDs, unsupported values, or exceeds fixed limits
- **THEN** validation reports a bounded configuration failure without executing learner source

### Requirement: Output and value tests compare exact deterministic data

`output-match` SHALL compare the complete ordered captured console output against an expected line sequence. `value-test` SHALL compare the source's returned JSON-compatible value against an expected JSON-compatible value by structural value, including array order and object content, without invoking learner getters or serialization hooks. Missing, extra, unsupported, or oversized output or values SHALL fail explicitly, never pass through truncation.

#### Scenario: Output differs by one line
- **WHEN** source prints an extra line or different whitespace
- **THEN** the output case fails with its authored feedback

#### Scenario: Returned value differs
- **WHEN** source returns a different JSON-compatible value
- **THEN** the value case fails with its authored feedback

### Requirement: Function tests invoke named learner functions with bounded fixtures

`function-test` SHALL call a named learner function with each case's bounded JSON-compatible arguments and compare its returned JSON-compatible value structurally with the expected value. Each case SHALL run in a fresh isolated Worker so global mutations and failures cannot contaminate another case. An absent function, thrown error, rejected promise, unsupported return, or timeout SHALL fail that case with bounded feedback.

#### Scenario: Normal and boundary arguments pass
- **WHEN** a function returns expected values for distinct normal and boundary argument sets
- **THEN** both cases pass in authored order

#### Scenario: One function case loops
- **WHEN** a case enters a tight loop
- **THEN** the trusted controller terminates that Worker, reports a timeout for that case, and a later finite check can complete within the approved recovery bound

### Requirement: Custom tests are declarative and bounded

`custom-test` SHALL apply only allowlisted data-only predicates to bounded output or returned JSON-compatible values. It SHALL NOT accept executable callbacks, source strings as test programs, regular expressions, packages, network dependencies, DOM access, or application authority. A predicate mismatch SHALL report the authored case feedback.

#### Scenario: Custom predicate matches
- **WHEN** an allowlisted predicate matches the captured result
- **THEN** its case passes without executing test code supplied by the caller

#### Scenario: Executable callback is supplied
- **WHEN** a caller supplies a callback or unsupported predicate
- **THEN** validation rejects the definition before source execution

### Requirement: Validation preserves the isolated runtime boundary

Learner source and case invocation SHALL execute only in fresh Workers at the configured credential-free runner origin, through a fixed trusted bootstrap and private correlated channel. The authenticated application SHALL never evaluate learner source or test it in its own origin, and NestJS SHALL never execute learner source. Source, definitions, results, and messages SHALL obey fixed byte, count, and time limits no weaker than the Phase 14 execution boundary. The runner SHALL deny network, application storage, DOM, nested workers, dynamic imports, authenticated APIs, and access to the trusted message port. Worker termination SHALL precede terminal result acceptance.

#### Scenario: Learner probes application authority
- **WHEN** learner source attempts network, application storage, DOM, or parent messaging during a check
- **THEN** those capabilities are absent or denied and no secret or authenticated response reaches the Worker

#### Scenario: Result is forged or malformed
- **WHEN** a stale, duplicate, wrong-origin, mismatched, oversized, or malformed message arrives
- **THEN** it cannot alter the active check and an active protocol failure terminates safely

### Requirement: Validation lifecycle and failures are explicit

The strategy SHALL support cancellation, supersession, disposal, and owner/navigation cleanup. Syntax errors, runtime errors, timeout, output limits, cancellation, and internal failures SHALL be distinct from an ordinary failed assertion. A failed or hostile check SHALL preserve learner source and drafts and permit a fresh finite check. Feedback SHALL remain text-only and bounded; no raw source or assessment result SHALL be sent to telemetry.

#### Scenario: Check is cancelled
- **WHEN** the caller cancels a check
- **THEN** active Worker resources are terminated, the result is cancelled, and later packets cannot update it

#### Scenario: Syntax error occurs
- **WHEN** source cannot compile
- **THEN** the check fails with syntax-error feedback and does not clear the editor source

### Requirement: Local checks have no learning authority

A pass SHALL be labeled local and unverified. Validation SHALL NOT create attempts or submissions, accept completion, change progress, award XP or rewards, unlock content, call LLM grading, or alter backend learning behavior.

#### Scenario: Every case passes
- **WHEN** all cases pass
- **THEN** only local test feedback changes and no authoritative learning state changes
