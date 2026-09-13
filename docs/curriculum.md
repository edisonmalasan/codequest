# JavaScript Foundations curriculum definition

Status: Phase 0 instructional draft, not executable curriculum. Journey size/direction and AI independence are confirmed C01/C05/C07/C08. Exact hierarchy, quest allocation, capstone, feedback and version policies are proposed P04/P05/P09/P15 in the [register](decisions.md). [Product](product.md) owns scope/terminology; [backend](backend.md) owns accepted progress.

## Entry requirements and assessed exit outcomes

Proposed learner: beginner able to read English, navigate a browser and edit text; no JavaScript, terminal, Git, package installation, or prior programming required. Adult/desktop-first audience and mobile guarantees remain P01/U01 review gates. Teach editor/run/error basics in the first quests rather than assume them.

| Outcome | Learner can demonstrate | Assessment evidence |
| --- | --- | --- |
| O1 — values/state | Choose variables and basic number/string/boolean values; predict reassignment | Evaluate/predict and correct state examples |
| O2 — expressions | Combine arithmetic/comparison/logical expressions and explain results | Values/output and boundary examples |
| O3 — decisions | Select a branch for requirements and handle boundary inputs | Deterministic varied-input checks |
| O4 — iteration | Build terminating counted loops/accumulations, locate off-by-one mistakes | Result checks plus a debugging task |
| O5 — decomposition | Define/call functions with parameters/returns; distinguish returning from logging | Function tests on multiple inputs |
| O6 — collections | Use arrays/objects, traverse/update records and handle empty data | Collection/function tests including empty cases |
| O7 — debugging/testing | Interpret syntax/runtime/check feedback; construct examples and correct defects | Debug explanation and targeted checks throughout |
| O8 — transfer/integration | Combine values, branches, iteration, functions and collections in a small project | Capstone rubric and fresh transfer task |

DOM/HTML/CSS/event APIs, asynchronous JavaScript, classes, npm, filesystem/network, terminal/Git, deployment, AI assistance, and interview algorithms are not assessed Foundations outcomes. A supplied preview interface does not imply DOM mastery. Adding those outcomes requires an explicit scope/prerequisite/allocation revision, not an unexplained capstone dependency.

## Proposed journey outline and quest briefs

Seven chapters, **24 instructional quests plus one capstone** (P04/P05). The capstone is a final integration quest in navigation, counted separately in the instructional total. Exact duration/difficulty labels remain balancing F04. Ordering is completion-prerequisite based (P09); Q01 is open, each numbered quest below requires the prior quest, with additional conceptual references listed for review. Q01–Q04 form the proposed guest subset P07.

Each future quest must contain a clear objective, explanation/example, task, starter material, concepts/prerequisites, stable ID/version, deterministic criteria, graduated hints, and reward/unlock metadata. The briefs below describe that content without writing starter/test code.

