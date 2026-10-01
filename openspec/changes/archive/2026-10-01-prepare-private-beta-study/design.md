# Design

## Context

The Phase 38 readiness record is NO GO. Phase 31 already defines bounded events, cohort trust labels, D1/D7 elapsed windows and report caveats. Product F05 recruitment and targets and F06 collection policy remain unset. The capstone's accepted completion is client reported under ADR 0005 and its written reasoning is not independently graded.

## Goals / Non-Goals

**Goals:** Give owners a concrete protocol to review, a synthetic rehearsal that can be run without real learner data, and clear evidence fields needed before invitations.

**Non-Goals:** Run a beta, contact participants, enable PostHog/Sentry, decide legal policy or numeric success thresholds, add feature requests to the roadmap, or represent passing local Checks as verified mastery.

## Decisions

1. Keep one field guide in `docs/private-beta-study.md`, linked to the Phase 38 readiness matrix. The field guide will be a procedure and blank evidence record, not a collection system.
2. Use the existing event dictionary and backend acceptance facts. Report guest and account cohorts separately, preserve source trust and content versions, deduplicate stable events, and exclude incomplete D1/D7 windows. Qualitative observation is voluntary only after F06; no raw code, credentials or protected payloads belong in the study record.
3. Require product/content owners to pre-register F04/F05 choices before interpreting outcomes. The guide names each choice and gives a place for an approved value but supplies no arbitrary target, sample size or recruitment criterion.
4. Classify beta issues by repeated patterns, severity, affected quest/version/device, and whether evidence is observed, participant reported, client observed, or backend accepted. Preserve contradictory and missing evidence. Triage and approve follow-up changes separately.
5. Keep the roadmap's Phase 39 status as blocked. Archiving this preparation change means the protocol exists, not that private beta occurred or Phase 38 release gates closed.

## Risks / Trade-offs

- A polished protocol could be mistaken for release approval -> the top of the guide and roadmap retain NO GO and link to unclosed owner gates.
- Synthetic journeys can miss real learner friction -> label every dry-run result synthetic and require actual participant evidence after launch approval.
- A qualitative note can leak private source or identity -> use minimal issue categories and a separate approved, access-controlled collection process after F06.

## Migration Plan

No deployment or schema migration. Product/security owners may later approve the release gates in a separate reviewed change. A later study run must record the approved release candidate, consent, recruitment and observation conditions before collecting any participant data.
