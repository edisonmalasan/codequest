# Phase 1 coverage inventory

Updated 2026-09-13 after available automation. Source: [charter](charter.md), approved [validation spec](../../openspec/changes/validate-codequest-technical-risks/specs/technical-risk-validation/spec.md), and the project owner's explicit device/reviewer instruction. Availability is separate from an experiment verdict. Available automation is summarized in the [preliminary report](report.md); physical/manual configurations remain untested.

| Configuration | Access status | E01 editor | E02 runtime | E03 containment | E04 preview | E05 offline/PWA | E06 integration |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Physical Windows development machine, Chrome | Hardware confirmed by owner; installed browser build to record when testing | Untested | Untested | Untested | Untested | Untested | Untested |
| Same physical Windows machine, Firefox | Hardware confirmed by owner; installed browser build to record when testing | Untested | Untested | Untested | Untested | Untested | Untested |
| Physical macOS Safari | Unconfirmed; await explicit access | Untested | Untested | Untested | Untested | Untested | Untested |
| Physical Android Chrome | Unconfirmed; await explicit access | Untested | Untested | Untested | Untested | Untested | Untested |
| Physical iPhone Safari, browser mode | Unconfirmed; await explicit access | Untested | Untested | Untested | Untested | Untested | Untested |
| Physical iPhone, home-screen mode | Unconfirmed; await explicit access | Untested | Untested | Untested | Untested | Untested | Untested |
| Declared lower-powered physical device | Not selected; do not infer from preliminary Windows hardware | Untested | Untested | Untested | Untested | Untested | Untested |
| Automated Chromium 153.0.8010.12 / Playwright 1.63.0 | Headless, GPU disabled, renderer limit two; physical coverage separate | Focused checks passed | Focused checks/100 cycles passed; hard memory quota unverified | Focused request/storage/message checks passed; complete gate unverified | **Failed self-navigation and tight-loop recovery**; parent-CSP navigation comparison passed | Save/prepared offline/update checks passed; physical cold/install untested | Q01/mock focused checks passed; combined preview gate unverified |
| Automated Firefox / Playwright 1.63.0 | Downloaded; missing msvcp140_1.dll prevents launch | Untested | Untested | Untested | Untested | Untested | Untested |
| Automated WebKit / Playwright 1.63.0 | Downloaded; could not create browser page | Untested | Untested | Untested | Untested | Untested | Untested |

| Accessibility configuration | Access / test state |
| --- | --- |
| Keyboard-only on confirmed Windows hardware | Exact input/browser configuration to record; untested |
| NVDA with declared Windows browser | Availability unconfirmed; untested until owner explicitly provides access |
| VoiceOver with Safari/macOS or iOS | Availability unconfirmed; untested until owner explicitly provides access |
| Zoom/reflow and reduced motion | Procedure declared in charter; untested |

At testing time record exact hardware, Windows/OS version, installed Chrome/Firefox/browser build, viewport, input method, power/thermal state, network condition, candidate topology and applicable assistive-technology version/configuration. Keep preliminary inventory separate from the dated run record. Automated Firefox/WebKit build versions are not installed Firefox/Safari product versions.

Populate each cell only from linked measured/manual evidence. Use passed, failed, unsupported or untested per capability; unconfirmed access is untested, not unsupported or passed. Installation verdicts are separate from browser learning verdicts. Required missing evidence makes the final progression gate inconclusive; no mobile/Safari promise or independent security-audit claim follows from project-owner self-review.