| Chapter / quest brief | Outcome / prerequisite | Task and scaffold | Acceptance description / hint direction |
| --- | --- | --- | --- |
| 1 Variables — Q01: First message | O1/O7; none | Edit one supplied string and Run; explain output versus editor text | Exact declared output; hint points to string location and Run |
| Q02: Name the values | O1; Q01 | Choose bindings for supplied number/string/boolean values | Expected bound values/types; hints explain value versus name |
| Q03: Update supplies | O1/O7; Q02 | Reassign a changing counter; inspect a supplied reassignment defect | Expected final state; hint distinguishes mutable/unchanging binding |
| Q04: Predict and repair state | O1/O7; Q03 | Correct a small variable-name/order bug and predict intermediate state | Output/state plus explanation; hint asks where value was assigned |
| 2 Operators — Q05: Resource cost | O2; Q04 | Arithmetic expressions for quantity/cost using supplied values | Several numeric cases; hint decomposes expression |
| Q06: Compare the boundary | O2/O7; Q05 | Write comparisons for threshold/equality; inspect boundary cases | Boolean values on below/equal/above threshold; hint focuses equality |
| Q07: Combine requirements | O2; Q06 | Combine two conditions and format a simple status message | Varied booleans/string output; hints separate expression parts |
| 3 Conditionals — Q08: Choose a path | O3; Q07 | Branch on supplied condition with starter structure | Both branches tested; hint traces one input at a time |
| Q09: Classify a score | O3/O7; Q08 | Ordered multi-branch thresholds with deliberate boundary trap | Below/equal/above each threshold; hint considers order |
| Q10: Debug conflicting choices | O3/O7; Q09 | Fix branch overlap and explain a failed case | All specified categories plus corrected rationale; hint maps exclusive choices |
| 4 Loops — Q11: Count steps | O4; Q10 | Complete a bounded counted loop from starter | Exact finite output count; hint traces first/last iteration |
| Q12: Accumulate a total | O4/O2; Q11 | Accumulate numeric sequence values without collections | Expected totals for zero/small limits; hint separates loop index and total |
| Q13: Repeat until ready | O4/O3; Q12 | Write a bounded condition-controlled update | Expected final state/termination; hints identify changing condition |
| Q14: Repair an off-by-one | O4/O7; Q13 | Diagnose missing/extra iteration from output evidence | Correct totals at boundaries and explanation; hint traces end condition |
| 5 Functions — Q15: Return a result | O5; Q14 | Replace a fixed expression with a parameterized function | Returned values, not just logs; hint separates input/return |
| Q16: Reusable decision | O5/O3; Q15 | Move classification logic into function | Multiple input/boundary tests; hint asks what varies per call |
| Q17: Compose small helpers | O5/O4; Q16 | Combine a loop-based helper and result formatter with supplied structure | Independent helpers plus combined result; hint names each responsibility |
| Q18: Debug return and scope | O5/O7; Q17 | Repair missing return/wrong variable lifetime in starter | Repeated calls independent, returned result/explanation; hint follows each call |
| 6 Arrays/objects — Q19: Store a sequence | O6; Q18 | Construct/read/update an array; contrast index with value | Expected length/elements on supplied cases; hint visualizes indices |
| Q20: Traverse a collection | O6/O4/O5; Q19 | Function loops over an array to calculate totals | Empty/single/multiple arrays; hint reuses numeric accumulator |
| Q21: Describe an item | O6; Q20 | Represent a record as an object, read/update named properties | Known record values and update result; hint contrasts property with index |
| Q22: Select useful records | O6/O3/O5; Q21 | Traverse array of records and select/report matching values | Empty/mixed/boundary inputs; hints combine previously taught loop/branch |
| 7 Integration — Q23: Test the edge case | O7/O6; Q22 | Find defect in a supplied collection helper and propose a revealing test | Fixed empty/boundary result plus explanation; hint asks which input was absent |
| Q24: Plan and combine | O8/O1–O7; Q23 | Combine helpers into a small data summary from a prose requirement | Varied data results, helper roles and learner-selected case; hint decomposes requirements |

Each quest exposes enough examples to understand the contract. Test descriptions must specify exact intended normalization/types/boundaries before authoring; undocumented output formatting cannot be a surprise failure. Test results reveal expected versus observed values appropriately without claiming to hide tests from a browser learner.

## Capstone brief: Quest inventory manager

Proposed final project (P05), available after Q24 and its prerequisites. A learner implements JavaScript logic to manage/report a small collection of quest or inventory records. Supplied examples and optional preview shell provide inputs/displays; learner chooses record theme/data, decomposes helpers, writes conditions/iteration, diagnoses an injected defect, and explains decisions. Completion is assessed under [declared personal-learning trust](adr/0005-assessment-trust-and-completion.md), not independent certification.

### Deliverables and scaffold limits

- Functions to total quantities/resources, identify records satisfying a stated condition, update one identified record without affecting others, and produce a combined summary.
- A small record collection of the learner's choosing that conforms to a supplied input contract, plus predictions/examples for normal and empty/boundary data.
- A corrected provided defect, the input that exposes it, and a short explanation of the fix.
- An explanation of helper responsibilities and one fresh transfer response.

Supply record-contract examples, function signatures/contracts, editor starter comments, and console or read-only preview plumbing. Do not supply the graded algorithms/functions. DOM/event handlers in a shell are scaffold owned by the platform, not assessed learner work. No network/files/packages/authenticated previews or project deployment. Accessibility must include textual output equivalent to any visual shell.

### Proposed rubric

