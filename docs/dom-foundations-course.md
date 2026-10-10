# DOM Foundations authoring and publication review

Review date: 2026-10-10. Content and assessment selection: `DOM01`–`DOM12`, each `1.0.0 / 1.0.0`. Authoring branch: `feat/dom-foundations-course`. The Course is an unpublished draft until the selected production-route record closes every required row. Instructional and technical self-reviewer: Codex, using source inspection and the browser harness. This record does not grant founder acceptance or independent grading.

## Instructional inventory

| Quest | Objective and check alignment                                                           | Supported facade and accessibility review                                                | Known limit                                                                           |
| ----- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| DOM01 | Two ID selections produce distinct station names; normal and boundary cases check both. | `getElementById`, `textContent`; supplied heading and readable text.                     | Checks exact displayed text.                                                          |
| DOM02 | Reads a supplied value, copies it into a summary, and preserves the original.           | ID selection and text read/write; text has its own paragraph.                            | Checks exact displayed text, not source shape.                                        |
| DOM03 | Updates every sensor without losing its name; cases check both matches.                 | `querySelectorAll` and bounded loop; both sensors remain named.                          | A longer list is not assessed.                                                        |
| DOM04 | Click opens the gate while initial text remains closed.                                 | `addEventListener('click')`, status text; real button.                                   | Only declared click behavior is checked.                                              |
| DOM05 | Input mirrors entered text and explains empty input.                                    | Text-input `value`, `input`; wrapping label and status paragraph.                        | No form submission or native DOM API is taught.                                       |
| DOM06 | Change confirms a label and retains an empty fallback.                                  | Text-input `value`, `change`; wrapping label and status paragraph.                       | No persistence is implied.                                                            |
| DOM07 | Click flags an alert and keeps the initial message.                                     | `classList` add/remove and `textContent`; `role="status"` gives a non-color cue.         | Class mutation is inspectable in Run, not independently graded by `interactive-text`. |
| DOM08 | Click updates the mode message while preserving the initial state.                      | `setAttribute('aria-label')` and text; button has an initial accessible name.            | Attribute mutation is inspectable in Run, not independently graded.                   |
| DOM09 | Click gives a ready message as well as a color change.                                  | Allowlisted `style.color` and text; `role="status"` avoids color-only feedback.          | Color mutation is inspectable in Run, not independently graded.                       |
| DOM10 | One and three clicks produce successive sample counts.                                  | Click listener and bounded number state; live status text.                               | State is isolated per Check case.                                                     |
| DOM11 | Input distinguishes valid, out-of-range, and empty readings.                            | Text-input value and input listener; wrapping label and status text.                     | The declared cases do not exhaust all numeric strings.                                |
| DOM12 | Final board saves a name, explains empty input, and replaces a previous save.           | Input, click, text status, labeled field; explanation and transfer prompts are separate. | This personal-learning project does not prove independently verified skill.           |

All lessons use original Signal Garden writing and supplied, local display structure. Each version declares a goal, worked example, task, exact text Check contract, three graduated hints, an ungraded reflection, and the limited Worker/page-facade boundary. Source files and tests use only literal data and the documented HTML/CSS/JavaScript file set. The check set contains normal and boundary cases; cases assess behavior rather than source syntax. DOM07–DOM09 disclose their ungraded visual/attribute aspects to learners. No lesson promises a full browser DOM, network, storage, timers, element creation, or script execution in the preview.

## Authoring verification

The command for each candidate is:

```text
pnpm --dir backend content:test --id <DOM-ID> --version current --source <absolute-candidate.js> --html <absolute-display.html> --css <absolute-display.css> --expect pass|fail
```

Candidate files remained in the OS temporary directory outside `backend/content`; browser Check ran through the isolated runtime and the CLI aborted backend account writes. On 2026-10-10, the final formatted assessment/starter snapshots passed all 36 Chromium authoring commands: reference and independently written alternative passed, while a deliberate behavioral defect failed, for each of DOM01–DOM12. The local origins were application `http://127.0.0.1:3310`, runner `http://localhost:3310`, and preview `http://127.0.0.2:3310`. Playwright 1.63.0 used bundled Chromium 153.0.8010.12. Every command reported content and assessment `1.0.0 / 1.0.0`, ordered case IDs, and an unpublished snapshot. Candidate sources, including reference solutions, are test fixtures only; they are not learner-facing lesson solutions.

| Quests      | Reference | Alternative | Deliberate defect    | Additional result                                                                                                                                                                         |
| ----------- | --------- | ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOM01–DOM03 | 3 passed  | 3 passed    | 3 failed as intended | Both distinct selectors and the multi-match boundary were observed.                                                                                                                       |
| DOM04–DOM06 | 3 passed  | 3 passed    | 3 failed as intended | Source-loop and event-handler-loop candidates each timed out for every Quest; a fresh finite Worker Check completed after each timeout. The CLI exits nonzero for an intentional timeout. |
| DOM07–DOM09 | 3 passed  | 3 passed    | 3 failed as intended | Text equivalents passed; class, attribute, and color mutations remain explicitly ungraded by the literal cases.                                                                           |
| DOM10–DOM12 | 3 passed  | 3 passed    | 3 failed as intended | Repeated clicks, empty input, out-of-range input, and latest-save behavior passed.                                                                                                        |

The final post-matrix edits changed only lesson wording and worked-example variable definitions; file starters and `interactive-text` case definitions were unchanged. `pnpm --dir backend curriculum:validate` passed again after those edits. The post-matrix lesson review found no remaining material task/check mismatch. The authoring matrix does not substitute for the selected production build or physical/browser support evidence.

## Publication gate

The Course requires an exact selected production build, three distinct origins, a dated Chromium/Firefox/WebKit/mobile matrix, repeated source and handler loop recovery, bounded message and mutation probes, lifecycle cleanup, and an isolated PostgreSQL account traversal before the publication record may approve the manifest. An absent, failed, or stale row keeps selection off `main`. Real-provider Auth, physical accessibility, hosted release checks, founder acceptance, and Phase 38 beta readiness remain separate open gates.
