# Proposal

## Why

The existing web preview safely displays HTML and CSS, but learner JavaScript cannot change its DOM. Original browser-interaction exercises and later Builds need an interactive result that survives hostile code and preserves the authenticated application's isolation. Earlier executable-frame experiments failed the recovery gate, so R07A must establish a new, measured capability before R07 can depend on it.

## What Changes

- Add a separate, opt-in interactive web execution capability for bounded HTML, CSS, JavaScript, and beginner DOM/event exercises. Keep the current static preview available and unchanged by default.
- Keep arbitrary learner JavaScript in a fresh, terminable, credential-free Worker. Use a deliberately limited DOM/event model and a fixed, reviewed display bridge on an isolated preview origin; learner source is never evaluated in the display frame.
- Define source, DOM mutation, event, output, packet, time, and recovery limits, with exact-origin/correlated channels and cleanup on every terminal path.
- Require adversarial browser evidence for containment, event spoofing, network/storage denial, tight loops, malformed packets, and fresh-run recovery before enabling interactive lessons. Record unsupported browser APIs explicitly.
- Keep Run/preview separate from local Check and backend-accepted completion. The exact R06 local visual/workflow acceptance is recorded separately; R04 real-provider verification remains open.

## Capabilities

### New Capabilities

- `interactive-web-execution`: Opt-in isolated DOM/event computation, bounded display bridge, lifecycle, safety, and R07A evidence gates.

### Modified Capabilities

- `web-preview-runtime`: Clarify that its script-disabled contract is the existing static preview mode and that interactive work is a separate capability, never a silent permission upgrade.
- `editor-workspace`: Permit an optional interactive adapter and truthful mode/status presentation without coupling the reusable workspace to curriculum or learning authority.

## Impact

The likely implementation touches frontend runtime and preview adapters, fixed credential-free origin resources, middleware/header allowlists, Editor Workspace presentation, focused browser probes, and security/runtime documentation. It does not require a backend learning API, migration, service-role credential, arbitrary NestJS execution, real telemetry, or a change to personal-learning completion trust. R07A is a prerequisite for the later R07 and original browser-interaction curriculum work; a failed containment or recovery gate leaves it unavailable.
