# Spec Delta

## MODIFIED Requirements

### Requirement: Curriculum source follows the approved hierarchy and ownership

Authored curriculum SHALL live under `backend/content/` as ordered Journey, Course, Chapter, and Quest records. Each Course SHALL have one stable owning Journey; each Chapter SHALL have one stable owning Course; each Quest SHALL retain its stable owning Chapter. The authored tree SHALL identify these parents without frontend imports, direct application-table access, or a root `content/` source. The existing JavaScript Foundations Journey, Chapters, and Quests SHALL keep their stable IDs and reviewed snapshots when its chapters are assigned to one distinct Course.

#### Scenario: Authored hierarchy is inspected

- **WHEN** the repository content tree is reviewed
- **THEN** Journey, Course, Chapter, and Quest metadata have one unambiguous parent and order under `backend/content/`, with separate stable Course identity and no frontend copy

#### Scenario: Existing Foundations content is migrated

- **WHEN** the published Foundations chapters are assigned to their new Course
- **THEN** existing Journey, Chapter, Quest, content-version, and assessment-version identities remain unchanged and the publication still resolves every selected quest

## ADDED Requirements

### Requirement: Course publication is complete and reviewable

A Course SHALL declare a stable unique ID, owning Journey ID, slug, position, original title and summary, topic metadata, outcomes, ordered Chapter IDs, and reviewed state. Publication SHALL select Courses explicitly and reject a selected Course with missing, unreviewed, duplicate, or inconsistent chapters, quests, versions, or parent links. Slugs SHALL be unambiguous within their public route scope; stable IDs SHALL be globally unique. Draft Courses MAY be authored without appearing publicly.

#### Scenario: Incomplete Course is selected
- **WHEN** publication selects a Course with a missing chapter, unreviewed snapshot, or duplicate identity
- **THEN** curriculum validation fails before the public catalog can serve that Course

#### Scenario: Draft Course exists
- **WHEN** valid draft Course metadata is not selected for publication
- **THEN** authoring may validate it but the public catalog reveals no draft title or identity
