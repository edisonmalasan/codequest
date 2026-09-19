## Context

See `proposal.md` (Why) for motivation and `specs/frontend-foundation/spec.md` for the behavior contract. Current state: Next.js 15 App Router with React 19, TypeScript strict, ESLint + Prettier, Vitest (node environment, `src/**/*.test.ts`), a placeholder page, and a `getApiBaseUrl` helper with tests. No styling, state, data, persistence, or editor layers exist. Constraints: AGENTS.md boundaries (no backend logic in frontend, no direct table access, no `frontend/src/lib/api/generated/` hand-edits, no speculative shared packages), approved P08 local-draft/outbox vocabulary, and the repository-foundation command/CI contract that must stay green.

## Goals / Non-Goals

**Goals:**

- Establish the styling, provider, state, persistence-skeleton, and editor-proof layers once, wired and tested.
- Leave Phase 4+ seams obvious: `styles/` tokens, `components/ui/` + `components/game/` shells, `features/*` domain shells, `pwa/` shell.
- Keep every check (`lint`, `typecheck`, `test`, `build`) passing on first merge.

**Non-Goals:**

- No visual design language (tokens beyond neutrals + base radius, no components, no pixel art, no motion) — Phase 4 owns it.
- No service worker, manifest, install prompts, or offline caching — Phase 26 owns it.
- No auth session handling, API calls, curriculum parsing, execution, validation, or reward logic — Phases 5+ own them.
- No Testing Library user-event flows or Playwright coverage — no user-critical flows exist yet (Phase 34).

## Decisions

- **Tailwind CSS v4 (`@tailwindcss/postcss`) over v3**: v4's CSS-first `@import "tailwindcss"` + `@theme` tokens match the "tokens file Phase 4 builds on" goal with no config-file API to migrate later. Alternative (v3 + `tailwind.config.js`) considered; rejected because it adds a config layer v4 makes unnecessary and the repo has no existing Tailwind investment.
- **shadcn-ready utility without components**: install `clsx` + `tailwind-merge` + `class-variance-authority` and ship only `lib/cn.ts`. Installing full shadcn/Base UI primitives now would land Phase 4 components prematurely; shipping just `cn()` keeps the exact import path (`@/lib/cn`) Phase 4 components will expect.
- **Defer `motion` and `serwist` installs**: both are unused-code risks today (animation rules are Phase 4; PWA registration is Phase 26). Dependencies are added when their owning phase lands, not on roadmap mention alone.
- **TanStack Query + Zustand + Dexie, each at skeleton depth**: `lib/query-client.ts` (single `QueryClient` factory with conservative defaults, no fetchers), `stores/app-store.ts` (minimal UI-state primitive proving the Zustand pattern, no domain state), `lib/db.ts` (Dexie `drafts` + `outbox` tables with `ownerId` compound indexes, no sync logic). Alternatives (React context only, raw IndexedDB) rejected: Query/Zustand/Dexie are the approved stack and their patterns must exist before domain phases copy them.
- **CodeMirror via `@codemirror/state/view` + `lang-javascript` directly, client-only**: a thin `components/editor/code-editor.tsx` (`'use client'`) mounting an `EditorView` in an effect with `onChange` propagation and disposal on unmount. Alternative (`@uiw/react-codemirror` wrapper) rejected: it hides the view lifecycle Phase 13's workspace must own, and adds an abstraction the team did not approve.
- **Vitest `jsdom` only for render tests**: keep the default node environment for unit tests; add a `*.test.tsx` include scoped to a jsdom project (or a second config section) so provider/editor smoke tests render without dragging jsdom into every unit test. `@testing-library/react` added as a dev dependency for these smoke tests only.
- **Feature-domain shells as tracked empty dirs (`.gitkeep`)**: satisfies the roadmap structure requirement with zero speculative code; each domain phase replaces its shell with real modules.

## Risks / Trade-offs

- [Risk] Tailwind v4 PostCSS integration breaks `next build` on CI → Mitigation: verify `pnpm build` locally and rely on the required CI build gate before merge; PostCSS plugin wiring is the only build-config surface added.
- [Risk] Dexie schema choices ossify before the sync design (F03) → Mitigation: tables carry only identity/ownership/payload-version fields plus a `schemaNote` comment marking them provisional; sync/merge logic explicitly excluded and stated in spec non-goals.
- [Risk] Minimal `app-store` invites domain-state sprawl → Mitigation: store holds only foundation-level UI state with a doc comment pointing domain state to `features/*` phases; reviewers enforce via the boundary scenario.
- [Risk] CodeMirror client-only mount causes SSR/hydration mismatch → Mitigation: dynamic import with `ssr: false` (or mount-guard) in the proof component; the placeholder page does not render the editor, so initial routes stay server-rendered.
