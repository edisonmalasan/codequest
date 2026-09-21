## 1. Identity foundation and assets

- [ ] 1.1 Convert the approved exploration into a final token, typography, 8px pixel-grid, border, shadow, state, and motion foundation; verify token contrast calculations and source audit contain no duplicated visual literals.
- [ ] 1.2 Create the original CodeQuest mark and wordmark assets and verify they remain recognizable and crisp at favicon, navigation, and showcase sizes.
- [ ] 1.3 Create the minimal original chapter/map, emblem, avatar-frame, HUD, and decorative asset set; optimize it for web and verify every asset has an exercised design-system role.
- [ ] 1.4 Add the production asset manifest with provenance, license, dimensions, byte size, intended sizes, and accessibility guidance; verify no proprietary research reference is shipped.

## 2. Core component refinement

- [ ] 2.1 Apply the shared conventional control language to Button, Input, Select, Card, Badge, Progress, and Skeleton while preserving public behavior; verify focused component tests and variants pass.
- [ ] 2.2 Apply the shared conventional overlay/navigation language to Dialog, Drawer, Tabs, Tooltip, Toast, and Dropdown; verify keyboard navigation, focus trap/restoration, announcements, disabled states, and 44px showcase targets.
- [ ] 2.3 Audit core typography, focus, contrast, state redundancy, and narrow-width behavior; verify the token contrast report and focused accessibility tests pass without pixel display type in dense content.

## 3. Game-world components

- [ ] 3.1 Redesign XPBar and LevelBadge around the CodeQuest HUD and emblem language; verify progress semantics, textual values, clamping safety, reduced motion, and display-only inputs.
- [ ] 3.2 Redesign QuestNode and QuestPath as an accessible circuit-map composition with a narrow-width journey mode; verify ordered semantics and all supplied statuses remain distinct without derived rules.
- [ ] 3.3 Redesign ChapterCard with original chapter artwork/frame support and readable overlays; verify missing/decorative artwork handling, responsive layout, and display-only props.
- [ ] 3.4 Redesign AchievementCard and RewardPopup with the shared patch/artifact language; verify locked/unlocked text, modal focus, dismissal, motion, and reduced-motion behavior.
- [ ] 3.5 Add showcase-only avatar-frame and decorative-world specimens without profile logic; verify they are semantic or hidden from assistive technology as documented.

## 4. Complete development showcase

- [ ] 4.1 Recompose `/design-system` into the planned identity, foundations, assets, HUD, quest map, chapters, rewards, conventional controls, motion, and accessibility sections; verify every core/game component and roadmap pixel surface appears.
- [ ] 4.2 Add useful variants and interactive states for loading, error, empty, disabled, selected, open, locked, available, current, and completed examples; verify controls work by keyboard and demo data remains local/static.
- [ ] 4.3 Implement desktop and mobile showcase compositions without scaled-down desktop art; verify 1440×1000 and 390×844 viewports have no unintended horizontal overflow, clipped controls, or unreadable text.
- [ ] 4.4 Preserve the development-only route guard and homepage separation; verify `/design-system` renders in development and returns not found in a production build.

## 5. Browser visual and accessibility review

- [ ] 5.1 Add browser checks for keyboard traversal, dialog/drawer focus, dropdown/tabs, reduced motion, asset responses, console/hydration errors, broken images, and overflow; verify the automated browser suite passes.
- [ ] 5.2 Run installed-Chrome visual review at 1440×1000, capture and inspect the showcase screenshot against the identity references, repair generic/inconsistent areas, and retain the passing evidence.
- [ ] 5.3 Run installed-Chrome visual review at 390×844, capture and inspect responsive hierarchy, touch targets, crispness, focus, and density, repair defects, and retain the passing evidence.
- [ ] 5.4 Audit WCAG 2.2 AA text/non-text contrast and state-without-color behavior across game art and conventional controls; record measured pairs and verify every exception is repaired.
- [ ] 5.5 Repeat screenshot and browser inspection after repairs and document the final visual verdict, known limitations, viewport/browser details, and asset-load results.

## 6. Final verification and status

- [ ] 6.1 Run `pnpm --dir frontend lint`, `pnpm --dir frontend typecheck`, `pnpm --dir frontend test`, and `pnpm --dir frontend build`; record exact successful results.
- [ ] 6.2 Run root `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; record exact successful results.
- [ ] 6.3 Run strict OpenSpec validation, Markdown/link checks, credential scan, and `git diff --check`; verify the change is internally consistent and contains no secrets or unrelated Phase 5 work.
- [ ] 6.4 Update the roadmap Project Status and redesign evidence for Apply completion pending Sync/Archive; verify the old Phase 4 archive remains byte-for-byte unchanged from `main`.
