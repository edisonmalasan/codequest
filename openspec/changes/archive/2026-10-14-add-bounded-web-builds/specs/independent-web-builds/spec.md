# Spec Delta

## Purpose

Give learners an independent, device-local place to create and run bounded web projects while preserving the established execution boundary and truthful project ownership and save states.

## ADDED Requirements

### Requirement: Learners can create and reopen independent bounded Builds

The frontend SHALL provide a production Builds entry separate from published lessons and SHALL allow a learner to create an original web Build from a reviewed starter. Each Build SHALL have a stable device-local identity, an owner scope, and an identified manifest containing exactly one HTML file, one JavaScript file, and optionally one CSS file. The learner SHALL be able to reopen an existing Build on the same device. The interface SHALL state that R11A Builds are device-local and are not cloud saved or published.

#### Scenario: Create and reopen a Build
- **WHEN** a learner creates a Build, edits two files, leaves the route, and returns on the same device under the same local owner
- **THEN** the Build retains its stable identity and restores its available drafts and active-file preference without changing a lesson draft

#### Scenario: Different owner opens Builds
- **WHEN** a different authenticated owner or guest bucket becomes active on the same browser
- **THEN** the previous owner's Build list and source are not displayed or modified

### Requirement: Build files and local metadata are bounded and recoverable

Build creation and reopening SHALL validate file identity, language, count, source size, and local metadata before presenting a project as runnable. Source drafts and the Build index SHALL use the existing owner-scoped local persistence boundary. A storage, quota, malformed-record, or version failure SHALL be reported without discarding current in-memory source, falsely claiming a save, or attaching one owner's work to another. The learner SHALL be able to remove a device-local Build through an explicit confirmation without deleting published lesson drafts or backend learning facts.

#### Scenario: Local storage fails during editing
- **WHEN** a save is rejected while the learner edits a Build
- **THEN** the current source remains editable, the save state reports failure and retry, and the Build is not described as backed up

#### Scenario: Build record is incompatible
- **WHEN** a stored Build has an unsupported manifest version or malformed owner/file data
- **THEN** it is not executed or silently converted into a current Build, and compatible existing drafts are not erased

### Requirement: Build Run uses the reviewed isolated web capability

Interactive Build Run SHALL capture an immutable identified HTML/CSS/JavaScript snapshot and use the existing credential-free runner Worker and separate preview-origin display. It SHALL retain the current source, output, event, lifetime, and recovery bounds and the reviewed limited DOM/event interface. Learner code SHALL NOT execute in the authenticated document, the preview display frame, Next.js server code, or NestJS. It SHALL NOT gain network, storage, navigation, timers, dynamic import, nested Workers, external assets, or unrestricted browser DOM authority. Unsupported files and APIs SHALL produce a bounded, truthful result without unsafe fallback.

#### Scenario: Finite Build runs
- **WHEN** a supported Build runs and its finite click handler changes allowed text
- **THEN** the current isolated preview and bounded console reflect only that captured snapshot and later edits mark it stale

#### Scenario: Hostile Build fails
- **WHEN** source loops, floods output, attempts an external sink, or sends a malformed packet
- **THEN** the work is terminated or rejected under existing limits, no privileged sink is reached, source is preserved, and a fresh finite run can recover within the reviewed bound

### Requirement: Build actions stay separate from learning and publication authority

Build Run, reload, save, and remove SHALL NOT invoke Quest Check or Submit, create accepted attempts or completions, change progress, XP, levels, streaks or unlocks, issue a certificate, create a public page, or send raw source to analytics or monitoring. The Builds UI SHALL distinguish local display feedback from verified learning results and SHALL not advertise unsupported browser capabilities.

#### Scenario: Build preview looks correct
- **WHEN** a learner runs a Build that appears correct
- **THEN** the Build remains a private device-local project and no accepted learning or public publishing state changes

### Requirement: Build workspace is usable and releases resources

The independent Build workspace SHALL provide accessible file selection, edit/save status, Run, reload, cancel, preview, console/error feedback, and source-preserving navigation at desktop and 390/320 CSS-pixel or zoom-equivalent widths. Owner change, route navigation, supersession, and unmount SHALL release active workers, frames, ports, listeners, and timers and ignore late packets without mixing owners or clearing drafts.

#### Scenario: Learner leaves an active Build
- **WHEN** the owner changes or the route unmounts during a Run
- **THEN** the old run and display are cancelled, late output is ignored, and source stays within its original owner scope

### Requirement: R11A acceptance is tied to the integrated Build route

R11A SHALL remain below founder accepted until the production Build route passes exact-build containment and recovery probes for finite and hostile source, malformed manifests, origin collision, denied sinks, spoofed or stale messages, repeated loops, owner switching, storage failures, responsive behavior, and keyboard operation, and the founder reviews the create-edit-run-reopen workflow. The record SHALL name commit/build, origin topology, environment, browser versions, failures, retests, and untested physical or assistive setups. This evidence SHALL NOT close R11B–R11E, real Auth, or Phase 38 hosted/device gates.

#### Scenario: Integrated probe fails
- **WHEN** an integrated Build route probe violates isolation, loses source, or fails to recover within the approved bound
- **THEN** the failure remains open and R11A is not marked founder accepted or release ready
