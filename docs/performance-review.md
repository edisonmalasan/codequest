# Phase 36 performance review

Status: Apply evidence, 2026-10-01. This review covers repeatable build bytes and production-mode browser probes. It does not establish an F02 supported low-end device, browser-version, or network-speed target.

## Method

`pnpm --dir frontend build` produces a Next.js production artifact. `pnpm --dir frontend test:performance-budget` reads the emitted app-build manifest, exact initial route chunk files, fixed public assets, and the generated service-worker precache URLs. It reports raw bytes and each chunk's gzip bytes; gzip sums are an estimate, not actual HTTP transfer bytes. The build's “First Load JS” figures are Next.js estimates. The deterministic gate checks raw route and asset ceilings plus a 3.5 MB performance ceiling for the existing public precache; the established 2 MiB per-entry and 12 MiB aggregate safety ceilings remain in place. Unknown or missing manifest shapes fail closed. The CI gate runs after the production build.

`pnpm --dir backend build` followed by `pnpm --dir backend content:bytes` serializes each currently published Quest detail projection from the backend catalog, then reports raw and gzip JSON bytes. This is the application payload, not a measured network response. It does not include HTTP headers, authentication, or CDN compression.

`pnpm --dir frontend test:performance` builds and serves the frontend in production mode with local fixture origins, a bounded public Quest response, downloaded Playwright Chromium, and no artificial network throttling. It observes a Quest lesson before explicit editor loading, then records cold Run, subsequent Run, and local Check wall time. A global written in the first Run is absent in the second. Variable timing is reported, not used as a fixed CI pass threshold; correctness and isolation assertions still fail the browser test if broken.

## Build and content measurements

Measured on Windows development hardware with Node 26.10.0 and pnpm 12.4.1. Baseline was the Phase 35 `main` production build on 2026-09-30; optimized figures are the Phase 36 local build on 2026-10-01. The CI runner builds independently and may emit different chunk hashes and byte totals.

| Initial route    | Baseline raw JS | Optimized raw JS | Baseline Next first-load estimate | Optimized Next first-load estimate | Raw CI ceiling |
| ---------------- | --------------: | ---------------: | --------------------------------: | ---------------------------------: | -------------: |
| Home             |       364,010 B |        364,100 B |                            107 kB |                             107 kB |      400,000 B |
| Journey          |       850,628 B |        850,648 B |                            247 kB |                             247 kB |      950,000 B |
| Quest            |     1,535,669 B |      1,035,020 B |                            477 kB |                             304 kB |    1,200,000 B |
| Offline learning |     1,557,686 B |      1,057,037 B |                            484 kB |                             310 kB |    1,225,000 B |

The Quest and offline initial raw graphs each shed about 501 kB (about 33%). CodeMirror moved into a deferred chunk: the workspace's source, draft, file selection, and Run/Check controls remain parent owned while the editor loads near view or by explicit button. A failed import leaves a readable source snapshot and retry. These route totals exclude later deferred chunks; the byte report prints every initial chunk, and the editor test/browser gate covers the deferred interaction.

The backend projection samples **25 published Quests**; the largest is the inventory capstone at **15,435 B raw / 5,260 B gzip**. Instructional details are smaller in this snapshot. Quest reads already return one selected published snapshot, so no API shape or content truncation change is justified by this measurement.

## Asset and offline-shell audit

The Pixelify Sans display font is **79,160 B** and already uses `font-display: swap`; body and code use system faces. The Foundations Valley WebP is **207,522 B** and the Journey's above-fold responsive image declares `sizes`; the other shipped SVG mark, emblems, and avatar frame range from **352–571 B**. Published lesson illustrations use lazy loading and version-pinned API URLs. No font or art re-encoding is justified by current sizes, and the asset provenance record remains unchanged.

The generated application service-worker precache measures **2,567,878 B** in the optimized local build, below the 3.5 MB performance ceiling and the existing 12 MiB hard ceiling. The report lists each exact cached URL and byte size. It remains restricted to public static shell entries and the credential-free offline-learning document; protected responses, drafts, account state, and dedicated runtime/preview origins are excluded. The code split slightly changes the generated chunk list, so the gate reads the generated manifest rather than assuming the allowlist size from source constants.

## Browser observations and remaining limits

Two local production-mode Chromium runs recorded **109–245 ms cold Run**, **90–110 ms subsequent Run**, and **101–141 ms local Check** on the development host. These are end-to-end button-to-result observations, not Worker process creation alone. Browser cache and fixture latency affect them. The second Run could not see the first Run's global. Existing worker timeout, cancellation, and recovery tests remain the containment checks; no worker reuse or prewarm was added.

Physical low-end hardware, mobile devices, installed Firefox/Safari versions, real slow networks, battery/CPU throttling, native zoom, and long-session memory behavior are **untested** under F02. Browser emulation and CI timing cannot establish a production performance or device-support promise.

## Verification record

The local focused deferred-editor unit tests passed 27/27 across the new loader and existing workspace suite. Both production Chromium browser probes passed 2/2; the updated full accessibility suite passed 12/12 across Chromium, Firefox, WebKit, and mobile Chromium; the full PWA suite passed 6/6. Root `pnpm test` passed 396 frontend and 196 backend tests plus three history checks; root `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed. The byte gate passed its three failure-fixture tests and the optimized production build. The local learning browser suite needs PostgreSQL, which is unavailable on this host; required CI ran it against a PostgreSQL service.

Apply PR [#157](https://github.com/edisonmalasan/codequest/pull/157) passed required CI on commit `430df12`: root tests, lint, typecheck, build, API/curriculum checks, and the emitted-artifact byte gate; PWA 6/6, production performance 2/2, curriculum 28/28, analytics 1/1, PostgreSQL-backed learning 8/8, and accessibility 12/12. The CI performance probe recorded 98 ms cold Run, 85 ms subsequent Run, and 114 ms local Check on its hosted Chromium runner; these remain observations, not timing thresholds. CI's generated public precache measured 2,561,932 B. The local affected editor, lesson, validation, and preview browser set also passed 12/12 across Chromium, Firefox, and WebKit. Strict OpenSpec change validation passed.
