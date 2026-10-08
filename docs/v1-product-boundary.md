# CodeQuest V1 product boundary and readiness inventory

**Founder scope approval:** 2026-10-02 Apply instruction for `rebaseline-codequest-product-roadmap`. **Status:** product-boundary planning only; no feature, hosted, physical-device or founder-acceptance result is approved by this document. The [roadmap](DEVELOPMENT_ROADMAP.md#product-completion--founder-alpha-rebaseline--proposed-forward-order) orders the work; the [decision register](decisions.md#ap05-founder-approved-broad-v1-boundary) preserves the approval and supersessions.

CodeQuest V1 must be a fully working, polished, integrated product before private beta. The publicly accessible [Codédex catalog](https://www.codedex.io/courses), [home](https://www.codedex.io/), [course map](https://www.codedex.io/intermediate-javascript), [daily challenge](https://www.codedex.io/daily-challenge), and [community](https://www.codedex.io/community/monthly-challenge) are reference products for general product categories and quality. CodeQuest uses original branding, artwork, characters, curriculum, examples, exercises, validation tests, projects and implementation. No private or paid reference content is a source.

## Decision and evidence rules

`REQUIRED` means the product category must be fully implemented, integrated and founder accepted before beta. A required category with an unresolved architecture or policy design **remains required and blocks beta**; it is not silently deferred. `CONDITIONAL` is reserved for a specific unapproved implementation choice within a required category, not the category itself. `DEFERRED` applies only to capabilities the founder did not list for V1, such as classroom administration and cloud synchronization of exercise source drafts. No row below is currently `FEATURE COMPLETE`, `INTEGRATED`, `FOUNDER ACCEPTED` or `RELEASE READY` on the available evidence.

The ordered readiness states are **TECHNICALLY IMPLEMENTED → FEATURE COMPLETE → INTEGRATED → FOUNDER ACCEPTED → RELEASE READY → PRIVATE BETA → BETA ACCEPTED → PRODUCTION READY**. `TECHNICALLY IMPLEMENTED` requires source and focused automated evidence. `NOT YET TECHNICALLY IMPLEMENTED` is the pre-state for absent or partial work; it cannot be promoted by an archived phase title. The current inventory is a repository audit, not a live end-to-end test. The founder reports actual Supabase email and OAuth failure; those flows cannot advance to `INTEGRATED` until reproduced and fixed in the real configured environment.

The accountable acceptance owner for every `REQUIRED` row is the founder at R15, with product/engineering/security/curriculum/operations reviewers as named in its phase. A future phase proposal must give each row a specific scenario, exact evidence and named reviewer. R15 cannot pass with any required row below founder acceptance.

## Required V1 capability matrix

| ID | Required capability and acceptance boundary | Current repository evidence / maximum defensible state | Planned phase and specialist owner |
| --- | --- | --- | --- |
| V01 | Original polished homepage with real course entry | Simple homepage; `TECHNICALLY IMPLEMENTED`, UX incomplete | R02–R03; product/frontend |
| V02 | Global application shell and navigation | No persistent full product shell; `NOT YET TECHNICALLY IMPLEMENTED` | R02–R03; product/frontend |
| V03 | Course discovery, catalog search/filter and truthful results | No multi-course catalog; `NOT YET TECHNICALLY IMPLEMENTED` | R05; product/frontend/backend |
| V04 | Distinct journeys, courses, chapters and exercises with stable navigation | One Journey; Course currently aliases Journey; `TECHNICALLY IMPLEMENTED` only for old model | R05; curriculum/backend/frontend |
| V05 | Complete HTML learning course | Four-chapter, twelve-Quest original HTML Foundations Course published; `TECHNICALLY IMPLEMENTED`, founder and release acceptance open | R08; curriculum/runtime |
| V06 | Complete CSS learning course | Four-chapter, twelve-Quest original CSS Foundations Course published; `TECHNICALLY IMPLEMENTED`, founder and release acceptance open | R08; curriculum/runtime |
| V07 | Complete JavaScript learning course | Foundations 24 quests + capstone published; `TECHNICALLY IMPLEMENTED`, product quality unaccepted | R06–R08; curriculum/product |
| V08 | DOM/browser-interaction learning with safe executable projects | Current assessment excludes DOM and preview scripts; `NOT YET TECHNICALLY IMPLEMENTED` | R07A/R08; security/runtime/curriculum |
| V09 | Additional complete original reference-equivalent course tracks | JavaScript, HTML, and CSS Foundations published; `NOT YET TECHNICALLY IMPLEMENTED` for the required additional breadth | R12A–R12E; curriculum/runtime |
| V10 | Persistent desktop lesson / editor / output-preview panes | Lesson and workspace vertically separated; `NOT YET TECHNICALLY IMPLEMENTED` for target | R06; product/frontend |
| V11 | Intentional tablet/mobile learning layouts | Responsive fragments exist; target shell absent; `NOT YET TECHNICALLY IMPLEMENTED` for target | R06/R13; frontend/accessibility |
| V12 | CodeMirror editing and durable exercise drafts | Reusable workspace exists; `TECHNICALLY IMPLEMENTED` | R06–R07/R13; frontend |
| V13 | Multi-file exercises where curriculum requires them | Workspace files exist; published quest uses one `main.js`; `TECHNICALLY IMPLEMENTED` seam only | R07/R08; frontend/curriculum |
| V14 | Bounded Run and cancellation | Isolated Worker exists; `TECHNICALLY IMPLEMENTED` | R07; runtime/security |
| V15 | Clear console/output/errors | Console exists, not persistent third pane; `TECHNICALLY IMPLEMENTED` | R06–R07; frontend |
| V16 | Safe rendered preview appropriate to each exercise | Static script-disabled preview exists; no interactive DOM preview; `TECHNICALLY IMPLEMENTED` for static subset | R07A/R07; runtime/security |
| V17 | Deterministic Check/validation with actionable feedback | Local strategy exists; `TECHNICALLY IMPLEMENTED` | R07/R08; learning/frontend |
| V18 | Contextual hints/help | Published hint tiers exist; `TECHNICALLY IMPLEMENTED` | R07/R08/R12E; curriculum/product |
| V19 | Authenticated completion/submission and truthful local states | Backend personal-learning acceptance exists; `TECHNICALLY IMPLEMENTED` | R04/R07; backend/frontend |
| V20 | Back/Next exercise navigation and resumption | Map links exist; integrated sequence controls absent; `NOT YET TECHNICALLY IMPLEMENTED` for target | R06–R07; frontend |
| V21 | Backend-authoritative progress and maps | Progress/read APIs exist; `TECHNICALLY IMPLEMENTED` | R09; backend/frontend |
| V22 | First accepted completion XP with replay protection | Ledger exists; `TECHNICALLY IMPLEMENTED` | R09; backend |
| V23 | Derived levels and a separately defined rank presentation | Provisional levels exist; ranks absent; `TECHNICALLY IMPLEMENTED` for level subset | R09/R10C; product/backend |
| V24 | Meaningful completion-based streaks | Backend streak days exist; `TECHNICALLY IMPLEMENTED` | R09; backend/frontend |
| V25 | Prerequisite unlocks and explanations | Backend availability exists; `TECHNICALLY IMPLEMENTED` | R09; backend/frontend |
| V26 | Achievements and badges with clear earning policy | Display component only; `NOT YET TECHNICALLY IMPLEMENTED` | R09; product/backend |
| V27 | Original character/avatar identity and customization | Presentational art seam only; `NOT YET TECHNICALLY IMPLEMENTED` | R09; design/profile |
| V28 | Standalone Practice, separate from course completion | No practice product; `NOT YET TECHNICALLY IMPLEMENTED` | R10A; learning/backend |
| V29 | Scheduled/daily challenge capability | No challenge product; `NOT YET TECHNICALLY IMPLEMENTED` | R10B; learning/backend |
| V30 | Fair competitive leaderboard/rank results | No competition; current client pass is unverified; `NOT YET TECHNICALLY IMPLEMENTED` | R10C, after trust model; security/backend |
| V31 | Builds/projects with meaningful independent creation | Capstone is a quest, not Builds; `NOT YET TECHNICALLY IMPLEMENTED` | R11A–R11B; product/runtime |
| V32 | Durable owner-bound project saving | Exercise drafts are device-local; `NOT YET TECHNICALLY IMPLEMENTED` for projects | R11B; backend/frontend |
| V33 | Controlled project presentation/publishing | No publishing; `NOT YET TECHNICALLY IMPLEMENTED` | R11C; security/backend |
| V34 | Private account profile and public-facing portfolio where approved policy permits | Private account summary exists; `TECHNICALLY IMPLEMENTED` subset | R09/R11C; profile/privacy |
| V35 | Community with moderated posts/interactions | No community system; `NOT YET TECHNICALLY IMPLEMENTED` | R11D; product/security |
| V36 | Community challenges/events within approved operations | No events/challenge workflow; `NOT YET TECHNICALLY IMPLEMENTED` | R11E; product/operations |
| V37 | AI/help experience with privacy and bounded claims | Static hints only; `NOT YET TECHNICALLY IMPLEMENTED` for AI | R12E; product/security |
| V38 | Certificates with explicit claim and assessment basis | No certificate system; personal-learning report is not proof; `NOT YET TECHNICALLY IMPLEMENTED` | R12F, after trust/claim model; product/security |
| V39 | Mentor/help-service surface | No mentor service; `NOT YET TECHNICALLY IMPLEMENTED` | R12F; product/operations |
| V40 | Notifications with channel, consent and delivery rules | No notification system; `NOT YET TECHNICALLY IMPLEMENTED` | R12G; product/backend |
| V41 | Search/discovery across included public product surfaces | No catalog/global search; `NOT YET TECHNICALLY IMPLEMENTED` | R05/R12G; frontend/backend |
| V42 | PWA install/update/navigation | Shell exists; physical install not accepted; `TECHNICALLY IMPLEMENTED` | R13; frontend |
| V43 | Offline behavior for explicitly supported capabilities | Lesson/draft/JS and replay foundations exist; `TECHNICALLY IMPLEMENTED` | R13; frontend/backend |
| V44 | Responsive/mobile support on an exact declared matrix | Automated viewport checks exist; physical scope open; `TECHNICALLY IMPLEMENTED` subset | R13/R16; frontend/product |
| V45 | Accessibility on supported devices and AT | Automated checks exist; physical AT open; `TECHNICALLY IMPLEMENTED` subset | R13/R16; frontend/product |
| V46 | Privacy-approved analytics | Bounded adapter off by default; `TECHNICALLY IMPLEMENTED` only | R14/R16; product/security |
| V47 | Privacy-approved monitoring | Bounded adapter off by default; `TECHNICALLY IMPLEMENTED` only | R14/R16; security/operations |
| V48 | Runtime, identity, data, content and public-surface security | Foundation and tests exist; hosted and new-surface designs open; `TECHNICALLY IMPLEMENTED` subset | R04/R07A/R10C/R11/R16; security |
| V49 | Account deletion and approved privacy operations | F06 policy/procedure absent; `NOT YET TECHNICALLY IMPLEMENTED` as a full flow | R14/R16; product/security |
| V50 | Hosted backup, isolated restore and recovery | No hosted evidence; `NOT YET TECHNICALLY IMPLEMENTED` operationally | R16; operations |
| V51 | Deployment and production operations | CI/build exists; actual beta host/operation open; `TECHNICALLY IMPLEMENTED` foundation only | R14/R16/R19; operations |
| V52 | Original commercial/pricing/subscription/entitlement product role | No commercial product; `NOT YET TECHNICALLY IMPLEMENTED` | R12H; product/legal/operations |
| V53 | Real email signup, confirmation, login/logout, recovery, Google/GitHub OAuth | Routes/adapters exist; founder reports real failure; `TECHNICALLY IMPLEMENTED`, integration failed/unverified | R04; identity/operations |
| V54 | Guest entry/import and owner-bound reconnect | Local and backend primitives exist; `TECHNICALLY IMPLEMENTED` | R04/R07/R13; frontend/backend |
| V55 | Original coherent project outcomes across advertised courses | Inventory capstone exists; breadth absent; `NOT YET TECHNICALLY IMPLEMENTED` for full V1 | R08/R11; curriculum/product |

## Public curriculum/topic breadth to plan as original CodeQuest courses

The [public catalog](https://www.codedex.io/courses) currently shows Web Development (HTML, CSS, JavaScript, Command Line, Git & GitHub, Intermediate JavaScript, Node.js, React), Data Science (Python, SQL, NumPy, Pandas, Matplotlib, Machine Learning), and Artificial Intelligence (Python, GenAI) journeys. Its wider library also shows Intermediate Python, data structures and algorithms, p5.js, Phaser, UI/UX Design, C#, Lua, Java, C++, and GitHub Copilot. The founder makes **reference-equivalent topic coverage a V1 roadmap requirement**. This is an inventory of public topics, not permission to copy the course structure verbatim or ship catalog cards before complete original courses exist.

| Original CodeQuest coverage family | Required public topic analogue | Runtime / assessment prerequisite before authoring or publishing |
| --- | --- | --- |
| Web fundamentals | HTML, CSS, JavaScript, DOM/events, Intermediate JavaScript, React, Node.js | Safe multi-file static and interactive web execution; browser API capability decision; isolated Node/server-side runner for Node if executable lessons are promised |
| Developer workflow | Command line, Git/GitHub, GitHub Copilot-style AI-assisted workflow | Safe command/repository simulation or isolated runner; no learner commands in NestJS; no assumption that external GitHub access is required |
| Python/data | Python, Intermediate Python, SQL, NumPy, Pandas, Matplotlib, Machine Learning, data structures/algorithms | Pyodide or separately approved isolated execution; resource/package bounds; SQL/data sandbox; deterministic or reviewed assessments |
| Creative/game | p5.js, Phaser, Lua, C# and game-coding concepts | Isolated browser canvas/game capability or separately approved isolated runner; no implied network/storage access |
| Other languages/design | Java, C++, UI/UX Design | Appropriate isolated compilation or project/review format; non-code exercises need explicit completion trust rules |
| AI/GenAI | GenAI concepts, AI-assisted coding tools | Privacy/consent/provider boundaries and original instruction; AI does not grade normal correctness by default |

For each course, R08/R12 authoring must record original learning outcomes, prerequisite order, complete lessons, exercises, assessment cases, hints, projects, supported runtime and review evidence. A catalog card without a complete usable course **does not satisfy V1**. Exact course titles, lesson counts, project briefs and technology choices are later content/design decisions, not permission to omit any required family.

## Required architecture and policy decisions before dependent work

1. **R05 curriculum model:** supersede Course-as-alias with stable distinct Journey/Course/Chapter/Exercise identities, versioning and migration/compatibility rules before publishing multiple courses. Preserve accepted history and ownership.
2. **R07A interactive execution:** demonstrate isolated DOM/project execution and bounded recovery without weakening the existing Worker/static-preview boundary. The current preview remains script-disabled until an approved safer capability exists. No learner code in NestJS.
3. **R10C/R12F trust:** choose independently defensible assessment, anti-abuse, appeal and claim policies before leaderboards or certificates carry verified/competitive meaning. Client-reported personal-learning completion remains sufficient only for its current limited purpose.
4. **R11 public data:** approve privacy, moderation, reporting, removal, deletion, abuse prevention and operator controls before project publication or Community collection. Private project saving and published project hosting have different authority/safety needs.
5. **R08/R12 runtimes:** prove runtime, package/data bounds and assessment for Python/data, terminal/Git, Node, compiled and game tracks before advertising them as usable. Select safe simulation where educationally honest; otherwise use a separately approved isolated runner.
6. **R12H commercial:** choose original tiers, prices, entitlements, billing/refunds/tax and consumer/privacy policy with named owner approval before real payment or upsell. V1 commercial surface remains required while these values are open.
7. **R16 release:** F06 jurisdiction-specific policy, consent, retention, deletion and processor decisions; matching hosted/physical evidence; and exact release candidate remain open. No live telemetry, learner invitation or beta GO follows from this scope approval.

## Explicitly deferred or different

Cloud synchronization/merge of *exercise source drafts* remains deferred under F07; required owner-bound saved Builds/projects are a separate product capability. Classroom/teacher administration, enterprise tenancy, uncontrolled local terminal, authenticated learner preview, and executing arbitrary learner code in NestJS are outside the V1 direction or prohibited by existing boundaries. Exact pricing, theme character designs, supported browser versions, provider choices, lesson counts and implementation mechanisms are design decisions, **not** conditional inclusion of their required parent categories.
