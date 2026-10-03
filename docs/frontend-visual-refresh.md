# Production frontend visual refresh

**Status:** Implemented, verified locally and in CI, synced, and archived. This design record is technical evidence; the revised Home-to-Course founder acceptance gate remains open. Phase 38 remains paused and `NO GO`.

## Design read

Reading this as a redesign for beginner coders: a playful field guide to connected code worlds, with strong editorial hierarchy, clear game cues, and calm, task-focused controls. The visual system keeps the CodeQuest mark and original world identity while replacing repeated dark boxes and oversized pixel headings with more deliberate compositions.

| Dial                | Existing reading | Target | Reason                                                                                        |
| ------------------- | ---------------: | -----: | --------------------------------------------------------------------------------------------- |
| Layout variation    |             3/10 |   7/10 | Home, catalog, map, forms, and editor need different compositions, not the same card grid.    |
| Motion              |             2/10 |   3/10 | Movement should clarify hover, navigation, and feedback; reduced motion must remain complete. |
| Information density |             3/10 |   5/10 | Give one published Course presence without large blank areas; make long maps scan quickly.    |

## Audit of the current implementation

- **Tokens and brand:** Deep navy canvas, mint action, sky discovery, amber reward, coral danger, Pixelify Sans headings, system body text, hard shadows, and an original portal mark. These are recognizable and remain starting materials. The mark and route slugs remain stable.
- **Information architecture:** `/` leads to `/courses`, then `/journeys/:slug`, `/courses/:slug`, and `/quests/:slug`; `/onboarding`, auth, account, offline learning, and feedback support that path. Search/filter, Retry, guest labels, and protected account states already exist. Preserve the navigation intent and semantic states.
- **Home:** A useful promise and original panorama exist, but the hero is a conventional split card and the single Journey appears in a large mostly empty rectangle. The first viewport favors atmosphere over the available learning path.
- **Catalog:** Search and topic filtering work on published metadata. With one Course, a small card sits under a large heading and full-width controls, leaving the rest of the desktop view unused.
- **Journey and Course:** Ordered hierarchy and trusted availability are present. Chapter panels repeat in a long sequence; pixel titles and exercise chips become small at full-page scale. The next eligible action needs stronger placement.
- **Lesson and workspace:** Reading, editor, and result are still vertically separated on the real Quest route. R06 owns the persistent three-region composition; this visual refresh provides its typography and surface roles.
- **Auth, account, onboarding, offline, feedback, errors:** Functional states exist with mixed route-specific utility styling. Form and account surfaces need the same visual language and clearer recovery hierarchy. Real provider verification remains an R04 gate.
- **SEO and route baseline:** Root metadata currently uses `CodeQuest` and a generic pixel-themed description; existing public paths are stable. This change preserves URLs, route labels, and published content identities. Any metadata rewrite must describe working features only.

## Visual roles and composition

- **World canvas:** Midnight outer background and crafted original landscape art establish place without carrying text or status claims.
- **Reading surface:** A warm, high-contrast, restrained instructional surface for long prose and outcomes. It may sit within a dark overall page; it must not make the editor or status text illegible.
- **Work surfaces:** Dark code and result regions with clear boundaries, practical monospace size, and stable scroll limits.
- **Type roles:** Pixel face for the mark, compact chapter/game labels, and brief celebratory moments. Readable sans for headings, Course and exercise titles, prose, forms, navigation, and actions. Monospace for code and output.
- **Color roles:** Mint is primary action and accepted progress, sky is discovery/navigation, amber is earned reward and focus, coral is error. Text or shape always accompanies a color state. Shared semantic tokens own these roles.
- **Shape and rhythm:** Strong frames around art and key actions; quieter surfaces for long reading; generous but bounded section spacing. Avoid identical dark cards, decorative status dots, generic gradient meshes, and repeated micro-labels.

## Route coverage and asset placements

