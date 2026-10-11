# Curriculum authoring source

This is the Git-owned, backend-local source of curriculum. It is **not published** by adding files here. Phase 29 authors 24 instructional JavaScript Foundations quests in seven chapters; Phase 30 adds one final capstone. The original Q01 1.0.0 draft remains historical; the selected editorial version is 1.1.0 with the unchanged 1.0.0 assessment. Publication is selected separately in `publication.yaml` after the [instructional and technical review](../../docs/javascript-foundations.md). Phase 30 authors CAP01 as a separately counted Integration capstone after Q24; see the [capstone review](../../docs/inventory-capstone.md). Its 10 XP and integrative label remain provisional. Do not import these files into the frontend or query application tables from the frontend.

Run `pnpm --dir backend curriculum:validate` from the repository root. CI runs the same command. It requires no database, Supabase credentials, running API, or learner-code execution. Backend unit tests exercise invalid temporary content trees. The command checks authored file structure and previously merged snapshots against `origin/main`; keep full Git history available. It fails closed when the base cannot be resolved.

## Local authoring tools

Run these commands from the repository root. `content:validate` is an alias for the full curriculum and immutable-history gate; every preview and candidate run performs that gate before reading its selection. IDs accept a stable Quest/Journey ID or an unambiguous slug. A Quest version is always explicit: use `current` to intentionally select `quest.yaml`'s current authored version, or supply an exact content version. Outputs must be new absolute `.html` paths outside `backend/content/`; remove them after review. The tools never update snapshots or `publication.yaml`.

```text
pnpm --dir backend content:validate
pnpm --dir backend content:preview:quest --id Q01 --version current --out <absolute-new-q01.html>
pnpm --dir backend content:preview:quest --id Q01 --version 1.0.0 --out <absolute-new-historical.html>
pnpm --dir backend content:preview:course --id JAVASCRIPT-FOUNDATIONS --out <absolute-new-course.html>
```

The self-contained previews render safe static lesson text and bounded local images with scripts and network loads disabled. Quest previews show selected content and assessment versions, starter, hints, cases, prerequisites, and their exact published comparison. Course previews show the ordered authored inventory, review status, and manifest-selected versions. An unselected snapshot is visibly unpublished; previewing it does not make it available to learners. The Course outline does not calculate learner progress or unlocks.

Save each candidate in a regular local `.js` file for a JavaScript or interactive web Quest, or `.html` for a static web Quest, at most 65,536 UTF-8 bytes. An interactive candidate also requires `--html` with the display HTML; a web Quest with a CSS file requires `--css` with separate CSS of at most 32,768 UTF-8 bytes. Use absolute candidate paths outside `backend/content`; symlinks, missing files, wrong extensions, and files not declared for the Quest are rejected before browser launch. The selected Quest must fit the current browser Check limit of 10 cases; a larger authored case set fails with a clear limit error rather than a false test result. Run reference and alternative snapshots with `--expect pass`, then a deliberate defect with `--expect fail`. A mismatch, malformed source, or timeout exits nonzero. The command starts a fresh local browser Check, reports exact content/assessment versions, ordered case IDs and bounded feedback, and deletes its temporary fixture. JavaScript and interactive candidates use credential-free Workers; interactive display uses the separate preview origin. Static HTML/CSS candidates use the inert local Check strategy. The harness aborts backend API requests. A passing candidate is technical review evidence only; curriculum and technical approval remain explicit.

