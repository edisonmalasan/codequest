# Private beta study protocol

**Status: preparation only — NO GO for invitations or real learner data.** This guide is a reviewable Phase 39 study plan. The [Phase 38 readiness record](beta-readiness.md) remains the release authority. F06 legal, privacy, consent, retention, deletion and operator-access decisions, hosted controls, physical-device evidence, F04 balancing and F05 recruitment/targets are still open. No participant recruitment or observation is documented here; repository PostHog/Sentry delivery remains disabled by default. Completing this guide does not start or complete the private beta.

## Decisions required before invitations

Product, content, security and operations owners must attach a dated decision and evidence link for every blocking row in [beta readiness](beta-readiness.md). Record the release candidate and environment actually reviewed. In particular, F05 must name recruitment eligibility, sample size, contact method, observation windows, metric thresholds, stop criteria and how nonrespondents are handled **before** looking at participant outcomes. F04 must approve or explicitly disclose the provisional XP curve and review quest timing/difficulty. F06 must approve actual policy text and collection mechanics, including feedback and observation handling. These values are intentionally unset here.

| Decision field | Owner | Approved value / link | Date |
| --- | --- | --- | --- |
| F06 policy, consent, retention, deletion and operator access | Product / security | Unset | Unset |
| Hosted recovery, backup restore, migrations and security evidence | Identity / operations / security | Unset | Unset |
| F02 supported physical devices, browsers and assistive technology | Product / frontend | Unset | Unset |
| F04 quest timing, difficulty, hints and provisional XP treatment | Product / content | Unset | Unset |
| F05 recruitment, sample size, targets, windows and stop rules | Product | Unset | Unset |
| Release candidate, environment and final go decision | Product / security / operations | **NO GO** | Unset |

## Study questions and evidence

Use the published JavaScript Foundations journey and its current content/assessment versions. Ask learners to think aloud during learning only after approved consent. Let them choose their own solution; do not give reference code or solve a stuck quest for them. A capstone review may require later sessions after prerequisites are reached. Record a failure, abandonment or missing observation as such, instead of inferring success.

| Phase 39 focus | Observation question | Evidence to review | Interpretation limit |
| --- | --- | --- | --- |
| Lesson clarity | Can the learner restate the task, expected output and next action? | Voluntary coded observation by quest/version; start and first Run | An observer prompt can change behavior; do not count it as independent comprehension |
| Exercise difficulty | Where do learners stall, retry or leave? | Quest/version attempt distribution, failed Checks, session notes and F04 timing review | A hint or retry does not by itself mean a lesson is too hard |
| Validation accuracy | Does a reported failure match the published case and expected behavior? | Reproduce with authored test case, assessment version, safe outcome category and private local fixture | Browser Check is deterministic feedback; accepted completion is client reported, not independent grading |
| Editor usability | Can learners edit, save, Run, Check and recover an error without losing source? | Coded observation, device/browser, recovery path and reproduction steps | Do not place learner source, output or credentials in the study record |
| Mobile friction | Can target-device learners navigate, type, inspect feedback and continue? | Physical device/browser/assistive-technology evidence under F02; reflow and interaction notes | Desktop simulation does not establish physical mobile support |
| Meaningful return | Do activated learners perform a later Run, Check or submission? | Separate D1/D7 elapsed-window views with numerator, denominator, cutoff and missing-data notes | App opens and timezone streaks do not count; guest and account cohorts stay separate |
| Hint usage | Do hints unblock or confuse the learner? | `hint_used` by quest/version, followed by observed action and optional consented note | Hint use is neither incompetence nor accepted completion |
| Capstone completion | Can eligible learners finish CAP01 and explain their debugging and transfer choices? | Backend `capstone_started`/`capstone_completed`, rubric review and optional observed explanation | Acceptance verifies required fields and client report, not prose quality or mastery |

Use the [analytics dictionary](analytics.md) and [canonical analytics spec](../openspec/specs/learning-analytics/spec.md) as the measurement contract. Do not create a parallel event or silently join guest observations to authenticated accounts. `source_trust=client_observed` describes local Run/Check/hint actions; backend milestones come from committed owner-bound facts. Deduplicate event IDs and accepted stable quest IDs. Keep content and assessment versions visible. Backend acceptance under [ADR 0005](adr/0005-assessment-trust-and-completion.md) is qualified `client_reported`, even when it awards progress or XP.

D1 meaningful return uses a new qualified action 24–48 elapsed hours after activation; D7 uses 168–192 elapsed hours. Include only learners whose **full** window has elapsed at report cutoff. Report guest and account cohorts separately, with browser-observed and backend-fact sources separately for accounts. Show numerator, denominator, sample size, cutoff, missing-browser-data caveat and content version; do not substitute app opens or streak days. First Run, first accepted quest, five distinct accepted quests, first completed chapter, capstone start and accepted capstone completion follow the existing funnel definitions. F05 supplies numeric targets later; this protocol supplies none.

