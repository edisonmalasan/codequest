## Context

See [proposal.md](proposal.md) for motivation. Phase 10 already delivers a bounded `QuestDetail` containing restricted static Markdown and graduated hints through the generated frontend contract. Phase 11 renders prerequisite-aware map states but deliberately has no lesson links. Authored `lesson.mdx` may reference validated local PNG/WebP files, while the public API currently has no asset operation. Production publication remains empty, so tests require published fixtures and the implementation must not publish draft Q01.

## Goals / Non-Goals

**Goals:** Preserve the backend-owned publication boundary; render the already approved Markdown subset without code execution; make local illustrations retrievable without exposing storage paths; provide a focused, responsive reading route; connect only non-locked map nodes; and verify security, accessibility, and browser behavior.

**Non-Goals:** Introduce a general MDX runtime, content authoring UI, production publication, editor/workspace, learner execution, Check/Submit, progress persistence or acceptance, reward logic, offline/PWA caching policy, authentication changes, or new application tables.

## Decisions

### 1. Parse static Markdown on the frontend without HTML evaluation

Use a maintained CommonMark React renderer as a task-specific dependency and map its supported nodes to CodeQuest presentation components/classes. Do not enable raw-HTML parsing or MDX plugins. Apply explicit link and image URL transforms even though backend validation already rejects unsafe authored markup; the client must fail safely if a malformed response bypasses that boundary.

A custom Markdown parser was rejected because correctness around nesting, escaping, code fences, and accessibility would create avoidable security and maintenance risk. Server-side HTML generation was rejected because it would add a second output-sanitization contract and still require trusted HTML injection in the frontend.

### 2. Keep document structure semantic and styling presentation-only

Treat the API lesson string as a document fragment beneath the page's Quest `h1`. Normalize authored heading levels so the lesson cannot introduce a second page-level heading or skip the route hierarchy. Render ordered lists as task instructions, blockquotes as visually distinct callouts, inline code separately from fenced examples, and fenced language metadata as a visible code label. Long code receives a keyboard-focusable labeled horizontal-scroll region; the page itself does not overflow.

Special shortcode syntax and custom MDX callout/example components were rejected because the Phase 9 authoring contract deliberately allows only static Markdown. The existing constructs are sufficient and remain portable.

### 3. Deliver illustrations through a version-pinned curriculum asset operation

Add a public read-only operation shaped as `GET /api/v1/quests/:slug/assets/:contentVersion?path=<relative asset path>`. The catalog resolves the currently selected Quest snapshot and returns a copied binary descriptor only when the requested version matches, the normalized path is under that snapshot's `assets/` directory, the extension is PNG/WebP, the file is regular/non-symlinked, and the size is within the existing 256 KiB authoring bound. Unknown and invalid requests share the safe curriculum not-found envelope. Responses set the exact media type, `X-Content-Type-Options: nosniff`, and immutable version cache metadata.

The renderer rewrites only `./assets/<validated path>` to this operation using the current slug/content version. Returning data URLs inside Quest JSON was rejected due to payload inflation and caching; copying backend curriculum into frontend public assets was rejected because it breaks ownership/publication boundaries; remote image URLs were rejected due to provenance, tracking, availability, and privacy concerns.

### 4. Use route-level query state and keep the lesson component pure

The `/quests/[slug]` client boundary uses the existing Query provider and `createCodequestApi().getQuest`, with an AbortSignal and the established HTTP/network/cancelled/invalid-response taxonomy. A pure lesson view receives a validated `QuestDetail`, allowing focused semantic and safety tests. Loading, not-found, recoverable failure, and invalid-response states follow the established Journey-page language without exposing raw diagnostics.

Server-side direct backend imports and duplicate fetch contracts were rejected because all frontend curriculum consumption must pass through the generated OpenAPI client boundary.

### 5. Hints use native progressive disclosures

Render the three API hint fields as ordered native `details` disclosures, initially closed, with descriptive summaries and 44-pixel interaction height. This preserves keyboard and screen-reader behavior with minimal state while keeping later hints learner-controlled. Opening a disclosure has no persistence, analytics, reward, or progress side effect.

Tabs or a custom accordion were rejected because native disclosure semantics meet this phase's behavior without adding focus-management machinery.

### 6. Course-map navigation uses real links

Extend the presentational `QuestNode` API with an optional `href`. Non-locked Phase 11 nodes receive `/quests/<encoded slug>`; locked nodes receive none. Use framework links with normal link semantics rather than click handlers so keyboard behavior, status bars, opening in a new tab, and route prefetch remain conventional. The component continues to derive no domain state and fetch no data.

### 7. Verification covers contracts, rendering, security, and reflow

Backend tests cover selected asset success, headers, version mismatch, traversal, unsupported types, missing/draft assets, and safe errors. Regenerate OpenAPI through the existing script and test wrapper stability; the browser can construct the asset URL from the public API base without a hand-edited generated file. Frontend component/page tests cover every allowed Markdown form, heading normalization, inert HTML/MDX-looking text, protocol filtering, image rewriting/fallback, graduated hints, and query states. Playwright intercepts curriculum JSON and a binary illustration to verify map navigation, keyboard disclosures, reduced motion, loaded assets, console/runtime health, and no page overflow at desktop and 390-pixel mobile widths.

## Risks / Trade-offs

- **Markdown renderer dependency expands the client bundle** → select one focused maintained renderer, omit plugin stacks, and inspect the production build.
- **Frontend defense and backend authoring rules can drift** → encode the same allowed URL/media expectations in focused tests and keep the backend as publication authority.
- **Cross-origin API images can reveal the API origin in markup** → construct URLs only from the configured public API base, send no credentials, and expose no filesystem data.
- **Heading normalization can differ from author intent** → document that authored headings are fragment-relative and verify a stable page outline.
- **Empty production publication prevents a live production lesson review** → use isolated published fixtures in unit/E2E tests and preserve the empty manifest; actual publication remains a separately reviewed content change.

## Migration Plan

Deploy the additive asset operation and lesson route with the existing empty publication manifest. No data migration or authentication change is required. Rollback removes the route, renderer dependency, map links, and asset operation; authored snapshots and API Quest representations remain intact.
