# Tasks

## 1. Bounded event contract and PostHog delivery

- [x] 1.1 Add explicit browser and backend event-name/property builders, source/cohort labels and stable event IDs. Verify malformed names, unapproved fields, private payloads and oversized values are rejected in focused tests; document the event dictionary and trust labels.
- [x] 1.2 Add no-op-by-default PostHog HTTP adapters with explicit approval/key/HTTPS-host gates, safe browser fetch options, backend timeout and isolated failures. Verify disabled/default/invalid config makes zero network requests, local fake capture receives only allowlisted payloads and failures do not affect learning; document F06 enablement preconditions without enabling collection.

## 2. Durable backend fact events

- [x] 2.1 Emit `signup_completed`, account `first_quest_started`/`capstone_started` and `hint_used` only for newly committed account/start/hint facts. Verify retry, account ownership, versions and no-telemetry-failure effects with focused backend tests; document event source and idempotency.
- [x] 2.2 Emit `quest_attempted`, `quest_failed`, `quest_completed`, `first_quest_completed`, `capstone_completed` and qualifying `streak_continued` from new committed submission facts without source/report text. Verify exact replay, practice, failed/rejected work, one first completion, one streak day, provider failure and distinct owner event IDs in backend integration tests; document ADR 0005 qualification.

## 3. Observed browser events

- [ ] 3.1 Add trusted quest/workspace seams for guest first start/hint and guest/account first run, each non-cancelled `code_run`, each completed `validation_checked`, execution error and validation failure. Verify later successful Run/Check retention evidence, Run/Check snapshot exclusion, client-observed labels, session/owner reset, guest separation, offline/no-network and unaffected editor behavior with focused frontend tests; document no automatic identity merge or completion authority.
- [ ] 3.2 Cover a representative browser flow with a local fake collector: guest start/run and authenticated accepted work remain separate source/cohort records, while runtime/preview origins cannot call the application analytics adapter. Verify in Playwright without external PostHog traffic or project credentials.

## 4. Measurement definitions and integration gates

- [x] 4.1 Document exact PostHog event filters and signup-to-capstone funnel, five-distinct-quest/chapter derivation, daily/weekly meaningful activity and elapsed D1/D7 windows, including denominators, stable-ID deduplication, incomplete windows, client/backend trust, F05 targets and F06 policy gate. Verify examples against a small deterministic event fixture.
- [ ] 4.2 Run root test/lint/typecheck/build, API/content/history drift, PWA/curriculum browser suites and strict OpenSpec validation; inspect the final diff and record actual outcomes. Merge Apply after required CI, then sync and archive through separate remote branches and merge-commit PRs.