## Synthetic rehearsal before release approval

Use disposable accounts, fixtures and PostgreSQL only. The current [learning test gate](learning-test-gate.md) already exercises guest Q01 Run/Check, sign-up, explicit import, Q02 submission, owner isolation and replay through a fake Auth provider. The [analytics test fixture](analytics.md#query-definitions) checks duplicate and incomplete D1/D7 windows without PostHog delivery. Repeat these commands on a release candidate and retain the exact command, commit, environment and result:

```text
pnpm --dir backend db:check
pnpm --dir backend db:drift
pnpm api:check
pnpm --dir backend build
pnpm --dir backend curriculum:validate
pnpm --dir frontend test:curriculum
pnpm --dir frontend test:analytics
pnpm --dir frontend test:learning
pnpm --dir frontend test:accessibility
```

Browser suites needing PostgreSQL require the isolated database and fixture setup in their Playwright configs. Synthetic passes prove the tested contract, not live Auth email delivery, hosted backup restore, physical-device usability, consent or learning efficacy. Do not point destructive integration tests at a persistent database. Do not set analytics/monitoring approval flags just to run the rehearsal.

## Future participant session outline — only after a recorded GO decision

1. Verify the approved recruitment criteria, consent version, accessibility accommodations, data minimization and withdrawal process. Record only the approved participant reference in the authorized study store; do not add it to this repository.
2. Ask the learner to find the journey and complete an early quest with normal Run/Check feedback. Observe task understanding, editing, error recovery and hint choice without coaching the solution.
3. If the approved study includes accounts, observe sign-up and explicit guest import. Record whether the interface explains provisional versus accepted progress. Never ask the learner to reveal passwords or session material.
4. Across later sessions, examine an unfamiliar quest, first chapter progression and CAP01 only when prerequisites permit. Ask for a debugging explanation and transfer example under the approved consent scope.
5. Offer follow-up within the preapproved schedule for D1/D7 measurement. Record nonresponse and incomplete windows. Do not treat an app open as meaningful return.
6. Debrief with voluntary clarity and difficulty questions. Avoid collecting raw source, test output, written capstone responses, email, screen recordings or free text unless a separately approved F06 procedure explicitly permits it.

## Minimal templates — synthetic examples only until GO

These are field shapes for an approved study process. Do not enter real participant data in this repository. Use a separate authorized, access-controlled location after F06.

### Observation record

| Field | Entry |
| --- | --- |
| Release candidate / session date / consent version | Unset |
| Approved participant reference and cohort | Unset; no guest-to-account stitching without approved consent |
| Quest stable ID, content version, assessment version | Unset |
| Device, browser and accessibility setup | Unset |
| Task attempted and observed outcome category | Unset |
| Assistance or interruption affecting interpretation | Unset |
| Evidence source and trust: observed, participant reported, client observed or backend fact | Unset |
| Missing evidence or contradiction | Unset |
| Follow-up question, without source or identity text | Unset |

### Issue triage record

| Field | Entry |
| --- | --- |
| Issue key and first observed release | Unset |
| Quest/version/device/browser scope | Unset |
| Safe reproduction steps and expected/observed categories | Unset |
| Severity, frequency and confidence with denominators | Unset; owner rubric required |
| Evidence trust and known alternative explanation | Unset |
| Linked duplicate or contradictory observations | Unset |
| Owner and disposition: investigate, reproduce, design change or no change | Unset |

Do not paste learner code, screenshots of private work, raw validation reports, credentials, URLs with tokens, protected responses or identity details into either record. Preserve a report that cannot be reproduced as unconfirmed instead of turning it into a feature request.

### Weekly pattern review

| Field | Entry |
| --- | --- |
| Review window, release and content versions | Unset |
| Invited / consented / started / eligible / responded denominators | Unset |
| First Run, accepted progression and capstone funnel with trust labels | Unset |
| D1/D7 eligible windows, numerator/denominator and missing data | Unset |
| Repeated lesson/editor/mobile/hint/validation patterns, including contradictions | Unset |
| Severity and confidence, with affected quest/version/device | Unset |
| F04/F05 preregistered target comparison and caveat | Unset |
| Owner decision, follow-up study or separate scoped change | Unset |

Review recurring patterns with product and content owners. A requested feature, one complaint or a dashboard change is a lead to investigate, not automatic Phase 40 scope. Preserve rejected hypotheses and incomplete evidence. Any product correction follows the normal OpenSpec and PR workflow.
