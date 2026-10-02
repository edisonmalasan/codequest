# Proposal

## Why

R02 established and founder-approved an original screen direction, but the real root page remains a centered list of links and production routes lack a coherent global navigation shell. R03 must make the actual entry experience usable and visually consistent before course discovery and the integrated learning workspace are built.

## What Changes

- Add a reusable, accessible production application shell for the current public and account routes, with truthful links, current-route indication, a skip link, and intentional desktop/mobile navigation.
- Replace the minimal root page with an original CodeQuest home page based on the approved visual direction and existing project-owned artwork. Lead visitors to published learning, onboarding, registration, and account access without advertising unfinished courses or rewards.
- Show a small published-learning entry from the existing public curriculum API, with loading, empty, and unavailable states. R05 owns the full multi-course catalog, filters, and new Course model.
- Verify anonymous, guest, and account-entry navigation in real browsers and record founder review separately from automated checks.

## Capabilities

### New Capabilities

- `production-shell-homepage`: Production navigation and home-page behavior for currently available destinations, responsive presentation, truthful curriculum entry, and review evidence.

### Modified Capabilities

None. The existing R02 design-direction, curriculum, authentication, and product-readiness contracts remain in force.

## Impact

Frontend application layout/components, root page, styling, and focused tests/browser checks change. Existing generated API transport supplies public journey summaries; no backend endpoint or database change is planned. Runtime/preview origins, learner-code isolation, account authority, Phase 38 readiness, telemetry gates, and unfinished V1 categories remain unchanged.
