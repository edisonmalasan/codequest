import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CodeEditorProps } from '@/components/editor/code-editor';
import { DeferredCodeEditor } from './deferred-code-editor';

const FakeEditor = ({ value, label, onChange }: CodeEditorProps) => (
  <textarea
    aria-label={label}
    value={value}
    onChange={(event) => onChange?.(event.target.value)}
  />
);

beforeEach(() => vi.stubGlobal('IntersectionObserver', undefined));

describe('DeferredCodeEditor', () => {
  it('keeps parent source while loading and renders it when ready', async () => {
    let finish:
      ((value: { CodeEditor: typeof FakeEditor }) => void) | undefined;
    const loadEditor = vi.fn(
      () =>
        new Promise<{ CodeEditor: typeof FakeEditor }>((resolve) => {
          finish = resolve;
        }),
    );
    const onChange = vi.fn();
    const { rerender } = render(
      <DeferredCodeEditor
        value="first"
        label="main.js"
        onChange={onChange}
        loadEditor={loadEditor}
      />,
    );
    expect(screen.getByRole('status').textContent).toContain('Loading');
    rerender(
      <DeferredCodeEditor
        value="newer source"
        label="main.js"
        onChange={onChange}
        loadEditor={loadEditor}
      />,
    );
    finish?.({ CodeEditor: FakeEditor });
    const textbox = await screen.findByRole('textbox', { name: 'main.js' });
    expect((textbox as HTMLTextAreaElement).value).toBe('newer source');
    fireEvent.change(textbox, { target: { value: 'edited' } });
    expect(onChange).toHaveBeenCalledWith('edited');
    expect(loadEditor).toHaveBeenCalledTimes(1);
  });

  it('keeps a recoverable source snapshot and retries a failed import', async () => {
    const loadEditor = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ CodeEditor: FakeEditor });
    render(
      <DeferredCodeEditor
        value="saved source"
        label="main.js"
        loadEditor={loadEditor}
      />,
    );
    expect((await screen.findByRole('alert')).textContent).toContain(
      'could not load',
    );
    expect(screen.getByLabelText('Current source snapshot').textContent).toBe(
      'saved source',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Retry editor loading' }),
    );
    const textbox = await screen.findByRole('textbox', { name: 'main.js' });
    await waitFor(() => expect(document.activeElement).toBe(textbox));
    expect(loadEditor).toHaveBeenCalledTimes(2);
  });
});