| Criterion | Required evidence | Assessment description |
| --- | --- | --- |
| Values/records (O1/O6) | Data represented correctly; independent records retained | Schema/value cases, ordinary and empty collections |
| Decisions (O2/O3) | Matching/boundary condition implemented correctly | Below/equal/above threshold and mixed matches |
| Iteration (O4/O6) | Correct finite traversal and totals | Empty, single, multiple records; no duplicate processing |
| Functions (O5) | Parameters/returns and helper decomposition | Multiple calls/inputs; avoid fixed-output-only solution |
| Integration (O8) | Combined report reflects learner's inputs and updates | End-to-end varied-input summary and changed-record case |
| Debug/test reasoning (O7) | Revealing input, corrected defect, explanation | Task-specific test/inspection plus short reviewed rationale |
| Transfer (O8) | Apply same concepts to unfamiliar requirement | New sample records and changed selection/summary criterion without a supplied solution |

Proposed completion requires all stated functional criteria, debug explanation and transfer response to be present; no numerical pass threshold is invented. Browser checks report functional results. Recording a response is not automatic proof that reasoning is sound; CO review/observed beta assessment separately evaluates transfer quality for learning evidence. Deterministic criteria cannot grade free-form reasoning by themselves. If PO requires reviewed reasoning for every account completion, define a manual review workflow in a separate capability proposal before claiming that guarantee.

PO/CO must approve that this amount of learner agency plus supplied shell constitutes a meaningful project. Alternative worker-only output project reduces web coupling; adding DOM/events instead expands teaching/assessment scope and must revise this plan.

## Instructional, hint and assessment principles

Proposed P05/P09: one primary objective with explicit prerequisite concepts; short examples followed by purposeful application; scaffold fades; failure is information. Every quest needs normal and boundary cases, actionable feedback distinguishing syntax/runtime/time/output/check failure, and review for valid alternative implementations. Do not grade by one textual code shape when behavior meets the objective. Function tests should vary inputs to discourage hardcoded example answers; they still do not make client results trustworthy.

Hints progress from a question about the requirement → a relevant concept/example → a localized next step. No automatic complete solution or AI dependency; hint usage and failed experiments do not reduce XP. Replays are practice, not new XP. Debugging/checking starts in chapter one. Illustrations require text alternatives; instructions/output must remain readable by keyboard/screen-reader users and at zoom/reduced motion, independent of pixel art.

CO reviews pedagogical sequence, clarity, cognitive load and hint quality. TO reviews deterministic contracts, alternative solutions, runtime capability assumptions, bounds and fixtures. Future publication must reject malformed content or failing reference checks; lesson rendering must treat content components as trusted authored material with a restricted rendering policy, never learner executable application code. A quest is not publishable until both instructional and technical review pass. Full CMS/authoring tools and executable tests are outside this change (F03/F07).

## Identity, publication and version lifecycle

Confirmed C05: Git-first content under `backend/content/`; backend owns available versions and API delivery. Frontend does not bundle/import raw authored curriculum or query application tables. Database projections, content format/compiler and deployment publication mechanism are deferred F03. Proposed P15/ADR 0007:

| Change category | Acceptance/history policy |
| --- | --- |
| Editorial wording/illustration fix, same objective and criteria | Publish version; explicitly mark earlier assessment compatible. Existing completion remains valid. |
| Assessment correctness fix, objective unchanged | New assessment version; CO/TO explicitly decide old-result compatibility. Never silently regrade historical completion. |
| Objective/prerequisite materially changed | New version with compatibility decision; pending incompatible work rejected with reason/retry guidance. Do not retroactively revoke accepted XP/history. |
| Retired quest/version | Preserve accepted history; define replacements/current journey denominator. Unsupported pending work requires retry; retain source. |

Use stable quest IDs separate from slug/title; record content and assessment version with submitted snapshots. Compatibility windows and mappings are explicit backend curriculum policy, not client guesses. Existing completion history and one-reward-per-stable-ID semantics survive editorial/version updates (P09). Reissuing a materially new learning objective/reward needs an explicit new identity and review, not accidental content-version XP farming.

Current journey progress derives from active requirements, with obsolete/history completion shown separately; map any accepted historical equivalent deliberately. No silent percentage denominator changes. Pending guest/offline work can be accepted only against a supported compatible assessment/version and prerequisite policy; otherwise explain rejection and preserve draft for current-version retry. Compatibility-window duration and exact data schema are later F03 decisions.

## Review gates and deferrals

P01/P04/P05/P07/P09/P15 remain Phase 0 approval gates. F04 covers XP/timing/difficulty balancing; F03 covers executable formats/tests/tooling; F01/F02 cover runtime/device evidence. [Register assessment](decisions.md#phase-0-completion-assessment) determines readiness. These briefs are not a fully authored course or implemented assessment engine.
