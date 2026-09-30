# Proposal

## Why

Phase 35 verifies that CodeQuest's pixel theme and core learning journey remain usable with keyboard navigation, assistive technology semantics, reduced motion, zoom, and touch. Earlier phases established accessibility requirements and isolated browser checks, but there is no cross-route accessibility gate or consolidated evidence for the complete learner path.

## What Changes

- Audit the home, authentication, Journey, lesson, and editor workspace surfaces at desktop and mobile reading widths; repair concrete keyboard, focus, labeling, contrast, reflow, motion, and target-size defects found in that path.
- Add a repeatable browser accessibility gate covering keyboard order and visible focus, semantic names and status, color contrast, reduced motion, 200%/400% zoom-equivalent reflow, touch targets, and CodeMirror entry and exit. Preserve source and existing learning authority while navigating.
- Record automated and manual review evidence with exact limitations. Keep physical mobile, NVDA/VoiceOver, and other F02 device obligations marked untested until directly exercised.

## Capabilities

### New Capabilities

- `learning-accessibility`: Cross-route accessibility behavior and verification for the core learning journey and editor.

### Modified Capabilities

None. Existing design-system, Journey, lesson, and editor requirements remain in force.

## Impact

Frontend route and reusable UI/editor components, focused unit/browser tests, the CI browser gate, and accessibility evidence documentation. No backend, database, OpenAPI, auth authority, curriculum publication, or learning rule changes. No production support-matrix or assistive-technology certification claim.
