## Context

See [proposal.md](proposal.md) for motivation. Phase 10 exposes public typed reads for Journey detail, Chapter detail, and Quest detail. Journey detail has no free-form description, Chapter detail includes ordered quest summaries, and only Quest detail includes prerequisite IDs. No endpoint supplies accepted/provisional completion state, and production curriculum publication is intentionally empty. The design system already owns display-only `ChapterCard`, `QuestPath`, `QuestNode`, and `Progress` components.

Frontend documentation permits provisional unlock simulation from delivered prerequisites but keeps accepted progress and unlock authority in NestJS. Phase 11 therefore needs a useful navigation model without claiming that account progress was loaded or adding a premature backend/progress contract.

## Goals / Non-Goals

**Goals:**

- Create a reusable Journey/Course-map feature that consumes the generated client wrapper and composes the existing visual system.
- Make ordering, completion counts, prerequisite availability, one active/current cue, and failure states deterministic and independently testable.
- Keep the real route honest when no completion source or published production Journey exists.
- Give future progress integration one explicit input seam without defining its transport or persistence now.

**Non-Goals:**

- Defining or fetching authoritative account progress, attempts, submissions, unlock decisions, XP awards, or guest import.
- Adding a Journey description field, aggregate map endpoint, or any other backend/OpenAPI change.
- Rendering lesson bodies, hints, starter code, an editor, execution, checks, or quest-detail navigation.
- Publishing the draft JavaScript Foundations fixture or adding demo data to production paths.

## Decisions

### Use one canonical route and one terminology model

The product route is `/journeys/[slug]`. “Course map” is a section label within that page. This matches the approved `Journey > Chapter > Quest` hierarchy while honoring Course as a display synonym. A separate `/courses/[slug]` UI route is unnecessary and could make Course appear to be a second domain object.

Alternative considered: mirror both backend aliases as frontend pages. Rejected because it creates duplicate canonical URLs without a user need.

### Load the complete public prerequisite graph through the existing wrapper

A curriculum query first loads Journey detail, then its Chapter details in parallel, then each published Quest detail in parallel. The final step is needed because quest summaries omit prerequisites. Every call receives the query abort signal. Any nested failure prevents course-map derivation; the UI may retain only safe, already rendered overview information or show the consolidated failure state, but it does not infer availability from a partial graph.

Alternative considered: infer a linear unlock path from positions. Rejected because curriculum supports an explicit prerequisite graph and unlocks must not silently become order-based.

Alternative considered: expand the Phase 10 summary DTO. Rejected because this task explicitly uses the existing generated API and does not reopen backend/API behavior.

This is an accepted MVP request-volume trade-off. A later progress/navigation projection may replace the fan-out through its own proposal if published course size or latency justifies it.

### Separate transport loading from a pure presentation model

The feature will contain:

1. a cancellable loader/query that returns the complete published graph or a normalized page failure;
2. a pure builder that sorts the graph and combines it with a `JourneyCompletionSnapshot`;
3. presentational Journey overview and Course-map components that receive the resulting view model.

The snapshot contains stable completed quest IDs and an authority label (`none`, `provisional`, or `accepted`). Phase 11 route construction uses `none` with an empty set. Tests can supply provisional/accepted fixtures to verify every state without wiring a fake production progress source. A later approved progress capability can populate the seam without moving business authority into the components.

### Derive only bounded display state

For each sorted quest:

- supplied completed ID -> `completed`;
- otherwise, any unmet prerequisite ID -> `locked`;
- otherwise, first eligible incomplete quest in the full route -> `current` (the UI expression of “active”);
- remaining eligible incomplete quests -> `available`.

Chapter state is `completed` when all its quests are completed, `in_progress` when it contains any completion or the current quest, `locked` when all incomplete quests are locked, and `not_started` otherwise. Overall and chapter progress are counts derived from the same supplied IDs and published totals; unknown IDs do not affect counts. No value is persisted or sent to the backend.

The current cue is a navigation emphasis, not the approved `in_progress` learning status. This distinction prevents a page visit from asserting that work has begun.

### Generate overview copy only from returned facts

Because the current API has no authored description, the overview uses a fixed accessible sentence such as “Explore {title} through {questCount} quests across {chapterCount} chapters,” followed by the API's entry requirements and outcomes. This satisfies the roadmap's descriptive overview without fabricating curriculum prose or expanding the API.

### Keep Phase 11 nodes non-navigating

Existing `QuestNode` supports display-only rendering when no selection callback is provided. Phase 11 uses that mode for all quest states because there is no approved lesson route. Chapter navigation may use in-page anchors so a learner can move from the chapter summary to its map without entering Phase 12.

### Use the client query boundary for inspectable UI states

The route's small server page validates and passes the slug to a client feature component. TanStack Query uses the existing browser API wrapper, which makes loading/retry behavior explicit and allows Playwright to intercept public API reads without starting or altering the backend publication catalog. Unit tests exercise the pure model and component semantics; Playwright supplies a public curriculum graph over network interception to inspect the assembled route at desktop and mobile widths.

### Reuse original design-system assets without assigning domain meaning

The Journey hero and maps may reuse the original Foundations Valley artwork as decoration with stable text backing. Chapter sections use the same image treatment unless future API metadata supplies reviewed chapter artwork. Decorative repetition is hidden from assistive technology; text conveys titles, objectives, order, and state.

## Risks / Trade-offs

- **Quest-detail fan-out increases initial requests and payload size** -> Run requests in parallel with cancellation and query caching; record it as a bounded Phase 11 compromise and do not invent a backend projection in this change.
- **An empty completion snapshot can look like a reset** -> State plainly that saved progress is not loaded in this phase and avoid “accepted” wording. There is currently no completion-producing product flow, so this is truthful for the implemented system.
- **Future progress APIs may use richer status semantics** -> Keep the snapshot/view-model seam internal and stable-ID based; authoritative backend data can replace the empty input later.
- **Partial data could produce false unlocks** -> Treat any required nested failure as a map-loading failure and never derive from a partial prerequisite graph.
- **Production curriculum is empty, limiting live visual review** -> Use network-intercepted Playwright fixtures sourced from the public DTO shapes, without publishing draft content or adding fixture fallbacks to production code.

## Migration Plan

1. Add the new frontend feature and dynamic route without changing existing routes or generated files.
2. Verify unit/component and intercepted-browser behavior while the production publication remains empty.
3. Deploy as an additive route. Rollback removes the route and feature files; no persisted data, backend contract, or migration needs reversal.

## Open Questions

None for Phase 11. Authenticated progress sourcing, a map-optimized backend projection, and quest navigation become decisions in their later capability proposals.
