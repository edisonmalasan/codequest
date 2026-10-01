# Proposal

## Why

Phase 38 repository preparation and the Phase 39 synthetic study protocol are complete, but the private-beta decision remains **NO GO**. The remaining gates need a single reviewable worksheet that separates owner policy choices from hosted and physical evidence, without treating CI as release approval.

## What Changes

- Inventory every open row in `docs/beta-readiness.md` under F04/F05/F06 decisions, hosted-deployment evidence, or physical-device and assistive-technology evidence.
- Prepare an **optional, explicitly experimental** F04 review baseline of the current 10 XP per first accepted quest and `provisional-linear-100-v1` level curve. Owners must decide whether to use it for private beta; no balance claim follows.
- Provide blank F05 preregistration and F06 decision checklists, with required approver, date, release candidate, and evidence fields.
- Specify repeatable, safe hosted and physical checks, expected outcomes, and evidence recording in a gate-closure worksheet. No check is marked passed without actual evidence.
- Keep `docs/beta-readiness.md` at **NO GO**, telemetry disabled, feedback local, and Phase 40 untouched.

## Capabilities

### New Capabilities

None. This change documents release-gate review and adds no product behavior.

### Modified Capabilities

None. The existing `beta-preparation`, `production-security`, `learning-analytics`, `production-monitoring`, `authentication`, `learning-accessibility`, `learning-performance`, XP/level, and runtime specifications already define the behavior and evidence boundary. `skip_specs: true` applies.

## Impact

Planning artifacts and `docs/beta-gate-closure-checklist.md` only. No application code, migrations, API contract, provider configuration, live telemetry, learner recruitment, release approval, or Phase 40 implementation changes.
