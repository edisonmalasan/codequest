# Design

## Context

See [proposal.md](proposal.md). R07 supplies the mode-selected multi-file Quest host, static preview, declarative local Check, explicit Submit, and Course navigation. Only the JavaScript Foundations Journey is published. The static preview strips forms and link destinations, and current HTML checks compare text at an ID without confirming the element type or attributes. The preview and assessment both parse inert markup; neither may execute learner script or gain network authority.

## Goals / Non-Goals

**Goals:** Publish one complete original beginner HTML Course under a new Web Foundations Journey; preserve historical JavaScript versions and learning facts; assess stated HTML outcomes without source-shape tricks; show safe static form and link structure while all active behavior remains denied.

**Non-Goals:** CSS authoring, DOM scripting, working form submission, real link navigation from preview, remote images, published projects/portfolio, independent grading, guest eligibility expansion, or the selected interactive Quest gate.

## Decisions

### 1. One reviewed Course and a fixed instructional sequence

Use stable IDs `WEB-FOUNDATIONS`, `COURSE-HTML-FOUNDATIONS`, `HTML-CH01`–`HTML-CH04`, and `HTML01`–`HTML12`, with globally unique slugs. The new Journey owns the Course, so later reviewed web Courses may join without reinterpreting the existing JavaScript Journey. Only the reviewed complete inventory enters `publication.yaml`; draft authoring can remain unselected.

| Chapter | Quest sequence | Assessed progression |
| --- | --- | --- |
| Page structure | HTML01 First page; HTML02 Heading map; HTML03 Readable copy | Main heading and text, heading levels, paragraphs and emphasis |
| Ways through content | HTML04 Useful links; HTML05 Images with meaning; HTML06 Clear lists | Safe fragment destinations, bounded supplied image with alt text, ordered/unordered lists |
| Meaningful regions | HTML07 Page landmarks; HTML08 Figure and caption; HTML09 Data table | Header/main/footer and sections, figure relationship, table headers and rows |
| Forms and project | HTML10 Labels and fields; HTML11 Grouped questions; HTML12 Field guide page | Explicit label-to-field association, grouped controls, integrated one-page project using prior concepts |

Every Quest uses a new immutable `1.0.0` content and assessment snapshot, one HTML file, `static-web` mode, two or more normal/boundary cases, three hints, and the approved experimental 10 XP award. Each after HTML01 requires its predecessor; no new guest eligibility is inferred. The final project is an instructional Quest because the current capstone response contract is specific to a separately reviewed capstone path. It must still integrate and demonstrate the stated course outcomes. An explicit content review records coverage and original writing.

Alternative considered: publish a short HTML sample course now and fill it later. Rejected because a catalog card must lead to a complete course.

### 2. Extend declarative assessment narrowly

Retain existing `html-element` and `css-declaration` cases. Add one versioned data-only semantic case shape with exact element ID, allowlisted tag name, optional exact text, and bounded allowlisted attributes. Inert parsing examines source rather than live preview DOM. For the first Course, required values are limited to safe fragment `href`, bounded `alt`, `for`, `type`, `name`, and selected accessibility text attributes. The authoring validator rejects executable callbacks, unsupported selectors/tags/attributes, dangerous URL schemes, duplicates, oversized cases, and objectives not represented by declared cases. A required label and input share a declared stable ID via separate cases; no browser form submission is used as assessment.

The generated OpenAPI case type and frontend mapper are regenerated from backend schema. Existing published JavaScript cases and historical assessment versions keep their meanings. Tests include reference and structurally different valid solutions, defects that target each concept, and malicious definitions.

Alternative considered: inspect learner HTML with executable authored tests in an iframe. Rejected because it would weaken the current isolated assessment boundary.

### 3. Show inert controls without adding active authority

Extend the static sanitizer allowlist only for display of `form`, `label`, `input`, `fieldset`, and `legend` with safe bounded attributes. The preview keeps the empty iframe sandbox and deny-by-default CSP, including `form-action 'none'`; no `allow-forms`, `allow-scripts`, or `allow-same-origin`. Link destinations and form actions are removed from rendered HTML even when a safe fragment value is checked in source. Input types are restricted to harmless text-like controls. Supplied image data remains within the existing bounded data-image rule. The lesson and preview status explain that navigation and submission are disabled.

This chooses accurate static appearance plus explicit inert behavior over activating learner-authored links/forms. Security tests must prove form/link activation reaches no external or authenticated sink, including parent navigation, and must retest current script/network/storage spoof probes after sanitizer changes. Any failure blocks publication.

### 4. Keep learning and publication authority where it is

Git content and explicit manifest versions remain publication authority. The backend API delivers selected snapshots; the frontend uses generated types. Local Check is feedback only; authenticated Submit follows existing owner, prerequisite, version, idempotency and personal-learning policy. Test with a synthetic account and isolated PostgreSQL across the Course path. Record exactly what is automated, what is browser-tested, and what still needs founder or later hosted/physical review. The interactive catalog guard remains intact.

## Risks / Trade-offs

- [Semantic checks could overfit one solution] → Check observable elements/attributes only, accept alternative valid structures, and avoid whole-source matching.
- [Form display could reopen a data sink] → Keep all active sandbox/CSP denials, strip action/destination attributes, and run adversarial browser probes before selection.
- [Large content set could pass syntax validation while teaching poorly] → Use a coverage map, editorial review, candidate solutions, accessibility review, and full Course traversal before manifest selection.
- [New IDs or reward values could collide] → Run global identity/history checks; use the existing experimental first-completion 10 XP policy without claiming balance.
- [A local browser pass could be mistaken for release readiness] → Record environment/build and untested founder, hosted, physical, and Phase 38 gates separately.

## Migration Plan

Add new Course and case shape without changing existing snapshots or accepted attempts. Run structural/content history validation, generate the API client from OpenAPI, and keep new content unselected until the whole Course and safety checks pass. Then select the complete exact version inventory in `publication.yaml`. Rollback is removal of the new publication selection in a reviewed commit; authored versions and any accepted account facts remain intact. Do not overwrite or remove published snapshots.