```text
pnpm --dir backend content:test --id Q01 --version current --source <absolute-reference.js> --expect pass
pnpm --dir backend content:test --id Q01 --version current --source <absolute-alternative.js> --expect pass
pnpm --dir backend content:test --id Q01 --version current --source <absolute-defect.js> --expect fail
pnpm --dir backend content:test --id Q01 --version 1.0.0 --source <absolute-reference.js> --expect pass
pnpm --dir backend content:test --id HTML01 --version current --source <absolute-reference.html> --expect pass
pnpm --dir backend content:test --id CSS01 --version current --source <absolute-reference.html> --css <absolute-reference.css> --expect pass
pnpm --dir backend content:test --id CSS01 --version current --source <absolute-alternative.html> --css <absolute-alternative.css> --expect pass
pnpm --dir backend content:test --id CSS01 --version current --source <absolute-defect.html> --css <absolute-defect.css> --expect fail
pnpm --dir backend content:test --id DOM01 --version current --source <absolute-reference.js> --html <absolute-display.html> --css <absolute-display.css> --expect pass
pnpm --dir backend content:test --id DOM01 --version current --source <absolute-alternative.js> --html <absolute-display.html> --css <absolute-display.css> --expect pass
pnpm --dir backend content:test --id DOM01 --version current --source <absolute-defect.js> --html <absolute-display.html> --css <absolute-display.css> --expect fail
```

The same commands can target an unselected draft after it passes structural validation. The browser test does not submit attempts or alter account records. A looping candidate fails within the runtime bound; the harness checks that a later finite Check recovers on a fresh Worker. Keep candidate files and generated previews outside Git unless they are reviewed authored content, and delete local outputs when finished.

On 2026-10-07, the documented two-file `CSS01 --version current` reference command passed the local Chromium authoring harness against unpublished content/assessment `1.0.0`: `normal-note-color` and `boundary-note-background` both passed. This is candidate-tool evidence, not Course publication, editorial review, or founder acceptance.

## Tree and identity

```text
backend/content/
  concepts.yaml
  publication.yaml
  journeys/<journey-slug>/journey.yaml
    courses/<course-slug>/course.yaml
      chapters/<chapter-slug>/chapter.yaml
        quests/<quest-slug>/quest.yaml
          versions/<content-version>/
            version.yaml
            lesson.mdx
            starter.js
            starter.html / starter.css (only for an explicit web exercise)
            tests.ts
            assets/ (optional, local images only)
```

Journey > Course > Chapter > Quest is the published hierarchy. Each concept, Journey, Course, Chapter, and Quest has a stable ID distinct from its slug, title, directory path, and version. Parent manifests list child IDs in unique position order. Moving the existing immutable Quest snapshots beneath the new Course path does not change their bytes or stable identities.

journey.yaml records entry requirements, outcomes, ordered Course IDs, and draft/reviewed status. course.yaml records its Journey ID, summary, topics, outcomes, ordered Chapter IDs, and draft/reviewed status. chapter.yaml records its Course ID, objective summary, and Quest IDs. quest.yaml records its Chapter ID, kind, guest eligibility, versions, and transitions. Only Q01-Q04 in the existing Foundations Course are guest eligible.

Each immutable `versions/<semver>/version.yaml` records the same `contentVersion` as the directory, an independent `assessmentVersion`, title, one primary objective, one Foundations outcome ID, concept IDs, completion-prerequisite quest IDs, editorial difficulty, positive XP award candidate, three graduated hints, and case IDs. A capstone additionally needs separate explanation and transfer prompts. Those prompts record responses for later review; deterministic cases cannot prove reasoning quality. `lesson.mdx` carries the task and examples. `starter.js` carries editable starter source. `tests.ts` must contain exactly one exported `const cases = [...]` literal; it is parsed, never imported or evaluated. Cases use `console` expected output or named `function` arguments/expected JSON values, with normal and boundary examples and actionable feedback. The schema and the focused tests in `backend/src/modules/curriculum/content/` are the definitive syntax reference.

### Explicit exercise descriptors

An existing snapshot without `exercise` remains a single `main.js` JavaScript exercise. New snapshots may add `exercise` to `version.yaml` with `schemaVersion: 1`, one of `javascript`, `static-web`, or `interactive-web`, and ordered files. Each file declares a stable lowercase ID, safe display name, matching `html`, `css`, or `javascript` language, and a local `starter.html`, `starter.css`, or `starter.js` path. A JavaScript exercise has exactly one JavaScript file. A static web exercise needs HTML, may add CSS, and has no JavaScript file. An interactive web exercise needs HTML and JavaScript and may add CSS. File IDs, names, languages, and starter paths must be unique. Source files are bounded to 64 KiB for HTML/JavaScript and 32 KiB for CSS; the private submission bundle including metadata remains bounded to 64 KiB total.

