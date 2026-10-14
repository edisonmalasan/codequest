# R11A bounded web Builds verification

Status: **local and PR CI technical integration verified; founder review and release evidence open**. This record covers the production `/builds` list and `/builds/[id]` workbench in the R11A Apply candidate. CI and founder results remain distinct from local automation.

## Supported Build

One original starter has fixed `index.html`, `style.css`, and `main.js` identities. Each Build has a random stable ID and a `build:<id>` workspace namespace. Metadata uses the existing Dexie database; source drafts and active-file preference use the existing Editor Workspace repositories. A Build is private and device-local. There is no cloud project backup or publication in R11A. Clearing browser data can remove it. Guest and authenticated owner buckets stay separate; signing in does not automatically attach or migrate a guest Build.

Run accepts one HTML file, one CSS file, and one JavaScript file with those exact identities. The Worker supports the reviewed limited text, class, selected attribute/style, and click/input/change interfaces. The preview displays sanitized HTML/CSS and correlated mutations in an opaque child frame. The existing source, output, event, lifetime, timeout, and recovery bounds are retained. Full browser DOM, arbitrary files, external assets, network, storage, navigation, timers, imports, nested Workers, and arbitrary script sinks are unsupported. There is no fallback to execution in the authenticated document, display frame, Next.js, or NestJS.

Run and save do not Check or Submit a Quest and do not award progress or rewards. The Builds list requires explicit confirmation to remove one local Build. Removal deletes that Build's metadata, local drafts, and file preference on this device only. It does not delete an account, cloud data, course work, or another owner's Build. A failed removal rolls back its transaction. A failed draft save leaves current source editable and announces failure; the in-app All Builds link asks the learner to retry Save before leaving.

## Local production verification

| Field | Evidence |
| --- | --- |
| Candidate | Implementation commits `bd159206902de7e59dc8548d6908fccb3e7c6bb1` and `71d7226` on `feat/bounded-web-builds`; latest full-matrix local production Build ID `NLwuKxamNGTAOLFtKWuPq`. The second commit prevents edits before local draft hydration. |
| Environment | 2026-10-14, Windows 11 IoT Enterprise, Node v26.10.0, pnpm 12.4.1, local production Next.js build, Playwright 1.63.0. No hosted beta deployment. CI runs its declared Node 24 toolchain separately. |
| Origin topology | Application `http://127.0.0.1:3500`; credential-free runner `http://127.0.0.2:3500`; preview `http://localhost:3500`. Collision probe uses application/runner `http://127.0.0.1:3501` and preview `http://localhost:3501`. |
| Browsers | Playwright Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6, and Pixel 7 mobile Chromium emulation. These are automation browser builds, not physical device evidence. |
| Builds production suite | `pnpm --dir frontend test:builds`: 36/36 passed on the post-fix local production build. The previously failing hostile-source case passed another 10/10 Chromium and mobile Chromium repeats. Create, edit, fixed file tabs, save, reload, reopen and refresh; finite click; loop timeout, cancel, mutation flood, fresh recovery; forbidden HTML/CSS/network/storage sinks; forged display messages; route exit, owner switching, storage failure and retry, malformed stored manifest, keyboard file selection/Run, and 390/320 CSS-pixel reflow. |
| Learning-write retest | After adding a test-only assertion, the production create/Run/reopen Chromium case passed 1/1 with no non-GET application API request. |
| Origin collision | `pnpm --dir frontend test:builds:collision`: 1/1 passed. With app and runner configured on the same origin, middleware denies `/builds` rather than serving an executable app workbench. |
| Unit and migration checks | Build manifest, adapter wrapper, owner-scoped repository and Dexie upgrade tests passed, including preservation of old drafts/outbox data and transaction rollback. |
| Existing interactive lesson regression | `pnpm --dir frontend exec playwright test e2e/interactive-web.spec.ts --project=chromium --grep-invert "100 hostile loops"`: 10/10 passed. The separately rerun 100 hostile loops and fresh-run recovery case passed 1/1 in 4.7 minutes. |
| Repository checks | Post-fix `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm api:check`, and `openspec validate add-bounded-web-builds --strict` passed locally. Frontend Vitest passed 494/494 in an isolated run. The concurrent lint/Vitest run timed out once in the unchanged review workspace test; the isolated rerun passed. The local root `pnpm test` run passed frontend 494/494 but failed two unchanged backend author CLI subprocess timing assertions and a Vitest worker RPC timeout on Windows Node 26. PR CI on Node 24 passed the root tests and all required checks in run `38505663139` for commit `29d56d4`. |

The first existing interactive lesson Chromium run passed 10/11 checks, then its 100-loop case lost Next.js development artifacts when a separate production build was accidentally started against the same `.next` directory. The competing build failed too. That run is invalid as a product regression result. Sequential retests passed 10/10 other interactive checks and 1/1 for the 100-loop endurance case. A change to runner/preview policy, Build manifest, source bounds, or the exact implementation candidate requires the affected checks to be rerun.

PR #247's first CI run (`38458750051`) passed its preceding checks but failed 2 of 36 Build browser cases: Chromium and mobile Chromium started the hostile test with a stale HTML snapshot. The Editor Workspace had allowed an edit while IndexedDB draft hydration was pending; hydration could then overwrite it. Commit `71d7226` withholds the editor until the draft load settles, with a focused regression test. The post-fix local repeats and full matrix above passed. The first CI result remains a recorded failure; PR CI run `38505663139` passed every required step, including the Build production and origin-collision browser suites.

## Open gates

- Founder create/edit/Run/reopen review on the exact merged Build: **untested**. Record release/build/commit, environment, tester, date, expected and observed behavior, defects and retest before founder acceptance.
- Real Supabase email Auth integration and R08 founder acceptance remain open. Synthetic local owner cookies are isolation probes, not proof of provider login.
- Physical Windows/Firefox/NVDA, macOS/Safari/VoiceOver, iPhone Safari/VoiceOver, Android Chrome/screen reader, low-power and storage-pressure checks: **untested**. Browser emulation does not close them.
- Hosted release configuration, real privacy approvals, R11B cloud saving, R11C publishing/portfolio, R11D Community, R11E events, and Phase 38 beta evidence: **open**. Phase 38 remains **PAUSED / NO GO**.
