# CodeQuest — Full Development Roadmap

## Project Status

Status snapshot: 2026-09-21. Update this section when the phase or OpenSpec stage changes; planned work is not completed work.

| Item | Current status |
| --- | --- |
| Current phase | Phase 4 — Design System; **visual direction revision proposed** because the archived implementation does not yet satisfy the roadmap's scalable pixel-game identity objective |
| Completed phases | Phase 0 — Product Definition: documentation delivered, decisions approved, change archived; Phase 1 — Technical Risk Validation: 34/34 tasks, F01/F02 selected, change archived; Phase 2 — Repository Foundation: workspace + toolchain + CI + bootable apps, change archived; Phase 3 — Frontend Foundation: directory structure + styling/theme base + providers + client-state primitive + Dexie skeleton + CodeMirror proof-of-render, 14 tests green, change archived; original Phase 4 — Design System: technically complete and preserved in the historical archive, now superseded for visual direction by the active redesign proposal |
| Current OpenSpec change | [redesign-codequest-pixel-game-identity](../openspec/changes/redesign-codequest-pixel-game-identity/proposal.md) (active superseding Phase 4 change); the [2026-09-19 design-system archive](../openspec/changes/archive/2026-09-19-design-system/proposal.md) remains unchanged history |
| Current OpenSpec stage | Propose — repository/visual audit and reference exploration complete; superseding proposal, design, delta spec, and tasks in preparation |
| Next execution step | Review and merge the Phase 4 redesign proposal, then Apply it from a new implementation branch |
| Next phase | Phase 5 — Backend Foundation, blocked until the revised Phase 4 is applied, verified, synced, and archived |
| Validation evidence | Installed Chrome 63/63 native; Chromium bundled scope; Firefox partitioned component coverage; cold-process substitute 10/10; unit 28/28 with clean lint/typechecks; WebKit offline cluster reviewed S06 limitation; opaque-era failures retained as history |
| Pre-beta release obligations (untested, no support claims) | Physical mobile/Safari/Firefox-install, NVDA/VoiceOver, low-power-device timing, native quota/background/OS-restart |
| Current repository | Documentation, OpenSpec artifacts, Phase 3 frontend foundation (structure, theme base, providers, state primitive, Dexie skeleton, editor proof) on the Phase 2 production workspace (`frontend/`, `backend/`, pnpm/Turborepo toolchain, CI), and isolated disposable Phase 1 prototypes; no database, generated client, content engine, or runtime |
| Decision baseline | [Approved Phase 0 register](decisions.md) and [architecture/ADRs](architecture.md) control historical roadmap conflicts; delegated 2026-09-18 final review Proceed (development gate); F01 dedicated mechanism recommended; F02 desktop-first validated scope; no production selection |

## 1. Product Goal

CodeQuest is a pixel-themed coding education platform focused on:

```text
Learn
→ Practice
→ Code
→ Debug
→ Test
→ Build
→ Ship
→ Use modern developer tools
→ Collaborate with AI
→ Operate coding agents safely
```

The MVP must prove that users:

* enjoy the learning loop
* understand the material
* complete multiple quests
* return to continue
* complete at least one meaningful project

The first release should **not** try to become Codecademy + Replit + GitHub + Cursor + Discord at once.

---

# 2. Final Architecture

```text
codequest/
│
├── frontend/
│   └── Next.js
│
├── backend/
│   └── NestJS
│
├── packages/
│   ├── api-client/
│   ├── eslint-config/
│   └── typescript-config/
│
├── content/
│   └── journeys/
│
├── docs/
│
├── tooling/
│
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Frontend

Responsible for:

* Next.js routing/rendering
* UI
* PWA
* CodeMirror
* local browser execution
* IndexedDB
* offline experience
* animations
* client state 
* API consumption
* responsive/mobile behavior

## Backend

Responsible for:

* authentication verification
* authorization
* users/profiles
* curriculum
* learning state
* submissions
* progress
* XP
* levels
* streaks
* achievements
* unlocks
* projects
* leaderboards
* analytics events
* AI orchestration
* remote execution orchestration
* rate limiting
* future integrations

## Core rule

```text
Frontend
   ↓
NestJS API
   ↓
Database
```

The frontend must never directly modify CodeQuest application tables.

---

# 3. Recommended Stack

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Base UI
Motion
Lucide
CodeMirror 6
TanStack Query
Zustand
Dexie
Serwist
```

