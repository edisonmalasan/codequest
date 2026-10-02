# Spec Delta

## Purpose

Give learners one coherent Quest screen where instructions, editable source, and output remain usable together across desktop and smaller layouts without changing learning authority.

## ADDED Requirements

### Requirement: Published Quest uses one integrated learning shell

The Quest route SHALL present published lesson content, the editable coding workspace, and output or results as one continuous exercise experience. At a supported desktop width, the lesson, editor, and output or preview SHALL be simultaneously visible as distinct persistent regions. The shell SHALL retain Journey, Course where available, Chapter, Quest, exercise identity, and safe return navigation without duplicating a second global application shell.

#### Scenario: Learner works at desktop width

- **WHEN** a published Quest with an editable workspace opens at a supported desktop width
- **THEN** the learner can read the lesson, edit source, and inspect current output or Check feedback without navigating to a separate page or scrolling past an unrelated full-page section

#### Scenario: Direct Quest link is refreshed

- **WHEN** the learner refreshes a published Quest route
- **THEN** the same Quest context and integrated regions load from the published snapshot, and any saved owner-scoped draft follows the existing restoration contract

### Requirement: Exercise controls remain in context and preserve authority

The shell SHALL present the existing Run, Check, hint, save, reset, and eligible Submit controls where their outcomes can be inspected in context. It SHALL keep the distinction among local Run, local unverified Check, pending delivery, and backend-accepted personal-learning completion. It SHALL NOT show an enabled action that has no implemented behavior, silently submit on Run or Check, or claim rewards from local output. The shell SHALL provide a clear path back to the owning published curriculum map; later Back/Next sequencing and completion-flow expansion remain R07 work.

#### Scenario: Learner checks and submits

- **WHEN** a signed-in learner runs Check and then explicitly submits an eligible result
- **THEN** Check feedback remains locally labeled, submission status stays distinct, and accepted completion appears only from the existing backend response or trusted account refresh

#### Scenario: Guest uses an eligible Quest

- **WHEN** a guest uses an eligible published Quest
- **THEN** the shell presents device-local provisional status and does not offer an authenticated completion claim

### Requirement: Tablet and mobile have intentional panel modes

At tablet and mobile widths, the shell SHALL provide explicit, named ways to reach lesson, code, and results without compressing all three desktop regions into unusable columns. Switching views SHALL preserve current source, drafts, pending validation, selection, scroll context where feasible, and output state. A panel change SHALL NOT reset the editor, rerun code, resubmit, or discard a failed local save. Primary actions SHALL remain reachable without page-level horizontal overflow at 390 and 320 CSS-pixel widths and zoom-equivalent reflow.

#### Scenario: Mobile learner switches panels

- **WHEN** the learner edits source, switches to lesson, then opens results and returns to code
- **THEN** the same source and current correlated result remain available without remount-driven loss or a new execution

#### Scenario: Narrow and zoomed layout

- **WHEN** the route is viewed at a narrow mobile width or 400% zoom-equivalent reflow
- **THEN** panel navigation and essential actions remain readable and operable while long code or console lines scroll only inside labeled bounded regions

### Requirement: Shell states and access remain truthful

The shell SHALL preserve published lesson loading, unknown-content, recoverable failure, offline, guest eligibility, local-storage failure, and protected-read failure states without exposing raw responses or silently substituting authority. It SHALL use meaningful landmarks, heading order, labels, visible focus, keyboard and screen-reader operable panel controls, reduced-motion behavior, and text equivalents for result state. Changing modes SHALL move or restore focus predictably and SHALL not trap focus inside a hidden panel.

#### Scenario: Lesson load fails

- **WHEN** the published Quest request fails before content is usable
- **THEN** the learner sees the existing safe retry or not-found experience rather than an empty editor or fabricated Quest

#### Scenario: Panel switch with keyboard

- **WHEN** a keyboard learner changes the active panel on a narrow layout
- **THEN** its content is announced, hidden controls are skipped, focus remains visible, and the existing code-editor escape path remains available

### Requirement: R06 evidence separates integration from acceptance

R06 verification SHALL cover the actual local Quest route with published curriculum, its real workspace seams, desktop/tablet/mobile and zoom-equivalent widths, keyboard and reduced-motion operation, source preservation, Run/Check outcome presentation, and guest/account status distinctions. The repository SHALL record exact build, environment, automated and browser results, screenshots, and any untested physical or assistive setup. Founder visual/workflow acceptance SHALL remain open until explicitly reviewed; R06 SHALL NOT be called release ready because CI passes.

#### Scenario: Automated browser checks pass without founder review

- **WHEN** tests and local browser review pass but the founder has not accepted the integrated screen
- **THEN** R06 technical and local-integration results may be recorded while founder acceptance remains open
