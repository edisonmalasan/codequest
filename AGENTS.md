# AGENTS.md

## Project overview

CodeQuest is a pixel-themed, game-like coding education platform for learning, practicing, building, and eventually using modern AI-assisted development workflows. The repository contains two applications: `frontend/` is the Next.js Web/PWA client and `backend/` is the NestJS authoritative application API. Keep the backend as a modular monolith until a concrete scaling or security requirement justifies extraction.

--

## Stack

- Language: TypeScript
- Frontend: Next.js, React, Tailwind CSS, shadcn/ui + Base UI, Motion, CodeMirror 6, TanStack Query, Zustand, Dexie, Serwist
- Backend: NestJS, Fastify, REST, OpenAPI, Drizzle ORM
- Data/Auth/Storage: PostgreSQL via Supabase, Supabase Auth, Supabase Storage
- Testing: Vitest, Testing Library, Playwright
- Ops: pnpm workspace, Turborepo, GitHub Actions, PostHog, Sentry
- Execution: JavaScript Web Workers; sandboxed iframe for web previews; Pyodide later; isolated remote runners later

--

## Setup & commands
These are the repository command contract. Keep the root `package.json` scripts aligned with them and remove/update any command that no longer works.

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

Application-specific checks:
```bash
pnpm --dir frontend test
pnpm --dir frontend lint
pnpm --dir frontend typecheck
pnpm --dir backend test
pnpm --dir backend lint
pnpm --dir backend typecheck
```

Verified Phase 1 prototype single-test command (run from prototypes/technical-risk-validation/): corepack pnpm@10.30.3 exec vitest run src/mock.test.ts. The disposable prototype has its own manifest; root application commands remain unavailable until separately authorized repository foundation work.

--

## Architecture boundaries
- `frontend/` owns UI, routing, PWA behavior, IndexedDB, CodeMirror, browser-safe execution, local drafts, and API consumption.
- `backend/` owns business rules, authorization, database access, curriculum, submissions, progress, gamification, AI orchestration, remote execution orchestration, and integrations.
- Frontend and backend communicate only through the documented REST/OpenAPI contract.
- Frontend must not import backend source; backend must not import frontend source.
- Frontend must not directly read or mutate CodeQuest application tables.
- Backend curriculum lives under `backend/content/`; frontend consumes it through the API.
- Generated API client code lives under `frontend/src/lib/api/generated/`.
- Do not create root shared packages unless at least two real independent consumers justify extraction.
- Never execute arbitrary learner code inside the NestJS process.

--

## Code style
- TypeScript strict mode; do not add `any`, `@ts-ignore`, or unchecked casts to bypass type errors.
- Prefer domain-oriented names and small explicit functions over generic helpers.
- Imports stay within the owning application/module; do not reach across architectural boundaries.
- Handle errors explicitly; never swallow failures.

```ts
const quest = await questRepository.findById(questId);
if (!quest) throw new QuestNotFoundError(questId);
```

- Remove dead code, unused imports, debug logs, commented-out implementations, and temporary compatibility shims before finishing.

--

## Testing
- Bug fixes require a regression test when practical.
- New backend rules/endpoints require unit or integration coverage.
- Changes to execution, validation, progress, XP, streaks, unlocks, auth, or offline sync require focused tests.
- User-critical flows require Playwright coverage where practical.
- Run `pnpm test`, `pnpm lint`, and `pnpm typecheck` before finishing.
- Do not claim a check passed unless it was actually run.
- If a required check cannot run, report the exact command and reason.

--

## Boundaries — do not touch
- Never commit `.env`, `.env.*`, secrets, credentials, tokens, or service-role keys.
- Never hand-edit `frontend/src/lib/api/generated/`; regenerate it from backend OpenAPI.
- Never rewrite an already-applied database migration; create a new migration.
- Never manually edit generated OpenSpec skills under `.agents/skills/`.
- Do not move backend business logic into Next.js Route Handlers or Server Actions.
- Do not add microservices, Redis, queues, GraphQL, tRPC, WebContainers, or remote runners unless the active spec explicitly requires them.

--

## Change scope
- Make the smallest coherent change that satisfies the task/spec.
- Do not perform unrelated refactors or modify unrelated files.
- Do not upgrade dependencies without a task-specific reason.
- Do not rename/reorganize code unless required.
- Preserve existing behavior unless the active requirement changes it.
- Prefer adding to an existing module over inventing a new architectural layer.

--

## Git / PR workflow

`main` is the integration branch. Never perform planned work directly on `main`.

Every repository-mutating OpenSpec stage must use a remote branch and PR. Local-only working branches are not allowed.

### Branch naming

Branch names describe the technical work, not the raw OpenSpec change name.