## Backend

```text
NestJS
Fastify
REST
OpenAPI
Drizzle ORM
PostgreSQL
Supabase
Supabase Auth
Supabase Storage
```

## Tooling

```text
pnpm
Turborepo
GitHub Actions
Vitest
Testing Library
Playwright
PostHog
Sentry
```

## Execution

### MVP

```text
JavaScript → Web Worker
HTML/CSS/JS → sandboxed iframe
```

### Post-MVP

```text
Python → Pyodide Web Worker
```

### Advanced

```text
Java/C++/Go/Rust
→ remote isolated sandbox
```

---

# 4. Architectural Principles

These should remain fixed unless an ADR explicitly changes them.

1. Next.js is the frontend.
2. NestJS is the backend.
3. NestJS owns business logic.
4. NestJS owns application database access.
5. The backend starts as a modular monolith.
6. No microservices in MVP.
7. No arbitrary user code inside the NestJS process.
8. Frontend/backend contracts use REST + OpenAPI.
9. The frontend uses a generated API client.
10. Curriculum works without AI.
11. AI is optional infrastructure, not a core dependency.
12. Gamification rewards meaningful learning.
13. Offline functionality remains deliberately limited.
14. Pixel art must not compromise usability.
15. One excellent course is more valuable than five incomplete ones.

---

# 5. Priority Tiers

## P0 — MVP

Required before public release.

* authentication
* profiles
* JavaScript learning journey
* 20–30 quests
* course/chapter map
* lessons
* CodeMirror
* JS execution
* code validation
* hints
* submissions
* progress
* XP
* levels
* streaks
* unlocks
* one capstone
* PWA installation
* local code persistence
* limited offline support
* analytics
* monitoring
* accessibility
* security

---

# P1 — Early Post-MVP

* AI tutor
* Python
* Pyodide
* Daily Challenge
* practice system
* achievements
* leaderboards
* public portfolio
* improved content tools
* notifications

---

# P2 — Growth

* pixel avatars
* cosmetics
* skill trees
* adaptive learning
* TypeScript track
* React track
* Git/GitHub track
* project sharing
* community
* certificates
* mentors
* project remixing

---

# P3 — Advanced

* WebContainers
* browser terminal
* npm/package management
* remote Linux execution
* compiled languages
* GitHub integration
* pull requests
* AI code diffs
* AI pair programming
* coding agents
* MCP
* collaborative projects
* public deployment

---

# Phase 0 — Product Definition

## Objective

Define exactly what CodeQuest is before implementation begins.

## Create

```text
docs/
├── product.md
├── architecture.md
├── frontend.md
├── backend.md
├── security.md
├── curriculum.md
├── gamification.md
└── adr/
```

## Define

* target user
* product positioning
* MVP boundaries
* explicit non-goals
* learning loop
* terminology
* first journey
* success metrics
* architecture boundaries

## Initial curriculum

```text
Journey:
JavaScript Foundations

5–7 chapters
20–30 quests
1 capstone
```

## Completion criteria

You can clearly answer:

* what are we building?
* what are we not building?
* who owns each system?
* what is required for MVP?

---

# Phase 1 — Technical Prototypes

## Objective

Test risky architecture decisions before building production infrastructure.

---

## 1. CodeMirror prototype

Verify:

* desktop experience
* mobile typing
* selection
* syntax highlighting
* resizing
* keyboard behavior
* touch behavior

---

## 2. JavaScript execution prototype

Build:

```text
Editor
↓
Web Worker
↓
Execute JS
↓
Capture console/errors
↓
Timeout
↓
Terminate worker
```

Test:

* successful code
* syntax errors
* runtime errors
* infinite loops
* huge output

---

## 3. HTML/CSS/JS preview

Prototype:

```text
Editor
↓
sandboxed iframe
```

Validate safe iframe communication.

---

## 4. PWA prototype

Test:

* installation
* offline page
* cached lesson
* saved code
* local JS execution

---

## Completion criteria

One mock quest works end-to-end on desktop and mobile.

---

# Phase 2 — Repository Foundation

## Objective

Create the production workspace.

## Structure

```text
codequest/
├── frontend/
├── backend/
├── packages/
├── content/
├── docs/
└── tooling/
```

## Configure

