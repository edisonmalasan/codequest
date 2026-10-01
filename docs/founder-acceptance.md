# V1 Founder Acceptance worksheet

**Status: NOT STARTED.** This is a blank future R15 worksheet, not a test result, release approval or Phase 38 evidence. Every capability in the [approved V1 boundary](v1-product-boundary.md) must be feature complete and integrated before the founder performs acceptance on the real configured app. Use synthetic accounts and project data. Do not record credentials, bearer tokens, raw private source, payment details, protected responses or sensitive provider payloads in Git.

## Acceptance rule

Record one completed scenario form for **every** core and extension scenario below. The founder personally performs or witnesses the exact V1 app flow; supporting CI or another tester cannot sign this gate. A founder-critical failure, untested required scenario, mismatched release/build, or unresolved blocker sets final founder acceptance to **FAIL / OPEN**. Fixes require a dated retest on the new exact build, and the affected dependent scenarios must be repeated. R16 Phase 38 release-gate execution remains paused and `NO GO` until the whole R15 gate passes; R15 itself does not imply beta GO.

### Release-wide header — fill only when a candidate exists

- Exact release/build/commit: **unselected**
- Frontend build/artifact identifier: **unselected**
- Backend build/artifact identifier: **unselected**
- Published curriculum and assessment versions: **unselected**
- Environment, application/API/runtime/preview origins and provider configuration version: **unselected**
- Declared device/OS/browser/AT matrix: **unselected**
- Founder/tester identity and role: **unassigned**
- Test start/end dates and timezone: **unrecorded**
- Final founder acceptance: **OPEN — no scenario evidence**

### Required record for each scenario

| Exact field | Entry |
| --- | --- |
| Capability ID and scenario ID | _blank_ |
| Release/build/commit, including frontend/backend artifact IDs and curriculum versions when relevant | _blank_ |
| Environment, origin and relevant safe configuration version | _blank_ |
| Tester and founder witness/approver | _blank_ |
| Date/time and timezone | _blank_ |
| Expected behavior | _blank_ |
| Observed behavior | _blank_ |
| Pass/fail (`PASS`, `FAIL`, `UNTESTED`) | `UNTESTED` |
| Defect ID, severity, owner and evidence link | _blank_ |
| Retest build/date/tester/result and affected dependent scenarios | _blank_ |
| Final founder acceptance (`ACCEPTED`, `REJECTED`, `OPEN`) and dated sign-off | `OPEN` |

## Mandatory core journey scenarios

These are **scenario definitions**, not completed evidence. Use separate synthetic accounts for distinct provider paths and preserve ownership isolation. The founder may split a scenario across sessions only when the same exact candidate and required state continuity are recorded.

| ID | Capability / scenario | Expected behavior to verify |
| --- | --- | --- |
| FA01 | Home and app navigation | Original polished home loads, exposes clear routes and accessible global navigation without dead ends. |
| FA02 | Browse and search courses | Catalog search/filter returns truthful complete available courses and correct empty/error states. |
| FA03 | Choose journey/course/chapter/exercise | Distinct hierarchy, prerequisite and progress context are understandable and navigable. |
| FA04 | Supported guest learning | Guest can read, edit, Run and Check supported work; device-local provisional status is unmistakable. |
| FA05 | Account creation and email confirmation | Real configured Supabase sends/accepts confirmation, handles pending/expired/error states and establishes the intended account. |
| FA06 | Email login and logout | Session starts and ends correctly, protected views clear, and safe return path works. |
| FA07 | Google OAuth | Real provider redirect/callback establishes only the correct verified account, with safe failure recovery. |
| FA08 | GitHub OAuth | Real provider redirect/callback establishes only the correct verified account, with safe failure recovery. |
| FA09 | Guest import | Explicit import binds work only to the verified account; incompatible source remains recoverable. |
| FA10 | Open course and lesson | Published original lesson, chapter/course context, examples and accessible instructions load through the API. |
| FA11 | Desktop three-pane workspace | Lesson, CodeMirror editor and output/preview remain persistently usable together; exercise bar is clear. |
| FA12 | Tablet/mobile layout | Declared supported devices use intentional panel/focus patterns with retained source and no squeezed three-column layout. |
| FA13 | Edit and multi-file handling | Where required, file tabs/source/drafts survive switches and revisions without cross-owner leakage. |
| FA14 | Run and inspect console/output | Bounded run, errors, cancellation and recovery work; output is current and distinguishable from Check. |
| FA15 | Rendered preview | Static and approved interactive exercises render within their specified isolated capability; hostile content cannot cross the trust boundary. |
| FA16 | Check and hint | Deterministic feedback is understandable, correctly scoped to the edited snapshot, and hints do not silently complete work. |
| FA17 | Submit/complete | Local pass is distinguished from pending/accepted backend completion; failures preserve source. |
| FA18 | Progress, XP, level, rank, streak, unlock and badge effects | Backend-accepted facts, permitted reward rules and truthful provisional labels appear without repeat farming or verified-claim overreach. |
| FA19 | Back/Next and course map | Navigation moves through exercises; accepted map state and prerequisites update correctly. |
| FA20 | Refresh and browser close/reopen | Device draft and accepted account facts restore according to their distinct durability contracts. |
| FA21 | Logout/login and retained progress | Correct owner sees accepted state again; another owner cannot see or inherit it. |
| FA22 | Password recovery/change | Real email link, callback, update and failure/expired-link behavior work on the configured environment. |
| FA23 | Account/profile | Private profile, settings, avatar, portfolio visibility and deletion entry points match approved policy. |

