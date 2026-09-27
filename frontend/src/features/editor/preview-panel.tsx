import type { PreviewResult } from '@/features/preview';

export function PreviewPanel({
  hostRef,
  result,
  running,
}: {
  hostRef: React.RefObject<HTMLDivElement | null>;
  result?: PreviewResult;
  running: boolean;
}): React.JSX.Element {
  return (
    <section
      aria-label="Web preview"
      className="min-w-0 overflow-hidden rounded-md border border-line bg-surface-raised"
    >
      <div className="border-b border-line px-4 py-3">
        <h2 className="font-sans text-sm font-bold">Web preview</h2>
        <p role="status" aria-live="polite" className="mt-1 text-xs text-muted">
          {running
            ? 'Loading preview'
            : (result?.message ?? 'Select Preview to render HTML and CSS')}
        </p>
        {result?.filteredActiveContent && (
          <p className="mt-1 text-xs text-muted">
            Active HTML content was removed for safety.
          </p>
        )}
      </div>
      <div ref={hostRef} className="h-80 min-w-0 overflow-hidden bg-white" />
      {result?.execution && (
        <div className="max-h-40 overflow-auto border-t border-line px-4 py-3">
          <p className="text-xs font-bold">
            JavaScript output (separate Worker)
          </p>
          <pre
            className="mt-2 whitespace-pre-wrap break-words font-mono text-xs"
            aria-label="Preview JavaScript output"
          >
            {result.execution.output.join('\n') ||
              result.execution.value ||
              result.execution.message ||
              'No text output'}
          </pre>
        </div>
      )}
    </section>
  );
}
