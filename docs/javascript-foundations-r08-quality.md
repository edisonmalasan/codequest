# R08 JavaScript Foundations course-quality review

## Scope and evidence standard

This is an AI-assisted instructional and technical repository review on 2026-10-09, starting from `c9b5b6b9f607925bbc4647d0d10c49d490ad21fb`. It is not independent curriculum approval, founder testing, real-provider Auth verification, physical-device evidence, or observed learner understanding. The selected source is `backend/content/publication.yaml`; the approved outcome sequence is in [curriculum.md](curriculum.md); the original technical review and limits are in [javascript-foundations.md](javascript-foundations.md) and [inventory-capstone.md](inventory-capstone.md).

The baseline selection is `JAVASCRIPT-FOUNDATIONS` → `COURSE-JS-FOUNDATIONS` → seven ordered chapters → Q01–Q24 plus CAP01. Q01 selects content `1.1.0` with assessment `1.0.0`; Q02–Q24 and CAP01 select content/assessment `1.0.0`. Q01 has no completion prerequisite; each later stable ID requires its predecessor, including CAP01 requiring Q24. Only Q01–Q04 are guest eligible. Every selected version has an explicit objective, starter, worked example, task, question/concept/next-step hints, normal and boundary cases, nonempty case feedback, and an accessible text-only lesson. Q01–Q14 use declared complete console output; Q15–Q24 and CAP01 use varied named-function inputs. CAP01 has ten functional cases plus separate required written explanation and transfer responses. The backend public-Course API and exact-order/guest-boundary test passed locally with `pnpm --dir backend exec vitest run src/modules/curriculum/foundations.spec.ts --no-file-parallelism` (4/4 on 2026-10-09). This is synthetic API evidence only.

The current learner Check runs in isolated fresh browser Workers and reports local, unverified results. Run is also browser-isolated. Authenticated Submit asks the backend to accept a bounded personal-learning report under ADR 0005; a browser pass is not independent proof. Backend accepted facts alone drive progress, XP and streaks. No learner source runs in NestJS. Browser candidate and integrated results for the revised selection are recorded below after implementation.

## Baseline per-Quest audit

`Pass` means this repository review found no material instructional defect in the selected snapshot; it does not mean founder acceptance. `Revise` identifies an exact issue to fix in a new immutable content snapshot. All assessment versions in this table are `1.0.0`.