- Proposal/docs: `docs/<technical-scope>-proposal`

- Feature: `feat/<technical-scope>`

- Fix: `fix/<technical-scope>`

- Refactor: `refactor/<technical-scope>`

- Tests/validation: `test/<technical-scope>`

- Technical spike: `spike/<technical-scope>`

- Spec sync: `docs/<technical-scope>-spec-sync`

- Archive: `chore/archive-<technical-scope>`

Examples:

- `docs/browser-runtime-validation-proposal`

- `spike/browser-runtime-containment`

- `feat/quest-progress-api`

- `fix/duplicate-xp-award`

- `docs/browser-runtime-spec-sync`

- `chore/archive-browser-runtime-validation`

Do not use the OpenSpec change ID as the branch name unless it is also the clearest technical description.

### Branch lifecycle

Before starting any repository-mutating stage:

1. Check `git status`.

2. Switch to `main`.

3. Pull the latest `origin/main`.

4. Create a new branch from the updated `main`.

5. Immediately push the new branch to `origin` and set upstream tracking.

6. Only then begin modifying files.

Never leave active repository work only on a local branch.

Recommended pattern:

    git switch main

    git pull --ff-only origin main

    git switch -c <branch-name>

    git push -u origin <branch-name>

### OpenSpec Git lifecycle

#### Explore

`/openspec-explore` is normally read-only.

If no repository files change, no branch or PR is required.

If exploration intentionally modifies tracked documentation, treat it as a normal repository-mutating stage and use a branch + PR.

#### Propose

For `/openspec-propose`:

1. Start from updated `main`.

2. Create a technical proposal branch such as `docs/<scope>-proposal`.

3. Immediately push the branch to `origin`.

4. Create/update the OpenSpec proposal, design, specs, tasks, and roadmap status.

5. Review the diff.

6. Commit using Conventional Commits.

7. Push all proposal commits to the remote branch.

8. Open a PR into `main`.

9. After required checks, merge the PR using a **merge commit**.

10. Delete the merged local and remote branch.

11. Return to `main` and pull the merged result before starting Apply.

Proposal artifacts should be committed and pushed before merge so the exact remote PR diff can be reviewed.

Do not reuse the proposal branch for Apply.

#### Apply

For `/openspec-apply-change`:

1. Ensure the approved proposal PR has already been merged.

2. Return to `main`.

3. Pull the latest `origin/main`.

4. Create a new implementation branch from `main`.

5. Immediately push the new branch to `origin`.

6. Apply only the approved OpenSpec tasks.

7. Commit coherent implementation steps using Conventional Commits.

8. Push commits regularly to the remote branch.

9. Run all required verification.

10. Review the final diff and test results.

11. Open or update the PR into `main`.

12. Merge only after required checks pass.

13. Merge using a **merge commit**.

14. Delete the merged local and remote branch.

15. Return to updated `main`.

Do not reuse the proposal branch for Apply.

Do not begin Sync or Archive from an unmerged Apply branch.

#### Sync

If `/openspec-sync` modifies repository files:

1. Ensure the Apply PR has already been merged.

2. Return to `main` and pull latest `origin/main`.

3. Create `docs/<scope>-spec-sync`.

4. Immediately push it to `origin`.

5. Run the approved OpenSpec sync.

6. Review the diff.

7. Commit using Conventional Commits.

8. Push the commit(s).

9. Open a PR into `main`.

10. Stop for review if the sync changes meaningful specification content.

11. Merge using a **merge commit** after review/checks.

12. Delete the local and remote branch.

13. Return to updated `main`.

Skip this stage when no spec synchronization is required.

#### Archive

For `/openspec-archive`:

1. Archive only after Apply and any required Sync are merged.

2. Return to `main`.

3. Pull latest `origin/main`.

4. Create `chore/archive-<technical-scope>`.

5. Immediately push the branch to `origin`.

6. Run the OpenSpec archive workflow.

7. Update Project Status, roadmap references, and archive links where required.

8. Review the diff.

9. Commit using Conventional Commits.

10. Push the archive commit(s).

11. Open a PR into `main`.

12. Merge only after review/checks pass.

13. Merge using a **merge commit**.

14. Delete the local and remote branch.

15. Return to `main` and pull latest `origin/main` before beginning the next roadmap phase.

### Commit conventions

Use Conventional Commits:

- `feat:` new product capability

- `fix:` bug fix

- `refactor:` behavior-preserving restructuring

- `test:` tests or technical validation

- `docs:` documentation/specification

- `chore:` repository/tooling/archive maintenance

Examples:

- `docs: propose browser runtime validation`

- `test: add worker containment probes`

- `feat: add quest progress endpoint`

- `fix: prevent duplicate xp awards`

