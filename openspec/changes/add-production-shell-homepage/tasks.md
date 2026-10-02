# Tasks

## 1. Production route and visual foundation

- [x] 1.1 Audit the current production routes, root layout, account redirects, and R02 preview boundaries; document the shell placement, link targets, main-content target, and routes that must retain their own full-screen chrome.
- [x] 1.2 Build the reusable production shell with CodeQuest branding, truthful route links, current-route semantics, skip target, and no unverified account or reward state. Keep development showcases and runtime/preview origin isolation intact.
- [x] 1.3 Implement narrow-screen navigation with touch and keyboard access, Escape dismissal, visible focus, and no clipped destination or overlay at desktop/tablet/mobile/zoom review sizes.

## 2. Real home page

- [x] 2.1 Replace the minimal root page with the accepted original visual hierarchy, project-owned art, clear published-learning and onboarding actions, and accurate local-feedback/account-progress copy.
- [x] 2.2 Read published Journey summaries through the existing public frontend API client; render stable loading, empty, unavailable/retry, and success states without a hardcoded course-availability fallback.
- [x] 2.3 Add focused component/route tests for real navigation, menu behavior, curriculum response states, and the absence of invented account/reward/course claims.

## 3. Integration and review

- [x] 3.1 Run strict OpenSpec validation and root lint/typecheck/test/build; inspect installed-browser Home → published Journey and Home → onboarding/account flows at desktop, tablet, mobile, and narrow reflow, recording focus, console, images, and overflow against the implementation commit.
- [x] 3.2 Present the real production Home and shared shell to the founder and record an explicit dated acceptance or revision decision for the reviewed build; leave R03 below `FOUNDER ACCEPTED` until that decision exists.
