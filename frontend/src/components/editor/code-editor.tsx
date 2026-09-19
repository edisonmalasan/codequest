'use client';

import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  initialValue: string;
  label?: string;
  onChange?: (value: string) => void;
}

// Minimal editor proof-of-render. The full workspace (toolbar, tabs,
// console, persistence, execution) belongs to Phase 13+.
export function CodeEditor({
  initialValue,
  label = 'Code editor',
  onChange,
}: CodeEditorProps): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialRef = useRef(initialValue);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) {
      return;
    }
    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: initialRef.current,
        extensions: [
          javascript(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current?.(update.state.doc.toString());
            }
          }),
        ],
      }),
    });
    return (): void => {
      view.destroy();
    };
  }, []);

  return <div ref={hostRef} role="textbox" aria-label={label} />;
}
