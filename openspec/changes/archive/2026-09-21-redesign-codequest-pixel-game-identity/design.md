## Context

The archived Phase 4 implementation established tokens, 13 accessible core components, seven display-only game components, and a later development-only showcase. Its visual system is largely a dark palette plus clipped corners and hard shadows. The canonical spec also forbids generated raster assets and limits pixel identity to CSS-only effects, which prevents the richer logo, map, chapter, avatar, badge, XP, achievement, and decorative language required by the roadmap.

The redesign preserves the existing frontend/backend ownership boundary, component behavior, accessibility semantics, display-only game API principle, and development-only showcase guard. The historical archive at `openspec/changes/archive/2026-09-19-design-system/` remains untouched.

Visual exploration produced three original reference images:

- [brand system](references/brand-system.png): mark construction, palette, typography, terrain/circuit motifs, chapters, emblems, and HUD.
- [quest map](references/quest-map.png): a strong game-world composition with conventional navigation and detail controls.
- [rewards and controls](references/rewards-and-controls.png): emblem, avatar-frame, XP, achievement, and clean control coexistence.

These are direction references, not production assets. Generated text and literal layouts are not source material; implementation extracts the visual rules and recreates accessible components and purpose-built assets.

Public research used for construction and accessibility principles:

- Kenney's [Pixel UI Pack](https://kenney.nl/assets/pixel-ui-pack) and [RPG UI expansion](https://kenney.nl/assets/ui-pack-rpg-expansion) demonstrate modular pixel borders, controls, and scalable parts under CC0. They are references only unless a specific file is later adopted and recorded.
- W3C's [Focus Appearance guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) supports a visible indicator at least equivalent to a two-pixel perimeter with sufficient contrast.
- W3C's [Animation from Interactions guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) informs the reduced-motion contract.
- Public game screenshots discovered during research are composition references only. No proprietary artwork, logo, map, character, or interface asset will be copied or committed.

## Goals / Non-Goals

**Goals:**

- Make an unlabelled showcase screenshot immediately recognizable as a polished pixel-game coding product.
- Establish one reusable brand grammar across logo, map, chapter, avatar frame, badge, XP, achievement, reward, and decoration.
- Keep ordinary work surfaces calm, readable, and familiar.
- Make visual review reproducible with retained references, screenshots, viewport sizes, and an explicit review checklist.
- Keep production art small, purposeful, and traceable.

**Non-Goals:**

- Building a complete quest page, dashboard, profile system, content model, or progression engine.
- Turning all typography and controls into pixel art.
- Copying a known game's visual identity or shipping research imagery.
- Introducing a general illustration pipeline, CMS, icon package, or runtime asset service.

## Decisions

### 1. Brand concept: the debugger's frontier

The core metaphor is a path through unknown systems: code brackets form a portal or compass, circuit traces become quest routes, bugs are visible obstacles, and completed work becomes crafted patches and artifacts. This connects learning, building, testing, debugging, exploration, and progress without medieval fantasy clichés or generic AI spark imagery.

The wordmark uses a compact custom pixel treatment for `CODEQUEST`; the mark must also work alone at small sizes. The body voice remains direct and adult. Alternatives considered were arcade neon, medieval RPG, and terminal-only cyberpunk. Each overweights one reference genre and weakens the education/product balance.

### 2. Hybrid surface model

Game-world surfaces receive the pixel system: identity, maps, route nodes, chapter scenes/frames, avatar frames, emblems, badges, XP/level HUDs, rewards, achievements, and sparse decorative scenery. Product controls retain modern geometry, readable sans typography, native interaction expectations, and restrained elevation.

The bridge between layers is shared semantic color, border weight, spacing, and focus treatment. This avoids the current mismatch where pixel corners are decorative stickers and avoids the opposite failure of pixelating form values, dialogs, editor content, tables, and menus.

### 3. Pixel construction rules

- Use an 8px source grid for identity art and motifs, rendered with `image-rendering: pixelated` only for raster pixel assets.
- Prefer integer scaling for pixel assets; supply a stable fallback size where responsive width would otherwise blur them.
- Use one-pixel source highlights, two-step silhouettes, and hard offset depth rather than noisy dithering on UI chrome.
- Use circuit routes with right-angle or deliberate stepped diagonal segments. Route meaning remains in ordered HTML and text.
- Use pixel display type only for short labels and headings. Body and control text use the readable sans stack; code uses the established mono stack.
- Use texture sparingly on large decorative regions and never behind unbacked body copy.

Alternatives considered were CSS-only clip paths and high-resolution painterly illustrations. CSS-only construction cannot create a sufficient chapter/world vocabulary; painterly art scales poorly across states and undermines pixel crispness.

### 4. Palette and typography

The base palette is ink `#090b12`, deep navy `#11182b`, parchment `#f2ead3`, mint `#53f6a6`, amber `#ffcb5c`, coral `#ff6b6b`, and sky `#69b7ff`, expanded into semantic ramps only after contrast measurement. Mint denotes forward progress, amber denotes reward/current attention, coral denotes faults or destructive attention, and sky denotes discovery or available paths. Text and icon labels remain mandatory, so these meanings never rely on hue alone.

