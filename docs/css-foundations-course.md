# CSS Foundations content and technical review

Status on 2026-10-07: twelve authored `1.0.0` content / `1.0.0` assessment snapshots have passed local structure and candidate review. The Course remains unselected until the exact build, browser integration, and publication gates below pass. This is an implementation review, not founder acceptance or verified mastery.

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
| Three-engine static Preview containment | Pending exact-build record | Reprobe width, denied sinks, script/storage/navigation, forged messages, timeout recovery, and cleanup after the implementation commit |
| Complete atomic publication | Open | Select all twelve reviewed snapshots together; prove partial or unreviewed selection fails |
| Integrated account journey | Open | Catalog to final project, local Check, accepted Submit, trusted progress/XP/unlock, refresh, and pending recovery on desktop/mobile browser projects |
| Founder product acceptance | Open | Review the exact merged build in the real application |
| Real-provider Auth, hosted and physical gates | Open | Separate R04 and Phase 38 evidence; no beta release candidate selected |

Static Preview remains script-disabled, opaque, and on its dedicated origin. CSS Check rejects unsupported CSS and cannot grant account authority. This Course does not select the separate interactive Quest. Phase 38 remains paused and NO GO.
