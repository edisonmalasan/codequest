# Proposal

## Why

Phases 0–37 established substantial engineering foundations, but their archived status and passing CI do not establish a complete, integrated, founder-accepted product. The founder has clarified that CodeQuest must deliver its approved V1 experience end to end before private beta or production, including a redesigned learning shell and real Supabase authentication verification.

## What Changes

- Rebaseline the product and roadmap around explicit readiness states: technically implemented, feature complete, integrated, founder accepted, release ready, private beta, beta accepted, and production ready. An advertised V1 capability cannot advance on implementation or CI evidence alone.
- Record the public Codédex product as a reference for information architecture, discovery, learning workflows, visual quality, breadth, and polish, while requiring original CodeQuest branding, art, curriculum, exercises, tests, and implementation. No private or paid Codédex material is a source.
- Establish dependency-ordered Product Completion / Founder Alpha phases R01–R15, then resume Phase 38 release gates at R16, conduct real Private Beta at R17, address beta findings at R18, and consider production at R19. Preserve Phases 0–37 and previously completed Phase 38 technical and Phase 39 study-preparation work as history.
- Make the current homepage and lesson/workspace composition explicitly non-final. Specify a persistent lesson/editor/output-preview desktop learning shell and intentional tablet/mobile alternatives as future product requirements, without implementing them in this change.
- Require real-environment verification of email signup, confirmation, login, logout, recovery, Google OAuth, and GitHub OAuth. Record the founder's report that current local/Supabase flows do not work; do not present their earlier implementation or test fixtures as product completion.
- Define a mandatory founder-run acceptance journey and make any founder-critical failure block beta. Keep Phase 38 **NO GO** and pause its release-gate execution while product completion proceeds; leave `review-beta-gate-closure` and its evidence open and unchanged.
- Record the founder's subsequent Apply-stage approval that practice, achievements, leaderboards, profiles/portfolio, avatars, broad original course tracks, React, Git/GitHub, Builds, community, AI, certificates, mentors, notifications and an original commercial product role are **required V1 categories**. Their architectures, trust/claim models, policies and exact designs remain dependent decisions; none is silently delivered by naming it.

## Capabilities

### New Capabilities

- `product-readiness`: Defines the V1 inclusion contract, readiness states, integrated and founder acceptance evidence, and release sequencing for every advertised V1 capability.

### Modified Capabilities

- `beta-preparation`: Requires Phase 38 release-gate execution to remain paused and NO GO until product completion and founder acceptance; preserves existing evidence requirements when gates resume.

## Impact

The Apply stage updates planning artifacts, `docs/DEVELOPMENT_ROADMAP.md`, `docs/product.md`, `docs/decisions.md`, V1 boundary/readiness and founder-acceptance worksheets, and directly affected planning/ADR references. It does not change application code, APIs, migrations, dependencies, provider configuration, live telemetry, learner recruitment, existing beta-gate task results, or the F04/F05/F06 approval state. Each product implementation phase needs its own reviewed OpenSpec change and tests.
