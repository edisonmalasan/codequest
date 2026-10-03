# Design

## Context

See `proposal.md` for the acceptance gap. The current Home uses a contained image card and three long text sections; the catalog and Course pages use the same dark-card rhythm. The Course map is a full-width stack of chapter slabs, while the current public reference demonstrates a more layered illustrated entry, a dense course library, and a progression path paired with a compact learner-context column. CodeQuest publishes one complete Course. Public research images remain temporary comparison material and will not be committed.

The existing public curriculum API, protected Course progress, guest-local facts, and link versus locked-node behavior are already implemented. This change can recompose their presentation without moving authority or adding API fields. The original R05 visual decision was withdrawn; the technical visual refresh is archived, but the revised founder gate remains open.

## Goals / Non-Goals

**Goals:** Give real Home-to-Course pages stronger visual identity and task hierarchy; keep currently published learning prominent; make chapter progression and status easy to scan; preserve existing semantics and responsive use.

**Non-Goals:** Additional Course publication, fictional catalog entries, new game rewards, practice/projects/community surfaces, R06 three-pane lesson implementation, API/backend changes, external artwork or copied page layouts, and Phase 38 release evidence.

## Decisions

### 1. Use page-specific compositions inside shared visual roles

Home gets a broad illustrated entry and a compact published-learning section. Catalog uses an illustrated introduction, controlled filters, and a featured Course treatment when only one is published. Journey becomes a world overview with ordered Course entry. Course uses an immersive course banner, connected chapter path, and an adjacent learner-context area at desktop widths. Shared canvas, type, focus, actions, and status roles keep them related. This is more legible than repeating identical card sections on every page; a literal replica of another site would discard CodeQuest's own content and identity.

### 2. Keep publication and learner facts as the only content inputs

All Course/Journey names, counts, summaries, chapter and exercise ordering, links, and unlock states continue to come from the existing API and guest/protected adapters. The featured layout is selected from the returned collection size, not hardcoded Course existence. The status area may show existing course progress and eligibility; it cannot calculate XP or infer account completion. If an owner read fails, it explicitly reports unavailable state. A separate factual status band can explain guest-local work without pretending it is account progress.

### 3. Make original art decorative and resilient

Reuse approved CodeQuest world assets where they fit and create new placement-specific original assets only where necessary. Record source, purpose, dimensions, file size, and alt treatment. Use dark backing/overlays behind text and test unloaded-image fallback. Do not copy research imagery, logos, icons, layout measurements, or wording. Hero art should be visible enough to establish a world while leaving the first action on screen.

### 4. Treat the Course path as the primary structure

Keep existing semantic headings, chapter lists, quest links, and non-interactive locks. Use a visible progression spine and compact chapter headers to reduce repetitive slab weight. Place a separate status/context area beside it on sufficiently wide screens, then before or after the path in document order on tablet/mobile. The status area is not an independent progress store and has no new write actions. Avoid making every locked row look like a playable button.

### 5. Use measured responsive behavior and exact-build review

Review at 1440, 1280, 820, 390, and 320 CSS pixels. Desktop can show discovery columns and the Course status area; tablet reduces columns; mobile uses full-width readable cards and ordered chapter sections. Check focus, reduced motion, image fallback, scroll/overflow, loading/error/empty states, and working links. Save screenshots of CodeQuest only, tied to implementation commit and environment. Record automated integration separately from an explicit founder decision; the R06 gate stays open until acceptance.

## Risks / Trade-offs

- [Single published Course leaves less content than a mature catalog] -> Make the real Course substantial and keep future breadth in the roadmap, without false cards.
- [Art obscures reading or increases transfer] -> Use responsive assets, measured overlays, image optimization, fallback, and byte checks.
- [A status rail becomes false progress authority] -> Render only existing owner-scoped or labeled local facts; test failed protected reads.
- [Course path styling harms keyboard semantics] -> Preserve list/link structure and run focus, target-size, and responsive checks.
- [Visual similarity is mistaken for founder acceptance] -> Keep the exact-build R05 gate open until the founder explicitly accepts the final CodeQuest implementation.

## Migration Plan

This is a frontend presentation change with no persisted-state or API migration. Retain stable routes and data contracts. Rollback is a presentation revert; drafts and backend learning facts are unaffected.
