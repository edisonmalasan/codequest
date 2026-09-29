# Cloud progress and reconnect replay

Phase 25 uses NestJS/PostgreSQL as account authority on every device. Explicit authenticated Submit saves an immutable version-1 `attempt-submit` envelope in the existing Dexie outbox before calling protected `POST /api/v1/learning-sync/:questId` through the generated client. Local Run/Check never auto-submit. Starts and hints retain immediate writes and failure reporting; they are not outbox operations.

The envelope binds originating owner, stable quest ID, UUID event ID, original content/assessment versions, source/report JSON, and local creation time. Creation time orders delivery only; backend acceptance time controls XP and streak credit. The existing 64 KiB serialized-payload bound includes report/JSON overhead. Storage failure sends nothing and preserves editable source.

## Replay and recovery

- App entry, reconnect, focus/foreground return, and explicit Submit/retry trigger sequential replay, at most 50 rows per pass. Remaining rows wait for another trigger or retry. No background timer or service worker runs.
- Every request checks the live account and binds bearer selection to its owner. Switching stops future requests, suppresses stale results, clears protected progress query memory, and remounts the editor owner boundary. Already-sent requests may finish for the original owner.
- Network/auth failure, 429, 5xx, or invalid/uncertain response keeps the identical event and payload pending. Multiple tabs/devices settle duplicates through backend idempotency.
- 400/403/404/409 marks work as needing attention. Source and original versions remain available to view/copy. Explicit retry resends the same event; current-version Check/Submit creates separate work without overwriting stale source.
- Confirmed transport stores a bounded delivery marker only, never a raw protected response, completion flag, account total, or credential. Current acceptance must be read from the backend. The owner may explicitly remove a device envelope without affecting backend history. Clearing browser data can erase device work.
- Guest and legacy rows stay excluded from automatic replay. Phase 24 signup import remains explicit, with its original guest source/retry path. No row is silently reassigned.

## Backend authority and cross-device reads

Stable-quest replay resolves an existing owner/event before requiring publication. An exact recorded event retains its original outcome after slug/version change or retirement; altered payload/context is rejected. A new event requires current published curriculum, existing exact-version admission, report normalization, and prerequisites. No new assessment compatibility window is declared. Accepted stable-quest history remains intact and further events cannot farm XP or streak days. Acceptance remains client-reported personal learning under ADR 0005.

Entry/reconnect/foreground and confirmed delivery refresh protected progress/unlock/XP/streak reads, including on devices with no pending work. Failed reads show unavailable state. No protected response is persisted for offline authority, and guest/offline capture dates never backdate streaks.

F07 keeps drafts device-local: an immutable submitted attempt is not cloud draft sync. No concurrent code merging, cloud draft transport, raw-response cache, or Phase 26 PWA/service worker is included. Current publication has no live quests; reviewed curriculum publication remains separate.
