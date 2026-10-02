# Design

## Context

The current home page is a centered JavaScript entry with no shared shell. The R02 development preview demonstrates a founder-accepted dark atlas hierarchy and original landscape asset, but it is not a production route. The published Journey route and public `getJourneys` generated API boundary exist. Account routes are protected by existing session rules; real provider flows remain R04 work. Production navigation must respect those facts.

## Goals / Non-Goals

**Goals:** Make Home → published learning and Home → onboarding/account navigation clear, consistent, responsive, accessible, and truthful in the actual app. Make the shell reusable for later catalog and workspace integration.

**Non-Goals:** Publish additional curriculum, create a full catalog or search experience, redesign auth forms, certify OAuth delivery, integrate the three-pane lesson, change progress or XP, add telemetry, or alter runtime origins.

## Decisions

### 1. Use one production shell around application pages

Put a reusable header/navigation and skip target at the root application boundary, excluding the isolated development showcases if their own navigation would conflict. Retain existing route ownership and account protection. Navigation targets are Home, the currently published learning entry, onboarding, and Account; Account leads anonymous visitors through the existing safe login redirect. Avoid a client-auth badge or unverified reward count. The shell must not issue protected requests or infer account authority. The responsive mobile control exposes the same links, indicates the current route, supports keyboard and Escape, and does not hide content behind a decorative layer.

### 2. Bring the accepted visual hierarchy to the real home page

Use CodeQuest's existing mark, landscape, palette, typography roles, and text-safe art backing. Reuse design tokens and suitable components; do not copy the development preview as an opaque bundle or ship its sample-action labels. The hero offers a direct path to learning and a secondary explanation of how the product works. Subsequent content explains the real Run/Check/local-feedback and account-progress distinction with original concise writing; it must not claim a learner completed anything.

### 3. Let public curriculum facts decide the learning entry

Fetch published Journey summaries through the existing frontend API client. Render only returned published entries and link by stable slug. A small home entry may show the available journey or a short list, but R05 owns full discovery. The loading state has stable layout; an empty response says no learning path is currently available; a failed response says learning cannot be loaded and provides a retry or onboarding path. Never replace a failed API read with hardcoded published-course claims. The shell itself remains useful if the API is unavailable.

### 4. Keep existing security and provider boundaries

No direct Supabase application-table access, backend source imports, server-side learner execution, or new telemetry. Do not modify middleware runtime/preview allowlists. The development preview remains development-only. Home does not use account data; current authenticated pages keep their existing trusted backend reads and redirect behavior.

### 5. Separate technical evidence and founder acceptance

Unit and component checks cover navigation destinations, active state, menu keyboard behavior, and home loading/empty/error/success states. Installed-browser checks cover desktop/tablet/mobile, Home → Journey, Home → onboarding/account, focus/reflow/art load/console and anonymous behavior. The founder reviews the real production home and shell against the accepted R02 direction on an exact build. Passing CI alone is not founder acceptance or beta readiness.

## Risks / Trade-offs

- **Shared header collides with existing route layouts:** inspect each current route, keep one main landmark, and repair spacing without redesigning later-phase work.
- **Backend unavailable during local review:** keep navigation and page explanation usable; expose an honest unavailable state rather than a sample course.
- **Auth status is uncertain:** link to Account and let the existing protected route decide; do not display a fabricated identity or accepted progress.
- **Art crowds small screens:** crop decoratively behind solid text backing and test image loading, contrast, narrow reflow, and reduced motion.

## Handoff

R04 stabilizes real email and OAuth flows. R05 replaces the small published-learning entry with a complete catalog and search/filter navigation backed by complete courses. R06/R07 integrate the accepted learning shell and execution/check workflow. R13 and R15 supply broader physical-device and founder acceptance evidence. Phase 38 stays paused and `NO GO`.
