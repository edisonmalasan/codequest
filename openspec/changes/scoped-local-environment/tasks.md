# Tasks

## 1. Scoped configuration

- [ ] 1.1 Add credential-free frontend and backend environment templates and exact `.gitignore` exceptions; verify only the templates are trackable and real `.env.local` files remain ignored.
- [ ] 1.2 Add optional, non-production backend local environment loading to dev/start and database scripts; verify missing-file, supplied-variable precedence, and production behavior with focused tests and `db:check`/`db:drift`/`db:generate` command probes.

## 2. Local origins and documentation

- [ ] 2.1 Bind the frontend development server to all interfaces and verify the three loopback hosts can reach their allowed routes while cross-origin and app-origin asset probes remain denied.
- [ ] 2.2 Rewrite README environment setup with scoped copy, Supabase values and callback, migration sequence, security boundaries, and verification instructions; review the rendered instructions against current scripts.

## 3. Integration verification

- [ ] 3.1 Run root lint, typecheck, test, build, and API drift checks; run a local `pnpm dev` smoke test and record any environment-dependent limitation without claiming an unrun check passed.
