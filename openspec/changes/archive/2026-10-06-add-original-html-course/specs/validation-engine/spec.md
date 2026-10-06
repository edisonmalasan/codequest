# Spec Delta

## ADDED Requirements

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
