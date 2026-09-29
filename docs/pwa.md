# Phase 26 — Installable public shell

CodeQuest publishes `/manifest.webmanifest` with a stable `/` identity, `/` start URL and scope, standalone display, existing theme colors, 192/512 PNG icons, and a separate maskable variant. Browser installation controls depend on platform support. Metadata includes an Apple touch icon; it does not prove native Safari/mobile installation support.

## Build and verify

`pnpm --dir frontend build` produces ignored `public/sw.js` through pinned Serwist 9.5.12 and Next 15 webpack. `pnpm --dir frontend test:pwa` builds and starts a fixture-configured production app and runs the focused Chromium suite. Development builds and preview-only builds disable worker generation/registration. Dedicated runtime/preview hosts deny the manifest, shell and worker even when sharing a deployment.

Regenerate icons with `python scripts/generate-pwa-icons.py` from the repository root. The generator uses only the Python standard library and the orthogonal paths in `frontend/src/app/icon.svg`. It preserves the existing mark and rejects unsupported vector commands. The maskable image keeps the entire mark inside the central safe circle. Generated PNGs are committed; production builds do not need Python.

## Cache policy

The only public files selected are `/offline.html`, `/offline.css`, and the four declared installation PNGs, plus selected `/_next/static/chunks`, `css`, and `media` JavaScript/CSS/font build assets. Public files have content hashes; static chunks use their build revisions. Both configuration and worker enforce the allowlist. The build fails above **2 MiB per selected entry** or **12 MiB total**; these are implementation bounds, not validated device performance promises.

Worker precache fetches omit credentials. Selected shell requests are same-origin GET without query strings, Authorization, RSC or prefetch headers. The cache is public across account switches. Application HTML, account pages, auth codes/tokens, API responses, mutations, Next data/RSC, lesson payloads, learner source, and runtime/preview/external traffic are never written to CacheStorage. The worker ignores all client messages, including Serwist cache/activation commands. No default runtime cache or background sync is enabled.

Application document navigation uses uncached network transport and falls back on transport failure to the static offline page. `/auth`, `/api`, `/runtime`, and `/preview` never receive this fallback. A reached HTTP error remains a network response. The public shell offers retry and storage cautions; it contains no account information, source or accepted learning facts. Phase 27 will add downloaded offline lessons. No durable protected progress cache is added here.

The root network indicator uses browser connectivity hints. “Online” does not mean that Auth/API/replay succeeded. Existing Phase 25 transport errors and owner-bound foreground replay still control submission delivery. The service worker never sends pending work or opens IndexedDB.

## Updates and recovery

Registration failure or a failed update check is visible while the application remains usable. A successfully installed replacement waits while old clients remain open. The update notice instructs learners to **save work, close all CodeQuest tabs and app windows, then reopen**. No `skipWaiting`, client claim, automatic reconnect reload or controller-change reload occurs. This preserves in-memory editing and existing idle/visibility/unload saves. Verify saved status before closing; asynchronous unload saves cannot guarantee durability.

Installation/precache errors or browser cache eviction can prevent offline navigation. Reconnect and reopen to retry. Browser data clearing can remove both shell caches and device-only learner work; installation is not cloud draft backup. An update changes only public CacheStorage and leaves owner-bound Dexie drafts/outbox/preferences/snapshots/guest state untouched.

## Deployment and rollback

Serve the generated worker at `/sw.js` on the application origin over HTTPS (loopback for tests), with no-store/revalidation headers and the configured restrictive worker CSP. Publish a coherent build and retain immutable old chunks during rolling deployments where feasible. Offline shell/icon paths bypass Auth middleware only after runtime/preview host checks. Do not deploy the application worker on learner compartment hosts or broaden their host allowlists.

Deleting `sw.js` does not retire installed workers. A rollback can serve the previous compatible build at the same URL. For complete PWA retirement, deploy a reviewed same-scope replacement worker that uses the normal waiting lifecycle, deletes only cache names with prefix `codequest-shell-` during activation, unregisters itself and passes requests to network. Never delete IndexedDB, unrelated origin caches or retained owner work. Document the removal to learners before rollout; do not silently force reload active editors.

## Evidence limits

Focused unit and production-browser results are recorded in the Phase 26 task evidence. Headless Chromium demonstrates production registration, public cache exclusions, offline navigation, waiting updates, and retained fixture drafts/outbox/in-memory source. It does not prove OS installation, physical mobile/Safari/Firefox installation, spoken assistive technology, low-power timing, native quota or OS restart. Those F02/pre-beta obligations remain open. Current publication still has no live quests.
