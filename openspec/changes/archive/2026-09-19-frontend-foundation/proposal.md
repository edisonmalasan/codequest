## Why

Phase 2 delivered a bootable but bare Next.js shell (placeholder page, no styling, state, data, persistence, or editor layers). Every later product phase (design system, curriculum UI, editor workspace, PWA/offline) builds on the frontend foundation, so Phase 3 must install and wire the approved client stack once, in a minimal verifiable form, before any domain or visual-system work begins.

## What Changes

- Install the Phase 3 client stack justified by `docs/frontend.md`, `docs/architecture.md`, and the roadmap: Tailwind CSS (styling foundation), `clsx` + `tailwind-merge` + `class-variance-authority` (shadcn-ready `cn()` utility only, no component library), `lucide-react` (icons), `@tanstack/react-query` (API-consumption async state), `zustand` (client state), `dexie` (IndexedDB drafts/outbox skeleton per P08), and minimal CodeMirror 6 packages (editor proof-of-render only).
- Explicitly defer to their owning phases: `motion` and full shadcn/Base UI component set (Phase 4 design system), `serwist`/service worker/manifest (Phase 26 PWA), Testing Library already covered by Vitest unit scope — component render tests use Vitest + Testing Library only where needed, Playwright flows (Phase 34), and all backend-domain, auth-flow, curriculum, execution, validation, and gamification logic (Phases 5+).
- Create the approved base directory structure under `frontend/src/`: `app/`, `features/` (eight domain shells: `auth`, `curriculum`, `learning`, `editor`, `progress`, `gamification`, `projects`, `profile`), `components/ui/`, `components/game/`, `lib/`, `hooks/`, `stores/`, `pwa/`, `styles/`.
- Add foundation modules only: theme tokens + global styles, `cn()` utility, composed `AppProviders` (Query client) wired into the root layout, a minimal `CodeEditor` proof component (render + value change, no workspace/toolbar/persistence), a Dexie database skeleton (owner-isolated `drafts` and `outbox` tables, no sync logic), and a minimal client store primitive.
- Add unit tests for each foundation module and a render smoke test for providers/editor; keep `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` green.
- Update `docs/DEVELOPMENT_ROADMAP.md` Project Status to mark Phase 3 active with this change as the current OpenSpec change.

## Capabilities

### New Capabilities

- `frontend-foundation`: Next.js application foundation — approved directory structure, styling/theme base, provider composition (TanStack Query), client-state primitive (Zustand), local-persistence skeleton (Dexie drafts/outbox), and editor proof-of-render (CodeMirror). Includes dependency, structure, wiring, and verification requirements plus explicit non-goals guarding Phase 4+ boundaries.

### Modified Capabilities

- None. `repository-foundation` requirements (workspace layout, command contract, boot proof, static checks, CI) are unchanged; this change builds on top of them.

## Impact

- Affected code: `frontend/` only (`package.json`, `src/` structure, root layout). No `backend/` changes, no API contract changes, no database, no generated client.
- Dependencies: adds Tailwind, lucide-react, TanStack Query, Zustand, Dexie, CodeMirror 6 view/state/lang-javascript, clsx/tailwind-merge/cva, and test-render tooling to `frontend/package.json`.
- Systems: none operational — no PWA registration, no network calls, no auth flows, no telemetry.
