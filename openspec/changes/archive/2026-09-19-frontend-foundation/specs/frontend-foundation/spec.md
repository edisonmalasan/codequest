## Purpose

The Next.js application foundation that every later CodeQuest frontend phase builds on: approved directory structure, styling/theme base, composed data and client-state providers, an owner-isolated local-persistence skeleton, and an editor proof-of-render.

## ADDED Requirements

### Requirement: Approved frontend directory structure exists

The repository SHALL provide the approved Phase 3 base structure under `frontend/src/`, including `app/`, `features/` (with `auth`, `curriculum`, `learning`, `editor`, `progress`, `gamification`, `projects`, `profile` domain shells), `components/ui/`, `components/game/`, `lib/`, `hooks/`, `stores/`, `pwa/`, and `styles/`.

#### Scenario: Structure inspection

- **WHEN** the `frontend/src/` tree is inspected
- **THEN** each required directory exists and feature-domain shells contain no domain logic that belongs to later phases

### Requirement: Global styling and theme base renders

The frontend SHALL apply global styles with theme tokens (CSS variables) from a single styles entry imported by the root layout, so later phases can build the Phase 4 design system on it without restructuring.

#### Scenario: Themed placeholder page

- **WHEN** the root route renders
- **THEN** global styles and theme tokens are applied and the page displays readable content with no unstyled flash caused by missing style wiring

### Requirement: Shared class-name utility is available

The frontend SHALL expose a single class-name composition utility that merges conditional classes and resolves Tailwind conflicts deterministically.

#### Scenario: Conflicting classes resolve deterministically

- **WHEN** the utility is called with conflicting Tailwind classes
- **THEN** the later conflicting class wins and conditional falsy inputs are ignored

### Requirement: Data and client-state providers compose at the root

The frontend SHALL compose its data-fetching provider (TanStack Query) and client-state primitive (Zustand) through a single `AppProviders` boundary wired into the root layout, with no network calls, no auth flows, and no domain state at this stage.

#### Scenario: Providers initialize on page render

- **WHEN** the root layout renders
- **THEN** the query client is instantiated once per app instance and client components can read shared client state without prop drilling

### Requirement: Local-persistence skeleton isolates owners and drafts from outbox

The frontend SHALL provide an IndexedDB-backed local database skeleton with separate `drafts` (editor source keyed by owner and quest) and `outbox` (pending submission snapshots with stable event IDs) tables, enforcing owner isolation fields with no sync, merge, or acceptance logic.

#### Scenario: Drafts and outbox stay separated per owner

- **WHEN** drafts and outbox records are written for two different owners
- **THEN** queries scoped to one owner never return the other owner's records and outbox entries retain stable unique event IDs

### Requirement: Editor proof-of-render works without workspace behavior

The frontend SHALL provide a minimal code-editor component that renders editable source with syntax highlighting and reports value changes, without toolbar, file tabs, console, persistence, execution, or validation behavior.

#### Scenario: Learner edits source

- **WHEN** source is typed into the editor
- **THEN** the change callback fires with the updated value and the editor remains mounted with no exception

### Requirement: Foundation is verified by automated checks

The frontend SHALL verify every foundation module (utility, providers, store, database skeleton, editor) with automated tests, and `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` SHALL pass.

#### Scenario: Full check suite gates the change

- **WHEN** install, lint, typecheck, tests, and the production frontend build run
- **THEN** each completes with a zero exit code and every foundation test passes

### Requirement: Phase 4+ boundaries are not leaked into

The change SHALL NOT introduce design-system components, PWA registration, auth flows, curriculum content or business logic, execution runtimes, validation, progress/XP/streak/unlock logic, telemetry product logic, or backend changes.

#### Scenario: Boundary review

- **WHEN** the final diff is reviewed
- **THEN** no files exist under `backend/`, no service worker is registered, no network or auth code paths are added, and `components/ui/`, `components/game/`, `features/*`, and `pwa/` contain no functional components, logic, or registrations beyond structural shells
