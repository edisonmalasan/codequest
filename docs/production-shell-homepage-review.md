# Production shell and home review

## Route audit

The root layout provides shared providers. The production shell sits inside those providers and wraps `/`, `/onboarding`, `/account`, `/feedback`, and `/journeys/*`. Its skip link targets the focusable `#main-content` wrapper immediately before each route's single `main` landmark. Home, learning, onboarding, and account links point to `/`, `/#learning`, `/onboarding`, and `/account`; the learning anchor is useful even when the public curriculum API is unavailable. The protected account page retains its existing redirect to login for anonymous visitors.

Login, registration, recovery, auth callbacks, quests, offline learning, design previews, and the development workspace retain their own full-screen chrome. The runtime and preview origins remain governed by existing middleware allowlists. The Journey map previously had its own brand header; the production shell replaces that header on its success, loading, empty, and error views.

## Implementation and browser evidence

Implementation: `4ec97fb4eb985249b6e66e032a257eaaf5124460`; browser console assertion: `8fabaa7454094a8036d4ed83205950428e3ea41c`. Reviewed 2026-10-02, Asia/Manila. The environment was local Windows with installed Playwright Chromium and synthetic frontend configuration. The published Journey response was a browser-route fixture with zero chapters and exercises; these results are not a hosted backend or real-provider integration claim.

| Check | Observed result |
| --- | --- |
| Home → published Journey → onboarding → Account | Passed. The API-returned Journey card linked to `/journeys/javascript-foundations`; the Journey view loaded; the shared navigation reached onboarding; anonymous Account redirected to `/login?next=%2Faccount`. |
| Desktop/tablet/mobile/narrow reflow | Passed at 1280, 820, 390, and 320 CSS px in Chromium. No horizontal document overflow at any tested width. The 320 CSS px case covers narrow reflow equivalent to 400% layout width reduction from 1280 CSS px; it is not physical browser zoom evidence. |
| Keyboard and focus | Mobile menu opened by button, exposed the same destinations, closed with Escape, and restored focus to the button. Skip link targets the focusable `#main-content` wrapper. |
| Art and browser errors | The original hero image completed with nonzero natural width. The click-through produced no uncaught page errors and no browser console errors in the synthetic run. |
| Component states | Six focused tests passed for shell navigation/keyboard behavior and public Journey success, empty, failure, and retry behavior. No hardcoded fallback Journey rendered on error. |
| Repository checks | `openspec validate --all --strict`: 40/40 passed. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` passed after sequential reruns. The full unit suite passed 416/416 frontend tests; the initial concurrent build/test run had one load-sensitive editor test failure, which passed in isolation and in the subsequent full run. |

Review images: [desktop Home](frontend-evidence/r03-home-desktop.png) and [mobile Home](frontend-evidence/r03-home-mobile.png). Both use the synthetic published Journey response and show layout, not real curriculum availability or account integration.

Founder acceptance is open. The founder has not yet reviewed this exact production Home and shell build or recorded an R03 acceptance/revision decision. R04 real-provider authentication, R05 multi-course discovery, R06/R07 integrated learning workflow, and Phase 38 hosted/physical beta evidence remain separate work.
