# Design

## Context

See the proposal and `learning-performance` delta. The 2026-09-30 production build reports 477 kB first-load JavaScript for `/quests/[slug]`, 484 kB for `/offline-learning`, and 107 kB for `/`. Its app-build manifest lists about 1.54 MiB and 1.56 MiB of raw initial chunks for the two learning routes. `QuestWorkspace` and the offline learning client statically import editor/runtime code. Pixelify Sans is 79,160 bytes and the largest world image is 207,522 bytes. The PWA already rejects an entry above 2 MiB or an aggregate above 12 MiB and excludes protected requests. F02 has no approved physical low-end support target.

## Goals / Non-Goals

**Goals:** Make the initial learning-route graph smaller, measure asset and cache cost, enforce conservative build-byte regression ceilings, and retain a reproducible worker timing record.

**Non-Goals:** Change assessment or backend completion rules; change the runner's fresh-Worker protocol, timeout, or containment; cache protected data; promise Core Web Vitals or a device support matrix from development-host measurements.

## Decisions

1. **Measure production artifacts, not development-server timings, for the CI budget.** A small Node script will inspect Next's app-build manifest and actual emitted bytes, plus a fixed public-asset inventory. It will print per-route totals and fail above documented ceilings. Browser timing evidence will be reported separately because hosted runner load changes timing. Alternative: assert lab timing in CI; rejected due to noisy hardware and network conditions.
2. **Split editor tooling at the workspace seam.** Keep lesson reading and workspace state mounted, but load the CodeMirror implementation through a deferred component when the editor region approaches view or the learner requests it. Show a named loading state, retry failed imports, and retain the source snapshot in the parent throughout. Alternative: split the whole quest route; rejected because that also delays lesson and status content and complicates failure recovery. Existing draft repository and editor contract remain authoritative.
3. **Audit before changing art.** Measure the font, SVG sprite/emblem files, world image, and lesson illustration response sizes. Optimize only measured oversize or unnecessary eager delivery. Keep the licensed/original asset record and text alternatives. Alternative: mass re-encode assets; rejected because most current assets are small and visual regression risk would outweigh proven savings.
4. **Preserve PWA and worker boundaries.** Keep the existing allowlist and 12 MiB/2 MiB hard ceilings. Record the actual generated precache size and measure cold and subsequent finite Run/Check with browser automation, but do not reuse or prewarm learner Workers. Alternative: loosen cache or reuse Workers to improve speed; rejected because it weakens existing safety and offline contracts.

## Risks / Trade-offs

- [Deferred editor import fails offline or after deployment] → retain parent source and a visible retry, verify offline exercise readiness and production browser flows.
- [Byte reductions shift cost from initial to interaction] → report both initial route bytes and deferred editor chunk bytes, and check editor usability after load.
- [Next manifest changes between framework versions] → fail with a clear unsupported-manifest error, rather than silently skipping budget checks.
- [Browser timing differs on real low-end devices] → retain F02 as untested and record exact probe conditions without a support claim.

## Migration Plan

Deploy as a frontend-only update; existing local drafts and offline shell remain compatible. If the deferred editor path regresses, revert the Apply PR and rebuild the same immutable public shell; no data migration is needed.