* pnpm workspace
* Turborepo
* strict TypeScript
* ESLint
* Prettier
* Git hooks if desired
* environment validation
* GitHub Actions

## CI

Every PR runs:

```text
install
→ lint
→ typecheck
→ tests
→ frontend build
→ backend build
```

## Completion criteria

```bash
pnpm dev
```

starts frontend and backend locally.

---

# Phase 3 — Frontend Foundation

## Objective

Create the Next.js application foundation.

## Configure

* App Router
* Tailwind
* shadcn/ui
* Base UI
* Motion
* Lucide
* TanStack Query
* Zustand
* Dexie
* CodeMirror

## Create base structure

```text
frontend/src/
├── app/
├── features/
├── components/
│   ├── ui/
│   └── game/
├── lib/
├── hooks/
├── stores/
├── pwa/
└── styles/
```

## Feature domains

```text
features/
├── auth/
├── curriculum/
├── learning/
├── editor/
├── progress/
├── gamification/
├── projects/
└── profile/
```

---

# Phase 4 — Design System

## Objective

Create a scalable pixel-game identity.

## Define

* color tokens
* typography
* spacing
* borders
* shadows
* states
* animation rules
* responsive breakpoints

## Use pixel styling for

* logo
* maps
* avatars
* badges
* XP
* chapter art
* achievements
* decorative elements

## Use conventional UI for

* forms
* dialogs
* settings
* editor
* console
* menus
* navigation
* tables

## Core components

Build:

* Button
* Input
* Select
* Dialog
* Drawer
* Tabs
* Tooltip
* Toast
* Card
* Badge
* Progress
* Skeleton
* Dropdown

## Game components

Build:

* XPBar
* LevelBadge
* QuestNode
* QuestPath
* ChapterCard
* AchievementCard
* RewardPopup

---

# Phase 5 — Backend Foundation

## Objective

Create the NestJS modular monolith.

## Structure

```text
backend/src/
├── modules/
├── common/
├── infrastructure/
├── app.module.ts
└── main.ts
```

## Initial modules

```text
IdentityModule
CurriculumModule
LearningModule
ProgressModule
GamificationModule
HealthModule
```

Later:

```text
ProjectsModule
ExecutionModule
AnalyticsModule
AiModule
CommunityModule
BillingModule
```

---

## Configure

* NestJS
* Fastify
* REST
* global validation
* exception filters
* request IDs
* logging
* CORS
* API versioning
* Swagger/OpenAPI
* configuration validation
* rate-limit foundation
* health endpoint

## API prefix

```text
/api/v1
```

---

# Phase 6 — Database Foundation

## Objective

Establish authoritative persistence.

## Use

```text
PostgreSQL
Supabase
Drizzle
```

## Initial entities

### Identity

```text
User
Profile
```

### Curriculum

```text
Journey
Course
Chapter
Quest
Concept
Prerequisite
```

### Learning

```text
Enrollment
Attempt
Submission
```

### Progress

```text
QuestProgress
CourseProgress
ConceptProgress
```

### Gamification

```text
XPEvent
Level
Streak
Achievement
UserAchievement
Unlock
```

---

## Rules

Use:

* foreign keys
* unique constraints
* indexes
* migrations
* timestamps
* explicit ownership

Avoid storing values that can easily be derived.

---

# Phase 7 — API Contract Generation

## Objective

Make frontend/backend integration strongly typed.

## Flow

```text
NestJS DTO/controllers
        ↓
OpenAPI
        ↓
Generated TypeScript client
        ↓
packages/api-client
        ↓
Next.js
```

## Rule

Do not import backend files directly into frontend.

Bad:

```text
frontend imports backend DTO
```

Good:

```text
frontend
→ generated api-client
→ backend
```

---

# Phase 8 — Authentication

## Objective

Introduce real user accounts.

## Use

Supabase Auth.

Support initially:

* email/password
* Google
* GitHub

## Frontend

Build:

```text
/login
/register
/auth/callback
/account
```

## Backend

NestJS must:

* verify token
* derive user identity
* enforce ownership
* enforce permissions

## Important

Never accept frontend-supplied `userId` as authority.

---

# Phase 9 — Curriculum Content Architecture

## Objective

Make educational content versionable and maintainable.

## Use repository-first content

```text
content/
└── journeys/
    └── javascript-foundations/
        ├── journey.yaml
        └── chapters/
```

Each quest:

