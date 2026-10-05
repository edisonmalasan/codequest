# HTML Foundations content and publication review

R08 first Course draft: `WEB-FOUNDATIONS` / `COURSE-HTML-FOUNDATIONS`, four chapters and twelve original instructional Quests, all content and assessment version `1.0.0`. This is a static HTML teaching course. The final page is an instructional project, not a capstone claim. The Course remains unselected from `backend/content/publication.yaml` until every review and integrated gate below is recorded.

| Chapter | Quests | Learning progression | Declared evidence |
| --- | --- | --- | --- |
| Page structure | HTML01–HTML03 | Main page, heading levels, paragraphs and meaningful emphasis | Exact element tags, IDs, text; normal and boundary cases |
| Ways through content | HTML04–HTML06 | Local fragment target, supplied image alt text, ordered and unordered lists | Safe fragment, matching section, image alt, list types/items |
| Meaningful regions | HTML07–HTML09 | Header/main/footer, figure/caption, data table headers/cell | Landmark, figure, image, caption, table and cell semantics |
| Forms and field guide | HTML10–HTML12 | Label/field association, grouped question, integrated static page | `for`/field ID, safe type/name, legend, project elements |

Each Quest depends on the previous stable Quest ID, starts with one HTML file, has three graduated hints, at least one normal and one boundary case, and offers an original worked example and reflection prompt. All are authenticated-only for now; the existing guest Q01–Q04 path is unchanged. The approved private-beta experiment awards 10 XP only on first backend-accepted completion and does not claim that difficulty or pacing is balanced.

## Static interaction contract

The lesson and authoring guide state that Preview displays links and form controls only. It strips link destinations and form actions, prevents navigation and submission with an empty learner-frame sandbox and `form-action 'none'`, and does not save values typed inside the frame. The Check parser reads safe HTML source and returns local feedback; it never executes learner script. The supplied image is bounded raster data embedded in source, with no external request. Existing Worker containment and authenticated Submit authority remain unchanged.

## Review worksheet

| Gate | Status | Evidence needed before selection |
| --- | --- | --- |
| Structure and immutable history | Pass, local draft | `pnpm --dir backend curriculum:validate` on the exact content commit |
| Original writing and coherent coverage | Open | Dated editorial review of all 12 lessons, examples, starters, hints and project |
| Reference, alternative and deliberate-defect candidates | Open | Exact Check results per Quest/version and actionable failure feedback |
| Accessibility and static preview | Open | Text alternatives, headings, labels, keyboard path and browser probes on exact build |
| Publication manifest | Open | Whole reviewed Course selected with exact 12 versions, prior JavaScript inventory unchanged |
| Integrated account flow | Open | Catalog through Next, accepted Submit, progress/XP/unlock, refresh/replay and source recovery |
| Founder product acceptance | Open | Exact-build founder review; technical/CI passage is not acceptance |

The R07 interactive publication guard stays closed. R04 real-provider, Phase 38 hosted/physical, and private-beta readiness gates remain separate and open.