The implementation will use a locally hosted, redistribution-safe pixel display font if its license and payload pass review; otherwise it will use a custom wordmark asset plus the current mono stack for short game labels. Body text stays on a system/readable sans stack unless an already-approved local font is available. No runtime font CDN is introduced.

### 5. Original asset set and provenance

Production assets are a small original family, expected to include the logo/mark, one reusable chapter panorama or tile strip, emblem sprites or individual icons, an avatar-frame set, and compact decorative motifs. SVG is preferred for marks and simple emblems; optimized WebP/PNG is appropriate for true pixel scenes. Assets are grouped by role under `frontend/public/assets/design-system/` and documented in an adjacent manifest with creator/source, license, dimensions, byte size, intended render sizes, and alt/decorative guidance.

The three generated references are original exploration artifacts, but they will not be copied wholesale into the product. Third-party packs remain construction references unless a specific CC0 or permissive file materially improves the result and is recorded. This keeps CodeQuest ownable and avoids a repository full of unrelated art.

### 6. Component redesign and API compatibility

Core component semantics and public props remain stable unless a visual state cannot be represented accessibly. Shared focus and control primitives may be introduced within the frontend, but no speculative package is created. Game components may gain optional presentation props such as artwork source, emblem, route layout hint, eyebrow, or metadata; defaults preserve existing call sites. Numeric progress clamping remains presentation safety, not progression policy.

QuestPath becomes a composed map surface at larger widths and a readable vertical journey at narrow widths. QuestNode keeps status text and DOM order while supporting stronger emblem/node silhouettes. ChapterCard, AchievementCard, LevelBadge, XPBar, and RewardPopup receive purpose-built art frames rather than generic bordered cards. Avatar language is demonstrated in the showcase without adding account behavior.

### 7. Showcase information architecture

The development-only route is organized as a review document rather than a mock product dashboard:

1. identity and design thesis;
2. tokens, type, palette, grid, borders, shadows, and motifs;
3. logo and asset specimens;
4. game HUD and progression;
5. composed quest map and chapter world;
6. achievements, badges, avatar frames, and rewards;
7. conventional core controls and all meaningful states;
8. motion and reduced-motion behavior;
9. responsive and accessibility review notes.

Large sections avoid nested-card repetition. On mobile, compositions stack in reading order and the quest route transforms rather than forcing a scaled-down desktop map.

### 8. Verification and review loop

Implementation proceeds in small visual slices. Each slice is built and tested, then the local showcase is inspected in installed Chrome at desktop (1440×1000) and mobile (390×844) widths. Screenshots are retained as change evidence and compared against the reference principles: immediate game identity, coherent assets/components, readable hierarchy, controlled density, crisp pixels, visible focus, no overflow, and no broken imagery.

Browser automation covers keyboard travel, dialog trapping/restoration, dropdown navigation, reduced motion, asset responses, console/hydration errors, and viewport overflow. Automated unit tests continue to cover behavior and presentation contracts without using brittle pixel snapshots. Contrast is calculated for token pairs and checked manually where text overlays artwork. Root/frontend lint, typecheck, tests, builds, and strict OpenSpec validation gate Sync.

## Risks / Trade-offs

- **[Generated references contain visual inconsistencies or unreadable text]** → Treat them as directional composition only; recreate all production semantics and labels in code and purpose-built assets.
- **[Pixel art overwhelms learning content]** → Restrict rich art to game-world surfaces, cap texture density, and put text on stable high-contrast surfaces.
- **[Responsive raster scaling blurs]** → Use documented source-grid multiples, `image-rendering` only on pixel assets, and mobile-specific composition rather than arbitrary shrinking.
- **[New optional props fragment component APIs]** → Add only props exercised by the showcase and keep game components display-only.
- **[Asset payload grows]** → Define a byte budget in Apply after measuring the generated source assets; optimize and remove unused variants before completion.
- **[Development showcase leaks into production]** → Preserve and test the existing production not-found guard.
- **[Visual verification becomes subjective]** → Use explicit acceptance prompts, fixed viewports, retained screenshots, and automated interaction/overflow checks alongside reviewer judgment.

## Migration Plan

1. Merge this proposal without changing runtime code.
2. Apply on a new technical implementation branch: add the token/asset foundation, redesign components in coherent slices, expand tests, and rebuild the showcase.
3. Run the browser screenshot/review loop and repair visual, accessibility, and responsive issues.
4. Sync the verified delta into `openspec/specs/design-system/spec.md` on a dedicated sync branch.
5. Archive the superseding change on a dedicated archive branch, update roadmap status to revised Phase 4 complete, and retain the old archive unchanged.

Rollback is a normal revert of the redesign Apply merge; the old archive and prior component history remain available. No data or API migration is involved.
