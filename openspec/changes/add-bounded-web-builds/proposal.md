# Proposal

## Why

R11A requires a usable, independent Build workflow before project saving and publishing are introduced. The existing editor and isolated interactive web adapter can support a bounded HTML/CSS/JavaScript project, but the only standalone host is a development-only review route and its limits are not presented as a product contract.

## What Changes

- Add a production Builds entry and independent project workspace with one original starter, fixed HTML/CSS/JavaScript files, create, edit, Run, reload, cancel, and recovery flows.
- Reuse the Editor Workspace's owner-scoped device drafts and the existing Worker/preview-origin interactive adapter. Make device-only save and storage-failure states explicit; give each Build a stable local workspace identity so a learner can reopen it on that device.
- State the supported DOM/event subset and file/resource limits in the product. Unsupported browser capabilities fail truthfully. Run and preview do not imply Check, completion, XP, public hosting, or assessment.
- Require exact-build integrated containment, hostile-loop recovery, owner-switch, source-preservation, responsive/keyboard, and founder workflow evidence for R11A. Preserve the existing static preview and published lesson behavior.
- Keep authenticated cloud project records, concurrent/device merging, publication, portfolio, and Community for R11B–R11E. R11A alone does not complete the V1 Builds category.

## Capabilities

### New Capabilities

- `independent-web-builds`: Independent bounded web Build creation, device-local draft recovery, isolated Run, truthful capability limits, and R11A acceptance.

### Modified Capabilities

None. The existing Editor Workspace, local persistence, and interactive execution contracts remain in force and are reused without relaxing their requirements.

## Impact

- Frontend Builds routes/navigation, project host, owner-scoped local metadata and drafts, editor composition, and browser tests.
- Existing runner and preview origins, snapshot validation, Worker limits, static preview, and backend learning authority remain unchanged.
- No new backend endpoint, database migration, remote runner, project publication, or real telemetry in R11A.
