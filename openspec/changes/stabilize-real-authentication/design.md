# Design

## Context

The Phase 8 auth and later recovery implementations provide `/register`, `/login`, `/auth/callback`, `/recover`, `/account/password`, and `/account`. Next.js uses Supabase SSR cookies and PKCE; NestJS verifies asymmetric access tokens and owns the account. The R03 shell did not change this boundary. Current frontend local config is populated and `/login` and `/register` returned 200 on 2026-10-02, but the backend health endpoint did not become available during a root `pnpm dev` probe; the backend watch process repeatedly restarted while loading dependencies. No registration, email delivery, OAuth, recovery, or backend account success was established by that probe. The founder has separately reported real email and provider failures.

## Goals / Non-Goals

**Goals:** Resolve application defects that block real local Auth journeys; make environmental dependencies observable without leaking secrets; record distinct automated, real-integration, and founder results for every required method.

**Non-Goals:** Alter Supabase as identity authority, bypass the NestJS verification boundary, configure external providers by assumption, introduce account linking or MFA, activate telemetry, advance Phase 38, or claim a beta release result from local tests.

## Decisions

1. **Diagnose the complete route before changing it.** Start with local dev health and safe configuration shape, then trace browser → Supabase Auth → callback cookie → protected account API. Inspect only sanitized status and error classes. This avoids changing security-sensitive code based on a failed fixture or a missing provider setting. Alternative: rewrite Auth paths wholesale; rejected because their security contract and tests already exist.
2. **Keep the existing SSR/PKCE and backend identity contract.** Repairs stay in current auth features, routes, identity module, and scripts where evidence points. Backend identity remains the verified JWT subject; browser-provided owner data and provider access tokens remain untrusted. Alternative: direct frontend application-table access; rejected by the architecture boundary.
3. **Use three evidence layers.** Deterministic tests cover error handling and security regressions; synthetic real-provider/email runs prove the configured local/hosted journey; the founder separately accepts the visible product flow. Record method, commit, environment, timestamp, observed result, defect and retest. A provider dashboard or mailbox dependency that cannot be exercised remains open. Alternative: count mocked OAuth redirects as integration; rejected because they cannot establish delivery, callback allowlists, or provider configuration.
4. **Keep failure messages safe and actionable.** Learners receive local retry and support paths while diagnostics distinguish code/configuration/delivery categories without raw provider responses in telemetry or committed evidence. Recovery retains its non-enumerating acknowledgement. Alternative: render provider error text; rejected for privacy and leakage risk.
5. **Treat root dev startup as an integration prerequisite.** Reproduce the observed backend watch restart with Node 24 and current scripts, isolate its cause, and make the smallest script/config fix if it blocks local account verification. Do not weaken production config validation or add a new configuration framework.

## Risks / Trade-offs

- Provider and email settings may require dashboard access or owner action → record exact missing setting and keep that method unverified; proceed with independent code/test work.
- Local success is not hosted beta evidence → tie every result to its actual environment and leave Phase 38 hosted rows open.
- Auth changes can regress cookie rotation or ownership → focus tests on refresh, sign-out, callback safety, bearer scope, and two-account isolation before merging.
- Synthetic identity creation touches a configured external project → use only authorized test identities and avoid logging addresses, credentials, cookies, tokens, or private responses.

## Migration Plan

No schema migration is planned. Deploy application repairs through the normal PR/CI route, configure approved redirect/provider/email settings in the intended environment, and repeat synthetic flow verification for the exact build. Roll back the application commit if Auth regressions appear; do not mark external configuration as fixed without a fresh run.