| ID | Selected content | Outcome | Finding | Exact observation |
| --- | --- | --- | --- | --- |
| Q01 | 1.1.0 | O1 | Pass | First editor/Run/console action, exact one-line target and local Check versus Submit distinction are explicit; historical 1.0.0 stays unselected. |
| Q02 | 1.0.0 | O1 | Pass | Number, string, boolean and zero types are taught before the eight-line output contract; quoted-type defect is visible. |
| Q03 | 1.0.0 | O1 | Pass | `let` reassignment and unchanged `const` label match the starter and 5→3→0 trace. |
| Q04 | 1.0.0 | O7 | Pass | Assignment order, misspelled name and ungraded prediction match the debugging objective. |
| Q05 | 1.0.0 | O2 | Revise | Objective/Goal promise **explicit grouping**, but the task and output cases require only multiplication, addition and a fee. Parentheses are taught as context, not assessed. Align the objective to the actual task without changing criteria. |
| Q06 | 1.0.0 | O2 | Pass | Below/equal/above minimum and number-versus-string strict equality are declared and demonstrated. |
| Q07 | 1.0.0 | O2 | Pass | Both-required logic and exact `Ready: ` formatting match the three visible examples. |
| Q08 | 1.0.0 | O3 | Pass | True/false branch selection and single-message output match the two starter decisions. |
| Q09 | 1.0.0 | O3 | Pass | Ordered category thresholds and 49/50/79/80/81 cases are explicit; Q16 later transfers the rule into varied-input functions. |
| Q10 | 1.0.0 | O7 | Pass | Overlapping `if` defect, else attachment and negative/zero/positive exclusivity are visible. |
| Q11 | 1.0.0 | O4 | Pass | Counted-loop endpoint and zero-step boundary are explained without assuming arrays or functions. |
| Q12 | 1.0.0 | O4 | Pass | Accumulator versus counter and empty/single/multiple totals match the supplied loops. |
| Q13 | 1.0.0 | O4 | Pass | While-loop stopping state and already-ready zero-iteration boundary are explicit. |
| Q14 | 1.0.0 | O7 | Pass | Inclusive endpoint debugging uses empty, one-step and multi-step traces; explanation is clearly ungraded. |
| Q15 | 1.0.0 | O5 | Pass | First function lesson distinguishes return from logging and varies quantity/fee inputs. |
| Q16 | 1.0.0 | O5 | Pass | Q09 categories become parameter-driven returns with both inclusive thresholds. |
| Q17 | 1.0.0 | O5 | Pass | Numeric helper, formatter and composition are independently checked, including zero and exact prefix. |
| Q18 | 1.0.0 | O7 | Pass | Local state and return defects are distinct; `repeatTotals` exercises two calls inside one Worker. |
| Q19 | 1.0.0 | O6 | Pass | Index, length, update through a const array and empty-string element align with the returned structure. |
| Q20 | 1.0.0 | O6 | Revise | The worked example already supplies the same accumulate-each-array-element algorithm the learner must repair. “Leave the input available to the caller” is ambiguous because mutation is not graded. Give an adjacent example and state the actual return-only Check boundary. |
| Q21 | 1.0.0 | O6 | Pass | Named-property correction, returned object shape and zero amount/count are clear; input mutation is explicitly ungraded. |
| Q22 | 1.0.0 | O6 | Revise | The worked example supplies the exact `quantity > 0` selection loop and name push required by the task, leaving only a one-character starter correction. Demonstrate collection/filter mechanics on an adjacent predicate so the learner applies the rule. |
| Q23 | 1.0.0 | O7 | Pass | The minimum example transfers to maximum with an empty-input defect and varied function cases; explanation is ungraded. |
| Q24 | 1.0.0 | O8 | Pass | Unit sum versus available-record count and three helper responsibilities prepare CAP01 without giving its six functions. |
| CAP01 | 1.0.0 | O8 | Pass | Six function contracts, ten visible cases, debug and fresh transfer prompts, written-presence limit and personal-learning trust limit are separate and explicit. Actual explanation quality still needs human/learner review. |

This audit maps O1 through O8 to the approved 24-instructional-plus-one-capstone structure. The three `Revise` findings are editorial clarity and scaffold changes only. The selected case IDs, expected behavior, prerequisites, stable IDs, guest eligibility, difficulty labels, and 10 XP experimental baseline do not need change.

## Revised-version review and verification

Instructional reviewer: CodeQuest implementation agent, AI-assisted self-review against the approved O1–O8 briefs, complete selected lessons, and versioned starters. Technical reviewer: the same implementation agent using the existing isolated authoring harness and focused authority tests. No independent human or founder approval is claimed. The three findings above were corrected in new `1.1.0` content snapshots; all other selected snapshots remain byte-identical and have explicit no-change decisions in the baseline table.

| ID | Correction in content 1.1.0 | Assessment and transition | Exact candidate outcome |
| --- | --- | --- | --- |
| Q05 | Goal/objective now describe the multiplication-plus-fee behavior actually checked; lesson states parentheses are optional. | Assessment `1.0.0`; 1.0.0→1.1.0 compatible, `accept-new`, curriculum and technical self-reviews approved. Starter and cases are byte-identical. | Reference pass, independent repeated-addition alternative pass, additive defect fail; `normal-output` and `boundary-output` checked. |
| Q20 | Example shows array traversal without supplying the sum algorithm; learner combines it with the earlier accumulator. Contract states Check compares the returned total and does not separately grade mutation. | Assessment `1.0.0`; 1.0.0→1.1.0 compatible, `accept-new`, curriculum and technical self-reviews approved. Starter and cases are byte-identical. | Reference pass, structurally different alternative pass, index-summing defect fail; `several-values`, `empty-array`, `single-value`, `mixed-signs` checked. |
| Q22 | Example selects visited places; learner applies the traversal and append tools to positive quantity and duplicate-name cases. | Assessment `1.0.0`; 1.0.0→1.1.0 compatible, `accept-new`, curriculum and technical self-reviews approved. Starter and cases are byte-identical. | Reference pass, structurally different alternative pass, zero-quantity defect fail; `mixed-stock`, `empty-records`, `zero-stock`, `repeated-name` checked. |

