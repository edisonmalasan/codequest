# Design

## Context

The Phase 17 submission transaction serializes on the learner user row, inserts one `quest_completions` fact, and awards Phase 19 XP. The database already has `streak_activity_days` keyed by owner and local date, including timezone, qualifying quest, and accepted time. Profiles default to UTC. There is no validated timezone setter or streak read. ADR 0005 limits acceptance to bounded client reports; this change preserves that personal-learning trust model.

## Goals / Non-Goals

**Goals:** Make the existing durable day table authoritative, avoid duplicate credit through replays and timezone switching, and derive current/longest streaks on demand.

**Non-Goals:** No freeze, grace, backfill, client clock, mutable counter, independent grader, achievements, or unlock presentation.

## Decisions

1. **Acceptance transaction.** After successful first completion and XP insertion, read the profile timezone under the same serialized user transaction, derive the local date from the server acceptance timestamp, and conditionally insert one day. `ON CONFLICT DO NOTHING` handles another completion on that date; existing quest/date uniqueness and the user lock protect idempotency. Use the attempt's server timestamp as acceptance time, not a client value. Create the default profile if absent, so UTC is explicit. A failed transaction rolls back completion, XP, and day together.
2. **Timezone validation and changes.** Add an authenticated account timezone update that validates a canonical IANA identifier with `Intl.DateTimeFormat` and rejects offset strings and aliases that are not supported as IANA zones. Serialize updates on the same user row so submission and setting order is clear. Validate timezone again before day conversion to fail closed for corrupt stored data. Preserve historical day fields. Compare the latest credited day before inserting: if its timezone differs and its acceptance is less than 24 hours earlier, withhold credit. This prevents rapid timezone hopping from creating an extra day while ordinary same-zone midnight completions can count consecutive dates. A completion withheld during the transition is not backfilled.
3. **Derived read.** Read only the principal's ordered activity dates and current profile timezone. Compare ISO date strings through UTC calendar arithmetic (not local process timezone). Longest counts the maximum consecutive run. Current counts the final run only if its last date equals today or yesterday in the current timezone. Return zero and null latest date for no activity. Never store derived counters.
4. **API and UI.** Add `GET /api/v1/streaks` and `PUT /api/v1/account/timezone`, protected by self permissions. Generate the frontend OpenAPI client from backend; account UI uses the trusted authenticated transport for the setting and read, with pending/failure states and an explanation of prospective effect. No request accepts user IDs or activity timestamps.

## Risks / Trade-offs

- **Timezone travel close to a prior credit can skip a legitimate local day** → The 24-hour transition guard favors anti-duplication; explain the rule in settings and test boundary cases.
- **Historical dates from different timezones can be adjacent even if elapsed time differs** → Keep immutable acceptance-local dates and derive by their date sequence, as P10 requires; never reinterpret old days.
- **Client-reported completion remains forgeable** → Reuse Phase 17 bounded/version-matched policy and label accepted streaks as personal-learning activity, not independent proof.

## Migration Plan

No migration is needed because the durable table and profile timezone already exist. Deploy the backend and regenerated contract together; old completions are not backfilled because their acceptance timezone was not captured. Rollback can stop new writes and reads without rewriting persisted day facts.
