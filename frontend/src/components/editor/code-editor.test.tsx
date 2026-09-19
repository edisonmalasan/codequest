import { EditorView } from '@codemirror/view';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditor } from './code-editor';

describe('CodeEditor', () => {
  it('renders editable source and reports value changes', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CodeEditor initialValue="const a = 1;" onChange={onChange} />,
    );

    const host = screen.getByRole('textbox', { name: 'Code editor' });
    expect(host).toBeDefined();
    expect(container.querySelector('.cm-editor')).not.toBeNull();

    const view = EditorView.findFromDOM(host.firstChild as HTMLElement);
    expect(view).not.toBeNull();
    view?.dispatch({
      changes: { from: view.state.doc.length, insert: '\nconst b = 2;' },
    });

    expect(onChange).toHaveBeenCalledWith('const a = 1;\nconst b = 2;');
  });
});
