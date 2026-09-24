import type { ConsoleLine } from './editor-workspace-types';

export function ConsolePanel({
  lines = [],
}: {
  lines?: readonly ConsoleLine[];
}): React.JSX.Element {
  return (
    <section
      aria-labelledby="workspace-console-title"
      className="min-w-0 rounded-md border border-line bg-surface-sunken"
    >
      <h3
        id="workspace-console-title"
        className="border-b border-line px-4 py-3 font-sans text-sm font-bold text-ink"
      >
        Console
      </h3>
      <div className="max-h-48 min-h-28 overflow-auto p-4 font-mono text-sm leading-6">
        {lines.length === 0 ? (
          <p className="text-muted">
            Execution is unavailable in this workspace.
          </p>
        ) : (
          <ol className="space-y-1" aria-label="Console messages">
            {lines.map((line) => (
              <li
                key={line.id}
                className={line.kind === 'error' ? 'text-danger' : 'text-muted'}
              >
                {line.text}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
