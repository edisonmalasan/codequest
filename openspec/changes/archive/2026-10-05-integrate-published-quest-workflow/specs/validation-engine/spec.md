# Spec Delta

## ADDED Requirements

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
