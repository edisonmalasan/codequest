# R05 Course discovery verification

**Review dates:** 2026-10-02 to 2026-10-03 (Asia/Manila). **Status:** technical implementation and local integration verified; founder acceptance open. This local result is not a beta release candidate or hosted evidence.

**Visual revision:** The founder requested a broader frontend redesign after this original R05 record. The original implementation and screenshots remain historical evidence. The revised Home, catalog, Journey, and Course views are linked from [frontend visual refresh verification](frontend-visual-refresh-verification.md). Founder acceptance must be recorded against the revised implementation and environment; the earlier R05 visual review request does not count as acceptance of the revised build.

## Identity and publication review

The migration places the existing Foundations content beneath one stable Course (`COURSE-JS-FOUNDATIONS`). It retains the Journey ID, seven Chapter IDs, 25 Quest IDs, and selected content/assessment versions. Against the pre-Apply `origin/main` tree, all 25 Quest manifest IDs match and all 104 relocated immutable snapshot files have identical Git blob hashes. The history guard allows only this exact byte-identical path relocation; changed relocated bytes fail its regression test. The backend content validator and public API expose one reviewed Course with seven chapters and 25 exercises. An authored draft Course is excluded from publication and public reads.

The legacy `/api/v1/courses/:slug` Journey alias remains available. New Course collection/detail and owner-scoped Course progress use `/api/v1/catalog/courses`. Accepted learning, XP, streak and unlock authority remains bound to stable Quest facts and backend version policy. No migration or mutable Course progress authority was added.

## Local integrated review

The real local Next.js development server and NestJS process served the public catalog and Course map using the configured scoped local environment. The backend health endpoint returned 200; the published Course list returned one Course with seven chapters and 25 exercises. Browser coverage follows Home to catalog to Journey to Course to Exercise, exercises a failed catalog request and retry, and checks narrow reflow and keyboard navigation. Local browser screenshots:

| View                | Desktop                                              | Mobile                                             |
| ------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| Published catalog   | [Desktop](frontend-evidence/r05-catalog-desktop.png) | [Mobile](frontend-evidence/r05-catalog-mobile.png) |
| Foundations Journey | [Desktop](frontend-evidence/r05-journey-desktop.png) | Not captured                                       |
| Foundations Course  | [Desktop](frontend-evidence/r05-course-desktop.png)  | [Mobile](frontend-evidence/r05-course-mobile.png)  |

Course progress for an account is displayed only after a complete owner-scoped protected response. Guest records are labeled device-local and provisional. Failed protected reads show unavailable status without claiming an accepted completion or unlock.

## Gate status

| Gate                                                | Result                                                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Technical implementation and automated verification | Passed on Apply PR #194; exact local command results below                                                    |
| Local integrated public discovery path              | Passed on the local app/API pair; no real Auth claim                                                |
| Founder visual/navigation acceptance for R05        | **OPEN** — founder review of this exact implementation and screenshots is required                  |
| Real email and OAuth integration (R04)              | **OPEN** — controlled synthetic inbox/provider identities and configured providers were unavailable |
| Phase 38 release readiness                          | **PAUSED / NO GO**; no beta release candidate selected                                              |

## Command record

These are the recorded Apply command results. A passing automated command is evidence of technical behavior, not founder acceptance.

| Command                                                           | Result                                                                                                                                                                      |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --dir backend curriculum:validate`                          | PASS; immutable history valid                                                                                                                                               |
| `pnpm api:check`                                                  | PASS                                                                                                                                                                        |
| `pnpm exec openspec validate establish-course-discovery --strict` | PASS                                                                                                                                                                        |
| `pnpm lint`                                                       | PASS                                                                                                                                                                        |
| `pnpm typecheck`                                                  | PASS                                                                                                                                                                        |
| `pnpm --dir frontend test`                                        | PASS, 425 tests                                                                                                                                                             |
| `pnpm --dir backend test`                                         | PASS, 207 Vitest tests plus 7 Node tests                                                                                                                                    |
| `pnpm build`                                                      | PASS                                                                                                                                                                        |
| `pnpm --dir frontend test:e2e`                                    | PASS, 22 browser tests across Chromium, Firefox and WebKit                                                                                                                  |
| Chromium accessibility browser suite                              | PASS, 3 browser tests                                                                                                                                                       |
| `pnpm test`                                                       | PASS on final rerun: 425 frontend tests, 207 backend Vitest tests and 7 Node tests. The earlier parallel timing failure passed when rerun alone and in this final root run. |

The approved specifications were synchronized in PR #195 and the completed OpenSpec change was archived. Both PRs passed required CI. The R05 founder visual/navigation gate remains open.
