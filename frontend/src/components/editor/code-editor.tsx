'use client';

import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

export interface CodeEditorProps {
  /** Compatibility input for the Phase 3 proof-of-render. Prefer `value`. */
  initialValue?: string;
  value?: string;
  language?: 'javascript';
  label?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const editorTheme = EditorView.theme({
  '&': {
    minHeight: '22rem',
    backgroundColor: 'var(--color-surface-sunken)',
    color: 'var(--color-ink)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.925rem',
  },
  '&.cm-focused': { outline: '2px solid var(--color-reward)' },
  '.cm-scroller': { overflow: 'auto', fontFamily: 'inherit' },
  '.cm-content': { minHeight: '22rem', padding: '1rem 0' },
  '.cm-line': { padding: '0 1rem' },
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-muted)',
    borderRight: '1px solid var(--color-line)',
  },
  '.cm-activeLine, .cm-activeLineGutter': {
    backgroundColor: 'rgb(105 183 255 / 0.08)',
  },
  '.cm-cursor': { borderLeftColor: 'var(--color-reward)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgb(105 183 255 / 0.28)',
  },
});

export function CodeEditor({
  initialValue = '',
  value,
  language = 'javascript',
  label = 'Code editor',
  className,
  onChange,
}: CodeEditorProps): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const syncingRef = useRef(false);
  const initialRef = useRef(value ?? initialValue);
  const labelCompartmentRef = useRef(new Compartment());
  onChangeRef.current = onChange;

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;

    const labelCompartment = labelCompartmentRef.current;
    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: initialRef.current,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          javascript(),
          closeBrackets(),
          autocompletion({ activateOnTyping: true }),
          keymap.of([
            indentWithTab,
            ...closeBracketsKeymap,
            ...completionKeymap,
            ...defaultKeymap,
          ]),
          labelCompartment.of(
            EditorView.contentAttributes.of({
              'aria-label': `${label} (${language})`,
              'aria-multiline': 'true',
              spellcheck: 'false',
            }),
          ),
          editorTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !syncingRef.current) {
              onChangeRef.current?.(update.state.doc.toString());
            }
          }),
        ],
      }),
    });
    viewRef.current = view;
    return (): void => {
      viewRef.current = null;
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (view === null || value === undefined) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    syncingRef.current = true;
    view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    syncingRef.current = false;
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (view === null) return;
    view.dispatch({
      effects: labelCompartmentRef.current.reconfigure(
        EditorView.contentAttributes.of({
          'aria-label': `${label} (${language})`,
          'aria-multiline': 'true',
          spellcheck: 'false',
        }),
      ),
    });
  }, [label, language]);

  return (
    <div
      ref={hostRef}
      data-code-editor=""
      className={cn(
        'min-w-0 overflow-hidden rounded-md border border-line bg-surface-sunken',
        className,
      )}
    />
  );
}
