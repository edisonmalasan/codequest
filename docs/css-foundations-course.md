# CSS Foundations content and technical review

Status on 2026-10-08: twelve authored `1.0.0` content / `1.0.0` assessment snapshots passed structure, candidate, Preview, and synthetic account-flow review. The complete Course is selected after that review; founder acceptance remains separate. This is an implementation review, not founder acceptance or verified mastery.

| Chapter | Stable Quests | Learning sequence |
| --- | --- | --- |
| Rules and selectors | CSS01–CSS03 | Separate stylesheet, class/element/ID selectors, source order |
| Type, color, and space | CSS04–CSS06 | Reading hierarchy, contrast pair, bounded line width and padding |
| Boxes and layout | CSS07–CSS09 | Border and padding, flex row, equal grid tracks |
| Responsive pages | CSS10–CSS12 | Narrow stack, wide layout, integrated static field guide |

Every Quest has a semantic HTML starter, a separate CSS starter, one objective, three graduated hints, at least one normal and one boundary case, and the previous stable CSS Quest as prerequisite except CSS01. No JavaScript or remote resource is needed. The final project is instructional; its Check covers declared source rules, while learners must inspect readability in Preview. It does not grade computed style, visual quality, accessibility as a whole, or independent ability. All CSS Quests remain account-only. The existing guest Q01–Q04 path, accepted-completion policy, and first-completion XP policy are unchanged.

## Editorial and accessibility review — 2026-10-07

Reviewer: CodeQuest implementation review (agent). The exact twelve draft lessons, starters, case definitions, hints, concepts, and chapter order were read after authoring. All text and examples were written for this Course. No external artwork or assets are included. The field-guide throughline grows from one note to a complete static page. Worked examples use different selectors or values from the required declarations so the learner must transfer the rule. Each lesson names the CSS declarations and, where relevant, the media scope that Check reads. The CSS03 and CSS12 lessons explicitly distinguish source checks from a rendered-quality judgment. HTML starters use a page heading and meaningful paragraph/article/section/nav/aside structure where appropriate; CSS05's navy-on-yellow pair is readable and no task asks the learner to replace text with color alone. CSS08 explicitly says static Preview disables link navigation.

Review corrections before selection: CSS02's YAML hint had treated an unquoted `#` as a comment and was quoted; CSS08's link behavior was clarified; several worked examples were changed so they do not simply show the requested values. Curriculum validation passed after those corrections. Physical screen-reader, touch-device, and low-power results remain untested release gates.

| Quest | Declared source objective | Chromium candidate outcomes |
| --- | --- | --- |
| CSS01 | Class color and background | Reference pass; safe variant pass; wrong color fail |
| CSS02 | Element weight and ID color | Reference pass; safe variant pass; wrong weight fail |
| CSS03 | Last same-selector color and paragraph rhythm | Reference pass; safe variant pass; wrong final color fail |
| CSS04 | Heading family and size | Reference pass; safe variant pass; wrong family fail |
| CSS05 | Note foreground and background | Reference pass; safe variant pass on rerun; wrong color fail |
| CSS06 | Reading width and inner space | Reference pass; safe variant pass; wrong width fail |
| CSS07 | Border style, width, and padding | Reference pass; safe variant pass; wrong style fail |
| CSS08 | Flex display, gap, and distribution | Reference pass; safe variant pass; wrong display fail |
| CSS09 | Grid display, tracks, and gap | Reference pass; safe variant pass; wrong display fail |
| CSS10 | Base two tracks and exact narrow scope | Reference pass; safe variant pass; wrong base tracks fail |
| CSS11 | Exact wide-scope grid and track ratio | Reference pass; safe variant pass; wrong wide display fail |
| CSS12 | Bounded guide, card grid, exact narrow stack | Reference pass; safe variant pass; wrong guide width fail |

The `content:test` authoring harness reported ordered case IDs and exact `1.0.0/1.0.0` versions for all 36 candidates. It uses the learner's local browser Check with synthetic Auth and aborts account API writes. Each safe variant adds a harmless CSS rule while preserving the required declarations; it checks that extra safe source is accepted, not a broader visual solution space. The CSS05 variant's first browser run reached the application's generic dev error page before Check; the same candidate passed on its immediate rerun. No content or case definition was changed to make that rerun pass. The failure is a local development-server instability, not positive evidence for the first run.

## Technical and publication worksheet

