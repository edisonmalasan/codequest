# Frontend visual refresh verification

**Implementation commits:** `b32d5e6` and `2899514` on `feat/frontend-visual-redesign`, merged as PR #199 at `2a7e33e`. **Local environment:** Windows, Node `26.10.0`, Next.js development server at `http://localhost:3000`, local backend at `http://127.0.0.1:3001`, Chromium browser capture on 2026-10-03. The public-route images show the actual published curriculum response and use no learner account. They are implementation review evidence, not founder acceptance or a hosted release candidate.

## Screens to review

| View             | Desktop                                                      | Narrow                                                        |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| Home             | [1440 px](frontend-evidence/visual-refresh-home-1440.png)    | [390 px](frontend-evidence/visual-refresh-home-390.png)       |
| Home tablet      | [820 px](frontend-evidence/visual-refresh-home-820.png)      | —                                                             |
| Catalog          | [1440 px](frontend-evidence/visual-refresh-catalog-1440.png) | [390 px](frontend-evidence/visual-refresh-catalog-390.png)    |
| Journey          | [1440 px](frontend-evidence/visual-refresh-journey-1440.png) | —                                                             |
| Course map       | [1440 px](frontend-evidence/visual-refresh-course-1440.png)  | [390 px](frontend-evidence/visual-refresh-course-390.png)     |
| Published lesson | [1440 px](frontend-evidence/visual-refresh-lesson-1440.png)  | [390 px](frontend-evidence/visual-refresh-lesson-390.png)     |
| Login            | [1440 px](frontend-evidence/visual-refresh-login-1440.png)   | [390 px](frontend-evidence/visual-refresh-login-390.png)      |
| Account fixture  | [1440 px](frontend-evidence/visual-refresh-account-1440.png) | [390 px](frontend-evidence/visual-refresh-account-390.png)    |
| Onboarding       | —                                                            | [390 px](frontend-evidence/visual-refresh-onboarding-390.png) |
| Local feedback   | —                                                            | [390 px](frontend-evidence/visual-refresh-feedback-390.png)   |
| Offline library  | —                                                            | [390 px](frontend-evidence/visual-refresh-offline-390.png)    |
| Shared error     | [1440 px](frontend-evidence/visual-refresh-error-1440.png)   | [390 px](frontend-evidence/visual-refresh-error-390.png)      |

Home captures were taken after the published Journey link loaded. The account captures use a local synthetic Auth fixture and intercepted owner-scoped API responses; their `example.test` email, player ID, XP, and streak are fixtures rather than account facts. The error captures render the production shared error component through a temporary synthetic route that was removed after capture. A development indicator from Next.js may appear in screenshots; it is not product UI. No protected source, token, or response body appears in these files.

## Checks run

| Check                                                                                   | Result                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                                             | Passed; frontend and backend.                                                                                                                                                                                     |
| `pnpm typecheck`                                                                        | Passed; frontend and backend.                                                                                                                                                                                     |
| `pnpm test`                                                                             | Passed on clean rerun: 207 backend tests and 426 frontend tests. An earlier concurrent run had two timing-sensitive workspace failures; the affected test passed in isolation and the full suite passed on rerun. |
| `pnpm build`                                                                            | Passed; backend and frontend.                                                                                                                                                                                     |
| `pnpm --dir frontend test:accessibility`                                                | Passed: 12 tests across Chromium, Firefox, WebKit, and mobile Chromium after updating the Home navigation assertion.                                                                                              |
| `pnpm --dir frontend exec playwright test e2e/home-shell.spec.ts --project=chromium`    | Passed: 5 tests.                                                                                                                                                                                                  |
| `pnpm --dir frontend exec playwright test e2e/journey.spec.ts --project=chromium`       | Passed: 2 tests.                                                                                                                                                                                                  |
| `pnpm --dir frontend exec playwright test e2e/auth.spec.ts --project=chromium`          | Passed: 3 tests. These verify local route behavior, not real provider configuration.                                                                                                                              |
| `pnpm --dir frontend exec playwright test --config playwright.visual-account.config.ts` | Passed: 1 synthetic account visual/ownership fixture without backend database writes.                                                                                                                             |
| PR #199 `ci / verify`                                                                   | Passed on 2026-10-03. The controlled GitHub Actions job includes `pnpm --dir frontend test:learning` and `test:curriculum`. The local mutating learning suite was not run against the configured remote database. |
| `openspec validate reimagine-codequest-frontend-visuals --strict`                       | Passed.                                                                                                                                                                                                           |
| `openspec validate compose-integrated-learning-shell --strict`                          | Passed.                                                                                                                                                                                                           |
| `openspec validate --all --strict`                                                      | 43 passed, 1 failed: the existing canonical `journey-course-ui` requirement warning lacks SHALL/MUST. This is present on `main` and is outside this visual change.                                                |

Local Chromium route scans at 320, 390, 820, and 1440 CSS pixels found no page-level horizontal overflow on login, onboarding, feedback, offline library, or the published lesson. Home, catalog, Journey, and Course were also checked at their captured widths; their visible original images loaded. The 820 px Home and controlled shared-error captures at 1440 and 390 px also had no horizontal overflow. The error fixture returned HTTP 200 with the expected heading and no page errors; its temporary route was removed. Page-error listeners reported no errors during the captured public routes. The mobile menu's Escape/focus behavior and locked Course row semantics were checked in the browser. Reduced-motion mode was used for captures and the accessibility suite covers reduced motion and reflow. These are browser checks, not physical-device or assistive-technology evidence.

## Open evidence and gates

- The account, guest import, and pending-work composition has focused state tests and controlled browser captures. The local checkout still has no isolated `DATABASE_TEST_URL`; its configured database is remote. The mutating `test:learning` suite was not run against that remote database; it passed in PR #199's controlled CI environment.
- R05 revised visual acceptance remains open. R06 Apply remains gated on explicit founder acceptance of this revised Home-to-Course build. The lesson still has the current vertical workspace composition; the persistent three-region shell is R06 work.
- Real Supabase email/OAuth verification, Phase 38 release evidence, and private beta remain open and unchanged. This visual change does not enable analytics, monitoring, or feedback sending.
