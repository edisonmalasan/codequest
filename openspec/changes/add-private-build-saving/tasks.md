# Tasks

## 1. Confirm the R11A and Auth boundaries

- [ ] 1.1 Confirm the merged R11A Build manifest, local owner model, and isolated Run limits still match this proposal; record the exact starting commit and R04 real-email status in an R11B verification record. Verify no R11A founder or real Auth pass is inferred from fixtures.

## 2. Persist private snapshots in NestJS

- [ ] 2.1 Add a forward `private_builds` migration with owner foreign key, source bounds, revision, timestamps, and indexes; update schema-inventory expectations and verify `pnpm --dir backend db:check`, `db:drift`, and isolated migration/owner-deletion tests pass without rewriting old migrations.
- [ ] 2.2 Add server-side exact-manifest, UTF-8 byte, UUID, title, version, and per-owner-count validation; verify focused tests reject malformed, oversize, unsupported, foreign-owner, and full-quota writes without changing the prior snapshot.
- [ ] 2.3 Implement transactional conditional save, same-snapshot immediate retry, owner-only list/read, and explicit cloud delete; verify concurrent-device, uncertain-response, 401/403/404, and cross-account tests on disposable PostgreSQL.
- [ ] 2.4 Export guarded versioned Build operations through OpenAPI, regenerate the frontend-local client, and document request, revision, conflict, and safe-error semantics; verify `pnpm api:check` and backend controller contract tests pass.

## 3. Integrate explicit account saving in the Build UI

- [ ] 3.1 Add bounded Build titles and local confirmed-cloud metadata through an additive Dexie version while keeping existing drafts and outbox intact; verify legacy title fallback, upgrade, owner separation, invalid-record, quota, and failed-write tests.
- [ ] 3.2 Add explicit Save to account, private rename, and cloud Open flows through the generated API transport, with local, in-flight, confirmed, offline, and error states; verify component tests distinguish multiple Builds, never claim cloud backup before confirmation, and preserve edited source on failure or sign-out.
- [ ] 3.3 Add local-versus-cloud revision comparison and explicit conflict resolution with no automatic source replacement; verify two-device and lost-response component tests retain both versions and prevent stale overwrite.
- [ ] 3.4 Add explicit guest-Build copy into a new account-local Build without deleting or auto-attaching the guest original; verify transaction rollback, account switch, and copy/save-failure tests.
- [ ] 3.5 Add separate confirmed cloud-delete and local-remove controls and update Build help/disclosure copy; verify keyboard/assistive labels and component tests distinguish the two deletion scopes.

## 4. Verify the integrated private Build route

- [ ] 4.1 Add synthetic browser coverage for create→local edit→account Save→relogin→cloud Open on a second browser context, plus conflict, uncertain response, owner switch, guest copy, deletion, and API/storage failures; verify no protected source appears for another owner and no Quest or reward write occurs.
- [ ] 4.2 Rerun affected Build/interactive Run containment and recovery suites against the exact integrated build, including origin collision and responsive/keyboard behavior; record commit, build, environment, browser versions, results, failures, retests, and untested physical/AT cases in the R11B record.
- [ ] 4.3 Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm api:check`, backend curriculum validation if touched, and `openspec validate add-private-build-saving --strict`; record exact outcomes and leave any failed gate open.

## 5. Real account and founder gates

- [ ] 5.1 After R04 real email signup/confirmation and backend account are verified, run a dated synthetic account Save→logout/relogin→second-device Open and conflict/recovery journey on the exact candidate and intended environment; keep this task open if provider delivery or access is unavailable.
- [ ] 5.2 Have the founder review private Build save, second-device reopen, conflict recovery, guest copy, and deletion on the exact integrated build; record individual observations, defects, retests, and acceptance without claiming Phase 38 GO or public project readiness.
