# learning-accessibility Specification

## Purpose

Make the core CodeQuest learning path and reusable coding workspace operable and understandable with keyboard, assistive semantics, reduced motion, zoom, and touch without a pixel-theme exception.

## Requirements

### Requirement: Core learning navigation works with keyboard and visible focus

The home entry, authentication pages, Journey map, lesson, and editor workspace SHALL expose a logical keyboard path through available actions. Focus SHALL be visible and shall not be trapped by decorative elements or the code editor; dialogs SHALL restore focus when closed. Navigating between files, hints, and actions SHALL preserve learner source.

#### Scenario: Keyboard learner reaches and leaves the editor
- **WHEN** a learner tabs from lesson content into the code editor and continues to workspace actions
- **THEN** the editor has an announced name, provides a documented keyboard escape path, and focus reaches the next control without modifying code

#### Scenario: Dialog closes
- **WHEN** a learner opens and closes an editor confirmation dialog by keyboard
- **THEN** focus returns to its trigger and the current draft remains unchanged unless the learner confirmed reset

### Requirement: Core learning information has meaningful structure and announcements

The core learning pages SHALL use meaningful landmarks and heading order, discernible names for controls and regions, text alternatives for essential images and states, and status or error announcements that describe current local versus accepted learning state. Decorative game layers SHALL not appear as essential assistive content or intercept navigation.

#### Scenario: Learner checks a quest
- **WHEN** a local Check finishes or reports a failure
- **THEN** the result and its local or unverified status are available to assistive technology without relying on color or animation

#### Scenario: Quest map is read without artwork
- **WHEN** decorative artwork is unavailable or ignored
- **THEN** the Journey, chapter, quest order, availability, and prerequisite explanation remain understandable in text

### Requirement: Theme and controls preserve perceptual access

Core learning text and meaningful graphics SHALL meet applicable WCAG 2.2 AA contrast thresholds on their actual backgrounds. Focus indicators and states SHALL remain discernible without color alone. Primary pointer controls SHALL expose at least 44 by 44 CSS pixels of usable target area or equivalent spacing. Reduced-motion preference SHALL preserve content and operation while removing nonessential movement.

#### Scenario: Contrast and motion review
- **WHEN** the core path is reviewed with reduced motion and the dark theme
- **THEN** text, control boundaries, focus, and semantic states remain perceivable and transitions reach stable content without required animation

#### Scenario: Touch navigation
- **WHEN** a learner uses primary lesson and workspace actions at a mobile-reading width
- **THEN** each primary target is operable without depending on a tiny decorative hit area

### Requirement: Core path reflows at zoom and narrow widths

The core learning path SHALL remain readable and operable at representative mobile widths and at 200% and 400% zoom-equivalent reflow. The page SHALL avoid unintended horizontal scrolling or clipped controls; long code and console lines MAY scroll within labeled bounded regions.

#### Scenario: Narrow and zoomed lesson
- **WHEN** a learner reads a Quest at a 320 CSS-pixel viewport or equivalent high zoom
- **THEN** prose, hints, controls, and workspace actions reflow, while only bounded code or console regions may scroll horizontally

### Requirement: Accessibility evidence is reproducible and qualified

The repository SHALL provide a repeatable browser verification gate for the core path, recording its tested engines, viewport and input conditions, failures repaired, and remaining manual or physical-device obligations. Automated semantic checks SHALL NOT be reported as a spoken screen-reader session or a supported-device certification.

#### Scenario: CI verifies the path
- **WHEN** required repository CI runs
- **THEN** representative keyboard, semantic, contrast, reduced-motion, reflow, touch-target, and editor behaviors are checked and failures block the change

#### Scenario: Untested assistive setup
- **WHEN** physical mobile or NVDA/VoiceOver has not been exercised
- **THEN** the evidence retains that obligation as untested and makes no support claim