```text
quest.yaml
lesson.mdx
starter.js
tests.ts
```

## Quest definition

Include:

* ID
* version
* title
* slug
* concepts
* objectives
* prerequisites
* difficulty
* XP
* starter code
* validation
* hints
* unlock conditions

## Validate with Zod

CI should reject invalid curriculum.

---

# Phase 10 — Curriculum Backend

## Objective

Expose curriculum through NestJS.

## CurriculumModule handles

* journeys
* courses
* chapters
* quests
* concepts
* prerequisites

## Initial endpoints

```text
GET /api/v1/journeys
GET /api/v1/journeys/:slug
GET /api/v1/courses/:slug
GET /api/v1/chapters/:slug
GET /api/v1/quests/:slug
```

## Completion criteria

Frontend no longer depends directly on raw content files.

---

# Phase 11 — Journey and Course UI

## Objective

Create the primary learning navigation.

## Build

### Journey page

Displays:

* journey description
* overall progress
* chapters
* unlock state

### Course map

Displays:

* quest nodes
* completed state
* active state
* locked state
* chapter progression

---

# Phase 12 — Lesson Renderer

## Objective

Render real instructional content.

## Support

* text
* headings
* examples
* code blocks
* callouts
* hints
* instructions
* embedded illustrations

## Mobile support

Lesson content must remain comfortable to read before integrating the editor.

---

# Phase 13 — Editor Workspace

## Objective

Create the reusable CodeQuest coding environment.

## Structure

```text
EditorWorkspace
├── EditorToolbar
├── FileTabs
├── CodeEditor
├── ConsolePanel
├── TestResults
├── RuntimeStatus
└── WorkspaceActions
```

## MVP features

* CodeMirror
* syntax highlighting
* line numbers
* indentation
* autocomplete
* reset
* autosave
* shortcuts
* responsive layout

## Rule

Editor must be independent from a specific lesson.

---

# Phase 14 — JavaScript Runtime

## Objective

Safely execute beginner JavaScript.

## Create runtime abstraction

```ts
interface ExecutionAdapter {
  execute(input: ExecutionRequest): Promise<ExecutionResult>
}
```

## First adapter

```text
JavaScriptWorkerAdapter
```

## Handle

* output capture
* errors
* syntax errors
* timeouts
* worker restart
* large output
* execution duration

## Security

Worker receives no:

* JWTs
* API keys
* database details
* application secrets

---

# Phase 15 — Web Preview Runtime

## Objective

Support HTML/CSS/JS exercises and future projects.

Use:

```text
sandboxed iframe
```

Add:

* preview generation
* secure `postMessage`
* restricted sandbox permissions
* safe CSP

Do not expose the authenticated application origin.

---

# Phase 16 — Validation Engine

## Objective

Determine whether learner code is correct.

## Create abstraction

```ts
ValidationStrategy
```

## MVP validators

```text
output-match
value-test
function-test
custom-test
```

## Result

```text
passed
failed tests
feedback
execution time
```

## Rule

No LLM grading for normal MVP correctness.

---

# Phase 17 — Attempts and Submissions

## Objective

Create the authoritative backend learning loop.

## Flow

```text
User writes code
↓
Run locally
↓
Submit
↓
NestJS LearningModule
↓
Create attempt/submission
↓
Validate completion
↓
Progress update
```

Store:

* quest
* user
* code snapshot
* result
* timestamp
* attempt count

---

# Phase 18 — Progress System

## Objective

Track learner progression accurately.

## Status

```text
not_started
in_progress
completed
```

Track:

* started time
* completion time
* attempts
* hints
* last activity

## Derived progress

Calculate:

* chapter %
* course %
* journey %

rather than making percentages primary source-of-truth values.

---

# Phase 19 — XP System

## Objective

Reward meaningful activity.

## Use event ledger

```text
XPEvent
├── id
├── user_id
├── source_type
├── source_id
├── amount
└── created_at
```

Create unique protection around reward sources.

Submitting one quest repeatedly must never create infinite XP.

---

# Phase 20 — Levels

## Objective

Provide understandable progression.

Level is derived from total XP.

Example:

```text
Level 1 — Initiate
Level 2 — Apprentice
Level 3 — Coder
...
```

Keep level math simple initially.

---

# Phase 21 — Streaks

## Objective

Encourage consistency.

A streak increases only when meaningful learning occurs.

