# CodeQuest Phase 1 disposable prototype

Run from this directory with Node 24 and Corepack. No root workspace/application manifest is created.

```powershell
corepack pnpm@10.30.3 install --frozen-lockfile
corepack pnpm@10.30.3 typecheck
corepack pnpm@10.30.3 lint
corepack pnpm@10.30.3 test
corepack pnpm@10.30.3 build
corepack pnpm@10.30.3 exec playwright install chromium firefox webkit
corepack pnpm@10.30.3 test:browser
corepack pnpm@10.30.3 inventory
node --max-old-space-size=128 scripts/serial-probes.mjs
node --max-old-space-size=96 scripts/preview-watchdog.mjs
```

`dev` runs Vite for editor development only; use `build` then `serve` for production-built prototype assets, dedicated-origin candidates, PWA and sink probes. `serve` starts three loopback-only servers: app `http://127.0.0.1:4310`, runner `http://127.0.0.2:4311`, sink `http://127.0.0.1:4312`. No TLS trust/DNS/hosts changes or cloud services are made. Manual mobile HTTPS/installation and real Safari/assistive-technology coverage remain untested until the owner supplies access.

The app exposes `window.__risk` exclusively as a synthetic test harness. It is not a production API or security boundary. Permissive control execution is deliberately unsafe and only for synthetic canaries. Worker source is never executed by the local servers. No real accounts, keys, application tables, telemetry, or learner data are used.

The evidence reporter writes timestamped synthetic JSON under `docs/technical-risk-validation/evidence/`, preserving failures and later retests. Each file records the current commit and dirty paths; lockfile and source commits identify reproducibility. Diagnostic security probes report policy failures even if their test successfully collected evidence. Green automation is not equivalent to a passing containment policy or physical validation.

`test:browser` owns server lifecycle. Stop a manually launched `serve` with Ctrl+C. Do not clear ordinary user browser profiles or change system certificate trust. Task build/dependency/test outputs are ignored; retained evidence is bounded synthetic metadata/source only. Private keys, certificates and profiles must stay ignored.

The serial runner avoids a separate test-worker process; it supplements the full suite. Chromium uses `--disable-gpu --renderer-process-limit=2`, with traces disabled: these measurements do not establish normal-browser performance. The preview watchdog has a separate owning process, 30-second startup allowance and an 8-second emergency cutoff after the tight loop starts. Emergency browser/process termination is a policy failure, not compliant recovery. Run each check separately on this 8-GiB machine; concurrent checks exhausted Windows committed memory.

Verified memory-constrained equivalents, run separately from this directory:

```powershell
node --max-old-space-size=384 node_modules/typescript/bin/tsc --noEmit
node --max-old-space-size=128 node_modules/typescript/bin/tsc -p tsconfig.sw.json
node --max-old-space-size=192 node_modules/eslint/bin/eslint.js .
```

`/?framePolicy=none` is a comparison variant adding the parent header `frame-src 'none'`. Preserve baseline navigation evidence; a passing Chromium comparison does not select the mechanism or prove Firefox/WebKit/physical coverage. The default preview remains an experimental failing candidate. Never use real session data in the permissive control.

The follow-up `/?framePolicy=isolated` allows only the dedicated bootstrap/preview document paths. `window.__risk.preview(html, 'dedicated')` uses a trusted runner-origin bootstrap and an inner `allow-scripts` learner frame. Inline execution and useful output are verified before evaluating denial. `node --max-old-space-size=96 scripts/preview-watchdog.mjs --dedicated` verifies an executing learner marker before starting its emergency cutoff, records prospective asset hashes, and dynamically loads Playwright only in the child to reduce parent memory use. This variant also failed CPU recovery; neither preview is selected for production.

Prototype Dexie schema revision 2 adds public lesson records keyed by task/content/assessment identity with SHA-256 response hashes. The synthetic `/__lesson/` endpoint serves only the public fixtures; it is not a production curriculum API. Missing offline lesson records are disclosed independently of existing drafts. Persistence procedures clear only the task database after closing its connection, preserve the last confirmed source after failed saves, and execute the frozen eight reload/six update/six multiclient cycle mix. These automated procedures do not establish physical background, cold-process or real storage-exhaustion behavior.

Automated Firefox 155.0 runs despite the host dependency preflight warning. To reproduce the recorded diagnostic on Windows, set `$env:PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS="1"` and run `corepack pnpm@10.30.3 exec playwright test --project=firefox`. This changes dependency preflight only; no security assertion is skipped. WebKit actual page creation still failed and remains untested. The owned preview watchdog also accepts `--firefox` and optional `--dedicated`; it records the engine and preflight setting.

The editor is read-only during draft loading; source actions become available when the lookup completes. The controlled `prototype-load-delay=500` session-storage fixture tests this race. Programmatic source replacements carry a CodeMirror annotation and do not count as user edits. New provisional completion is shown unsaved until its metadata write succeeds. These are prototype regressions, with no application code or production sync added.
