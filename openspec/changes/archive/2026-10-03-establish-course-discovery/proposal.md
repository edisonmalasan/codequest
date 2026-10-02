# Proposal

## Why

The current Home links directly to one published Journey map, and the API treats Course as a Journey alias. The approved V1 boundary requires a discoverable multi-course product with distinct Journey, Course, Chapter, and Exercise identities. R05 establishes that structure without advertising unfinished courses or changing accepted quest history.

## What Changes

- Add stable Course identity and membership between Journey and Chapter in backend-authored, reviewed publication. Migrate the existing published JavaScript Foundations chapters into one Course while retaining every existing Journey, Chapter, and Quest stable ID, content/assessment version, completion, and XP event.
- Expose ordered published Course summaries/details and Journey-to-Course membership. Keep the existing `/api/v1/courses/:slug` Journey alias and its progress alias stable for legacy consumers; place the distinct Course API under `/api/v1/catalog/courses` until a separately reviewed API-version transition.
- Derive owner-only Course progress and availability from current published quests and backend learning facts. Guest indicators remain clearly provisional.
- Add a dedicated browse/search catalog and Course detail/map journey: Home → catalog → Journey → Course → Chapter → Exercise. Only fully published, reviewed Courses appear. Search and filtering work against public published metadata, with honest empty/error states and accessible responsive navigation.
- Preserve existing quest routes and drafts. Do not create placeholder course cards, a backend search index, or new curriculum content in R05.

## Capabilities

### New Capabilities

- `course-discovery`: Published Course catalog, discovery, routing, and truthful learner presentation.

### Modified Capabilities

- `curriculum-content`: Distinct stable Course membership and authoring/publication validation.
- `curriculum-api`: Published Course reads and compatible Journey alias behavior.
- `journey-course-ui`: Journey overview and Course map become separate navigable surfaces.
- `learner-progress`: Derived owner-only Course progress without a mutable aggregate.
- `learner-unlocks`: Derived Course availability from contained quest prerequisites.

## Impact

Backend curriculum schema/loader/validator/publication and read-only REST/OpenAPI; progress read model; regenerated frontend API client; Home/navigation, catalog, Journey and Course views; content directory structure; focused content/API/progress/browser tests and documentation. No learner-code execution, Auth provider setting, accepted completion rule, XP, streak, or Phase 38 beta gate changes.