Examples:

* quest completion
* daily challenge
* project milestone

Not:

* opening the app
* viewing dashboard

Store learner timezone carefully.

---

# Phase 22 — Unlock System

## Objective

Control course progression.

Support conditions such as:

```text
quest completed
chapter completed
minimum concept mastery
course completed
```

Do not hardcode unlock logic into UI components.

NestJS owns it.

---

# Phase 23 — Local Persistence

## Objective

Prevent code loss.

Use IndexedDB + Dexie for:

* editor drafts
* workspace preferences
* downloaded lessons
* guest state
* pending sync operations

Autosave:

* after idle
* before navigation
* on visibility change

---

# Phase 24 — Guest Learning

## Objective

Allow users to experience CodeQuest before signup.

Support:

```text
guest
→ complete initial quests
→ local progress
→ signup
→ migrate progress
```

This reduces onboarding friction.

---

# Phase 25 — Cloud Progress Sync

## Objective

Support multiple devices.

Flow:

```text
frontend local state
↓
NestJS
↓
PostgreSQL
```

Handle:

* duplicate requests
* stale changes
* reconnects
* local/cloud merge

---

# Phase 26 — PWA

## Objective

Make CodeQuest installable.

Implement:

* manifest
* icons
* standalone display
* Serwist
* service worker
* offline page
* application shell cache
* update UI
* network indicator

---

# Phase 27 — Offline Learning

## Objective

Support useful—not unlimited—offline usage.

Allow:

* downloaded lessons
* reading content
* editing code
* JavaScript execution
* deterministic local exercises
* viewing cached progress

Do not support offline:

* AI
* leaderboards
* community
* remote sandboxes
* account changes
* publishing

---

# Phase 28 — Offline Sync

## Objective

Synchronize offline actions safely.

Use an outbox:

```text
Offline action
↓
IndexedDB
↓
Connection restored
↓
NestJS sync endpoint
↓
Idempotency check
↓
Commit
```

Each event includes:

```text
event_id
event_type
resource_id
content_version
timestamp
payload
```

---

# Phase 29 — First Full Curriculum

## Objective

Transform technical infrastructure into a real product.

Build:

```text
JavaScript Foundations

Chapter 1 — Variables
Chapter 2 — Operators
Chapter 3 — Conditionals
Chapter 4 — Loops
Chapter 5 — Functions
Chapter 6 — Arrays & Objects
Chapter 7 — Integration
```

Target:

```text
20–30 polished quests
```

Every quest contains:

* clear objective
* explanation
* examples
* task
* starter code
* tests
* hints
* reward

---

# Phase 30 — Capstone Project

## Objective

Verify users can apply concepts.

Build one polished JavaScript project.

The capstone should require combining:

* variables
* functions
* loops
* collections
* conditionals
* event handling where relevant

Do not build a full IDE.

---

# Phase 31 — Analytics

## Objective

Measure learning quality and product health.

Use PostHog.

## Track activation

```text
signup_completed
first_quest_started
first_code_run
first_quest_completed
```

## Learning

```text
quest_attempted
quest_completed
quest_failed
hint_used
execution_error
validation_failed
```

## Retention

```text
daily_learning_activity
weekly_learning_activity
streak_continued
```

## Projects

```text
capstone_started
capstone_completed
```

## Core funnel

```text
Signup
↓
First Code Run
↓
First Quest
↓
5 Quests
↓
First Chapter
↓
Capstone Start
↓
Capstone Completion
```

---

# Phase 32 — Monitoring

## Objective

Make production failures observable.

Use Sentry.

Monitor:

* frontend errors
* backend exceptions
* API latency
* failed requests
* releases

Backend logs should include:

* request ID
* route
* duration
* response status

Never log secrets.

---

# Phase 33 — Security Hardening

## Objective

Prepare for real users.

Review:

### Authentication

* token verification
* session expiration

### Authorization

* resource ownership
* privileged roles

### API

* validation
* request limits
* rate limits

### Runtime

* Worker isolation
* iframe sandbox
* timeout
* output limits

### Database

* least privilege
* migration safety

### Storage

* file permissions
* upload validation

### Secrets

* backend-only access
* environment separation

---

# Phase 34 — Testing

## Objective

Build confidence in core workflows.

## Unit

Prioritize:

* validation
* progression
* XP
* streaks
* unlocks
* content parser

## Integration

