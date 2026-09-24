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

    const editor = screen.getByRole('textbox', {
      name: 'Code editor (javascript)',
    });
    const host = container.querySelector('[data-code-editor]');
    expect(host).not.toBeNull();
    expect(container.querySelector('.cm-editor')).not.toBeNull();
    expect(container.querySelector('.cm-lineNumbers')).not.toBeNull();

    const view = EditorView.findFromDOM(
      editor.closest('.cm-editor') as HTMLElement,
    );
    expect(view).not.toBeNull();
    view?.dispatch({
      changes: { from: view.state.doc.length, insert: '\nconst b = 2;' },
    });

    expect(onChange).toHaveBeenCalledWith('const a = 1;\nconst b = 2;');
  });

  it('reconciles a controlled source without reporting it as learner input', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CodeEditor value="const first = 1;" onChange={onChange} />,
    );

    rerender(<CodeEditor value="const second = 2;" onChange={onChange} />);

    expect(screen.getByRole('textbox').textContent).toContain(
      'const second = 2;',
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});
