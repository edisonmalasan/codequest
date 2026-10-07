# Design

## Context

The Web Foundations Journey currently publishes the reviewed HTML Course. Static Preview already displays HTML/CSS in a script-disabled, opaque learner frame on a separate origin. The local static Check parses HTML and a small CSS subset with PostCSS. It supports only simple selectors and four declarations, with no media scope. The authoring candidate command accepts one HTML file for static web work, so it cannot independently test CSS alternatives. The R08 Course must use existing owner, version, submission, and progress contracts.

## Goals / Non-Goals

**Goals:** A coherent CSS Course with a safe, explicit subset that learners can Preview, Check, Submit, and revisit; responsive inspection; repeatable author review of exact candidates and selected versions.

**Non-Goals:** General CSS compatibility, pixel-perfect or computed-style grading, unrestricted selectors/functions/imports, JavaScript execution in static Preview, new server grading, broader guest eligibility, XP policy changes, or interactive Quest publication.

## Decisions

### 1. Publish a complete Course under the existing Journey

Add a second Course with four chapters and twelve versioned Quests under `WEB-FOUNDATIONS`. Teach (1) stylesheet and selector basics, (2) type, color, and spacing, (3) box, flex, and grid layout, then (4) responsive composition and an integrated field-guide page. Use one HTML and one CSS file per exercise, with the HTML starter providing a meaningful semantic canvas. Stable IDs, outcomes, concept references, and a linear prerequisite chain remain authored metadata. Selection in `publication.yaml` occurs only after all snapshots pass review. Existing HTML and JavaScript identities and selected versions stay intact. A card is not published ahead of its usable Course.

### 2. Extend the existing static parser rather than execute styles as assessment

Keep declarative `css-declaration` cases compatible. Add an optional bounded media condition to CSS assertions and an explicit allowlist of teaching properties needed by this Course: color/background, type and line height, margin/padding/border, sizing, flex, grid, gap, and alignment. Support simple tag, class, and ID selectors; a narrow set of min/max-width media conditions; and fixed rule/nesting/byte limits. Parse with the existing frontend PostCSS dependency. Normalize insignificant whitespace and property/value casing only where CSS semantics permit; preserve meaningful units and values. A responsive assertion matches the declared rule in the exact media scope, not a visually inferred computed result. Duplicate declarations follow CSS last-wins order within that scope. Reject imports, URLs, arbitrary functions/selectors/at-rules, excessive nesting, and unsupported properties with bounded feedback. The existing preview CSP remains the network containment backstop; browser sink probes verify the actual policy. This avoids running arbitrary code or making untestable visual judgments.

### 3. Reuse the existing authoring browser harness for two-file candidates

Extend `content:test` with an explicit CSS candidate path for static web Quests while retaining the existing single-source JavaScript form. Validate both absolute regular files, no symlinks, paths outside authored content, file types, and byte limits. Serialize the two files into the existing versioned web snapshot and let the browser harness call the same `StaticWebValidationStrategy` as the learner. The Node authoring command validates input and launches the browser; it does not parse/evaluate learner CSS as a grading authority. Record reference, alternative, and deliberately broken candidate outcomes per exact Quest version. Do not pass private credentials or publish from this command.

### 4. Resize the static preview's viewport without changing its snapshot

Add named narrow and wide width controls to the static `PreviewPanel`, preserving the default current-width view. Resize the adapter host itself so the nested learner document gets the selected CSS viewport. Keep overflow within the preview region on small screens and expose the selected width by label/status; do not cause document-level horizontal overflow. Switching width does not create a new source capture, Check, or submission. A failed preview may be reloaded through the existing generation controls. Keep the static and interactive preview components separate so the new controls cannot grant scripts to the static frame.

### 5. Review content and integration before selection

Write original text, examples, starter files, hints, and declared normal/boundary cases for all twelve Quests. Use readable contrast and semantic HTML in starters, and state precisely which CSS declaration Check examines. Test one reference, one valid alternative, and one deliberate defect per Quest; inspect responsive cases at both widths. Run the full four-browser catalog-to-final-project flow with synthetic account facts and check source persistence/replay. Document exact content and assessment versions, build commit, failures and untested physical/hosted setups. Preserve the separate founder acceptance, real-provider Auth, interactive publication, and Phase 38 gates.

## Risks / Trade-offs

- **Source-level CSS checks can pass a rule that is later overridden.** → Teach this limitation plainly, add explicit order/cascade exercises where supported, and never label Check a rendered-quality grade.
- **A broad CSS parser expands the preview attack surface.** → Keep fixed grammar and byte/count limits, no resource URLs, and rerun external-sink/origin/cleanup browser probes on the exact build.
- **Responsive wide preview may exceed a narrow Results pane.** → Confine horizontal scrolling to the named preview region and verify desktop, tablet, mobile, and zoom reflow.
- **Course size makes partial publication tempting.** → Use a full-inventory manifest gate and keep the Course unselected until every Quest and final project passes the dated worksheet.

## Migration Plan

Add parser and authoring support compatibly, then author and review draft snapshots. Select the full Course in one publication change after candidate and browser evidence passes. Rollback removes the new Course selection without rewriting content history or learner facts; any accepted facts for already published versions remain owner-bound and durable. No database migration is planned.
