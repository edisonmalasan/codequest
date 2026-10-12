# Design

## Context

See [proposal.md](proposal.md) for motivation and [the capability deltas](specs/) for observable behavior. The API already exposes owner-only account, progress, XP/level, streak, and unlock reads. The account page composes several of those responses, and an achievement card component is present as presentation-only UI. No profile preference store, achievement policy, earned-achievement API, or public profile surface exists.

Authentication, accepted completion, XP, levels, streaks, and availability keep their current authorities. ADR 0005 still limits accepted completions to personal learning; the new UI must preserve that claim boundary. R04 real-provider auth and R08 course acceptance remain integration prerequisites for the R09 exit.

## Goals / Non-Goals

**Goals:**

- Reuse verified principal ownership and existing backend learning facts.
- Keep profile preferences small, private, and owner-bound.
- Make achievement outcomes reproducible from stable criteria and accepted facts.
- Keep the current account experience truthful when an API section fails or work is pending.

**Non-Goals:**

- Public usernames, profile URLs, portfolio publishing, social follows, or account search.
- User-uploaded images, avatar marketplaces, paid cosmetics, or avatar-based skill claims.
- New XP sources, streak rules, unlock rules, competitive ranks, certificates, or independently graded mastery.
- Changes to Phase 38 readiness or release gates.

## Decisions

### Keep profile preferences in the identity boundary

Add nullable `display_name` and `avatar_id` fields to the existing owner account record and expose authenticated `GET` and `PATCH /api/v1/profile` operations. The verified principal selects the account row. Display-name validation trims surrounding whitespace, rejects empty strings when supplied, caps names at 40 Unicode characters, and rejects control characters; `null` clears the preference. `avatar_id` must match a backend allowlist of stable original avatar catalog IDs; `null` selects the stable default. Supabase remains the authority for email and provider credentials.

This reuses the existing account and identity module. A separate public profile table or username index would add sharing and enumeration policy that R09 does not authorize.

### Derive achievements from immutable facts, without an award ledger

Keep the initial achievement definitions in a reviewed backend-owned catalog: first accepted quest, first completed chapter, and first completed course. Store each chapter/course criterion against the stable quest IDs in its published scope snapshot. Implement a deterministic evaluator over the authenticated owner's current-equivalent accepted completions. The completion fact that first satisfies each criterion determines `earnedAt`, ordered by backend timestamp and stable fact ID. Do not write an achievement event or XP event. Once an achievement ID is published, its criteria remain immutable; retire it without reusing its ID, and introduce a new ID for a materially different criterion.

This avoids a second mutable reward authority and makes retries, repeated reads, imports, and content edits derive the same result. Criteria must not claim evidence stronger than ADR 0005 permits.

### Keep profile and achievement APIs owner-only and generated

Add versioned backend API contracts for profile read/update and authenticated earned-achievement reads. The achievement catalog may be read without authentication, but earned state requires the verified principal and is always computed for that owner. Include definition metadata, earned state, and deterministic earned time; do not accept client totals or status. Regenerate the frontend API client from OpenAPI. Do not let the browser read or write application tables.

### Reuse account presentation and trusted refresh seams

Extend the existing authenticated account screen with profile preferences and an achievements section. Reuse protected XP/level, streak, progress, and unlock responses rather than duplicating their facts in a new aggregate table. Refresh achievement and profile reads after backend completion acceptance and confirmed outbox replay. On an uncertain outcome, preserve the current pending state and perform a trusted read; do not optimistically mark achievements earned.

Keep current original avatar assets and achievement-card presentation; add stable catalog metadata and text alternatives. Do not add new art unless existing original assets cannot represent the approved catalog.

### Use additive storage changes

Add profile preference columns with nullable/default-safe values in a new migration; never rewrite applied migrations. Existing accounts receive the default avatar and no display name without synthetic personalization. Rollback is an application rollback while keeping the additive columns; a later migration may remove them only after usage review.

## Risks / Trade-offs

- **[Personal-learning claims are mistaken for verified skill]** → Label completion-derived badges as personal learning and prohibit mastery, credential, or competition language.
- **[A criterion change alters an old badge]** → Treat published IDs and criteria as immutable; retire old IDs and add new IDs for materially different conditions.
- **[Profile values expose private data]** → Keep reads self-only, reject caller-selected owners, and add cross-account API probes; do not create public profile routes.
- **[Avatar IDs drift from available artwork]** → Validate against one stable catalog and keep a default fallback; test every catalog ID resolves to an original asset.
- **[Partial API failure produces false zeroes]** → Keep independent loading/error states and retries for each protected section; never synthesize an authoritative empty response.
- **[R04/R08 prerequisites remain open]** → Keep Apply integration and phase-exit tasks gated on real-auth and founder course-acceptance evidence; proposal approval alone does not close R09.

## Migration Plan

1. Add and check an additive schema migration and profile repository behavior.
2. Implement owner-only API operations and deterministic achievement reads; regenerate and check the OpenAPI client.
3. Integrate account/profile UI and trusted refresh handling while retaining existing progress routes.
4. Run migrations and full verification on synthetic accounts; compare each achievement result to its accepted facts.
5. Roll back application code if needed while retaining nullable columns; do not discard profile data or rewrite learning history.

## Open Questions

None that change the behavior contract or implementation approach. Visual review of the original avatar and badge treatment is part of R09 founder acceptance.