| Gate | Status | Evidence or remaining work |
| --- | --- | --- |
| Authored structure and immutable history | Local pass | `pnpm --dir backend curriculum:validate` and unselected Web Foundations author preview on 2026-10-07 |
| Originality, order, hints, and semantic starters | Implementation review pass | Dated review above; founder quality acceptance remains open |
| Reference, variant, and defect Check | Local Chromium pass | 36 outcomes above, including the CSS05 retry |
| Responsive final-page Preview | Local Chromium pass | CSS12 narrow single track and wide two-track probe on 2026-10-07 |
| Three-engine static Preview containment | Local pass on `1225666` | 18/18 Chromium, Firefox, and WebKit cases passed: width changes, denied external sinks/script/storage/navigation, forged messages, timeout recovery, and single-frame cleanup |
| Complete atomic publication | Local pass | All twelve `1.0.0/1.0.0` snapshots selected together; 18 focused catalog tests passed, including incomplete inventory, missing Quest review, and draft Course rejection; existing HTML/JavaScript identities unchanged |
| Integrated account journey | CI synthetic pass on `e79bede` | Run `37683979437` passed CSS flow on Chromium, Firefox, WebKit, and mobile Chromium: catalog, first and final Quest UI, Preview widths, Check, Submit, progress/XP/unlock, pending replay, map, and saved source after reload. Middle prerequisite completions used authenticated synthetic API reports, as detailed below. |
| Founder product acceptance | Open | Review the exact merged build in the real application |
| Real-provider Auth, hosted and physical gates | Open | Separate R04 and Phase 38 evidence; no beta release candidate selected |

## Integrated account verification

The Playwright account journey uses isolated PostgreSQL and synthetic Auth. It searches the catalog, opens the CSS Course, edits and Checks CSS01 through the browser, submits it, then advances CSS02–CSS11 with authenticated synthetic API reports so the final prerequisite is available. It edits, Previews at narrow and wide widths, Checks, and submits CSS12 through the browser. An aborted delivery response exercises device-local pending work and reconnect replay. Backend progress and XP reads, the Course map, and the restored final draft are checked after navigation and reload. The middle Quests are not individually exercised through their UI in this test; their reference, variant, and defect Check outcomes are covered by the separate author-candidate suite. Client reports remain subject to the existing personal-learning acceptance policy and do not establish independent grading.

The first CI attempt, run `37620798969`, found that persisted chapter positions collided when two Courses each used local chapter position 1. Commit `921b46f` materializes Journey-wide positions in the existing database schema, with a focused two-Course regression test. Run `37679805295` passed the account submit but found a test race: automatic reconnect replay removed the manual retry button between the visibility check and click. Commit `17f171e` waits for confirmed replay and backend facts instead. Run `37682225681` confirmed account completion and XP across all browser projects but found a Firefox draft-restore assertion after an immediate revisit and reload. Its trace showed the final edit still unsaved before navigation. Commit `e79bede` requires the editor's durable saved status, then checks restoration before and after reload. The exact-commit [CI run](https://github.com/edisonmalasan/codequest/actions/runs/37683979437) passed the CSS account journey on all four browser projects. The full learning suite recorded 15 passes and one unrelated HTML Course WebKit case that passed on retry after its editor was transiently absent; that flaky result is retained rather than counted as a clean first attempt.

Local `pnpm test --concurrency=1` ran all 223 backend assertions on `921b46f` but exited nonzero because Vitest reported an unhandled worker heartbeat timeout after the assertions. The same commit passed the CI `pnpm test` step. That local result is not recorded as a clean pass.

On `e79bede`, CI passed migration check/drift/migrate, API contract, curriculum validation, lint, typecheck, `pnpm test`, frontend build, performance, PWA, curriculum, analytics, learning, and accessibility checks. Local `pnpm build`, focused backend lint/typecheck and chapter regression, frontend lint/typecheck, API contract, curriculum validation, and strict OpenSpec validation also passed. These are synthetic/local checks, not real-provider Auth, hosted, physical-device, or founder evidence. The full branch diff was reviewed for generated-client drift, selected version identity, chapter persistence, security boundaries, and unrelated scope; no beta release candidate is selected.

Static Preview remains script-disabled, opaque, and on its dedicated origin. CSS Check rejects unsupported CSS and cannot grant account authority. This Course does not select the separate interactive Quest. Phase 38 remains paused and NO GO.

The 18-case containment probe ran on the pushed implementation commit `1225666` on 2026-10-07. Its build uses local Next.js development servers and synthetic source; it is not hosted, physical-device, or beta-release evidence. Any later preview/security code change requires a fresh exact-build probe.
