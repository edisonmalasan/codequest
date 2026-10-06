# HTML Foundations content and publication review

R08 first Course: `WEB-FOUNDATIONS` / `COURSE-HTML-FOUNDATIONS`, four chapters and twelve original instructional Quests, all content and assessment version `1.0.0`. This is a static HTML teaching course. The final page is an instructional project, not a capstone claim. The complete Course is now selected in `backend/content/publication.yaml` after local content and containment review. Integrated account and founder gates are recorded separately below.

| Chapter | Quests | Learning progression | Declared evidence |
| --- | --- | --- | --- |
| Page structure | HTML01–HTML03 | Main page, heading levels, paragraphs and meaningful emphasis | Exact element tags, IDs, text; normal and boundary cases |
| Ways through content | HTML04–HTML06 | Local fragment target, supplied image alt text, ordered and unordered lists | Safe fragment, matching section, image alt, list types/items |
| Meaningful regions | HTML07–HTML09 | Header/main/footer, figure/caption, data table headers/cell | Landmark, figure, image, caption, table and cell semantics |
| Forms and field guide | HTML10–HTML12 | Label/field association, grouped question, integrated static page | `for`/field ID, safe type/name, legend, project elements |

Each Quest depends on the previous stable Quest ID, starts with one HTML file, has three graduated hints, at least one normal and one boundary case, and offers an original worked example and reflection prompt. All are authenticated-only for now; the existing guest Q01–Q04 path is unchanged. The approved private-beta experiment awards 10 XP only on first backend-accepted completion and does not claim that difficulty or pacing is balanced.

## Dated content and assessment review — 2026-10-05

Reviewer: CodeQuest implementation review (agent), with founder product acceptance still open. The twelve `1.0.0` lessons were read against the coverage map and their actual starters/cases. They use an original city/river field-guide scenario, original text and examples, and an original local raster route marker. The sequence introduces each required element before the integrated final page. Essential instructions remain text; image lessons include useful alternate text; heading, landmark, list, table-header, and form-label examples use semantic tags. The final project requires no CSS or JavaScript. Links and form controls are explicitly described as inert in every lesson's Check contract. This review verifies authored material and declared behavior; it is not a founder quality acceptance or a claim of independently verified mastery.

| Exact Quest snapshot | Editorial coverage | Browser candidate Check |
| --- | --- | --- |
| HTML01 `1.0.0/1.0.0` | Main + heading | Reference pass; alternate pass; wrong-tag defect fail |
| HTML02 `1.0.0/1.0.0` | Heading hierarchy | Reference pass; alternate pass; wrong-level defect fail |
| HTML03 `1.0.0/1.0.0` | Paragraph + emphasis | Reference pass; alternate pass; wrong-tag defect fail |
| HTML04 `1.0.0/1.0.0` | Local link + target | Reference pass; alternate pass; wrong-fragment defect fail |
| HTML05 `1.0.0/1.0.0` | Image alt + text note | Reference pass; alternate pass; vague-alt defect fail |
| HTML06 `1.0.0/1.0.0` | List choice + items | Reference pass; alternate pass; wrong-list defect fail |
| HTML07 `1.0.0/1.0.0` | Page landmarks | Reference pass; alternate pass; wrong-main defect fail |
| HTML08 `1.0.0/1.0.0` | Figure + caption | Reference pass; alternate pass; wrong-caption defect fail |
| HTML09 `1.0.0/1.0.0` | Data table | Reference pass; alternate pass; wrong-header defect fail |
| HTML10 `1.0.0/1.0.0` | Label + email field | Reference pass; alternate pass; broken-for defect fail |
| HTML11 `1.0.0/1.0.0` | Group + legend | Reference pass; alternate pass; wrong-legend defect fail |
| HTML12 `1.0.0/1.0.0` | Integrated field guide | Reference pass; alternate pass; wrong-caption defect fail |

The authoring command `content:test` drove the real local lesson Check in Chromium with synthetic authentication and aborted API writes. Each result reported ordered declared case IDs. The first HTML04 negative candidate used an unsafe external destination, which correctly caused a whole-Check safety rejection without case rows; it was replaced with a safe wrong fragment, and the full three-candidate matrix then passed. Source versions and authored tests were not changed by that candidate correction. The exact static origin probe on `5ba894b` passed Chromium, Firefox, and WebKit with no submission, navigation, sink request, storage, script execution, or forged-message acceptance. A later three-engine probe rendered the exact authored local route image at its intrinsic 16-pixel width with its text alternative and a data-only source. These are local synthetic results. Physical assistive technology and hosted release evidence are still untested.