Test:

```text
submission
→ validation
→ progress
→ XP
→ unlock
```

## E2E

Playwright:

```text
guest starts quest
→ runs code
→ submits
→ signs up
→ keeps progress
→ completes next quest
```

Also test:

* Chrome
* Firefox
* WebKit
* mobile viewport

---

# Phase 35 — Accessibility

## Objective

Ensure the theme does not harm usability.

Test:

* keyboard navigation
* focus order
* screen readers
* color contrast
* reduced motion
* zoom
* touch targets
* editor accessibility

---

# Phase 36 — Performance

## Objective

Keep CodeQuest usable on low-end devices.

Optimize:

* route bundles
* fonts
* sprites
* images
* editor loading
* content payloads
* worker boot
* service worker cache size

---

# Phase 37 — Internal Content Tools

## Objective

Improve authoring without building a full CMS.

Create:

```text
content-validator
quest-preview
course-preview
test-runner
```

Later:

```text
/admin/content
```

Git remains source-of-truth for curriculum initially.

---

# Phase 38 — Beta Preparation

Before inviting users, complete:

* onboarding
* account settings
* recovery
* terms
* privacy
* feedback form
* analytics
* monitoring
* backups
* security review
* migration process

---

# Phase 39 — Private Beta

## Objective

Validate the learning experience.

Focus on:

* lesson clarity
* exercise difficulty
* validation accuracy
* editor usability
* mobile friction
* retention
* hint usage
* capstone completion

Do not immediately build requested features.

Look for repeated patterns.

---

# Phase 40 — Public MVP

MVP should contain:

```text
Authentication
Profiles

1 JavaScript Journey
20–30 Quests
1 Capstone

CodeMirror
JavaScript execution
Web previews
Validation

Attempts
Submissions
Progress

XP
Levels
Streaks
Unlocks

PWA
Offline lessons
Offline JS execution
Draft persistence

Analytics
Monitoring
Security
Accessibility
Testing
```

This is enough.

---

# Phase 41 — Post-Launch Stabilization

Before new major features:

* fix confusing lessons
* fix validation
* improve mobile
* improve onboarding
* optimize performance
* analyze retention

Do not immediately add five programming languages.

---

# Phase 42 — AI Tutor

## Priority

P1.

## Backend

Add:

```text
AiModule
├── TutorService
├── ContextBuilder
├── TutorPolicy
├── ProviderAdapter
└── UsageLimiter
```

Allow:

* explain concept
* explain error
* provide hint
* ask guiding question

Do not allow:

* automatically solving graded quests
* arbitrary code editing
* autonomous actions

---

# Phase 43 — Python

## Priority

P1.

Implement:

```text
Python
↓
Pyodide
↓
Web Worker
```

Reuse:

```text
ExecutionAdapter
```

Then create the Python learning journey.

---

# Phase 44 — Practice System

Build:

* Daily Challenge
* concept review
* random practice
* weak-skill practice

Start tracking concept mastery.

---

# Phase 45 — Achievements

Reward meaningful accomplishments:

* chapter completion
* course completion
* capstone completion
* consistency
* debugging
* mastery

---

# Phase 46 — Leaderboards

Begin simple.

Use:

* weekly XP
* verified activity

Keep leaderboards optional.

Avoid systems that encourage XP farming.

---

# Phase 47 — Portfolio

Create public profile capability:

```text
/profile/:username
```

Show:

* courses
* projects
* achievements
* badges
* optional XP/level

---

# Phase 48 — Avatar System

Introduce:

* pixel avatar
* equipment
* cosmetics
* achievement-based unlocks

Do not introduce monetized loot systems.

---

# Phase 49 — Skill Trees

Model actual skill progression.

Example:

```text
JavaScript
├── Variables
├── Control Flow
├── Functions
├── Collections
├── DOM
└── Debugging
```

Tie it to concept mastery rather than only XP.

---

# Phase 50 — Git and GitHub

Teach:

* repositories
* commits
* branches
* merges
* pull requests
* conflicts

Then add GitHub integration.

Allow learners to export projects later.

---

# Phase 51 — Community

Only build after enough active users exist.

Start with:

* public projects
* reactions
* comments

Later:

* discussions
* mentorship
* guilds
* collaborative challenges

Plan moderation first.

---

# Phase 52 — Certificates

Require stronger proof than ordinary completion.

