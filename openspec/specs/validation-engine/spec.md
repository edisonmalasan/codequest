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

### Requirement: Eligible web exercises use bounded declarative local checks
An explicitly authored HTML/CSS or interactive-web exercise MAY define allowlisted data-only assertions over an inert parsed document, bounded style declarations, or the supported interactive result and event sequence. The definition SHALL use stable case IDs, fixed limits, deterministic ordering, and bounded feedback. It SHALL reject executable test callbacks, arbitrary selectors or predicates, hidden network requests, external resources, and unsupported DOM operations before learner work executes. Learner JavaScript SHALL remain subject to the existing isolated Worker limits; authored web checks SHALL NOT evaluate code in the authenticated application, preview display frame, or NestJS. A missing or unsupported web-check strategy SHALL disable Check and Submit for that exercise.

#### Scenario: Static markup satisfies an authored assertion
- **WHEN** a valid static web snapshot has the required inert element and style declaration
- **THEN** Check returns the authored ordered local case results without loading external resources

#### Scenario: Interactive result exceeds limits
- **WHEN** the supported interactive state or event sequence exceeds its published limits
- **THEN** Check fails safely, releases execution resources, and preserves source and drafts

#### Scenario: Definition asks for executable test code
- **WHEN** an author supplies JavaScript as a test or an unsupported browser operation
- **THEN** publication validation rejects the definition and no published Quest uses it

### Requirement: Static HTML cases can assert reviewed semantic structure
An authored static web assessment SHALL support a bounded data-only assertion for an element with an exact stable ID, allowlisted HTML tag, and a small set of allowlisted safe attributes needed for declared beginner outcomes. Supported attributes SHALL be compared as inert parsed data with deterministic normalization and feedback; URL-bearing values SHALL be limited to explicitly safe local forms, and form relationship checks SHALL not submit or execute anything. Definitions SHALL reject arbitrary selectors, predicates, executable callbacks, unsafe URLs, unsupported tags or attributes, and excessive counts or bytes before learner work runs. Existing exact-text and CSS declaration cases SHALL remain compatible.

#### Scenario: Semantic markup satisfies the case
- **WHEN** a current HTML snapshot contains the declared element type and safe attribute values
- **THEN** Check returns the ordered local result without loading resources or activating links or forms

#### Scenario: Unsafe or unsupported assertion is authored
- **WHEN** a case asks for executable logic, an external URL, arbitrary selector, or unsupported attribute
- **THEN** publication validation rejects the definition and no published Quest uses it

#### Scenario: Attribute or element differs
- **WHEN** learner markup uses the wrong tag, omits a required attribute, or breaks a declared label-to-field relationship
- **THEN** only the matching case fails with bounded actionable feedback and the source remains editable

### Requirement: Static CSS cases inspect bounded authored rules
Static web Check SHALL support data-only cases for a reviewed allowlist of beginner CSS selectors, properties, values, and viewport conditions. The parser SHALL bound bytes, rule count, nesting, case count, and feedback; reject imports, external URLs, executable extensions, unsupported at-rules, and unsupported selector or value forms; and compare normalized declarations deterministically without executing learner code or loading resources. A case SHALL identify its intended rule scope and shall not mistake a declaration in a different media scope for the requested one. Existing CSS declaration cases SHALL remain compatible. Check SHALL describe source-level evidence and SHALL NOT claim computed-style or visual-quality grading.

#### Scenario: Equivalent formatting passes
- **WHEN** the learner expresses the required safe declaration with different whitespace or rule order within the same declared scope
- **THEN** the same ordered case passes with bounded feedback

#### Scenario: Wrong media scope fails
- **WHEN** a declaration exists only outside the case's required responsive rule
- **THEN** that responsive case fails without treating the declaration as a match

#### Scenario: Unsafe CSS is supplied
- **WHEN** source contains an import, external URL, unsupported at-rule or selector, or exceeds a fixed limit
- **THEN** Check returns a safe terminal result, preserves the source, and cannot contact an external sink
