# Spec Delta

## MODIFIED Requirements

### Requirement: Phase 13 excludes learning authority and execution

The Editor Workspace SHALL remain independent from curriculum and learning authority. Its Phase 13 baseline SHALL execute nothing when no adapter is supplied; its optional Phase 14 adapter SHALL add only browser JavaScript Run/Cancel and runtime presentation; its optional Phase 15 preview adapter SHALL add only script-disabled HTML/CSS presentation and separately isolated JavaScript computation; its optional Phase 16 strategy SHALL add only deterministic local Check feedback. A Phase 17 parent MAY provide an explicit submission action and receive a captured source and local check result; the parent SHALL call the protected backend API and present backend acceptance separately. The workspace SHALL NOT determine quest completion, award XP, alter progress, unlock content, or submit automatically.

#### Scenario: Phase boundary is reviewed

- **WHEN** the published quest workspace is inspected
- **THEN** Run and Check remain local, Submit is explicit and authenticated, and only the backend response can report accepted personal-learning completion

#### Scenario: Submission integration is absent

- **WHEN** a parent supplies no submission action
- **THEN** the reusable workspace retains its local editing, Run, Preview, and Check behavior without any learning write
