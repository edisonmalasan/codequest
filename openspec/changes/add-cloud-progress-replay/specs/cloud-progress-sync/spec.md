# Spec Delta

## Purpose

Deliver explicitly submitted authenticated learning work after reconnect and refresh accepted account facts across devices while preserving local recovery and owner isolation.

## ADDED Requirements

### Requirement: Explicit submissions are durable owner-bound pending work

The frontend SHALL save an explicit authenticated Submit as an immutable bounded snapshot with its originating owner, stable quest ID, event ID, content/assessment versions, source, and report before sending it. Repeated delivery SHALL reuse that event and payload. Local Run or Check SHALL NOT automatically submit. Storage failure SHALL preserve editable source and SHALL NOT claim durable pending work or send an unsaved snapshot. Guest records and legacy envelopes SHALL NOT be automatically replayed as account operations.

#### Scenario: Device goes offline after Submit
- **WHEN** an authenticated learner submits and transport is unavailable
- **THEN** the same durable event survives reload as pending, separately from accepted completion

#### Scenario: Storage is unavailable
- **WHEN** the snapshot cannot be saved
- **THEN** source stays editable and the UI reports the storage failure without claiming pending delivery

### Requirement: Reconnect replay is bounded and isolated

The trusted frontend SHALL replay originating-owner pending submissions sequentially on authenticated app entry, reconnect, foreground return, and explicit retry. Each pass SHALL be bounded and prevent overlapping same-tab replay. Before each request it SHALL check the current account and bind the transport token to that owner. Logout or account switch SHALL stop further requests and suppress old-owner results from the new-owner UI. Multiple tabs or devices MAY deliver duplicates; backend event and reward uniqueness SHALL settle them without duplicate effects.

#### Scenario: Account switches during replay
- **WHEN** account A has pending work and the device switches to B
- **THEN** A's source remains in A's bucket and is never sent with B's credentials or shown as B's work

#### Scenario: Duplicate delivery
- **WHEN** two devices deliver the same owner's identical event
- **THEN** one attempt and at most one first-completion reward/day exist

### Requirement: Uncertain and rejected work remains recoverable

Network failure, authentication expiry, throttling, server failure, or an uncertain response SHALL retain the original pending event for retry. A safe version, prerequisite, unavailable-quest, or malformed-payload rejection SHALL retain source and identify work needing attention without silent version relabeling. The owner SHALL be able to view/copy saved source and explicitly retry or remove their own envelope. Confirmed delivery metadata SHALL be stored separately from immutable payload and SHALL NOT become completion authority or a raw protected-response cache.

#### Scenario: Response is lost after acceptance
- **WHEN** the backend accepts an event but the response is lost
- **THEN** replay reuses the event and original payload and creates no additional reward or streak date

#### Scenario: Curriculum changes
- **WHEN** an unrecorded event uses an unsupported or retired assessment
- **THEN** it remains recoverable with a safe retry explanation rather than being overwritten as current work

### Requirement: Cloud facts are refreshed without local authority

Accepted progress, availability, XP, and streak views SHALL come from owner-only backend reads. App entry, reconnect, foreground return, and confirmed delivery SHALL refresh those views; a read failure SHALL show unavailability rather than an empty or client-derived accepted snapshot. Pending or provisional work SHALL be presented separately by stable quest identity and SHALL NOT replace accepted account facts. First completion and reward uniqueness SHALL merge repeated work with existing history; streak credit SHALL use backend acceptance time only. Protected responses and credentials SHALL NOT be persisted for offline display. Drafts SHALL remain device-local with no cloud draft transport, code merging, or service worker added.

#### Scenario: Another device already completed a quest
- **WHEN** pending work is delivered for the same stable quest
- **THEN** accepted history is preserved, no repeat reward is granted, and the frontend refreshes trusted account facts

#### Scenario: Offline progress view
- **WHEN** the backend cannot be reached
- **THEN** pending work is labelled device-local and no cached client total or completion flag is presented as current account authority
