# Phase 1 coverage inventory

Updated 2026-09-14 after available automation. Source: [charter](charter.md), approved [validation spec](../../openspec/changes/validate-codequest-technical-risks/specs/technical-risk-validation/spec.md), and the project owner's explicit device/reviewer instruction. Availability is separate from an experiment verdict. Available automation is summarized in the [preliminary report](report.md); physical/manual configurations remain untested.

| Configuration | Access status | E01 editor | E02 runtime | E03 containment | E04 preview | E05 offline/PWA | E06 integration |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Physical Windows development machine, Chrome | Hardware confirmed by owner; installed browser build to record when testing | Untested | Untested | Untested | Untested | Untested | Untested |
| Same physical Windows machine, Firefox | Hardware confirmed by owner; installed browser build to record when testing | Untested | Untested | Untested | Untested | Untested | Untested |
| Physical macOS Safari | Unconfirmed; await explicit access | Untested | Untested | Untested | Untested | Untested | Untested |
| Physical Android Chrome | Unconfirmed; await explicit access | Untested | Untested | Untested | Untested | Untested | Untested |
| Physical iPhone Safari, browser mode | Unconfirmed; await explicit access | Untested | Untested | Untested | Untested | Untested | Untested |
| Physical iPhone, home-screen mode | Unconfirmed; await explicit access | Untested | Untested | Untested | Untested | Untested | Untested |
| Declared lower-powered physical device | Not selected; do not infer from preliminary Windows hardware | Untested | Untested | Untested | Untested | Untested | Untested |
| Automated Chromium 153.0.8010.12 / Playwright 1.63.0 | Headless, GPU disabled, renderer limit two; separate default-flags watchdog passed | Focused checks passed; physical input untested | Focused checks/100 cycles passed; hard memory quota unverified | Focused request/storage/message checks passed; required physical gate untested | Worker supplied-shell core passed: 10 verified loops/100 executed resets/inert hostile markup. Legacy executable-HTML navigation/CPU failed | Prepared offline/update/20-cycle mix/clearing/version and single headless cold-origin functional check passed; native quota inconclusive; physical cold/install/background untested | Q01/mock and Worker-preview/offline focused checks passed; physical integrated gate untested |
| Automated Firefox 155.0 / Playwright 1.63.0 | Headless; dependency preflight explicitly bypassed; actual browser executed | Focused checks passed; physical input untested | Focused checks/100 cycles passed; hard memory quota unverified | Focused request/storage/message checks passed; required physical gate untested | Worker supplied-shell core passed: 10 verified loops/100 executed resets/inert hostile markup. Legacy executable-HTML navigation/CPU failed | Canonical prepared offline/update/20-cycle mix/clearing/version and single headless cold-origin functional check passed after retained regressions; native quota/physical cases untested | Q01/mock and Worker-preview/offline focused checks passed; physical integrated gate untested |
| Automated WebKit 26.6 / Playwright 1.63.0 | Headless actual browser now available; dependency preflight explicitly bypassed; not physical Safari | Focused checks passed; physical input untested | Focused checks/100 cycles passed; hard memory quota unverified | Focused request/storage/message checks passed; required physical gate untested | Worker supplied-shell core passed: 10 verified loops/100 executed resets/inert hostile markup; standalone watchdog passed | **Failed simulated-offline new-page/reload gates** despite activated controller/public cache. Fixed-response worker control reproduces failure before fetch-handler delivery. Single headless cold-origin functional check passed only with shorter task profile; longer-profile online preparation reports a CacheStorage filesystem error. Corrected server-version fixture and 20-cycle mix passed. Native quota/physical cases untested | Q01/mock focused checks passed; **combined offline-preview gate failed**; physical integrated gate untested |

| Accessibility configuration | Access / test state |
| --- | --- |
| Keyboard-only on confirmed Windows hardware | Exact input/browser configuration to record; untested |
| NVDA with declared Windows browser | Availability unconfirmed; untested until owner explicitly provides access |
| VoiceOver with Safari/macOS or iOS | Availability unconfirmed; untested until owner explicitly provides access |
| Zoom/reflow and reduced motion | Procedure declared in charter; untested |

At testing time record exact hardware, Windows/OS version, installed Chrome/Firefox/browser build, viewport, input method, power/thermal state, network condition, candidate topology and applicable assistive-technology version/configuration. Keep preliminary inventory separate from the dated run record. Automated Firefox/WebKit build versions are not installed Firefox/Safari product versions.

Populate each cell only from linked measured/manual evidence. Use passed, failed, unsupported or untested per capability; unconfirmed access is untested, not unsupported or passed. Installation verdicts are separate from browser learning verdicts. Required missing evidence makes the final progression gate inconclusive; no mobile/Safari promise or independent security-audit claim follows from project-owner self-review.

Current engine results and retained failures/retests are linked in the [Worker-preview continuation](report.md#worker-preview-redesign-continuation---2026-09-13). A passing cache/outage diagnostic is not a passing network-offline or physical cold-launch gate.

See [offline-path and profile-location diagnostics](report.md#offline-emulation-and-cold-origin-diagnostics---2026-09-14): origin refusal/cold headless recovery is not physical offline timing, and a minimal-worker collection pass does not pass WebKit offline emulation.