## Static interaction contract

The lesson and authoring guide state that Preview displays links and form controls only. It strips link destinations and form actions, prevents navigation and submission with an empty learner-frame sandbox and `form-action 'none'`, and does not save values typed inside the frame. The Check parser reads safe HTML source and returns local feedback; it never executes learner script. The supplied image is bounded raster data embedded in source, with no external request. Existing Worker containment and authenticated Submit authority remain unchanged.

## Review worksheet

| Gate | Status | Evidence and remaining limits |
| --- | --- | --- |
| Structure and immutable history | Pass, selected Course | `pnpm --dir backend curriculum:validate`; repeat on the final content commit |
| Original writing and coherent coverage | Pass, implementation review | The dated twelve-Quest map above; founder acceptance remains separate |
| Reference, alternative and deliberate-defect candidates | Pass, local Chromium | 36 browser Check outcomes above; no account writes |
| Accessibility and static preview | Local technical pass | Semantic/text review, three-engine sink/image probes passed; physical AT remains a later release gate |
| Publication manifest | Pass, local catalog | Exact 12 snapshots selected; backend test confirms unchanged JavaScript inventory and rejects partial/unreviewed selection |
| Integrated account flow | Pass, synthetic four-browser CI | Catalog through Next, accepted Submit, progress/XP/unlock, refresh/replay and source recovery; real-provider Auth remains open |
| Founder product acceptance | Open | Exact-build founder review; technical/CI passage is not acceptance |

## Apply verification — 2026-10-06

The selected application and content changes are in commit `afe7dec`; the catalog-to-Next browser flow is in test commit `5e81c8e`, with later test revisions on the same Apply branch. These are development builds, not a selected beta release candidate. The first PR browser run exposed a test assumption that counted only links, while locked exercises are list items. CI run `37342728572` on `e96df1e` passed all required checks, including twelve authenticated learning cases across Chromium, Firefox, WebKit, and mobile Chromium, after that assertion was corrected. CI run `37346782700` passed the expanded HTML Course path in all four browser projects but failed an existing guest-flow revisit while the lesson was still loading in WebKit. CI run `37352860847` repeated that guest-flow failure after a longer wait; its trace showed canceled requests during soft navigation from the Course map. The guest test now verifies the completed map target and reloads the lesson directly. CI run `37354867616` then exposed a WebKit cold-start failure: the validation bootstrap page took about 877 ms to load and its script request was canceled when the shared one-second handshake timer expired. Commit `a8bd1a1` separates a finite three-second bootstrap deadline from the unchanged one-second Worker recovery limit and adds a browser regression that deliberately delays the bootstrap script by 1.2 seconds. The HTML account-flow test uses the supported browser signup `next=/courses` route. Apply [PR #220](https://github.com/edisonmalasan/codequest/pull/220), merged as `692ad7f`, passed every required CI step in run `37357528156` on `a8bd1a1`, including learning journeys across Chromium, Firefox, WebKit and mobile Chromium. Canonical spec Sync [PR #221](https://github.com/edisonmalasan/codequest/pull/221), merged as `af22906`, passed required CI run `37359943126`. Archive CI run `37422203919` failed in WebKit when synthetic signup and a Course link transition canceled Course API requests. Two follow-up fix runs (`37424270443`, `37437498515`) exposed further dev-server transition/reload timing. Test fix [PR #223](https://github.com/edisonmalasan/codequest/pull/223), merged as `8177673`, keeps the catalog search and link-destination assertion, then loads that verified destination for the full Course flow; its required CI run `37439396238` passed all checks, including four-browser learning coverage. The separate catalog browser suite retains link-navigation coverage. These are synthetic development checks, not a selected beta release candidate.

Local checks on the selected content passed: `pnpm --dir backend curriculum:validate`, `pnpm api:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and strict OpenSpec validation. `pnpm test --concurrency=1` passed 217 backend tests, 460 frontend tests, and seven backend script checks; the unrestricted parallel run had local resource-pressure timeouts. The public curriculum browser suite passed its 26 unaffected cases plus the two corrected catalog cases on a focused rerun. The exact pushed preview suite passed all twelve Chromium, Firefox, and WebKit cases for safe rendering, sink denial, source recovery, and Worker recovery. The 36 authored reference, alternative, and defect Check candidates passed in the synthetic authoring browser. None of these results substitutes for real-provider Auth, physical assistive-technology review, hosted release evidence, or founder acceptance.

The R07 interactive publication guard stays closed. R04 real-provider, Phase 38 hosted/physical, and private-beta readiness gates remain separate and open.