## Required V1 extension scenarios

Each advertised course and product category must add concrete course/version or feature-specific records using the form above. These category-level rows are the minimum; one pass cannot stand in for all courses, runtimes, devices or entitlement states.

| ID | Required extension | Expected behavior to verify before R15 passes |
| --- | --- | --- |
| FX01 | Complete original curriculum breadth | Founder traverses a representative full course in **each** required topic/runtime family; curriculum/content reviewers complete every advertised course/version. No empty catalog cards. |
| FX02 | HTML/CSS/DOM and interactive learning | Original exercises teach browser interaction; approved isolated runtime and preview recover from errors/loops without privileged access. |
| FX03 | Standalone Practice | Start, retry, feedback and recorded state follow the separate practice policy without unintended quest XP. |
| FX04 | Daily challenges | Calendar/timezone, eligibility, start/check/result and missed-day states follow approved challenge rules. |
| FX05 | Fair leaderboards and ranks | Independently defensible result source, anti-abuse, tie/appeal handling and privacy work; client-reported course completion is not falsely called verified competition. |
| FX06 | Achievements, badges and avatars | Earning/display rules and original character customization persist and remain accessible; no false mastery claim. |
| FX07 | Builds and private project saving | Create, edit, run, save, reopen and delete original project; owner isolation and source durability hold. |
| FX08 | Public project and portfolio | Publish/unpublish, visibility, safe rendering, reporting and deletion follow approved security/privacy policy. |
| FX09 | Community and events/challenges | Join, post/interact, report, moderate, withdraw and remove content under approved operator controls. |
| FX10 | AI/help and mentors | Help is bounded, privacy-aware and clearly non-authoritative for normal correctness; mentor contact/service expectations are truthful. |
| FX11 | Certificates | Issuance, verification, revocation and wording match the approved assessment/claim model; no current client pass is presented as verified mastery. |
| FX12 | Notifications | Approved channels, consent/preferences, delivery, opt-out and cross-account isolation work. |
| FX13 | Commercial role | Original plans/prices/entitlements, signup/upgrade/cancel/error and access states match approved payment, privacy and consumer policy; use synthetic payment methods for prelaunch testing. |
| FX14 | PWA/offline/reconnect | Declared offline-capable V1 surfaces, install/update/restart and pending-state recovery work on supported devices; unavailable actions explain the limit. |
| FX15 | Accessibility/responsive | Keyboard, screen reader, touch, zoom/reflow, reduced motion and physical supported-device flows meet the declared matrix. |
| FX16 | Privacy/account deletion | Verified request, optional collection withdrawal, project/community/account handling and recovery limits match final approved F06 policy. |

## Gate closure summary — unfilled

| Gate | Required entry | Current result |
| --- | --- | --- |
| V1 inclusion matrix | Every required V1 capability has complete, integrated, founder-accepted evidence | **OPEN** |
| Core journey | FA01–FA23 each have dated records on matching release | **OPEN** |
| Extensions | FX01–FX16 and every advertised course/feature variation have dated records | **OPEN** |
| Founder-critical defects | None unresolved; failures retested on exact candidate | **OPEN** |
| Founder final sign-off | Name, role, date, exact release/build/commit and explicit acceptance | **OPEN** |
| Phase 38 transition | Only after all above pass may the separate beta gate review resume | **PAUSED / NO GO** |
