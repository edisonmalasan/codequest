# Spec Delta

## Purpose

Represent a learner's consistency through durable, owner-bound local activity days created only by accepted learning, with self-only derived streak reads.

## ADDED Requirements

### Requirement: Only first accepted completions create meaningful days

The backend SHALL create a qualifying streak activity day only after the first accepted completion of a stable published quest or capstone, in the same transaction as that completion. It SHALL use backend acceptance time and the learner's validated timezone to determine the local calendar date, retain that timezone and acceptance time on the durable day, and credit at most one day per learner-local date. App opens, local Checks, failed attempts, hints, practice, replays, and duplicate submissions SHALL create no day. Guest or offline work SHALL count only on the authenticated backend acceptance day, never on a client capture date.

#### Scenario: First accepted completion
- **WHEN** an authenticated learner earns a first accepted completion in their configured timezone
- **THEN** one durable day records the server acceptance date and timezone atomically with completion

#### Scenario: Several completions on one local date
- **WHEN** the learner first completes several different quests on the same local date
- **THEN** exactly one qualifying day exists for that date

#### Scenario: Nonqualifying activity and replay
- **WHEN** the learner opens the app, checks locally, uses a hint, fails, practices a completed quest, or replays an event
- **THEN** no additional day is credited

### Requirement: Timezone changes are prospective and cannot manufacture a day

An accepted timezone setting SHALL affect future acceptance only. Existing activity dates, timezones, and timestamps SHALL remain unchanged. A timezone change alone SHALL create no activity; when a first completion occurs within 24 hours of the latest credited day under a different timezone, the backend SHALL withhold a second day credit. A new local date under an unchanged timezone MAY receive credit across a normal local-midnight boundary. A historical local date SHALL never receive duplicate credit.

#### Scenario: Learner changes timezone after a credited completion
- **WHEN** a learner changes timezone and earns another first completion 10 hours after the last credited day
- **THEN** the original day remains unchanged and no second day is credited

#### Scenario: Learner completes after timezone transition window
- **WHEN** a learner earns a first completion at least 24 hours after the latest credited day in a new timezone and its local date has no credit
- **THEN** the new day is credited using the new timezone

### Requirement: Streaks derive from durable activity days

The backend SHALL derive longest streak from consecutive recorded local dates and current streak from the trailing consecutive dates when the latest day is today or yesterday in the learner's current timezone. A missed local calendar date SHALL break current continuity. No mutable current or longest streak counter SHALL be authoritative. A protected versioned self-only read SHALL return current streak, longest streak, current timezone, and latest activity date; an account view MAY display these values without computing authority client-side.

#### Scenario: Today or yesterday was meaningful
- **WHEN** the learner has consecutive activity days ending on today or yesterday in the configured timezone
- **THEN** the read returns that trailing run as current streak and the longest run in all durable days

#### Scenario: Activity is stale
- **WHEN** the latest recorded day precedes yesterday in the current timezone
- **THEN** current streak is zero while longest streak retains its historical value

#### Scenario: Owner separation
- **WHEN** an authenticated learner reads streaks
- **THEN** the response uses only that principal's activity days and never a browser-supplied owner
