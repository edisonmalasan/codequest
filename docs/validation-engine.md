# Local validation engine

Phase 16 provides a reusable frontend `ValidationStrategy`. A caller supplies one immutable JavaScript source snapshot and a bounded, data-only `ValidationDefinition`. The returned `ValidationResult` has a terminal status, overall `passed` flag, ordered case outcomes, `failedCaseIds`, bounded feedback, and measured `durationMs`. A pass is local and unverified. It never submits an attempt or changes accepted progress, XP, rewards, or unlocks.

`output-match` compares the complete ordered console-line sequence exactly, including whitespace and extra lines. `value-test` compares the returned JSON-compatible value structurally. `function-test` calls a named function with JSON-compatible arguments in a fresh Worker for each case, then compares the result structurally. `custom-test` accepts only `output-contains` and inclusive finite `number-range` predicates. Callbacks, regexes, executable test strings, DOM checks, packages, and LLM grading are excluded.

Example:

```ts
const definition: ValidationDefinition = {
  cases: [{
    id: 'double-three',
    label: 'Doubles three',
    feedback: 'Multiply the input by two.',
    mode: 'function-test',
    functionName: 'double',
    args: [3],
    expected: 6,
  }],
};
const result = await strategy.validate({
  source: 'function double(value) { return value * 2; }',
  definition,
  signal: controller.signal,
});
```

The frontend rejects duplicate/malformed IDs, extra fields, unsupported fixture values, callbacks, and oversized definitions before dispatch. It limits source to 64 KiB, definitions to 16 KiB, at most 10 cases, feedback to 512 bytes per field, and output to 12 KiB. Trusted control uses a two-second per-case deadline and six-second total deadline. Timeout, syntax/runtime errors, output limit, cancellation, and internal/protocol failure cannot pass. Each case gets a fresh Worker; termination precedes forwarded results. The same separate runner origin and strict response CSP used by Phase 14 serve fixed `/runtime/validation-bootstrap.html`, `/runtime/validation-bootstrap.js`, and `/runtime/validation-worker.js` resources. No validation code runs in the authenticated app document or NestJS.

The runner host serves only fixed `/runtime/` resources and no authenticated routes. Deploy it without cookies, session middleware, service workers, or authenticated API routing; preserve its Host header at the edge. `NEXT_PUBLIC_RUNTIME_ORIGIN` must be a separate HTTPS origin, with loopback HTTP limited to local development. If the origin or handshake fails, validation fails closed. Browser-reported results remain forgeable under the personal-learning policy in [ADR 0005](adr/0005-assessment-trust-and-completion.md); Phase 17 is responsible for any later acceptance flow.

The development-only `/editor-workspace` route demonstrates all four modes. Published curriculum already delivers data-only console/function cases, but Phase 16 does not connect the quest reading route to this workspace. A later route may map those public cases to this contract without importing `backend/content/` into the frontend.
