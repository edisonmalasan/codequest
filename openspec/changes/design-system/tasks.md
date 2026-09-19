## 1. Dependencies and tokens

- [ ] 1.1 Add `class-variance-authority` and `motion` to `frontend/package.json`, and verify `pnpm --dir frontend install` succeeds
- [ ] 1.2 Expand the Tailwind v4 `@theme` token system (`styles/globals.css`: color palette, typography scale, spacing, pixel + conventional borders, hard + soft shadows, interactive states, stepped + smooth animation rules with reduced-motion collapse, breakpoints), and verify the production build emits the token values with no hardcoded component literals

## 2. Pixel styling language

- [ ] 2.1 Add the CSS-only pixel treatment utilities (pixel-corners, hard offset shadows, stepped transitions, emblem/badge motifs) with documentation of the pixel-vs-conventional rule, and verify game surfaces render the treatment while text/state remain readable without color-only meaning

## 3. Core components

- [ ] 3.1 Build Button, Input, Select, Badge, Card, Progress, and Skeleton with variants/states via the variant API, and verify render tests cover every variant plus loading/error/empty/disabled behavior
- [ ] 3.2 Build Dialog, Drawer, Tabs, Tooltip, Toast, and Dropdown with keyboard operation (focus trap, Escape, arrow keys, outside dismissal) and ARIA roles/labels/live announcements, and verify interaction tests prove keyboard-only operability and focus visibility

## 4. Game components

- [ ] 4.1 Build XPBar, LevelBadge, QuestNode, and QuestPath as display-only components (numeric values and status strings as props, no derived rules), and verify tests prove distinct status rendering with no store, fetch, or computation inside
- [ ] 4.2 Build ChapterCard, AchievementCard, and RewardPopup as display-only components with reduced-motion-safe reveal, and verify tests prove final-state rendering under reduced motion with no animation loops

## 5. Verification and status

- [ ] 5.1 Run the full design-system gate (`pnpm --dir frontend lint`, `typecheck`, `test`, `build`, plus root `pnpm lint/typecheck/test/build`) and verify every command exits zero
- [ ] 5.2 Audit text/state contrast to WCAG AA across all variants, review the final diff for Phase 5+ boundary leaks (no backend, network, auth, rule computation, or binary assets), update `docs/DEVELOPMENT_ROADMAP.md` Project Status to Phase 4 active with this change referenced, and verify `openspec validate design-system --strict` passes
