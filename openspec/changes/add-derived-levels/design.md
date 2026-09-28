# Design

## Context

Phase 19 writes owner-bound XP events and `XpService.total` sums them for protected `GET /api/v1/xp`. There is no level table. `AccountPanel` already establishes an authenticated account and the design system has a display-only `XPBar`. F04 defers final XP values, level names, and curve balancing until beta.

## Goals / Non-Goals

**Goals:** One backend-computed response whose level fields are consistent with the ledger total, and truthful authenticated presentation.

**Non-Goals:** Final level names or balance, historical curve snapshots, migrations, new XP sources, levels as learning mastery, or level-based gates.

## Decisions

- Use a named, versioned `provisional-linear-100-v1` policy object in the backend with `xpPerLevel = 100`, and a pure derivation function that accepts the policy. The default is explicitly provisional; a later F04 decision can replace it through reviewed code/configuration and coordinated API documentation. Alternative: hardcode labels/thresholds in the frontend; rejected because the backend must own level meaning.
- Level is one-based: `floor(totalXp / 100) + 1`. Current start is `floor(totalXp / 100) * 100`; next boundary is start + 100; within-level and remaining XP follow from those boundaries. Every read derives total and fields from the same sum query. Alternative: persist level on XP award; rejected because that creates a second authority and backfill problem.
- Extend the existing XP DTO and route instead of adding a second read. Preserve `totalXp` and `clientReported`; add `level`, `levelStartXp`, `nextLevelAtXp`, `xpIntoLevel`, `xpToNextLevel`, `curveId`, and `curveProvisional`. Alternative: new `/levels` endpoint; rejected because separate requests could observe different ledger totals.
- The trusted frontend wrapper validates all fields and boundary relationships before rendering. The account page loads XP after account establishment using current session transport, shows text plus the existing `XPBar`, and keeps an explicit unavailable state on failure. Do not use the design-system badge's fallback `Explorer` name, since names are provisional under F04.

## Risks / Trade-offs

- [Changing the provisional curve reinterprets all levels] → Include a versioned curve ID and provisional label; F04 requires a separate reviewed balancing decision before beta.
- [Accepted personal-learning XP relies on client reports] → Retain `clientReported` and avoid mastery or competitive language under ADR 0005.
- [Account read can fail independently of account establishment] → Keep account details visible and show level as unavailable with retry behavior.

## Migration Plan

No database migration. Deploy the backend response and regenerated frontend contract together; older clients may ignore added fields. Rollback restores the previous read shape without changing XP events.