The synthetic, test-only static exercise in `backend/src/modules/curriculum/content/curriculum-catalog.spec.ts` shows a two-file descriptor, literal `html-element` and `css-declaration` cases, and the publication review checks. It is created in a temporary test tree; it is absent from `backend/content/publication.yaml` and is not a public course. Web cases must match their exercise mode and retain the declared case-ID order and normal/boundary coverage. Invalid files, executable tests, unsupported modes, or mismatched cases fail validation. A changed exercise contract or cases requires a new reviewed snapshot and appropriate assessment version/transition.

Static HTML lessons may also use a literal `html-semantic` case. It identifies one element by `#id`, requires an allowlisted HTML tag, and may compare exact trimmed text and up to four unique safe attributes. The supported attributes are `alt` on images, `for` on labels, `href` on links, `name` and text-like `type` on inputs, and `aria-label`. Link values are local fragments such as `#habitats`; field names and label targets are short stable IDs. The case is parsed as data, with no callbacks or arbitrary CSS selectors. For a label relationship, author separate cases for the label's `for` value and the input's ID/type. Give every case clear failure feedback and include normal and boundary cases. For example:

```ts
export const cases = [
  {
    id: 'normal-label',
    category: 'normal',
    kind: 'html-semantic',
    selector: '#search-label',
    tag: 'label',
    expectedText: 'Search',
    expectedAttributes: [{ name: 'for', value: 'search-field' }],
    feedback: 'Connect the visible label to the search field.',
  },
  {
    id: 'boundary-field',
    category: 'boundary',
    kind: 'html-semantic',
    selector: '#search-field',
    tag: 'input',
    expectedAttributes: [{ name: 'type', value: 'text' }],
    feedback: 'Use a text input with the stated ID.',
  },
];
```

These cases are browser-visible local feedback, not independent grading. The static preview displays only safe inert markup; even a checked fragment link does not navigate in Preview, and visible forms cannot submit.

### Static CSS Check grammar

Static CSS cases use `kind: 'css-declaration'`, a single lowercase tag, `.class`, or `#id` selector, an allowlisted property, and `expectedValue`. An optional `media: { type: 'min-width' | 'max-width', widthPx: 320..1440 }` requires the declaration inside that **exact** `@media (min-width: Npx)` or `@media (max-width: Npx)` scope. A case without `media` matches only a base rule. The same selector may occur in several scopes; the last declaration of a property within one scope wins. Check ignores insignificant value whitespace and keyword case, while preserving units and the order of grid columns. For example, this authored case passes when the learner writes `.card { gap: 1rem; }` inside `@media (max-width: 600px)`, and fails if the declaration occurs only outside that rule:

```ts
{
  id: 'boundary-narrow-gap',
  category: 'boundary',
  kind: 'css-declaration',
  selector: '.card',
  property: 'gap',
  expectedValue: '1rem',
  media: { type: 'max-width', widthPx: 600 },
  feedback: 'Add a 1rem card gap inside the 600px narrow rule.',
}
```

