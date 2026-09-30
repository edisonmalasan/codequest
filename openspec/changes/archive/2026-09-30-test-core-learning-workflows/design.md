# Design

## Context

See [proposal.md](proposal.md). The existing Vitest suites cover each domain and the production browser fixtures exercise public curriculum, local Run/Check, pending work, and a fake collector. `foundations.spec.ts` confirms Q01–Q04 provisional state but has no verified Auth or protected request. CI supplies PostgreSQL and runs Chromium PWA/curriculum/analytics gates; default Playwright covers Firefox/WebKit only for isolated preview and validation. Backend personal-learning acceptance trusts bounded authenticated client reports after policy checks (ADR 0005), never independent code grading.

## Goals / Non-Goals

**Goals:** Exercise the accepted-fact chain and the complete published guest-to-account journey through real CodeQuest API/database boundaries; make browser-engine and mobile-emulation results visible in CI; keep test Auth inputs reproducible and disposable.

**Non-Goals:** Add a new production identity policy, external Supabase project credentials, a remote grader, new learning authority, broad snapshot tests, physical mobile or assistive-technology support claims, or Phase 35 accessibility implementation. Repairing the existing signup form's public environment lookup is in scope when the browser gate exposes it.

## Decisions

### Keep one source of test truth per boundary

Audit current unit suites first and add only cases that close observed gaps, especially one concise table for deterministic validation/content inputs and one integration test for cross-domain acceptance. Use published test content and migration-backed PostgreSQL in the integration gate; assert externally visible service/HTTP facts and durable uniqueness rather than private helper calls. An alternative of repeating every existing unit assertion would increase runtime without finding cross-boundary faults.

### Run a local test identity provider, not a mock backend

Use a test-only local HTTP Auth fixture with a generated asymmetric key and JWKS endpoint. It returns a short-lived signed session for the registration UI and a matching user response for session refresh. NestJS retains its real JWT verifier, owner guards, controllers and PostgreSQL connection. The fixture starts only in the dedicated Playwright gate and never writes a key to the repository. The browser still performs the signup form action; a seeded cookie alone would not cover that transition. A real hosted Supabase project was rejected because the CI gate must be deterministic and credential-free.

The signup form must read each public environment variable explicitly for Next.js browser inlining, as the existing browser Supabase client does. The test fixture must answer the Supabase client's CORS preflight, including its API-version header. These are narrow repairs revealed by running the browser transition; the production identity contract does not change.

### Isolate the browser scenario and verify backend reads

Add a dedicated Playwright config and script rather than broadening every existing suite. Start the Auth fixture, migrated backend, and frontend/preview hosts in a known order. Use the current selected Q01 and Q02 snapshots and reference solutions. Before signup, assert no protected write on Check. After signup, click the explicit import control and assert the account's protected progress/XP/streak/availability responses and visible UI. Submit Q02 explicitly and re-read trusted facts. Use a unique fixture user identity and clean database state per run; no frontend-provided owner or total counts as authority. If Auth or database startup fails, fail the gate.

### Use engine matrix plus limited mobile emulation

Run the critical scenario on Chromium, Firefox, and WebKit with one worker to protect the shared test database; add a Chromium mobile viewport project or explicit viewport assertion for guest and account routes. Install all three Playwright browser dependencies in CI for this named gate. Keep the existing Chromium production curriculum/PWA gates and default isolated-runtime matrix. Emulated viewport results do not satisfy F02 physical-device or screen-reader obligations.

## Risks / Trade-offs

- [Test Auth fixture diverges from Supabase] → Implement only the registration, user and JWKS responses exercised by this path; assert actual signed Bearer verification at NestJS and retain separate Auth unit tests. Record the fixture limit.
- [Shared database produces order-dependent results] → Use fresh test subject identity and deterministic cleanup or isolated database scope; run browser projects serially.
- [All-engine journey is slow or engine-specific] → Keep one focused flow per engine, retain artifacts and failure output, and fix actual behavior rather than silently skip an engine.
- [Client report mistaken for independent proof] → Name it a reported pass in tests and documentation; assert backend policy and durability only.

## Migration Plan

No product data migration. Add the dedicated test command and CI gate after local verification. Rollback removes test harness and gate without changing production contracts or stored facts.
