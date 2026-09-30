# Spec Delta

## Purpose

Define minimized learning and activation measurement across trusted browser interactions and durable backend facts while keeping external PostHog collection off until privacy policy is approved.

## ADDED Requirements

### Requirement: Analytics uses a bounded event contract

Phase 31 SHALL define the activation events `signup_completed`, `first_quest_started`, `first_code_run`, `first_quest_completed`; learning events `quest_attempted`, `quest_completed`, `quest_failed`, `hint_used`, `execution_error`, `validation_failed`, `code_run`, `validation_checked`; and project events `capstone_started`, `capstone_completed`. Every captured event SHALL have a contract version, source trust (`client_observed` or `backend_fact`), guest or account cohort, bounded stable event identity and only allowlisted quest ID, chapter ID, content/assessment version, outcome category or error category properties that apply. Unknown event names or properties SHALL be rejected before delivery. No raw source, test output, report, written response, hint text, URL/query, email, token, free text or arbitrary object SHALL enter analytics.

#### Scenario: Learner code is offered as a property

- **WHEN** a caller tries to capture an event with source, output, credential or any unapproved field
- **THEN** the capture boundary rejects it before any network request

#### Scenario: Published quest metadata is captured

- **WHEN** a permitted learning event is recorded
- **THEN** its bounded stable quest identity and version may be included without private lesson or learner text

### Requirement: Browser interactions remain observed and non-authoritative

Trusted application seams SHALL observe first quest start, first code run, each non-cancelled code run, each completed local Check, hint use, execution error and validation failure without reading learner source or accepting completion. Guest-observed and authenticated-account events SHALL remain separate cohorts; anonymous guest activity SHALL NOT be silently linked to an account at signup. Client timestamps and local passes SHALL NOT become accepted progress, retention or reward authority. Offline or blocked delivery SHALL leave learning and drafts usable and SHALL NOT create an analytics replay containing private work.

#### Scenario: Local Check fails

- **WHEN** a learner runs a failing local Check
- **THEN** bounded `validation_checked` and `validation_failed` interactions may be observed without declaring a backend attempt or completion

#### Scenario: A later successful Run or Check occurs

- **WHEN** a learner returns and successfully Runs code or completes a passing local Check
- **THEN** `code_run` or `validation_checked` records a bounded observed action in the elapsed return window without a second `first_code_run` or backend acceptance

#### Scenario: Guest signs up

- **WHEN** a guest later authenticates or imports local learning work
- **THEN** guest-observed events remain distinguishable from backend account facts and no automatic identity merge occurs

### Requirement: Backend milestones originate from committed facts

The backend SHALL derive first verified CodeQuest owner-row creation across account and learning writes, first quest start, submitted attempts, failed attempts, first accepted quest completion, each first accepted quest/capstone completion, and qualifying continued streaks only from newly committed owner-bound facts. `signup_completed` SHALL label the first backend owner-row creation as an account-activation proxy, not claim the Supabase registration instant. Stable event identities SHALL allow downstream reports to deduplicate uncertain delivery. An exact replay, rejected submission, passing practice after completion, failed request or client assertion SHALL NOT create a new accepted milestone. Analytics delivery failure SHALL NOT change account, progress, XP, streak or unlock transactions. Backend events SHALL retain the ADR 0005 `client_reported` qualification and SHALL NOT claim independent grading.

#### Scenario: Submission is replayed

- **WHEN** the same authenticated event is replayed after a response loss
- **THEN** its original learning outcome is returned without a second analytics attempt or accepted-completion milestone

#### Scenario: First capstone completion commits

- **WHEN** an eligible owner receives the first accepted CAP01 completion
- **THEN** `quest_completed` and `capstone_completed` may be captured from the committed fact with stable identity and a client-reported qualification

#### Scenario: Provider is unavailable

- **WHEN** PostHog delivery fails after a valid learning transaction
- **THEN** the learning response and durable facts remain correct while measurement loss is recorded without private payloads

### Requirement: Retention and funnel views are qualified

`daily_learning_activity` and `weekly_learning_activity` SHALL be defined as derived PostHog views of qualified learning actions rather than app opens or mutable learning counters. The core funnel SHALL report signup, first run, first accepted quest, five distinct accepted quests, first completed chapter, capstone start and accepted capstone completion with source/cohort labels. D1 and D7 return SHALL use elapsed 24-48 and 168-192 hour windows for a new run, Check or submission/completion, excluding unfinished observation windows; timezone streak days SHALL remain a separate measure. Reports SHALL deduplicate stable event/quest identities, show denominators and sample size, and identify client-observed versus backend-accepted evidence. Numeric targets and efficacy claims SHALL remain deferred under F05.

#### Scenario: Retry inflates a funnel step

- **WHEN** an accepted submission is replayed or a second attempt occurs on a completed quest
- **THEN** five-quest and capstone-completion numerators count only distinct first accepted stable quest IDs

#### Scenario: Learner only opens the app

- **WHEN** a learner returns without a qualified learning action
- **THEN** D1/D7 meaningful-return views do not count that open

### Requirement: External delivery is privacy gated and least capability

PostHog capture SHALL be disabled by default and SHALL require explicit approved deployment configuration after F06 consent, retention, deletion and access policies are settled; a key or host alone SHALL NOT enable it. Enabled delivery SHALL send only the event allowlist to a configured HTTPS ingestion origin with no cookies, referrer or credential-bearing headers from the browser. Automatic page/click/form capture, session replay, surveys, user profiling, feature flag polling and exception capture SHALL remain off. Learner runtime/preview origins SHALL have no analytics capability. Invalid configuration or provider failure SHALL fail closed for telemetry and never block learning. No live project key or production learner data is required for local/CI tests.

#### Scenario: No approval gate is configured

- **WHEN** the application runs with default analytics configuration
- **THEN** no PostHog network request or analytics identifier is created

#### Scenario: Disabled preview attempts to emit

- **WHEN** learner-controlled code runs in a Worker or preview iframe
- **THEN** it cannot invoke the trusted analytics adapter or send an authenticated analytics request
