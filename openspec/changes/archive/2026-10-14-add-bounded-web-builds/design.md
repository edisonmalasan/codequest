# Design

## Context

See [proposal.md](proposal.md). `EditorWorkspace` already accepts parent-owned file, owner, and workspace identities and saves drafts to Dexie. `IsolatedInteractiveWebAdapter` accepts exactly one HTML and JavaScript file with optional CSS and runs learner JavaScript in a fresh credential-free Worker. Its opaque display lives on the separate preview origin and only fixed bridge code runs there. The current standalone `/editor-workspace` host is development-only. Published lessons use the same reusable seams, so a Build host must not alter their authority or snapshot behavior.

## Goals / Non-Goals

**Goals:** Provide a production, independent create/edit/run/reopen experience for a bounded original web project; preserve source and owner isolation; prove the existing execution boundary on the integrated route.

**Non-Goals:** Cloud project persistence or merge, uploads/imports, arbitrary file trees, external packages/assets, full browser DOM, network access, grading, Quest submission, XP, public hosting, portfolio, and Community. R11B–R11E own those later capabilities.

## Decisions

### Fixed project manifest and reviewed starter

The first Build uses a versioned original starter with `index.html`, `style.css`, and `main.js`, one file of each language and stable IDs. A Build has a random stable ID and a distinct workspace namespace such as `build:<id>`, never a Quest workspace ID. The host validates stored metadata and uses the existing snapshot validator before a run. A fixed manifest fits the adapter's reviewed 2–3 file contract and avoids inventing imports or a general virtual filesystem. Expanding file types or runtime APIs requires another security design and affected-probe review.

### Device-local project index in existing Dexie database

Add an owner-indexed, bounded Build metadata table in a forward Dexie version. Metadata records the ID, owner, template/manifest version, fixed file IDs, and creation/update times; source remains in the existing draft repository and active-file choice in workspace preferences. The index supports a local list/reopen flow without a parallel storage system. Guest and verified account owner scopes remain separate. Signing in does not automatically migrate or attach a guest Build to an account. A transaction removes one Build's metadata, drafts, and preference only after an explicit confirmation. Failed storage writes retain editable in-memory source and are surfaced for retry. The UI calls this a device-local draft, not cloud backup. R11B will design separate authoritative cloud project records and explicit import/merge policy.

### Production host composes existing workspace and adapter

Add a Builds entry and route with a small project-list/create host. The host supplies the stable owner/workspace/file IDs to `EditorWorkspace` and creates/disposes one interactive adapter for the active Build. The existing preview and runner origin resolution fails closed. Run, reload, and cancellation use the adapter's correlated generation, source snapshot, timeouts, cleanup, and bounded output. Build creation and local save never call Quest Check, Submit, or backend learning APIs. The existing lesson and static preview integrations remain separate.

### Verification is route-specific

Unit tests cover metadata validation, owner switching, duplicate/oversize manifests, migration, deletion scope, and storage failure. Production-build browser tests cover create/edit/run/reload/reopen, source preservation, keyboard and 390/320-pixel layouts, hostile loops, fresh-run recovery, denied sinks, origin collisions, stale/spoofed packets, and route/owner cleanup. Record exact commit, built assets, three origins, browsers, results, and untested device/AT cases. Founder review of this integrated workflow is a separate R11A gate; CI alone is technical evidence.

## Risks / Trade-offs

- **Device data loss on browser clearing or quota failure** → explain device-only storage, expose save failures, preserve in-memory edits and retry. R11B is the durable cloud solution.
- **A project appears to be a full website** → label the supported subset and report unsupported APIs instead of falling back to app-origin or preview-frame execution.
- **Storage migration affects existing drafts** → add an additive Dexie version and test upgrade from existing versions with source and outbox preservation.
- **Reuse of the interactive adapter changes its behavior** → keep its limits unchanged and rerun affected lesson and Build containment/recovery suites against the exact integrated build.

## Migration Plan

Deploy the additive Dexie schema and Build routes together. Existing lesson drafts and pending operations remain in their owner scopes. Rollback hides the new route; older clients ignore the new table and do not need to rewrite existing records. No backend migration or provider configuration is required for R11A.
