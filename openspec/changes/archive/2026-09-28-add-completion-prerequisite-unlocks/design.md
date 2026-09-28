# Design

## Context

The published catalog carries active quest prerequisite IDs and reviewed version transitions. Progress already derives current-equivalent completion through those transitions, but submission checks only the presence of an accepted completion row. Protected progress DTOs do not carry availability. The authenticated Journey map infers locks from its protected completed IDs in frontend code. Only Q01 is currently published; tests must cover a synthetic multi-quest publication so the new rule has meaningful evidence.

## Goals / Non-Goals

**Goals:** One backend compatibility policy for progress, availability, and new-account activity; owner-bound explanations for quest, chapter, and Journey/Course scopes; a UI that presents backend results faithfully.

**Non-Goals:** No mutable unlock table, mastery score, XP threshold, achievement gate, guest-import implementation, new content publication, or Phase 23 persistence.

## Decisions

1. **Shared compatibility policy.** Extract the current-equivalent completion walk from ProgressService to a backend curriculum-domain function. Both progress and submission resolve a completion's recorded content and assessment versions against the active published quest through approved compatible transition chains. Missing or unapproved transitions fail closed. This preserves historical completion and XP while ensuring old incompatible work cannot unlock a new dependent quest.
2. **Availability projection.** Extend existing protected progress reads rather than add overlapping endpoints. Quest DTOs add `availability` and ordered `unmetPrerequisites` with published stable ID, slug, and title. ProgressService collects current-equivalent completions across the published catalog for that owner, then computes quest availability from active prerequisites. A currently completed quest remains available for review. A nonempty chapter or Journey is locked only if every contained quest is locked; its explanation uses the earliest ordered quest's unmet prerequisites. An empty scope is browseable/available but contains no playable quest. Course continues as an exact Journey alias. Learning status, counts, and percentages remain independent of availability.
3. **Mutation gate.** Before new start or hint use, call the same progress availability projection and reject locked quests before any insert. In LearningService, preserve the existing client-event replay check first, then check current prerequisite completions before creating a new attempt, whether the report passes or fails. The user row lock already serializes submissions; locked rejection produces no attempt or reward. Public lesson reads and local Check are unchanged.
4. **Trusted map presentation.** For authenticated learners, build node status and prerequisite text from the protected Journey progress DTO. Only the earliest backend-available incomplete node gets a `current` visual cue; this is presentation, not eligibility authority. Use backend chapter and Journey availability for aggregate labels. Validate that every displayed published quest has a matching protected entry; missing or failed protected data shows recoverable unavailable UI. Guest navigation remains public-curriculum based and labeled provisional. No token enters learner runtime or preview.
5. **No schema migration.** The existing owner-bound completion/attempt facts and immutable catalog have all inputs. No unlocked-state row or cached percentage is added.

## Risks / Trade-offs

- **Only Q01 is published today** → Build synthetic multi-quest catalog tests for absent, compatible, incompatible, cross-owner, chapter, Course alias, and acceptance gates; keep Q01 production behavior unchanged.
- **Curriculum changes can relock a previously open incomplete quest** → Explanations name the current published prerequisite, while completed history remains visible; do not silently relabel incompatible history as current completion.
- **Client-reported accepted completion can be forged under ADR 0005** → Preserve the bounded personal-learning policy; do not describe unlocks as independent grading or mastery proof.

## Migration Plan

Deploy backend DTO and policy with regenerated frontend contract and map presentation in one Apply stage. Existing accepted completions are read through the compatibility policy; there is no data migration or backfill. Rollback restores prior reads without deleting accepted facts.
