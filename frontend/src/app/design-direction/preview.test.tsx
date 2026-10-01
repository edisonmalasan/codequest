import { EditorView } from '@codemirror/view';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DesignDirectionPreview } from './preview';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => (
    <img src={props.src} alt={props.alt} />
  ),
}));

describe('DesignDirectionPreview', () => {
  it('keeps sample status visible across home, discovery, map, and lesson', async () => {
    const user = userEvent.setup();
    render(<DesignDirectionPreview />);

    expect(screen.getByText(/SAMPLE CONTENT/).textContent).toContain(
      'SAMPLE CONTENT',
    );
    await user.click(screen.getByRole('button', { name: /Explore courses/i }));
    expect(
      screen.getByRole('heading', { name: /Choose a course/i }),
    ).toBeTruthy();
    await user.type(
      screen.getByRole('searchbox', { name: 'Find a course' }),
      'nothing',
    );
    expect(screen.getByText(/No sample courses match/)).toBeTruthy();
    await user.clear(screen.getByRole('searchbox', { name: 'Find a course' }));
    await user.click(screen.getByRole('button', { name: /JavaScript Trail/i }));
    expect(
      screen.getByRole('heading', { name: 'JavaScript Trail' }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole('button', { name: /Open sample lesson/i }),
    );
    expect(screen.getByRole('heading', { name: 'Send a signal' })).toBeTruthy();
    expect(screen.getByText(/ACTIONS DO NOT SAVE PROGRESS/)).toBeTruthy();
  });

  it('keeps source and simulated result while switching panels and exercises', async () => {
    const user = userEvent.setup();
    render(<DesignDirectionPreview />);
    await user.click(
      within(
        screen.getByRole('navigation', { name: 'Preview screens' }),
      ).getByRole('button', { name: 'Lesson' }),
    );

    const editor = screen.getByRole('textbox', {
      name: 'Sample JavaScript editor (javascript)',
    });
    const view = EditorView.findFromDOM(
      editor.closest('.cm-editor') as HTMLElement,
    );
    expect(view).not.toBeNull();
    view?.dispatch({
      changes: { from: view.state.doc.length, insert: '\nconsole.log(42);' },
    });

    await user.click(screen.getByRole('button', { name: /Run sample state/i }));
    expect(screen.getByText(/your code was not executed/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Output' }));
    await user.click(screen.getByRole('button', { name: 'Editor' }));
    expect(
      screen.getByRole('textbox', {
        name: 'Sample JavaScript editor (javascript)',
      }).textContent,
    ).toContain('console.log(42)');
    await user.click(
      screen.getByRole('button', { name: /Check sample state/i }),
    );
    expect(
      screen.getByText(/no validation or completion was submitted/i),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next →' }));
    expect(
      screen.getByRole('heading', { name: 'Shape a message' }),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Show sample hint' }));
    expect(screen.getByText(/A message goes between/)).toBeTruthy();
  });
});
