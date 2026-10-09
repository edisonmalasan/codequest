# Tasks

## 1. Exact selected-course audit

- [x] 1.1 Capture the selected Q01–Q24 and CAP01 content/assessment versions, stable identities, current browser contract, and existing review limits in an R08 quality worksheet; verify the inventory against `publication.yaml`, the public Course API, and `docs/curriculum.md`.
- [x] 1.2 Review Q01–Q10 in sequence for beginner assumptions, chapter handoffs, objective/task/check alignment, first Run guidance, starters, hints, feedback, and accessible reading; record a specific pass/revise/blocked finding for every exact version and verify no assessment or prerequisite is omitted.
- [x] 1.3 Review Q11–Q24 and CAP01 in sequence for scaffold progression, varied inputs, debugging and transfer, written capstone prompts, hints, feedback, and accessible reading; record a specific pass/revise/blocked finding for every exact version and verify the Course still covers O1–O8 and the approved 24-plus-capstone structure.

## 2. Versioned instructional corrections

- [x] 2.1 Resolve documented Q01–Q10 findings in new immutable content snapshots only where necessary, with explicit reviewed transitions and pending-work decisions; verify unchanged snapshots are byte-identical, each changed lesson/starter/hint matches its declared contract, and the curriculum validator accepts the new draft versions without selecting them.
- [x] 2.2 Resolve documented Q11–Q24 and CAP01 findings in new immutable content snapshots only where necessary, with explicit reviewed transitions and pending-work decisions; verify capstone functional cases remain distinct from ungraded reasoning quality, unchanged snapshots are byte-identical, and the curriculum validator accepts the new draft versions without selecting them.
- [x] 2.3 Verify each changed assessment version corresponds to changed criteria and run focused compatibility, history/replay, stable-ID XP, and source-preserving retry tests. Record no-change decisions for untouched Quests in the worksheet.

## 3. Technical and instructional review of changed versions

- [x] 3.1 Run the existing isolated authoring Check for each changed exact version with a reference, a behaviorally valid alternative, and a deliberate defect; verify ordered cases and useful bounded feedback, with no learner source executed in Node or NestJS, and record outcomes in the worksheet.
- [x] 3.2 Review the revised Course as a continuous learning path, including chapter transitions and CAP01 transfer, and document the instructional/technical approvers and any unresolved finding; verify no changed version is approved for selection while a material finding remains.

## 4. Complete publication and integration

- [x] 4.1 Select the complete reviewed 25-Quest Course with exact current versions in one `publication.yaml` update after groups 1–3 pass; verify partial or stale selection fails closed, previous snapshots remain addressable, and Q01–Q04 guest eligibility, prerequisite order, stable IDs, and 10 XP experimental baseline are unchanged.
- [ ] 4.2 Verify the exact selected build in desktop and mobile browser projects from catalog entry through CAP01: Run, Check, hints, Submit, Next, refresh/revisit, source preservation, guest/account boundary, and backend-accepted progress/XP. Record build, environment, result, defects, and affected retests; do not infer real-provider or physical-device success.
- [ ] 4.3 Run `pnpm --dir backend curriculum:validate`, `pnpm api:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and strict OpenSpec validation; review the final diff and record the remaining founder, R04 Auth, interactive publication, F04/F06, hosted, and physical gates before the Apply PR merges.
