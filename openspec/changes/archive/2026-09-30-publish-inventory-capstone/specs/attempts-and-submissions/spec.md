## ADDED Requirements

### Requirement: Capstone response presence is required without quality grading

New passing capstone reports SHALL contain strict explanation and transfer response fields with nonblank text, at most 2000 characters and 4000 UTF-8 bytes each, within the existing total report bound. The backend SHALL enforce this presence before persisting a new passing capstone attempt or accepting completion. Missing, malformed or oversized responses SHALL be rejected; failed capstone reports MAY omit them. Instructional submissions SHALL reject capstone response fields. Responses SHALL be immutable private report data, readable only by the authenticated owner, included in exact event replay identity and retained in owner-bound pending/rejected-work recovery. Existing reports without response fields SHALL remain readable. Presence SHALL NOT claim reviewed reasoning quality or independent correctness, and no learner code or LLM grading SHALL run in the backend.

#### Scenario: Functional pass lacks written responses
- **WHEN** a new capstone passing report omits either required response or supplies blank text
- **THEN** no new attempt, completion, XP event or streak day is committed

#### Scenario: Responses change on replay
- **WHEN** an existing event is reused with different explanation or transfer text
- **THEN** the immutable original remains unchanged and the backend rejects the conflict

#### Scenario: Complete personal-learning submission
- **WHEN** a verified eligible owner submits bounded complete functional results and both responses
- **THEN** normal backend policy can accept one personal-learning completion and owner history retains the responses without a reasoning-quality claim
