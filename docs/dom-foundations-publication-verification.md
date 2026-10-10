# DOM Foundations selected-route candidate verification

Date: 2026-10-10. Candidate code and content base: `1f0160f`. Selected manifest, full build head, and CI run: **pending**. The manifest entry on the Apply branch is staged solely to exercise the production route. It is not yet eligible to merge into `main` or to claim public publication.

Selected content and assessment: DOM01–DOM12, all `1.0.0 / 1.0.0`. Instructional/technical self-review: [DOM Foundations authoring review](dom-foundations-course.md). Application origin: `http://127.0.0.1:3400`; runner: `http://127.0.0.2:3400`; preview: `http://localhost:3400`. All are local, distinct browser origins. The production build and browser versions must be recorded from the final run, not inferred from package versions.

| Blocking selected-route row                                                            | Chromium | Firefox  | WebKit   | Mobile Chromium | Evidence / retest                                           |
| -------------------------------------------------------------------------------------- | -------- | -------- | -------- | --------------- | ----------------------------------------------------------- |
| Real catalog and DOM01 lesson route from compiled backend                              | Untested | Untested | Untested | Untested        | Required on candidate build.                                |
| Effective application, runner, preview host allowlists and CSP                         | Untested | Untested | Untested | Untested        | Required on candidate build.                                |
| Opaque child sandbox, storage/top-frame denial, active markup and external sink denial | Untested | Untested | Untested | Untested        | Required on candidate build.                                |
| Correlated message rejection and finite Run/Check                                      | Untested | Untested | Untested | Untested        | Required on candidate build.                                |
| Source, output, event, and mutation bounds; unsupported APIs                           | Untested | Untested | Untested | Untested        | Required on candidate build.                                |
| Repeated source and handler loops, termination and fresh-run recovery                  | Untested | Untested | Untested | Untested        | Three cycles in selected-route test, plus authoring probes. |
| Cancellation, reload, edit invalidation, owner switch, navigation cleanup              | Untested | Untested | Untested | Untested        | Required selected route and account traversal.              |
| Complete Course catalog-to-DOM12 account traversal with isolated PostgreSQL            | Untested | Untested | Untested | Untested        | Requires CI PostgreSQL service.                             |
| Frontend/backend/OpenAPI/OpenSpec quality gates                                        | Untested | Untested | Untested | Untested        | Run on final candidate.                                     |

Every failed or skipped row remains open. A code, selected-content, origin, or policy change invalidates affected results until retested against the new exact build. The catalog metadata points to this record and exact selected versions; it does not itself certify a passing security result. Production publication remains blocked until all required rows are dated passes on one final candidate.

R04 real-provider authentication, founder acceptance, hosted origin checks, physical-device/assistive-technology evidence, unresolved F06 policy, and Phase 38 beta readiness remain open. No beta GO, independent grading, competitive score, or verified mastery is claimed.
