## Why

Phase 3 delivered structure without identity: a dark placeholder page, empty `components/ui/` and `components/game/` shells, and base tokens with no scale. Every product UI phase (auth, curriculum, editor workspace, map, dashboard) needs shared tokens and reusable components first, otherwise each phase invents one-off styles that diverge and break accessibility.

## What Changes

- Expand the Tailwind v4 `@theme` token system in `styles/globals.css`: pixel-game color palette (dark-first), typography scale, spacing, borders (pixel-corner + conventional radii), hard + soft shadows, interactive states, stepped animation rules honoring `prefers-reduced-motion`, and responsive breakpoints.
- Establish the pixel styling language (CSS-only: pixel-corners, hard offset shadows, stepped motion, badge/emblem motifs) for game identity surfaces, and conventional readable styling for forms, dialogs, settings, navigation, and tables.
- Build 13 presentational core components in `components/ui/`: Button, Input, Select, Dialog, Drawer, Tabs, Tooltip, Toast, Card, Badge, Progress, Skeleton, Dropdown. Native elements + ARIA + keyboard support; no business logic.
- Build 7 presentational game components in `components/game/`: XPBar, LevelBadge, QuestNode, QuestPath, ChapterCard, AchievementCard, RewardPopup. Display-only props (values and status passed in, never computed); no XP math, no unlock rules, no backend calls.
- Add `class-variance-authority` (variant API) and `motion` (animation rules with reduced-motion degradation) as the only new runtime dependencies; keep `lucide-react` as the single icon family.
- Add unit/render tests for tokens (CSS output), every component (variants, states, keyboard/a11y behavior), and reduced-motion handling; keep `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` green.
- Update `docs/DEVELOPMENT_ROADMAP.md` Project Status to mark Phase 4 active with this change as the current OpenSpec change.

## Capabilities

### New Capabilities

- `design-system`: CodeQuest visual identity and reusable component library — design tokens, pixel/game styling language, core UI components, game display components, accessibility baseline, and verification requirements, plus explicit non-goals guarding Phase 5+ boundaries.

### Modified Capabilities

- None. `frontend-foundation` requirements (structure, providers, persistence skeleton, editor proof) are unchanged; this change fills the component shells it left empty.

## Impact

- Affected code: `frontend/` only (`package.json`, `src/styles/`, `src/components/ui/`, `src/components/game/`). No `backend/` changes, no API contract changes, no database, no generated client.
- Dependencies: adds `class-variance-authority` and `motion` to `frontend/package.json`.
- Systems: none operational — no network calls, no auth flows, no telemetry, no PWA registration.
