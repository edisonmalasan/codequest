# Web preview runtime

The R07A [interactive web execution candidate](interactive-web-execution.md) is a separate opt-in adapter with a fixed event bridge in an opaque child. It does not add script permission or DOM mutation to this static preview contract. Published Quests still use the current script-disabled preview until a separately reviewed interactive release gate passes.

Status: Phase 15 implemented, verified, synced to the canonical [Web Preview Runtime](../openspec/specs/web-preview-runtime/spec.md) and [Editor Workspace](../openspec/specs/editor-workspace/spec.md) specifications, and [archived](../openspec/changes/archive/2026-09-27-add-web-preview-runtime/proposal.md). The development-only `/editor-workspace` route demonstrates the reusable preview adapter. It is not a lesson assessment surface.

## Contract

`PreviewAdapter` in `frontend/src/features/preview/preview-types.ts` accepts a captured set of one HTML file, at most one CSS file, and at most one JavaScript file. `preview()` captures the current editor sources on an explicit action. `reload()` regenerates the last captured snapshot with a new generation ID. `cancel()` and `dispose()` invalidate active work. Results distinguish ready, error, timeout, cancelled, and unavailable; the workspace announces loading while a request is pending. A result says whether active HTML content was filtered. It never represents a Check or accepted learning outcome.

The HTML/CSS document is built with `parse5` and a conservative element and attribute allowlist. It supports headings, paragraphs, sections, lists, tables, simple disclosures, buttons as inert display, classes, accessibility labels, and bounded raster data images. It removes script, inline event attributes, forms, embeds, nested frames, SVG, navigation attributes, remote image URLs, and meta refresh. The separate CSS file provides inline style rules; external loads are denied by CSP. Unsupported content is removed and reported as filtered. This is static display, not a general website host.

Optional JavaScript is sent to a separate instance of the Phase 14 `ExecutionAdapter` after the static frame loads. It has no DOM access and cannot mutate the preview. Its bounded output and errors appear as text beneath the frame. The workspace's Run adapter remains independent. HTML/CSS rendering works when the runner is unavailable, with a truthful computation error if a JavaScript file was supplied.

| Bound | Limit |
| --- | ---: |
| HTML source | 64 KiB UTF-8 |
| CSS source | 32 KiB UTF-8 |
| JavaScript source | 64 KiB UTF-8 |
| Generated document | 128 KiB UTF-8 |
| Message packet | 144 KiB UTF-8 |
| Preview bootstrap handshake | 1 second |
| Static frame load | 2 seconds |

The Phase 14 Worker retains its own 2-second computation deadline, 1-second recovery bound, and output limits. Browser process memory has no hard per-preview quota; bounded source and one active child reduce exposure but do not guarantee a memory ceiling.

## Deployment boundary

Set `NEXT_PUBLIC_PREVIEW_ORIGIN` to a credential-free HTTPS origin distinct from the authenticated application origin and `NEXT_PUBLIC_RUNTIME_ORIGIN`. Loopback HTTP is accepted only for local development. Missing, malformed, insecure, or colliding values leave Preview unavailable. The preview origin must preserve its Host header at the Next.js edge and serve only `/preview/bootstrap.html` and `/preview/bootstrap.js`; middleware returns 404 for other routes on that host, including app auth routes and Phase 14 runner resources. Do not attach app cookies, auth middleware, a service worker, or authenticated API routing to that host. Use separate cookie scope and avoid sharing a parent-domain cookie with the preview host.

`frontend/next.config.ts` sets fixed-resource CSP, `no-referrer`, `nosniff`, and `no-store` headers. The development workspace response allows frames from configured runner and preview origins. A future production parent route must allow only those exact frame origins in its own frame policy. The trusted bootstrap iframe permits its own fixed script on the separate origin; its nested learner frame has an empty sandbox permission set, an opaque origin, and an additional restrictive CSP. The generated document does not receive a MessagePort or auth material.

The app checks the exact frame window, preview origin, and random bootstrap ID before transferring a private port. The bootstrap checks its parent source and origin. Each render uses a fresh generation ID; packets are bounded and correlated. Failures, cancellation, replacement, and unmount clear the child frame and invalidate active results. A failed preview leaves editor source and owner-scoped local drafts intact.

Focused Playwright coverage in Chromium, Firefox, and WebKit exercises static output, stripped active content, opaque child origin, blocked app/runner routes on the preview host, Worker isolation and loop recovery, reload, and 390 CSS-pixel reflow. The browser tests are the containment gate; no production lesson route currently mounts this adapter.
