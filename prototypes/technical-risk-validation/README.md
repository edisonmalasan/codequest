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

`dev` runs Vite for editor development only; use `build` then `serve` for production-built prototype assets, dedicated-origin candidates, PWA and sink probes. `serve` starts three loopback-only servers: app `http://127.0.0.1:4310`, runner `http://127.0.0.2:4311`, sink `http://127.0.0.1:4312`. No TLS trust/DNS/hosts changes or cloud services are made. Inaccessible physical mobile/Safari/assistive-technology coverage remains untested. The current owner instruction prohibits requesting manual validation.

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

`/?framePolicy=none` is a comparison variant adding the parent header `frame-src 'none'`. Preserve baseline navigation evidence; a passing Chromium comparison does not select the mechanism or prove Firefox/WebKit/physical coverage. The legacy executable-HTML preview remains an experimental failing comparison; the normal preview now uses restricted Worker results as inert text. Never use real session data in the permissive control.

The follow-up `/?framePolicy=isolated` allows only the dedicated bootstrap/preview document paths. `window.__risk.preview(html, 'dedicated')` uses a trusted runner-origin bootstrap and an inner `allow-scripts` learner frame. Inline execution and useful output are verified before evaluating denial. `node --max-old-space-size=96 scripts/preview-watchdog.mjs --dedicated` verifies an executing learner marker before starting its emergency cutoff, records prospective asset hashes, and dynamically loads Playwright only in the child to reduce parent memory use. This variant also failed CPU recovery; neither preview is selected for production.

Prototype Dexie schema revision 2 adds public lesson records keyed by task/content/assessment identity with SHA-256 response hashes. The synthetic `/__lesson/` endpoint serves only the public fixtures; it is not a production curriculum API. Missing offline lesson records are disclosed independently of existing drafts. Persistence procedures clear only the task database after closing its connection, preserve the last confirmed source after failed saves, and execute the frozen eight reload/six update/six multiclient cycle mix. These automated procedures do not establish physical background, cold-process or real storage-exhaustion behavior.

Automated Firefox 155.0 runs despite the host dependency preflight warning. To reproduce the recorded diagnostic on Windows, set `$env:PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS="1"` and run `corepack pnpm@10.30.3 exec playwright test --project=firefox`. This changes dependency preflight only; no security assertion is skipped. Earlier WebKit page creation failed; later continuation trials successfully launched WebKit 26.6. See the report for passing core preview cases and retained simulated-offline failures; no Safari physical coverage is implied. The owned preview watchdog also accepts `--firefox` and optional `--dedicated`; it records the engine and preflight setting.

The editor is read-only during draft loading; source actions become available when the lookup completes. The controlled `prototype-load-delay=500` session-storage fixture tests this race. Programmatic source replacements carry a CodeMirror annotation and do not count as user edits. New provisional completion is shown unsaved until its metadata write succeeds. These are prototype regressions, with no application code or production sync added.

## Worker-backed supplied preview continuation

The normal Open bounded preview button now reruns current learner source in the restricted opaque Worker. A fixed empty-sandbox iframe renders only escaped bounded result text; scripts, styles, external resources, forms, frames and base URLs are denied. Learner HTML/CSS output is text rather than parsed markup. A host text equivalent is updated from the same decoded result. The trusted 2-second preview deadline stops computation and removes presentation; timeout and stop remain explicit. This implements supplied DOM plumbing for function/record logic, not general DOM programming.

Run `corepack pnpm@10.30.3 exec playwright test tests/preview-recovery.spec.ts --project=chromium` or `--project=firefox` (with the documented Firefox dependency-preflight option). The owned standalone controller accepts `node --max-old-space-size=96 scripts/preview-watchdog.mjs --worker-shell --default-browser` and optional `--firefox`. It observes a run-bound trusted Worker dispatch marker before checking recovery; this marker grants no privileged host action or correctness proof. Previous executable-HTML modes remain failing comparisons.

Only the canonical app URL `/` is prepared for offline navigation. Diagnostic `?framePolicy=` URLs are not precached; the failed offline diagnostic-query trial is retained. Use canonical navigation for public offline/update integration and physical preparation. See [device validation procedures](../../docs/technical-risk-validation/manual-checklist.md) for retained procedures and limitations; they are not a request for manual owner testing.

### Offline-path controls

From this directory, with task ports free, run `corepack pnpm@10.30.3 exec playwright test tests/offline-control.spec.ts` for the fixed-response worker diagnostic. It records offline policy separately from successful diagnostic collection. Keep the existing WebKit offline failures; this is not a substitute passing gate.

Run `node scripts/cold-origin-probe.mjs chromium`, then the same command with `firefox` and `webkit`. Each invocation owns a fresh persistent profile/server, closes the prepared browser, stops its server, verifies all three origin ports refuse connections, launches a new headless process and checks cached source/check/preview before task-only cleanup. It never stops an existing service. The known WebKit Windows long-profile preparation failure is retained; compare with `node scripts/cold-origin-probe.mjs webkit --short-profile`, which uses only a newly created profile under ignored repository `temp/phase1-profiles`. This changes profile location only, not security flags. Keep observed single-trial timing separate from physical B07 and keep actual offline-emulation failures failed. Record the preflight environment option exactly when required, as in the earlier procedures.


### Installed Windows Chrome automation

Run each command separately with all task ports free. The installed-Chrome project uses headed channel `chrome`, native viewport and default GPU settings. Keyboard events are automated, not physical typing. No dedicated Browser Use/computer tool is exposed in this session. The Win32 helper only attempts restore/focus for the current test process's disposable-profile Chrome windows; failed foreground activation is recorded.

```powershell
$env:PHASE1_INSTALLED_CHROME='1'
corepack pnpm@10.30.3 test:browser
Remove-Item Env:PHASE1_INSTALLED_CHROME
node scripts/native-chrome-diagnostics.mjs
node scripts/native-chrome-diagnostics.mjs --storage-denied
node scripts/cold-origin-probe.mjs chrome --short-profile
```

The native diagnostic collects ten verified Worker loop trials, 100 Worker and 100 preview/reset cycles, actual task-profile browser zoom at 200%/400%, bounded window-state observations, CDP task-PWA installation/standalone launch, exact 8/6/6 persistence cycles and origin-refused process-cold app recovery. It uninstalls only its own task app and removes only its fresh profile. `--occlusion-control` adds one explicitly recorded comparison flag; its results are not normal-browser passes. `--storage-denied` blocks storage using only fresh-profile preferences, independently observes local/session/IndexedDB denial and verifies editable exact source with a truthful failed-save status. Native disk exhaustion and OS restart are not simulated as passes.

`tests/renderer-recovery.spec.ts` uses CDP Page.crash only on the disposable task page, then checks the real confirmed draft in a new page. It is not an OS restart or learner emergency recovery. Non-CDP engines are explicitly untested for this diagnostic. Original failures are retained, including native lifecycle/deadline failures and WebKit offline-emulation failures. Proposed [scope adjustments](../../docs/technical-risk-validation/proposed-scope-adjustment.md) have not been approved or applied.

`node scripts/native-chrome-diagnostics.mjs --retention-control` adds ten/thirty-second natural-idle resource snapshots after the same workload; it does not force GC or extend recovery/readiness budgets. Current-process CPU sums may decrease when processes exit and are not cumulative workload CPU. Run `test:browser tests/nested-worker.spec.ts` for permissive/restricted nested Blob request controls and fixed child-first-message loop rejection/recovery, recording unavailable constructor/bootstrap paths separately. The proposed persistent-bootstrap follow-up is documented in the report and is not implemented or selected.
