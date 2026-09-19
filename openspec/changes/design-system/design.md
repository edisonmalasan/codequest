## Context

See `proposal.md` (Why) for motivation and `specs/design-system/spec.md` for the behavior contract. Current state: Phase 3 left `components/ui/` and `components/game/` as empty shells, `styles/globals.css` with two colors and one radius, and explicit deferrals (`motion`, variant utilities, Base UI) for Phase 4 to justify. Constraints: product.md P02 (pixel art must not reduce readability/focus/accessibility/editor usability), frontend.md (keyboard/focus/screen-reader/contrast/reduced-motion/zoom with no pixel-theme exception; conventional controls for forms/dialogs/editor/navigation), architecture.md (frontend displays accepted/cached reward state; backend owns XP/level/unlock rules), and the single-`lucide-react` icon family already installed.

Brand direction (brandkit strategy, Dark Developer/Builder mode adapted to education): near-black indigo surface, warm paper ink for readability, emerald ascent as the single action/progress accent, amber reserved for rewards, stepped pixel motion for game feedback and short smooth motion for UI feedback. No generated image assets: the pixel identity is CSS-constructed (corners, hard shadows, steps) so it stays crisp, themeable, and testable.

## Goals / Non-Goals

**Goals:**

- Token-first system: every component value traces to a `@theme` token; later phases theme by editing tokens, not components.
- Two styling languages with a documented rule: pixel treatment for game identity surfaces, conventional controls for everything interactive except game emblems.
- Display-only game components with prop APIs shaped so backend-driven phases can feed them without modification.

**Non-Goals:**

- No light theme (dark-first pixel identity is the brand decision; tokens are structured so a future theme adds values without component changes).
- No Base UI/Radix/shadcn component adoption (deferred until product screens exercise them; native elements + ARIA satisfy the contract with fewer deps).
- No marketing/landing composition, no logo raster art, no map/avatar/chapter raster artwork (CSS motifs only; real art direction belongs to content phases).
- No Playwright coverage (no user-critical flows exist yet; Phase 34 owns it).

## Decisions

- **Tailwind v4 `@theme` tokens over a config file or CSS-in-JS**: v4 CSS-first tokens match the Phase 3 foundation and keep values in one emitted stylesheet. Alternative (CSS custom-property sprawl or a JS theme object) rejected: splits the source of truth and bypasses Tailwind utilities the components use.
- **`class-variance-authority` for variants**: gives each component a typed `variant/size/state` API Phase 3 explicitly deferred. Alternative (hand-rolled variant maps) rejected: reinvents the typed API later phases will extend.
- **`motion` for animation rules, used sparingly**: entry/press/progress/reward micro-motion only, every animated component honoring `useReducedMotion` with instant final-state fallback. Alternative (CSS-only animations) rejected: the roadmap asks for animation rules and reward reveals need orchestrated enter/exit; alternative (GSAP) rejected as oversized for micro-motion.
- **Native elements + ARIA instead of Base UI/Radix**: native `<button>`, `<input>`, `<select>`, `<dialog>` carry built-in keyboard/screen-reader behavior; custom Tabs/Tooltip/Toast/Dropdown/Drawer implement roving tabindex, focus trap (Dialog/Drawer), `aria-live` (Toast), and outside-interaction dismissal with unit tests. Base UI adoption deferred until product screens prove the need — installing a primitive library for 13 components now adds API surface without a consumer.
- **Keep `lucide-react`, single family**: already installed and used; the skill's Phosphor preference loses to the repo's existing dependency (AGENTS.md: do not churn working systems).
- **Game components take fully-derived props** (e.g. `value`/`max` numbers, `status: 'not_started' | 'in_progress' | 'completed' | 'locked'`, label strings): enforces the architecture boundary at the type level — no store reads, no fetchers, no derived state inside.
- **No `image-to-code` visual generation**: component implementations are code-driven (layout, tokens, interaction); generated reference images would not change any implementation decision, so the skill is intentionally not invoked.

## Risks / Trade-offs

- [Risk] 20 components in one change is broad → Mitigation: strict presentational scope per component, shared test patterns, grouped tasks; no product composition to balloon review.
- [Risk] Hand-rolled Dialog/Dropdown/Tabs miss edge-case a11y behavior a primitive library would provide → Mitigation: tests cover focus trap, Escape, arrow-key navigation, outside dismissal, and aria attributes; Base UI adoption remains an explicit later option.
- [Risk] Dark-only theme ossifies → Mitigation: semantic token names (`surface`, `ink`, `ascent`) rather than literal color names, documented as the single extension point.
- [Risk] `motion` bundle cost for micro-motion → Mitigation: import from `motion/react`, animate transform/opacity only, lazy/reward-scoped usage; build output reviewed for size regression.

## Open Questions

None. All scope, dependency, and boundary decisions are resolved above and in the spec non-goals.
