# Offline learning

Phase 27 adds an explicit **Download lesson** control and a public `/offline-learning` library. It does not mirror the website or accept account learning facts without the backend.

## Prepare and open

While online, open a published lesson and choose Download lesson. Guest downloads use the guest bucket; authenticated downloads use the current session's owner. The UI reports reading-ready once the lesson and all supported illustrations persist. It reports exercise-ready only after the controlling application shell and separate runner cache are prepared. Partial, failed, oversized, and quota-denied downloads do not replace a previously valid package. The current publication contains no live quests; automated flows use fixtures.

An installing or waiting application/runner update keeps the download reading-ready. Save work, close application tabs, reopen, and refresh the download after the update takes control. Preparation never forces activation or reload; cache bytes from a waiting worker do not prove the older controlling worker can serve them.

After preparation, the offline landing page links to Downloaded lessons. The library lists exact content/assessment versions and save dates. Open saved lesson reuses the safe Markdown renderer and Editor Workspace, including device-only drafts, autosave, explicit saves, and reset behavior. Remove saved lesson deletes only that package and illustrations, leaving drafts and pending submissions intact. An older version is a saved copy, not proof of current publication or account acceptance.

The device's Supabase session selects an authenticated local bucket; without a session the library selects guest. That identity is not backend verification while offline. No owner picker or pending-envelope identity grants access to a different bucket. Guest practice remains the existing Q01–Q04 subset. Signup/import and account management require a connection.

## Storage bounds

Dexie v4 extends the same `codequest` database with lesson illustration blobs and minimal accepted-progress records; existing drafts, outbox, guest state, preferences, and snapshots survive the forward upgrade. Download packages use the Phase 23 public snapshot projection, 256 KiB per lesson, at most eight PNG/WebP illustrations, 512 KiB per illustration, 2 MiB combined illustration bytes, and at most eight stored snapshots per owner. Image paths come from the same Markdown parsing pipeline as reading, including reference images; code examples and external images are excluded. Download requests omit credentials and reject redirects. Packages commit in one transaction.

Accepted-progress projections are schema-versioned and limited to 32 KiB and 128 quest facts per Journey. They store stable identity, publication versions, backend-derived status/availability, and capture time. Raw protected responses, source, tokens, and client totals are excluded. Offline views label these facts **last known** and display their capture time. Local Check, guest activity, and pending submissions do not alter this accepted snapshot. Logout/account switch clears the prior progress projection; retained owner-isolated drafts and pending work follow existing policy. Clearing failure is reported.

## Execution and account authority

Offline Run/Check use the same credential-free dedicated origin, fixed bootstrap, fresh Worker, correlated private channels, CSP, source/output limits, two-second case/run deadline, and one-second recovery bound. The runner has its own `/runtime/` fixed-resource worker; the application worker never handles runner requests. Missing or evicted runner bytes cause unavailable/error feedback without application-origin evaluation or source loss. Browser storage restrictions can leave a package reading-ready only.

Phase 28 keeps backend start/hint calls suppressed in downloaded learning. Run and deterministic Check give provisional feedback and never auto-submit. A signed-in local owner can choose **Submit attempt** after Check to save an immutable source/report snapshot into the existing owner-bound outbox. When known offline, saving sends no request. Storage failure leaves source editable and does not claim pending durability. Guest Checks remain provisional Q01-Q04 work for explicit signup import; they never enter an account outbox automatically.

The downloaded library and open saved lesson show **Submissions on this device**, even if no lesson remains downloaded. Delivery states distinguish pending/uncertain, needs attention, and delivery confirmed. Expand **View and copy saved submission source** to recover original code and versions; **Remove this device copy** affects only that envelope. **Retry saved submissions** is disabled offline, and a connected retry requires the same current account and resends the original event. Logout or account switching hides prior-owner lessons and pending source. Browser clearing can erase these device records.

Reconnect uses the existing Phase 25 protected replay endpoint, current exact-version admission, prerequisite checks, report normalization and idempotency. Unsupported/retired work stays recoverable without silent relabeling. Completion, progress, XP, streak, and unlock authority remain on NestJS/PostgreSQL under ADR 0005 personal-learning trust. Confirmed delivery never advances the last-known accepted-progress snapshot; current acceptance needs trusted backend reads. Streak credit uses backend acceptance time, without backdating offline timestamps. Drafts remain device-local under F07; an explicit submission is not cloud draft backup.

AI, leaderboards, community, remote sandboxes, account changes, and publishing are unavailable offline. There is no new background replay, synchronization protocol, or cloud code merge.

## Recovery and evidence

Browser eviction can remove a shell, runner cache, lesson, illustration, or draft independently. The library reports missing/corrupt storage and preserves remaining work. Reconnect to redownload; copy unsaved source before leaving when storage fails. Installing the app is not cloud backup. Version-incompatible submission recovery remains the existing Phase 25 behavior.

Production Chromium tests cover the distinct-origin cold offline runner, loop timeout/fresh recovery, explicit lesson download, offline reading/editing/Run/Check, and draft reload. Unit tests cover owner switching, stale cached labels, missing assets, storage rejection, immutable resource bytes/CSP, and denied routes. Physical mobile/Safari, installed Firefox, spoken assistive technology, low-power timing, native quota/background/OS restart remain untested F02 pre-beta obligations; no broader support guarantee is inferred.

Phase 28 adds production Chromium evidence for signed-in offline Check/explicit Submit, durable pending recovery after cold reload, uncertain-response reconnect with identical event retry, confirmed delivery metadata, unchanged last-known accepted progress, and cache exclusions. The production suite passes 6/6. Browser identity/acceptance uses explicit fixtures; existing backend database tests and required CI independently verify event/completion/XP/streak uniqueness and backend acceptance time. No live curriculum or F02/F06 operational release claim is established.