Potential requirements:

* final assessment
* capstone
* mastery threshold

---

# Phase 53 — Advanced Workspace

Upgrade projects toward:

```text
File Tree
Editor
Console
Preview
Tests
Package Manager
Git
```

Evaluate WebContainers here.

---

# Phase 54 — Remote Execution Platform

## Objective

Support languages that cannot safely run in-browser.

Architecture:

```text
frontend
↓
NestJS ExecutionModule
↓
Execution queue
↓
runner
↓
isolated sandbox
```

Support later:

* Java
* C++
* Go
* Rust
* shell

Enforce:

* CPU limits
* memory limits
* disk limits
* process limits
* network restrictions
* output limits
* timeouts

This may eventually be extracted from the modular monolith.

---

# Phase 55 — AI Pair Programming

Allow AI to:

* propose code
* generate small patches
* generate tests
* explain diffs

Learner must:

* inspect
* approve
* test
* reject bad changes

---

# Phase 56 — Agentic Learning

Introduce agent-based quests.

Example:

```text
Define task
↓
Agent proposes plan
↓
Learner reviews
↓
Learner approves tools
↓
Agent edits code
↓
Learner reviews diff
↓
Tests
↓
Accept / Reject
```

Teach:

* scope
* permissions
* validation
* context
* hallucination detection
* review discipline

---

# Phase 57 — MCP

Introduce MCP only when the platform already teaches:

* terminal
* Git
* testing
* AI
* tool permissions

Teach MCP for connecting agents to:

* repositories
* databases
* documentation
* APIs
* external developer tools

---

# 6. Backend Module Evolution

Start with:

```text
backend/src/modules/
├── identity/
├── curriculum/
├── learning/
├── progress/
└── gamification/
```

Then add:

```text
projects/
analytics/
ai/
execution/
community/
notifications/
billing/
```

Do not create separate services until scaling/security demands it.

---

# 7. Systems to Abstract Early

## Execution

```ts
ExecutionAdapter
```

Possible adapters:

```text
JavaScriptWorker
Pyodide
WebContainer
RemoteSandbox
```

---

## Validation

```ts
ValidationStrategy
```

Implementations:

```text
OutputValidator
FunctionValidator
UnitTestValidator
RemoteValidator
```

---

## AI

```ts
TutorProvider
```

Avoid model/provider lock-in.

---

## Storage

Abstract project storage.

---

## Content

Use:

```text
stable quest ID
+
content version
```

from the beginning.

---

## XP

Use an event ledger from day one.

---

## Sync

Every client mutation should support idempotency.

---

# 8. Technical Milestones

## Milestone 1

```text
Quest
→ Editor
→ JS execution
→ validation
```

---

## Milestone 2

```text
5 polished quests
→ local progress
```

---

## Milestone 3

```text
NestJS
→ PostgreSQL
→ authentication
→ cloud progress
```

---

## Milestone 4

```text
XP
→ levels
→ streaks
→ unlocks
```

---

## Milestone 5

```text
PWA
→ offline lesson
→ offline code
→ sync
```

---

## Milestone 6

```text
20–30 quests
→ capstone
```

---

## Milestone 7

Private beta.

---

## Milestone 8

Public MVP.

---

# 9. Biggest Technical Risks

Ranked:

1. untrusted code execution
2. incorrect validation
3. mobile editor usability
4. offline synchronization
5. authentication/authorization mistakes
6. duplicate XP/progress events
7. PWA cache versioning
8. content versioning
9. runtime fragmentation
10. low-end device performance

---

# 10. Biggest Product Risks

1. boring curriculum
2. low retention
3. over-scoping
4. building game mechanics instead of learning mechanics
5. weak differentiation
6. AI doing too much for learners
7. poor mobile experience
8. course-authoring bottleneck
9. adding languages too quickly
10. building community before sufficient users exist

---

# 11. Explicitly Postpone

Do not include in MVP:

```text
Microservices
Kubernetes
Kafka
GraphQL
tRPC

Redis unless needed

WebContainers
Remote Linux shells

Java
C++
Go
Rust

AI agents
MCP

Realtime collaboration

Public project hosting

Multiplayer

Community forums

Avatar economy

Marketplace

Teacher dashboard

Classrooms

Subscriptions

Complex CMS

Vector database

Advanced recommendation system
```

---

# 12. Exact Development Order