| Route family                    | Primary task                                 | Planned composition / art role                                                            |
| ------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Shared shell                    | Know location and reach current destinations | Compact one-line navigation, active cue, intentional mobile menu.                         |
| Home                            | Start real published learning                | Editorial promise and one world illustration; available path visible early.               |
| Catalog                         | Find a published Course                      | Featured treatment for sparse publication, scalable result layout, working search/filter. |
| Journey                         | Choose the Course route                      | Outcome-led overview and direct Course entry.                                             |
| Course                          | Find next eligible exercise                  | Chapter landmarks, readable quest rows, explicit locks and next action.                   |
| Login/register/recover/password | Complete an auth action                      | Calm form surface, clear status and recovery; decorative art cannot obstruct fields.      |
| Account                         | Review owned facts and settings              | Identity and progress hierarchy, truthful pending/unavailable states.                     |
| Onboarding                      | Understand guest/account path                | Short sequence with accurate actions and separate import explanation.                     |
| Quest                           | Read, code, inspect                          | Current presentation refreshed; R06 owns the future simultaneous three-region shell.      |
| Offline learning                | Find available local work                    | Direct offline state and recovery, no false account claim.                                |
| Feedback                        | Preserve local notes                         | Local-only status visible near the form.                                                  |
| Error and empty states          | Recover                                      | State and next action before decoration.                                                  |

The original world illustration belongs in the Home entry and may support a published Course only if it identifies that Course accurately. New assets must be optimized and recorded in `frontend/public/assets/design-system/ASSETS.md`; no image may imply an unpublished Course, earned reward, or completed project.

The first token and art pass was checked locally in Chromium at 1440 and 390 CSS pixels: the two new world images loaded with nonzero natural width, no page error, and no document overflow. Calculated contrast ratios are 13.55:1 for reading ink on the warm surface, 6.86:1 for reading muted text, 15.37:1 for standard ink on the world panel, and 8.75:1 for standard muted text on the world panel. These are implementation checks, not a physical-device or founder review.

## Review contract

Inspect the real local app at 1440 and 1280 desktop, 820 tablet, 390 and 320 mobile CSS pixels, plus zoom-equivalent narrow reflow. Include keyboard/focus, reduced motion, image loading, browser errors, and page overflow. Capture exact commit and environment for Home, catalog, Journey, Course, auth, account, Quest, offline, feedback, and shared error states. Automated results establish integration evidence; founder acceptance requires a separate explicit review of the final build. R05 visual acceptance remains open and R06 Apply remains gated.

### Home and discovery copy

Home's first action opens `/courses`; the featured Journey entry comes from the public curriculum response, and its world art is applied only to the stable published Foundations identity. The catalog's single-Course layout remains a real result, not a placeholder for future tracks. Search, topic filtering, loading, empty, error, and retry states keep their existing semantics. Guest work is described as device-local and import remains an explicit later action.

### Course map interaction

The Course hero identifies the published Course and its authored summary. Below it, the progress notice reports only the available owner-scoped or provisional device facts, followed by a first eligible practice link when the existing model supplies one. Chapter landmarks retain published order and objectives. Exercise rows retain semantic ordered lists, a readable title, textual status, sequence number, and unmet prerequisite names. Available/completed rows remain links; locked or unavailable rows remain inert. A visual route or illustration never supplies an unlock decision. The same chapter and exercise information stacks into one column at narrow widths without horizontal page scrolling.

### Auth and support states

Auth uses a focused form surface with decorative original art only at widths that leave room for fields. Login, registration, recovery, and password update share the same frame; none of the visual treatment asserts that a provider is configured or a session is established. Onboarding presents the guest-to-account path as an ordered sequence. The account record groups identity, timezone, streak, level, pending work, and explicit guest import without changing owner checks. Feedback remains a clearly local draft. Offline learning labels cached account facts as last known and keeps recovery actions close to the saved lesson list. Error states lead with what happened and a direct retry. Loading, empty, unavailable, and saved states retain textual labels and their existing live-region semantics; decoration must never replace a status message.

### Published lesson and R06 handoff

The current Quest route now uses a warm reading surface for authored prose, a clear exercise heading, dark hint/briefing surfaces, and the existing dark Editor Workspace. This refresh retains the current vertical flow. R06 must keep one mounted workspace controller and bring lesson, CodeMirror, and output/results together at desktop widths. Tablet and mobile need explicit region access while retaining source and result state. The work surface remains bounded and the reading surface must keep dark ink contrast. Existing Worker containment, local Check, guest provisional wording, owner-scoped drafts, and backend Submit authority remain untouched. R06's active design now references these visual roles; its R05 founder-acceptance gate stays open until the revised discovery build is explicitly accepted.
