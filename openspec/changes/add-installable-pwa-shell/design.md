# Design

## Context

See proposal.md for motivation. Next 15.5 uses webpack production builds. Phase 23 owns Dexie records, Phase 25 owns foreground replay, and ADRs 0006/0008 exclude protected-response caching. Middleware already isolates runtime/preview hosts before handling application requests. The published curriculum is empty. Phase 27, not this change, supplies offline lesson usage.

## Goals / Non-Goals

**Goals:** Installable production shell, explicit public-cache bounds, safe lifecycle, focused browser evidence.

**Non-Goals:** New authority, offline auth/lessons/progress, background replay, draft migration or cloud source storage, install-support certification.

## Decisions

### Explicit public precache

Add compatible pinned `@serwist/next` and `serwist`; keep existing Next and runtime dependencies. Configure webpack output with registration disabled so a small trusted client lifecycle owns registration/errors. Disable in development and preview-only builds. Build manifests filter to public offline HTML/CSS/icons and hashed `/_next/static` JavaScript/CSS/fonts, with 2 MiB per-entry and 12 MiB total limits that fail build when exceeded. Use content revisions and a defensive matching filter in worker code. Unknown assets, queries, maps, pages, RSC, API, and runtime/preview files are excluded. No broad Serwist default caching. Alternative broad runtime caches risk private responses and incompatible lesson versions.

### Public offline shell and navigation

Use a static credential-free `/offline.html` with local styling and existing mark, plus a retry link to `/`. It is the minimal application shell: readable recovery without mounting auth or offline learning. Normal document requests go to network with `no-store`; on failure return the precached offline page only for same-origin non-auth/non-API application navigation. Other requests use ordinary network transport unless they exactly match the public precache allowlist. Do not cache page HTML or application data. Explicit worker lifecycle event handlers use Serwist install/activate/request methods and omit its unrestricted cache-message handler. Public shell paths bypass Auth middleware after dedicated-origin checks. Worker script uses revalidation headers and restrictive response CSP.

### Waiting updates protect work

Register only on a secure application origin, expose browser connectivity hints, and detect an already-waiting or newly installed worker. `skipWaiting`, clientsClaim, auto-reload, and background sync are disabled. Show save/close-all-tabs/reopen instructions; this allows normal lifecycle activation when all old clients close and keeps existing autosave/unload warnings intact. Explicit hot activation would need a cross-tab save barrier and is not justified here. Registration listeners are cleaned up; foreground checks may discover updates without reloading. Shell/cache failures never delete Dexie data.

### Icons and metadata

Generate 192/512 PNG and maskable/Apple touch variants from the existing pixel mark using deterministic vector rasterization, with adequate safe area. Manifest scope `/`, identity `/`, start URL `/`, standalone display, existing theme colors. No fake install prompt on unsupported browsers.

## Risks / Trade-offs

- Browser storage can be denied or evicted → truthful failure notice, online fallback, no offline guarantee before successful installation.
- Waiting worker remains while tabs are open → clear manual save/close/reopen instructions, no silent loss of source.
- Static application chunks are cached but protected documents are not → offline navigation reaches only the public landing page until Phase 27.
- Browser `onLine` is a hint → retain transport errors and existing replay authority.
- F02 platform/device coverage is incomplete → automated production Chromium coverage with no physical/native install claim.

## Migration Plan

No database change. Build the worker with release assets, deploy static assets and worker consistently, retain immutable chunks across rolling deployments where possible. Update through normal waiting lifecycle. Rollback must continue serving a replacement worker at the same URL; simply deleting `sw.js` does not unregister installed workers. Document a same-scope cache-only retirement worker that removes only CodeQuest shell caches and leaves IndexedDB untouched.

## References

- [Serwist webpack integration](https://serwist.pages.dev/docs/next/getting-started)
- [Serwist lifecycle and explicit handlers](https://serwist.pages.dev/docs/serwist/core/serwist)
- ADR 0006, ADR 0008; P03/P08/P11; F02/F03/F07.
