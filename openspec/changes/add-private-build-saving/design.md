# Design

## Context

See [proposal.md](proposal.md). R11A gives each Build a random UUID, `build:<id>` workspace, fixed `index.html`, `style.css`, and `main.js` files, local metadata in Dexie, and source in the existing draft repository. Its Run adapter accepts at most 65,536 HTML bytes, 32,768 CSS bytes, and 65,536 JavaScript bytes. The backend already derives authenticated ownership from verified Supabase subjects and exposes guarded REST/OpenAPI modules. No project table or project API exists. R04 has local Auth fixes, but delivered email, real account establishment, and founder Auth evidence are still open; the configured Management token returned 401 on 2026-10-17.

## Goals / Non-Goals

**Goals:** Explicit private account snapshots for the reviewed Build format; safe source recovery across devices; owner-only reads and writes; conditional edits; honest local versus cloud state.

**Non-Goals:** Automatic cloud autosave, lesson-draft cloud sync, concurrent code merge, project publication, public profile, general file trees, uploaded assets, expanded runtime APIs, Quest assessment, or real learner collection before F06.

## Decisions

### Store bounded snapshots in the existing PostgreSQL application schema

Add an additive `private_builds` relation with global Build UUID, verified owner foreign key, manifest/template version, bounded private title, the three bounded source fields, positive revision, server creation/update timestamps, and a server-computed snapshot digest. The current reviewed source limits cap a snapshot at 160 KiB before request overhead; also enforce a 50-Build per-owner limit matching the local repository. Accept a trimmed title of 1–80 Unicode scalar values and at most 320 UTF-8 bytes without control characters; existing untitled local Builds get a deterministic distinct display label until renamed. The backend validates UTF-8 byte lengths and exact file identities independently of the browser. Title participates in the digest and conditional revision. The table is a user-owned project record, not a lesson draft, execution result, or derived learning authority. Add it through a new migration and update the historical schema-inventory test without changing an applied migration. PostgreSQL fits the fixed small manifest and existing ownership/backup path. Direct browser Storage access or a new service would introduce another authority and is unnecessary here.

### Use owner-scoped REST with conditional revisions

Add guarded versioned `GET /builds`, `GET /builds/:id`, `PUT /builds/:id`, and `DELETE /builds/:id`. The list returns bounded metadata without source; a single owner read returns source and revision. `PUT` includes the exact manifest, source, and `expectedRevision` (`0` to create). In one transaction, the backend locks the owner row if present, validates the principal and bounds, and compares the expected revision. A matching revision and unchanged digest returns the current record without a write; a matching revision and changed digest writes the next revision. If current revision is exactly `expectedRevision + 1` and its digest matches the submitted snapshot, an exact retry returns the existing record without another write. A different snapshot or older revision returns a safe conflict; a foreign owner's ID is treated as unavailable without disclosing existence. Deletion is explicit, owner-only, and removes only the cloud row. After an uncertain delete response, an owner read can confirm absence. A stable UUID plus revision and digest gives bounded retry safety without a separate mutation ledger or last-write-wins. The response never echoes another owner's data.

### Keep the local draft as the editing source

The current Editor Workspace keeps local autosave; it does not gain network writes. An explicit Save to account captures its current three-file snapshot and title after local hydration, sends them through the generated API transport, and records the confirmed cloud revision/digest only after a successful response or a matching owner read. A local edit or rename after confirmation marks the cloud copy stale. Offline or failed network writes leave local source and the prior cloud revision intact. Do not enqueue project source in the learning-attempt outbox or service-worker cache. On another device, the private Build list offers explicit cloud Open with distinguishable titles. If no local Build exists, import its snapshot into the account-scoped local repository; if a local Build with the same ID differs, show both versions and require a choice to keep local work, replace it, or create a separate copy. No choice deletes the conflicting source implicitly. The UI distinguishes local saved, account save in flight, confirmed account snapshot, conflict, and error.

### Copy guest work explicitly

Signing in changes the visible owner bucket but performs no guest Build migration. A signed-in learner may explicitly select a device guest Build and confirm Copy to my account. The frontend creates a new account-local Build UUID and copies the three guest drafts and preference transactionally, keeping the guest original. Cloud Save remains a separate explicit step after the account-local copy is durable. If copy or cloud save fails, both editable source and ownership labels remain truthful. This mirrors the existing guest/account separation without making a guest timestamp, local Run, or project save into learning progress.

### Verify the real dependency separately from fixture coverage

Unit/integration tests use disposable PostgreSQL and synthetic principals for bounds, revision races, retries, 401/403/404 behavior, owner isolation, delete and API drift. Browser tests exercise local versus cloud status, guest copy, two-owner switching, two-device reopen, conflict, uncertain response, storage failure, and existing Run isolation. Apply may not claim R11B integrated from fixtures: R04 delivered email and self-owned backend account must first pass on the intended exact environment; R11B then needs a dated real-account save, logout/relogin, and second-device reopen plus founder review. F06 and hosted/device beta gates stay open.

## Risks / Trade-offs

- **A server snapshot could be mistaken for the live local draft** → display revision and last confirmed save separately; mark later edits local until confirmed.
- **Two devices edit the same Build** → conditional revision fails closed and the UI preserves both sources for an explicit choice.
- **A response disappears after a successful write** → exact-snapshot retry or owner read reconciles without duplicating a revision.
- **Private source reaches logs or telemetry** → DTO redaction, allowlisted operational metadata, no source in list responses, and request/logging tests.
- **Schema or client changes widen execution authority** → cloud source is data only; existing snapshot validator and isolated Run remain unchanged, with affected containment probes rerun.

## Migration Plan

Add the PostgreSQL table through a forward migration, then deploy backend API and regenerated client before exposing cloud actions in the Build UI. Existing local Builds continue working unchanged. A later client may add optional confirmed-cloud metadata to the current Dexie Build row through a forward version; old rows default to local-only and are never assumed cloud saved. Rollback hides account actions and keeps the additive table/data for a compatible corrective migration. No source is copied to cloud automatically. Real learner use remains blocked by F06 and release gates.
