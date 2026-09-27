import { useId } from 'react';
import type { WorkspaceTestResult } from './editor-workspace-types';
import type { ValidationResult } from '@/features/validation';

export function TestResults({
  results = [],
  validation,
  checking = false,
}: {
  results?: readonly WorkspaceTestResult[];
  validation?: ValidationResult;
  checking?: boolean;
}): React.JSX.Element {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="min-w-0 rounded-md border border-line bg-surface-raised p-4"
    >
      <h3 id={titleId} className="font-sans text-sm font-bold">
        Test results
      </h3>
      {checking && (
        <p role="status" className="mt-3 text-sm">
          Checking locally…
        </p>
      )}
      {validation && !checking && (
        <p role="status" className="mt-3 text-sm leading-6">
          {validation.passed ? 'Local check passed' : 'Local check failed'} —
          unverified, no progress recorded. Completed in{' '}
          {(validation.durationMs / 1_000).toFixed(2)} seconds.
          {validation.feedback && <> {validation.feedback}</>}
        </p>
      )}
      {results.length === 0 && !validation && !checking ? (
        <p className="mt-3 text-sm leading-6 text-muted">
          Checks are unavailable until validation is added.
        </p>
      ) : (
        results.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm">
            {results.map((result) => (
              <li key={result.id}>
                <span className="font-semibold">{result.label}</span>{' '}
                <span className="text-muted">— {result.status}</span>
                {result.message && (
                  <p className="text-muted">{result.message}</p>
                )}
              </li>
            ))}
          </ul>
        )
      )}
      {validation && !checking && validation.cases.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm">
          {validation.cases.map((item) => (
            <li key={item.id}>
              <span className="font-semibold">{item.label}</span>{' '}
              <span className="font-mono text-xs text-muted">({item.id})</span>{' '}
              <span className="text-muted">— {item.status}</span>
              <p className="text-muted">{item.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
