# Proposal

## Why

R08 requires complete original core courses, while the published catalog currently contains only JavaScript Foundations. The R07 static web workspace is ready for reviewed HTML exercises, but its current text-only element assertion cannot reliably assess essential HTML semantics such as element type, links, images, and form labels.

## What Changes

- Add an original HTML Foundations Course under a Web Foundations Journey: four ordered chapters, twelve instructional Quests, and a final integrated one-page project within that sequence. Publish the Course only when every Quest and its normal/boundary assessment has passed curriculum and technical review.
- Teach document structure, semantic text, links and images, grouped content, accessible form basics, and a small integrated page. Each Quest uses the existing static web mode and safe preview; HTML is authored by the learner without executable page script.
- Extend bounded, data-only static HTML assertions to check authored element type and a small allowlist of safe attributes or relationships needed for those objectives. Preserve deterministic ordered feedback, source limits, and inert parsing.
- Extend the static preview only enough to display a reviewed subset of inert links and form controls: destinations and form submissions remain disabled, while text and allowed fields remain visible. Preserve the separate preview origin, empty iframe sandbox, strict CSP, script denial, and network/storage denial.
- Exercise the complete path through public catalog, Course map, lesson, local Preview and Check, explicit authenticated Submit, backend progress, and revisit using synthetic data and the existing learning authority.
- Record exact content and assessment versions, original writing review, candidate passes and deliberate failures, accessibility checks, and any remaining founder/hosted/physical evidence. The next CSS, JavaScript quality, and interactive browser courses remain separate R08 changes.

## Capabilities

### New Capabilities

- `html-foundations`: complete original HTML Course outcomes, Quest sequence, assessments, project, publication, and learner-facing review gates.

### Modified Capabilities

- `validation-engine`: bounded declarative static HTML checks cover a small reviewed semantic and safe-attribute subset beyond exact text.
- `web-preview-runtime`: static display can show safe link/form structure without enabling navigation, submission, scripting, or network access.

## Impact

Backend-owned Git curriculum, content validation and publication; static web validation and its generated case contract; the existing REST/OpenAPI client, Course map, Quest workspace, and focused browser tests. Existing JavaScript Quest identities and accepted learning facts remain unchanged. No interactive-web Quest is selected, and the R08 exact-build interactive publication gate remains open.
