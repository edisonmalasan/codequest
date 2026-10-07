import { useState } from 'react';
import type { PreviewResult } from '@/features/preview';

const viewportWidths = {
  current: null,
  narrow: 390,
  wide: 1024,
} as const;
type ViewportChoice = keyof typeof viewportWidths;

export function PreviewPanel({
  hostRef,
  result,
  running,
  onFailedWidthChange,
}: {
  hostRef: React.Ref<HTMLDivElement>;
  result?: PreviewResult;
  running: boolean;
  onFailedWidthChange?: () => void;
}): React.JSX.Element {
  const [viewport, setViewport] = useState<ViewportChoice>('current');
  const width = viewportWidths[viewport];
  const chooseViewport = (choice: ViewportChoice): void => {
    if (choice === viewport) return;
    setViewport(choice);
    if (result && result.status !== 'ready') onFailedWidthChange?.();
  };
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
        <div
          role="group"
          aria-label="Preview width"
          className="mt-3 flex flex-wrap gap-2"
        >
          {(['current', 'narrow', 'wide'] as const).map((choice) => (
            <button
              key={choice}
              type="button"
              aria-pressed={viewport === choice}
              onClick={() => chooseViewport(choice)}
              className="min-h-11 rounded-sm border border-line px-3 py-1 font-mono text-xs font-bold text-ink aria-pressed:border-ascent aria-pressed:bg-ascent/15"
            >
              {choice === 'current'
                ? 'Current'
                : `${choice === 'narrow' ? 'Narrow' : 'Wide'} · ${viewportWidths[choice]}px`}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted" aria-live="polite">
          {viewport === 'current'
            ? 'Preview width follows this panel.'
            : `${viewport === 'narrow' ? 'Narrow' : 'Wide'} preview: ${width} CSS pixels.`}
        </p>
      </div>
      <div className="max-w-full overflow-x-auto bg-white">
        <div
          ref={hostRef}
          className="h-80 overflow-hidden bg-white"
          style={{ width: width === null ? '100%' : `${width}px` }}
        />
      </div>
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