Each candidate ran with `pnpm --dir backend content:test --id <ID> --version current --source <temporary .js> --expect pass|fail` on 2026-10-09 in local Windows/Chromium. The files were synthetic test fixtures extracted to OS temporary storage and removed after each run; no learner account or publication was changed. The command reported content `1.1.0`, assessment `1.0.0`, and an **unpublished snapshot** for each. The existing bounded case feedback names the multiplication/fee, array-element versus index, and positive-quantity/order issues. The authoring process did not evaluate candidate JavaScript in Node or NestJS; the browser used the credential-free isolated Check boundary. This is technical self-review, not independent grading.

`pnpm --dir backend curriculum:validate` passed before selection, including immutable merged-snapshot history. The old `1.0.0` directories were not edited. The unchanged `starter.js` and `tests.ts` bytes were compared directly for each corrected Quest. Focused backend compatibility/catalog/learning tests passed 37/37, including old-event replay after publication changes, one award per stable completion, and rejection of unsupported new submissions. Frontend pending-source replay tests passed 8/8, including retaining blocked source and original versions for explicit retry. Compatible accepted history remains intact; a stale unaccepted snapshot still follows the current-version retry path with source preserved.

The reviewed sequence remains O1 values/state → O2 expressions → O3 decisions → O4 iteration → O5 functions → O6 collections → O7 debugging throughout → O8 Q24/CAP01 integration. Q20 now asks learners to combine earlier accumulation with array traversal; Q22 asks them to apply selection tools to a new predicate. CAP01's six functional contracts and required written debug/transfer prompts are unchanged, and written-presence checking still does not establish explanation quality. No revised material finding remains from this repository review.

## Selected-build integration record

The selected `publication.yaml` now pins Q01, Q05, Q20 and Q22 content `1.1.0`, all other JavaScript Foundations content `1.0.0`, and every assessment `1.0.0`. `curriculum:validate`, the public API selection test, and publication catalog fail-closed tests passed locally after selection. The catalog rejects incomplete or stale versions; the original snapshots remain addressable. The stable 25 IDs, ordered prerequisites, Q01–Q04 guest subset and first-completion 10 XP award are unchanged.

On 2026-10-09, `pnpm --dir frontend test:curriculum` passed **56/56** production-build Playwright tests in local Windows Chromium desktop and emulated Pixel 7 Chromium projects. It used the selected backend content and a local production Next.js build. Each Q01–Q24 reference and independent alternative passed local Check and a deliberate defect failed. CAP01 passed its alternative and defect checks, bounded timeout recovery, written-response local save/reload, and guest boundary. The course map, guest Q01–Q04 local completion/reload, Q01 Run and output, hint reveal, Q01 Next navigation, Q05 account boundary, and narrow-viewport overflow were exercised. These are synthetic browser tests on local hardware; mobile emulation is **not** physical-device evidence. An initial mobile test run failed because the test queried hidden panels before switching them; the test was corrected and the full 56-test run passed. No product defect or affected production retest remains from that failure.

The existing account journey tests cover authenticated Q01/Q02 Submit, accepted progress, unlock, XP, owner isolation, replay, and retained source. This Apply adds a complete synthetic account chain: browser Q01 Run/Check/Submit, bounded account reports for Q02–Q24 after their real browser Checks, browser CAP01 Check/Submit, backend 250 XP, completed map, refresh, and source/written-response restoration. Its isolated PostgreSQL Playwright run requires `DATABASE_TEST_URL`, which is supplied by CI but unavailable locally. The PR CI result and exact implementation commit/build must be attached before task 4.2 is closed. The API reports are allowed personal-learning facts under ADR 0005, not independent proof of mastery or test execution in NestJS.

## Open gates

R08 founder review and the separately selected interactive Quest publication gate remain open. R04 real Supabase email/OAuth verification remains open. F04 is only the approved experimental private-beta baseline, not balance evidence. F06 privacy policy approval, hosted checks, physical-device and assistive-technology evidence, and Phase 38 readiness remain open; beta is **NO GO**.
