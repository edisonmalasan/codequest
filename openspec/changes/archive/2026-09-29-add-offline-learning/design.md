# Design

## Context

See proposal.md. Phase 23 provides owner/version-pinned lesson snapshots and drafts; Phase 25 provides an owner-bound outbox. Phase 26 caches only public shell bytes and serves `/offline.html` for failed navigation. `LessonPageClient` and `JourneyPageClient` currently require API reads. Run and Check use an iframe and fresh Worker on `NEXT_PUBLIC_RUNTIME_ORIGIN`; the application worker cannot control that origin. The current curriculum publication contains no live quests, so browser flow tests need published fixtures.

## Goals / Non-Goals

**Goals:** A learner explicitly prepares a published lesson, cold-opens it offline, reads its content and illustrations, edits a retained draft, receives bounded local JavaScript Run/Check feedback where supported, and sees last known accepted progress without an authority claim. Preserve the current origin, CSP, validation, and backend boundaries.

**Non-Goals:** Caching authenticated pages or raw API responses; accepting completion offline; changing Phase 25 replay semantics; cloud draft merge; remote runners; account management offline; a general offline mirror of the website.

## Decisions

### A public offline route, not cached account navigation

Use a static `/offline-learning` route with a client-only library. Precache its credential-free document explicitly, alongside the existing static chunks, and serve it only for that exact route; ordinary navigation still uses network-first with `/offline.html` fallback. Bypass auth-session middleware for this route after runtime/preview host checks. The offline document contains no user data; all lesson, draft, and progress bytes come from owner-scoped IndexedDB after hydration. The fallback links to the library and does not claim any download exists. This reuses the existing React lesson renderer and workspace; a separate handwritten offline editor would duplicate security and draft behavior.

The static route must be inspected in a production build for auth/session content, RSC requests, and precache size. An application worker must never cache a session-bearing response, a dynamic quest page, or arbitrary URLs. If the static route cannot be proven credential-free, switch to a public static offline document with equivalent component behavior before claiming readiness.

### Downloads are explicit, bounded, and two-stage

From an online lesson, save the published `QuestDetail` through the Phase 23 snapshot repository. Add owner-scoped list and exact-version lookup and bounded per-version illustration blobs to the same Dexie database. Extract only the lesson renderer's allowlisted relative image paths and fetch their versioned public API assets without credentials; verify MIME, count, aggregate bytes, and every required asset before marking reading-ready. Keep previous versions separately. Removing a downloaded lesson removes its snapshot and asset blobs, never its draft/outbox. Partial downloads are reported and retryable; no silent degradation of required illustrations.

Prepare the application public shell and runner resource set as a separate exercise-readiness step. A download without a controlled application worker or runner preparation is reading-ready only. Preparation status is rechecked at open; cache eviction and unsupported browser storage yield a clear capability error. File and response budgets are fixed and tested.

### The runner has its own narrow offline worker

The runtime origin serves a separate `/runtime/offline-sw.js` scoped to `/runtime/`. Its install transaction precaches only the six fixed bootstrap/Worker HTML and JavaScript URLs, with credentials omitted, exact paths, strict MIME/CSP expectations, and fixed per-entry/aggregate bounds. It never caches learner source, messages, API traffic, arbitrary URLs, or application resources. Add only the worker/setup resources to the runtime host allowlist and keep the application worker unavailable on that host. Its fetch handler is cache-only for those exact fixed resources when offline and network-first when online; failed incomplete installation does not claim readiness. The worker has no learner inputs or message commands and does not change the fresh-per-run Worker lifecycle.

A small fixed `/runtime/offline-setup.html` page registers and verifies the runtime worker from the runtime origin while online. The application embeds it only during an explicit download, passes a nonce and exact parent origin, and accepts a bounded correlated ready/error message only from the expected iframe/origin. This avoids installing from the application origin and keeps setup out of normal Run latency. The runtime worker must control later bootstrap navigations after a cold reopen; production Chromium offline/new-context tests are a required gate. Browser support beyond the measured engines remains subject to F02.

### Owner selection and progress are separate from cached content

Use the active verified Supabase session's user ID for online preparation. On an offline reopen, read the SDK's device-stored session only to select that same owner's local bucket; it is not proof of current backend access or account authority. If no local session exists, expose only the guest bucket, never an arbitrary owner picker. Never infer an owner from a pending operation. Sign-out clears the cached progress view while retained owner-isolated drafts/outbox follow existing policy.

Project successful protected Journey progress reads into a small local record containing stable quest IDs, accepted status/counts, publication versions, server-derived availability, and capture time. Do not persist the raw response, tokens, source, or API cache. Show a stale/last-known label on offline display. Local checks, guest progress, and pending operations occupy separate UI text and do not mutate that projection. On reconnect, Phase 25 trusted refresh updates it only after another successful protected read.

### Existing lesson and workspace seams

Pass a saved `QuestDetail` into the existing `LessonPageView`, `LessonDocument`, and `QuestWorkspace` with an offline mode. Local image resolution uses verified blob URLs revoked on exit. Offline mode suppresses backend start/hint calls; guest Q01–Q04 local checks may remain provisional via existing guest primitives. For authenticated users, Run and Check stay local; explicit Submit can use the existing outbox, but no implicit submission occurs. A failed runner/storage read preserves in-memory source and gives recovery copy guidance.

## Risks / Trade-offs

- Cross-origin iframe service-worker registration or storage partitioning may differ by browser → require a production offline cold-launch test with actual distinct origins; only advertise exercise readiness after verified preparation; do not fall back to application-origin execution.
- Static Next route might introduce protected or oversized bytes → inspect production HTML and CacheStorage entries in browser tests, assert no auth/RSC/response leakage, and enforce existing public-byte budgets.
- Browser eviction may remove app/runner CacheStorage or Dexie independently → recheck each dependency, report reading-only or unavailable states, retain source, and offer redownload on reconnect.
- Stored lesson may become stale or incompatible → show exact saved content/assessment versions and defer account acceptance to existing backend compatibility checks.
- Device-stored session identity is not backend verification while offline → label cached data as device-local and last known, use it only to scope IndexedDB reads, and never use it to claim account authority.

## Migration Plan

Add a forward Dexie schema version; preserve existing drafts/outbox/snapshots. Deploy the new public route and runner worker assets as one release, with exact host allowlists and CSP. Existing installed application workers naturally wait for tab closure; retained immutable assets support old workers. Rolling back removes offline-learning links/readiness while leaving saved local records recoverable. Do not erase IndexedDB or forcibly activate a worker. Update docs with support evidence and remaining F02 obligations.