```text
01  Product definition
02  Architecture specification
03  Technical prototypes

04  Repository foundation
05  Frontend foundation
06  Design system
07  Backend foundation
08  Database foundation
09  API/OpenAPI client

10  Authentication
11  Content schema
12  Curriculum backend
13  Journey/course UI
14  Lesson renderer

15  CodeMirror workspace
16  JavaScript runtime
17  iframe web preview
18  Validation engine

19  Attempts/submissions
20  Progress
21  XP
22  Levels
23  Streaks
24  Unlocks

25  Local persistence
26  Guest learning
27  Cloud sync

28  PWA
29  Offline lessons
30  Offline execution
31  Offline synchronization

32  Build 20–30 quests
33  Capstone

34  Analytics
35  Monitoring
36  Security
37  Testing
38  Accessibility
39  Performance

40  Content tools
41  Beta preparation
42  Private beta
43  Product iteration
44  Public MVP

45  AI tutor
46  Python / Pyodide
47  Practice system
48  Achievements
49  Leaderboards
50  Portfolio

51  Avatars
52  Skill trees
53  Git/GitHub
54  Community
55  Certificates

56  Advanced project workspace
57  WebContainers
58  Remote execution
59  Additional languages

60  AI pair programming
61  Agentic learning
62  MCP
```

---

# 13. First 20 Concrete Tasks

## 1

Create `docs/product.md`.

## 2

Create `docs/architecture.md`.

## 3

Create ADRs for frontend/backend separation.

## 4

Prototype CodeMirror.

## 5

Prototype JavaScript Worker execution.

## 6

Prototype sandboxed iframe preview.

## 7

Prototype offline lesson + IndexedDB.

## 8

Initialize pnpm/Turborepo.

## 9

Create `frontend/`.

## 10

Create `backend/`.

## 11

Configure shared TypeScript and ESLint.

## 12

Configure CI.

## 13

Build base frontend design tokens.

## 14

Create NestJS module skeleton.

## 15

Configure PostgreSQL/Supabase.

## 16

Configure Drizzle.

## 17

Configure OpenAPI.

## 18

Create generated `api-client`.

## 19

Define Quest content schema.

## 20

Write first five real quests.

Then:

```text
Lesson renderer
→ Editor
→ Execution
→ Validation
→ Progress
→ Gamification
→ PWA
→ Curriculum
→ Beta
```

---

# 14. Final Architecture Summary

```text
                      CODEQUEST

                ┌──────────────────┐
                │    frontend/     │
                │                  │
                │ Next.js          │
                │ React            │
                │ Tailwind         │
                │ CodeMirror       │
                │ PWA              │
                │ IndexedDB        │
                │ TanStack Query   │
                │ Zustand          │
                └────────┬─────────┘
                         │
                         │ REST
                         │ generated OpenAPI client
                         ▼
                ┌──────────────────┐
                │     backend/     │
                │                  │
                │ NestJS           │
                │ Fastify          │
                │ Modular Monolith │
                │                  │
                │ Identity         │
                │ Curriculum       │
                │ Learning         │
                │ Progress         │
                │ Gamification     │
                │ Projects         │
                │ AI               │
                │ Execution        │
                └────────┬─────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼

         PostgreSQL    Auth       Storage
          Supabase   Supabase     Supabase
```

Browser-side execution:

```text
frontend/
│
├── JavaScript
│      ↓
│   Web Worker
│
├── HTML/CSS/JS
│      ↓
│   sandboxed iframe
│
└── Python later
       ↓
    Pyodide
```

Advanced execution:

```text
frontend
↓
NestJS
↓
ExecutionModule
↓
isolated runner
↓
sandbox
```

---

# 15. Core Roadmap Rule

Always preserve this development priority:

```text
Learning
before
Gamification

Gamification
before
Community

One polished course
before
many languages

Strong manual learning
before
AI

Browser-safe execution
before
remote execution

Real retention
before
advanced infrastructure

Modular monolith
before
microservices
```

The first meaningful CodeQuest product should therefore be:

```text
User opens CodeQuest
↓
chooses JavaScript journey
↓
reads quest
↓
writes code
↓
runs code
↓
sees output/errors
↓
debugs
↓
submits
↓
passes validation
↓
earns progress + XP
↓
unlocks next quest
↓
eventually completes a real project
```

Everything else should be layered on top of that stable foundation.