- `docs: sync runtime validation requirements`

- `chore: archive browser runtime validation`

Keep commits coherent and scoped.

Do not bundle unrelated changes into one commit.

### PR / merge conventions

- Every Propose, Apply, Sync, and Archive stage that changes repository files must go through a PR into `main`.

- Never silently commit completed stage work directly to `main`.

- Keep one coherent OpenSpec stage per branch.

- Open the PR from the remote branch, not from local-only work.

- Use **merge commits only** for OpenSpec and development PRs.

- Do **not** squash merge.

- Do **not** rebase merge.

- Preserve branch topology and individual branch commits in Git history.

- When using GitHub CLI, merge with:

    gh pr merge <PR_NUMBER> --merge --delete-branch

- Do not use:

    gh pr merge <PR_NUMBER> --squash

or:

    gh pr merge <PR_NUMBER> --rebase

- Do not replace the default GitHub merge-commit title unless there is a specific reason.

- Prefer preserving the normal GitHub merge message, for example:

    Merge pull request #123 from owner/feat/quest-progress-api

- Delete local and remote branches only after the PR has successfully merged.

- The PR and merge commit are the permanent historical record after branch deletion.

- Never begin the next OpenSpec stage from an unmerged branch.

- After every merge, switch back to `main` and update it from `origin/main` before creating the next branch.

### Expected OpenSpec branch flow

For one OpenSpec change, the normal flow is:

    main

      │

      ├── docs/<scope>-proposal

      │      ↓ push remote immediately

      │      ↓ /openspec-propose

      │      ↓ commit + push

      │      ↓ PR

      │      ↓ merge commit

      │

      ├── feat|spike|test/<scope>

      │      ↓ push remote immediately

      │      ↓ /openspec-apply-change

      │      ↓ implementation

      │      ↓ verification

      │      ↓ commit + push

      │      ↓ PR

      │      ↓ merge commit

      │

      ├── docs/<scope>-spec-sync

      │      ↓ only if sync is required

      │      ↓ /openspec-sync

      │      ↓ PR

      │      ↓ merge commit

      │

      └── chore/archive-<scope>

             ↓ /openspec-archive

             ↓ update roadmap/status

             ↓ PR

             ↓ merge commit

             ↓ delete branch

             ↓ return to updated main

### Git safety

- Check `git status` before significant work.

- Inspect `git diff` before every commit.

- Inspect the final diff before opening a PR.

- Never discard existing user changes.

- Never force-push unless explicitly authorized.

- Never use destructive Git operations unless explicitly authorized.

- Never rewrite history unless explicitly authorized.

- Never merge a PR with failing required checks unless explicitly authorized.

- Never claim a branch was pushed, a PR was opened, or a merge occurred unless it actually happened.

--

## Source of truth

When deciding behavior, use this order:

1. Explicit user/task requirements
2. Approved OpenSpec change/spec
3. Existing architecture and behavior
4. Tests
5. Repository documentation
6. Agent assumptions

When sources conflict, do not silently invent a resolution.

--

## Existing / brownfield work
- Inspect the relevant implementation before changing it.
- Read the relevant OpenSpec spec and check `openspec/changes/` for an active change.
- Continue an existing relevant change instead of creating a duplicate.
- Understand current behavior before redesigning it.
- Do not rewrite working systems merely because they are unfamiliar.

--

## Spec-driven development (OpenSpec)

This project uses OpenSpec for nontrivial changes.

openspec/
├── config.yaml
├── specs/
└── changes/

- `openspec/specs/` defines current agreed behavior; read the relevant spec before changing a capability.
- `openspec/changes/` holds in-flight changes; implementation must follow the active change.
- If no relevant change exists for nontrivial work, create one before implementation.
- Do not silently diverge from an active change; update its artifacts when requirements/design/tasks change.
- Do not expand a change with unrelated work.
- Use installed OpenSpec workflows: Explore → Propose → Apply → Verify → Sync → Archive.
- Explore is for investigation, not permission to implement.
- Use `/opsx:update` when planning artifacts need revision and `/opsx:sync` when approved specs should update the main spec set.
- Use the OpenSpec archive workflow rather than manually moving files.
- Regenerate OpenSpec AI instructions with `openspec update`; never hand-edit generated `.agents/skills/`.
- Durable project engineering rules belong here; OpenSpec capability behavior belongs in OpenSpec.

--

## Multi-agent development
- Determine file/module ownership before editing.
- Avoid multiple agents modifying the same files unless intentionally coordinated.
- Respect dependency order; do not parallelize dependent work just for speed.
- Review upstream agent output before building dependent work on top of it.
- Use OpenSpec artifacts as the shared plan and source of truth.
