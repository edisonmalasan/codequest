## ADDED Requirements

### Requirement: Optional written responses share local draft and snapshot behavior

The reusable workspace SHALL accept optional parent-defined labeled written response fields without curriculum coupling. Responses SHALL share owner/workspace/version-bound draft storage, idle and explicit Save, revision ordering, lifecycle best-effort flush, unload warnings and truthful failure behavior with editable source. Response text SHALL NOT enter execution, preview or deterministic check requests. Explicit Submit SHALL capture current responses with the checked source and report; editing or switching owners SHALL NOT leak a previous owner's responses. Without fields, existing workspace behavior SHALL remain unchanged.

#### Scenario: Responses survive reload
- **WHEN** the same owner returns to the same versioned workspace after a successful save
- **THEN** source and responses restore together while another owner's work remains inaccessible

#### Scenario: Written work cannot save
- **WHEN** storage rejects a response save
- **THEN** text stays editable, failure and retry are exposed, and no durable or cloud-save claim is made

#### Scenario: Learner submits written work
- **WHEN** the parent permits explicit Submit for a checked source
- **THEN** the captured responses belong to that snapshot and later edits do not alter it or execute the response text
