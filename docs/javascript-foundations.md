# JavaScript Foundations instructional curriculum

Phase 29 delivers **24 instructional quests in seven chapters** using the existing public curriculum API and quest workspace. The separately approved inventory-manager capstone remains Phase 30. Source lives only in `backend/content/`; browser code consumes generated API contracts.

## Instructional review

Reviewed 2026-09-29 as AI-assisted instructional and technical self-review under the authorized Phase 29 implementation. This is not an independent audit, owner-personal testing, learner observation or evidence of learning efficacy. The review checks the approved [curriculum briefs](curriculum.md), P04/P05/P07/P09/P15, prerequisite sequence, cognitive load, concrete examples, explicit contracts, graduated hints and accessible text. Publication approval records this review, not a new balancing decision.

Every lesson includes Goal, Learn, Worked example, Your task, Check contract, workflow/authority explanation, an explicitly ungraded reflection and error guidance. Essential instructions are text; no image, animation, color, DOM, network or package knowledge is required. Question → concept → localized next-step hints stay optional. Starter defects are intentional and syntactically valid; error handling preserves source.

| Quest | Instructional review / observable technical contract |
| --- | --- |
| Q01 First message | Editor versus console, quoted text, Run before Check; one exact line, no extra output. |
| Q02 Name the values | Number/string/boolean literals, bindings and typeof; zero remains a number. |
| Q03 Update supplies | Mutable counter versus unchanged label; 5 → 3 → 0 with no const reassignment. |
| Q04 Predict and repair state | Assignment order and misspelled name; initial/intermediate/zero states; reflection ungraded. |
| Q05 Resource cost | Multiplication before one fee; normal order, zero quantity and zero fee are explicit. |
| Q06 Compare the boundary | Inclusive threshold and strict type equality; below/equal/above and number versus text. |
| Q07 Combine requirements | Both conditions required; equal minimum and missing requirements; exact readable prefix. |
| Q08 Choose a path | If/else selects one path; true and false both exercised. |
| Q09 Classify a score | Ordered exclusive categories; both threshold starts and neighboring values declared. |
| Q10 Debug conflicting choices | Independent-if overlap and else attachment; negative/zero/positive, no duplicate line. |
| Q11 Count steps | For initialization/condition/update; first/last step and empty loop. |
| Q12 Accumulate a total | Accumulator differs from index; empty, single and inclusive sequence totals. |
| Q13 Repeat until ready | While state moves toward termination; ready-at-start performs no updates. |
| Q14 Repair an off-by-one | Small revealing case and excluded endpoint; empty/single/multiple totals, rationale ungraded. |
| Q15 Return a result | Parameters and return differ from printing; varied cost inputs, zero quantity and fee. |
| Q16 Reusable decision | Same categories via varying argument; return each path, inclusive boundaries. |
| Q17 Compose small helpers | Sum, formatting and composition tested independently; zero and exact prefix. |
| Q18 Debug return and scope | Local accumulator and missing return; helper tests invoke two calls in one Worker. |
| Q19 Store a sequence | Zero-based indexing, length and mutation through const; empty-string element retained. |
| Q20 Traverse a collection | Sum elements rather than positions; empty/single/mixed-sign arrays. |
| Q21 Describe an item | Named properties and updated record shape; zero stock and no addition, exact two fields. |
| Q22 Select useful records | Array/object traversal and push; strict positive quantity, empty/zero, order and duplicates. |
| Q23 Test the edge case | First-element assumption fails for empty input; maximum position and zero; revealing-test explanation ungraded. |
| Q24 Plan and combine | Distinct units/record count responsibilities; helper and summary results, empty and single data. |

The sequence introduces functions at Q15 and arrays/objects at Q19/Q21. No early task requires implementing a function or using an array. Later examples combine already introduced concepts. Reflection supports O7/O8 self-explanation, but deterministic results cannot establish reasoning quality. No LLM or manual-completion-review system is added.

## Technical review and publication gate

`pnpm --dir backend curriculum:validate` parses declarative cases and validates hierarchy, references, safe static lessons, source bounds, sequential prerequisites, guest eligibility and immutable snapshot history. It never evaluates starter, reference or learner source.

`pnpm --dir frontend test:curriculum` builds the backend and runs production Chromium against the real public NestJS catalog. Each of the 24 quests checks a reference solution, a behaviorally equivalent alternative and the deliberately defective starter through the existing fresh-Worker strategy on the dedicated runner origin. Test-only solutions are in `frontend/e2e/fixtures/`; they are not imported by application code or included in public DTOs. A local browser session fixture exposes Q05+ workspaces; it is not verified identity, protected writes are blocked and no account acceptance is inferred. Separate real guest tests check Q01–Q04 and reload durability without protected requests, and Q05 requires sign-in. No database, auth provider, production credentials or arbitrary-code execution in NestJS are required for these public browser tests.

Before final selection, isolated checks can review a disposable built-content candidate in ignored `backend/dist/content`; the tracked manifest remains empty. Final verification rebuilds from the reviewed tracked manifest. CI runs the normal command and requires all 25 browser tests. Catalog/API regressions independently verify all 24 IDs, seven chapters, exact prerequisites, selected versions, ≤10 cases, bounded definitions/feedback and normal/boundary coverage. Existing malformed/draft/learning tests retain a frozen representative fixture under `backend/test/fixtures/curriculum-draft`.

Q01–Q14 use fixed complete console contracts. Normal and boundary examples appear in the same learner program; the two category cases compare that complete output and are intentionally redundant. This checks observable results, not generalization or source structure; hardcoded equivalent output can pass. Q15–Q24 use varied function arguments and independently tested helpers where relevant. Return comparisons are structural, accepting different variable names, loop styles, arithmetic and object property order. Browser checks remain forgeable client reports under [ADR 0005](adr/0005-assessment-trust-and-completion.md).

## Identity, acceptance and rollback

Q01 1.0.0 stays byte-for-byte historical and unselected. Its 1.1.0 editorial snapshot has identical case data and assessment 1.0.0, with an approved compatible/accept-new transition. Q02–Q24 start at 1.0.0. Each quest after Q01 requires its predecessor; only Q01–Q04 is guest-eligible. Backend prerequisites, version acceptance, stable-event replay, completion, one-reward-per-stable-quest XP and acceptance-time streak policies are unchanged. Guest Check remains provisional until explicit authenticated import; no dates are backdated.

After both reviews pass, `publication.yaml` selects the complete 24-quest inventory and exact versions. No reference solution, historical snapshot or review note is delivered. A follow-up reviewed PR can clear selection to withdraw exposure; preserve all merged snapshots, source recovery and accepted history. Adding the capstone later requires its own reviewed snapshot and complete updated selection.

## Remaining release obligations

- **F04:** 10 XP per first accepted quest and introductory/developing/integrative labels are explicitly provisional. No duration or difficulty claim has been measured; PO/CO must balance against learner feedback before beta. No repeat rewards or hint penalties are added.
- **Instructional evidence:** Observe beginners attempting the course, revise clarity/hints in new immutable snapshots, and assess explanation/transfer quality separately. Automated reference success does not prove effective instruction.
- **F02:** Physical mobile/Safari/Firefox, spoken assistive technology, low-power timing and native quota/background/OS-restart evidence remain pre-beta obligations. Chromium reading/reflow evidence does not establish device parity.
- **F06:** Repository/API publication does not deploy the course or authorize real-learner collection. Privacy, retention, consent, operator access and deletion policies must be resolved before such beta activity.
