import type { WorkspaceTestResult } from './editor-workspace-types';

export function TestResults({
  results = [],
}: {
  results?: readonly WorkspaceTestResult[];
}): React.JSX.Element {
  return (
    <section
      aria-labelledby="workspace-tests-title"
      className="min-w-0 rounded-md border border-line bg-surface-raised p-4"
    >
      <h3 id="workspace-tests-title" className="font-sans text-sm font-bold">
        Test results
      </h3>
      {results.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-muted">
          Checks are unavailable until validation is added.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {results.map((result) => (
            <li key={result.id}>
              <span className="font-semibold">{result.label}</span>{' '}
              <span className="text-muted">— {result.status}</span>
              {result.message && <p className="text-muted">{result.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
