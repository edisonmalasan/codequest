# Spec Delta

## MODIFIED Requirements

### Requirement: HTML and CSS display without learner script execution
Learner HTML and CSS SHALL render only in a sandboxed iframe with no script or same-origin permission. The preview SHALL treat script elements, inline event handlers, JavaScript URLs, active SVG or embedded content, and DOM-programming attempts as inert. A small allowlist of link and form elements MAY display their static text and controls for HTML instruction, but link destinations and form submission SHALL remain disabled. Learner markup SHALL not be inserted into the authenticated application DOM or a trusted preview bootstrap document. The preview SHALL not offer external asset loading, navigation, popups, downloads, or storage.

#### Scenario: Static page renders
- **WHEN** the snapshot contains ordinary headings, text, layout markup, and inline CSS
- **THEN** the iframe displays the page without running learner JavaScript

#### Scenario: Active markup is supplied
- **WHEN** learner HTML includes scripts, event attributes, external resources, forms, embeds, or navigation targets
- **THEN** active behavior is denied and no learner data reaches an external or authenticated sink

#### Scenario: Inert form is previewed
- **WHEN** a supported lesson uses a label, field, button, or link
- **THEN** its safe static structure is visible, while activation cannot submit data or navigate the frame or parent

### Requirement: Restricted sandbox and CSP deny active capabilities
The learner iframe SHALL use an empty sandbox permission set and an enforced deny-by-default content policy. The policy SHALL allow only the minimum inline style and local visual data necessary for static rendering while denying scripts, network connections, external resources, workers, nested frames, objects, form submission, base URL changes, and unauthorized navigation. Displaying inert form or link markup SHALL NOT add `allow-forms`, `allow-scripts`, or `allow-same-origin` sandbox tokens. The trusted bootstrap SHALL have a separate fixed response policy. Any failure of effective policy or sink-denial browser tests SHALL block capability completion rather than weaken the application or Phase 14 runner policy.

#### Scenario: Markup probes external sinks
- **WHEN** learner markup or CSS requests an external script, image, stylesheet, frame, form target, link target, or redirect
- **THEN** no request carrying learner data reaches the controlled sink

#### Scenario: Form control is activated
- **WHEN** a learner activates a visible form control in the preview
- **THEN** the sandbox and content policy prevent submission, navigation, and access to application authority
