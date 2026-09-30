'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import type { CodeEditorProps } from '@/components/editor/code-editor';

type EditorModule = { CodeEditor: ComponentType<CodeEditorProps> };

export interface DeferredCodeEditorProps extends CodeEditorProps {
  loadEditor?: () => Promise<EditorModule>;
}

const importEditor = (): Promise<EditorModule> =>
  import('@/components/editor/code-editor');

export function DeferredCodeEditor({
  loadEditor = importEditor,
  ...props
}: DeferredCodeEditorProps): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const requestedRef = useRef(false);
  const focusAfterLoadRef = useRef(false);
  const [Editor, setEditor] = useState<ComponentType<CodeEditorProps> | null>(
    null,
  );
  const [status, setStatus] = useState<'waiting' | 'loading' | 'failed'>(
    'waiting',
  );

  const requestEditor = useCallback(
    (focusAfterLoad = false) => {
      if (requestedRef.current || Editor) return;
      if (focusAfterLoad) focusAfterLoadRef.current = true;
      requestedRef.current = true;
      setStatus('loading');
      void loadEditor().then(
        (module) => setEditor(() => module.CodeEditor),
        () => {
          requestedRef.current = false;
          setStatus('failed');
        },
      );
    },
    [Editor, loadEditor],
  );

  useEffect(() => {
    if (Editor || status !== 'waiting') return;
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === 'undefined') {
      requestEditor();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          requestEditor();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [Editor, requestEditor, status]);

  useEffect(() => {
    if (!Editor || !focusAfterLoadRef.current) return;
    focusAfterLoadRef.current = false;
    const timer = window.setTimeout(() => {
      hostRef.current
        ?.querySelector<HTMLElement>('[role="textbox"], textarea')
        ?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [Editor]);

  return (
    <div ref={hostRef}>
      {Editor ? (
        <Editor {...props} />
      ) : status === 'failed' ? (
        <div className="min-h-[22rem] rounded-md border border-line bg-surface-sunken p-4">
          <p role="alert">
            Code editor could not load. Your source remains on this device.
          </p>
          <button
            type="button"
            className="mt-3 min-h-11 rounded-md border border-line px-4 text-discovery"
            onClick={() => requestEditor(true)}
          >
            Retry editor loading
          </button>
          <pre
            className="mt-4 max-h-52 overflow-auto whitespace-pre-wrap break-words text-sm"
            aria-label="Current source snapshot"
          >
            {props.value ?? props.initialValue ?? ''}
          </pre>
        </div>
      ) : (
        <div className="min-h-[22rem] rounded-md border border-line bg-surface-sunken p-4">
          <p role="status">
            {status === 'loading'
              ? 'Loading code editor…'
              : 'Code editor ready to load.'}
          </p>
          {status === 'waiting' && (
            <button
              type="button"
              className="mt-3 min-h-11 rounded-md border border-line px-4 text-discovery"
              onClick={() => requestEditor(true)}
            >
              Load code editor
            </button>
          )}
        </div>
      )}
    </div>
  );
}
