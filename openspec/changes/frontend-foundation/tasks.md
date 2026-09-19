## 1. Dependencies and structure

- [ ] 1.1 Add approved frontend dependencies (tailwindcss, @tailwindcss/postcss, clsx, tailwind-merge, class-variance-authority, lucide-react, @tanstack/react-query, zustand, dexie, @codemirror/state, @codemirror/view, @codemirror/lang-javascript) plus @testing-library/react + jsdom dev tooling, and verify `pnpm --dir frontend install` succeeds
- [ ] 1.2 Create the approved `frontend/src/` directory structure (features domain shells with .gitkeep, components/ui, components/game, lib, hooks, stores, pwa, styles) and verify the tree matches the spec structure scenario

## 2. Styling and shared utility

- [ ] 2.1 Add Tailwind v4 global styles with theme tokens (`styles/globals.css` imported by the root layout) and verify the production build emits styles with no unstyled-flash wiring gap
- [ ] 2.2 Add the `cn()` class-name utility (`lib/cn.ts`) with unit tests proving deterministic Tailwind-conflict resolution, and verify `pnpm --dir frontend test` passes

## 3. Providers and client state

- [ ] 3.1 Add the QueryClient factory (`lib/query-client.ts`) and `AppProviders` composition (`app/providers.tsx`) wired into the root layout, and verify a render smoke test proves single instantiation and state readability
- [ ] 3.2 Add the minimal Zustand client-state primitive (`stores/app-store.ts`) with unit tests, and verify tests prove isolated state updates without domain state

## 4. Persistence skeleton and editor proof

- [ ] 4.1 Add the Dexie database skeleton (`lib/db.ts` with owner-isolated `drafts` and `outbox` tables, stable event IDs) with unit tests proving per-owner isolation, and verify tests pass without any sync logic present
- [ ] 4.2 Add the minimal CodeMirror proof component (`components/editor/code-editor.tsx`, client-only, onChange + disposal) with a render/change smoke test, and verify the editor stays mounted with no exception and no SSR/hydration error in build

## 5. Verification and status

- [ ] 5.1 Run the full foundation gate (`pnpm --dir frontend lint`, `typecheck`, `test`, `build`, plus root `pnpm lint/typecheck/test/build`) and verify every command exits zero
- [ ] 5.2 Update `docs/DEVELOPMENT_ROADMAP.md` Project Status to Phase 3 active with this change referenced, review the final diff for Phase 4+ boundary leaks, and verify `openspec validate frontend-foundation --strict` passes