The supported properties are `color`, `background-color`, `display`, `font-size`, `font-family`, `font-weight`, `line-height`, `text-align`, `letter-spacing`, the four `margin` and `padding` sides plus their shorthands, `border-width`, `border-style`, `border-color`, `border-radius`, `box-sizing`, `width`, `min-width`, `max-width`, `height`, `min-height`, `max-height`, `gap`, `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, and `grid-template-columns`. Colors are the reviewed small named-color set or three/six-digit hex. Lengths use `0` or bounded `px`, `rem`, `em`, `%`, `vw`, or `vh` numbers; margin and sizing may also use `auto`. Margin/padding shorthands accept up to four lengths. Grid columns accept one to four bounded `fr`, `px`, or percent tracks. Other keywords are restricted by property: display, font family/weight, text alignment, border style, box sizing, flex direction/wrap, and flex alignment/justification use the explicit values in `css-case-contract.ts`. `line-height` also accepts a bounded unitless number. No arbitrary CSS function is accepted.

Check accepts at most 16 media rules, 64 selector rules, and 256 declarations in a CSS file, within the existing 32 KiB CSS source limit. It rejects comments, imports, resource URLs, unsupported at-rules or selectors, nested rules, `!important`, unsupported declarations, and over-limit source. An invalid case fails authoring validation; unsupported learner CSS returns bounded local feedback and leaves the source editable. Preview remains a separate script-disabled, origin-isolated display with a deny-by-default CSP. Check compares declared source structure, not computed cascade, pixels, contrast, accessibility, or independent mastery. Authors must explain this limit in lessons and inspect both narrow and wide Preview before publication. The focused definition and parser tests in `frontend/src/features/validation/` exercise the example and rejection rules.

The original HTML Foundations draft uses one `index.html` file per Quest and carries the supplied 16-pixel route marker as a bounded local raster data image. Authors must explain that Preview strips link destinations and form actions, that clicking a link or submit button does not navigate or send data, and that input values typed in Preview are not saved. A lesson must never promise live browser interaction from this static exercise mode. The course coverage, case map, and exact review status are tracked in [the HTML Foundations review](../../docs/html-foundations-course.md).

Selecting a web Quest requires Quest-level `curriculumReview: approved` and `technicalReview: approved` in the publication manifest in addition to the existing Journey/Course reviews. Interactive selection additionally requires a dated exact-build evidence record for the integrated published route; the development workspace does not grant publication approval. The R07 Apply gate and later R08 content review must both pass before any interactive Quest can be selected. Existing JavaScript snapshots and their manifest entries remain unchanged.

Interactive publication is currently blocked in the catalog loader even if a manifest contains review fields and an evidence reference. The reference is metadata, not proof of a completed review. A later reviewed R08 change must provide the original content snapshot and exact-build published-route verification, then explicitly revise this gate. Until then, interactive source and local Check remain development capabilities only.

Lesson markup is limited to static Markdown: headings, paragraphs, lists, emphasis, code, block quotes, links, and local `./assets/` images with text alternatives. Imports, expressions, JSX, raw HTML, remote embeds, and executable components are invalid. Legacy Foundations JavaScript starters cannot use browser/network/application capabilities. Interactive starters may use only the separately contained browser interaction model; authoring syntax checks do not imply publication approval. Keep essential instructions and outputs available as text; images cannot be the only carrier of a concept. Tests are bounded declarative data, with no callbacks, network, filesystem, packages, or hidden server runner. The existing isolated browser Check consumes these cases; this validator checks authoring structure only.

## Review and versions

Create a new content snapshot for any changed lesson, starter, objective, prerequisite, hint, or case. Never edit or delete a previously merged versions/ file. For publication, review the Journey and each selected Course, then include the complete Quest inventory of each selected Course in publication.yaml with exact content and assessment versions and both approvals. Authored draft Courses may remain outside the manifest. Selected Courses must be complete and reviewed; invalid, stale, partial, ambiguous, or dangling selections fail closed. The legacy /api/v1/courses/:slug path remains a Journey alias for saved clients; new Course resources live under /api/v1/catalog/courses.

All Phase 29 `xpAward: 10` values and difficulty labels are provisional candidates. F04 still owns numeric XP and difficulty/timing balance. This tree does not calculate XP, unlocks, progress, or active availability. Unlock references are completion prerequisites only; do not add XP thresholds or stored unlock state. Historical completions and one-reward-per-stable-quest policy are governed by [curriculum decisions](../../docs/curriculum.md) and [ADR 0007](../../docs/adr/0007-curriculum-identity-and-versioning.md). Phase 10 serves only manifest-selected snapshots. Phase 12 renders their static lesson markup and serves selected local illustrations; existing completion acceptance remains owned by the learning module.
