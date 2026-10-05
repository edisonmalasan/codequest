'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type {
  InteractiveResult,
  InteractiveWebAdapter,
} from '@/features/interactive';
import type { WorkspaceFile } from './editor-workspace-types';

export function InteractivePreviewPanel({
  adapter,
  contentVersion,
  ownerId,
  workspaceId,
  files,
  sources,
}: {
  adapter: InteractiveWebAdapter;
  contentVersion?: string;
  ownerId: string;
  workspaceId: string;
  files: readonly WorkspaceFile[];
  sources: Readonly<Record<string, string>>;
}): React.JSX.Element {
  const host = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<InteractiveResult>();
  const [running, setRunning] = useState(false);
  const [stale, setStale] = useState(false);
  const [revision, setRevision] = useState(0);
  const token = useRef(0);

  useEffect(() => {
    if (!host.current) return;
    adapter.attach(host.current);
    const unsubscribe = adapter.subscribe((next) =>
      setValue((previous) => ({
        ...next,
        output: [...(previous?.output ?? []), ...next.output].slice(-200),
      })),
    );
    return () => {
      token.current += 1;
      unsubscribe();
      void adapter.cancel();
    };
  }, [adapter]);

  useEffect(() => {
    token.current += 1;
    setValue(undefined);
    setRunning(false);
    void adapter.cancel();
  }, [adapter, ownerId, workspaceId]);

  useEffect(() => {
    token.current += 1;
    void adapter.cancel();
    setValue(undefined);
    setRunning(false);
    setStale(true);
  }, [adapter, sources]);

  function start(reload: boolean): void {
    const current = ++token.current;
    setRunning(true);
    setValue(undefined);
    setStale(false);
    const operation = reload
      ? adapter.reload()
      : adapter.start({
          contentVersion: contentVersion ?? `review-${revision}`,
          files: files.map((file) => ({
            id: file.id,
            language: file.language,
            source: sources[file.id] ?? file.starterSource,
          })),
        });
    void operation.then(
      (outcome) => {
        if (token.current !== current) return;
        setValue(outcome);
        setRunning(false);
        setRevision((value) => value + 1);
      },
      () => {
        if (token.current !== current) return;
        setRunning(false);
        setValue({
          generationId: crypto.randomUUID(),
          status: 'unavailable',
          message: 'Interactive preview unavailable',
          output: [],
          filteredActiveContent: false,
          description: '',
          durationMs: 0,
        });
      },
    );
  }

  return (
    <section
      aria-label="Interactive result"
      className="min-w-0 overflow-hidden rounded-md border border-line bg-surface-raised"
    >
      <div className="border-b border-line px-4 py-3">
        <h2 className="font-sans text-sm font-bold">Interactive web preview</h2>
        <p className="mt-1 text-xs text-muted">
          Start the page to try its supported interactions. Your latest edits
          appear after you start it again.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" onClick={() => start(false)} disabled={running}>
            Start interactive
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => start(true)}
            disabled={running || !value || stale}
          >
            Reload interactive
          </Button>
          {running && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                token.current += 1;
                void adapter.cancel();
                setRunning(false);
                setValue({
                  generationId: crypto.randomUUID(),
                  status: 'cancelled',
                  message: 'Interactive preview cancelled',
                  output: [],
                  filteredActiveContent: false,
                  description: '',
                  durationMs: 0,
                });
              }}
            >
              Cancel interactive
            </Button>
          )}
        </div>
        <p role="status" aria-live="polite" className="mt-3 text-xs text-muted">
          {running
            ? 'Running interactive preview'
            : stale
              ? 'Source changed. Start interactive again to update the preview.'
              : (value?.message ??
                'Select Start interactive to render the current files.')}
        </p>
        {value?.filteredActiveContent && (
          <p className="mt-1 text-xs text-muted">
            Active HTML content was removed for safety.
          </p>
        )}
      </div>
      <div ref={host} className="h-80 min-w-0 overflow-hidden bg-white" />
      {value && (
        <div className="border-t border-line px-4 py-3 text-xs">
          <p
            data-interactive-duration-ms={Math.round(value.durationMs)}
            className="sr-only"
          >
            Interactive run finished in {Math.round(value.durationMs)}{' '}
            milliseconds.
          </p>
          <p aria-label="Interactive preview description">
            {value.description}
          </p>
          <pre
            aria-label="Interactive console output"
            className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words font-mono"
          >
            {value.output.join('\n')}
          </pre>
        </div>
      )}
    </section>
  );
}
