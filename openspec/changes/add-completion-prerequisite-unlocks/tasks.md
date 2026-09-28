# Tasks

## 1. Shared prerequisite authority

- [ ] 1.1 Extract current-equivalent completion policy for progress and learning; verify unit tests for active, approved compatible, incompatible, missing, and cyclic transitions.
- [ ] 1.2 Gate new attempts, starts, and hints on owner-bound current published prerequisites while preserving exact replay; verify synthetic multi-quest integration tests for locked, unlocked, incompatible, replay, and cross-owner cases.

## 2. Derived availability API

- [ ] 2.1 Extend protected quest/chapter/Journey/Course progress DTOs with availability and published unmet-prerequisite explanations; verify multi-quest service/API tests for hierarchy, empty scope, owner isolation, and alias equivalence.
- [ ] 2.2 Document the P09 completion prerequisite rule, version compatibility, and F08 deferrals in curriculum/gamification/API docs; verify examples match tests.

## 3. Trusted map presentation

- [ ] 3.1 Regenerate the OpenAPI client and present authenticated backend availability/explanations in the Journey map while keeping guest states provisional; verify typed client, map, and page tests for locks, failures, and current cue.
- [ ] 3.2 Ensure locked nodes are non-interactive and prerequisite explanations are readable and accessible; verify focused component tests and existing responsive/keyboard coverage.

## 4. Integration verification

- [ ] 4.1 Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm api:check`, and strict OpenSpec validation; review the complete Apply diff and CI results.
