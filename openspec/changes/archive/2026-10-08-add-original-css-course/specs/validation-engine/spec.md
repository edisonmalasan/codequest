# Spec Delta

## ADDED Requirements

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
