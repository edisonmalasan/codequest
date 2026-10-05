import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  InteractiveEvent,
  InteractiveResult,
  InteractiveSnapshot,
  InteractiveWebAdapter,
} from '@/features/interactive';
import type { WorkspaceFile } from './editor-workspace-types';
import { InteractivePreviewPanel } from './interactive-preview-panel';

const files: readonly WorkspaceFile[] = [
  {
    id: 'page',
    name: 'index.html',
    language: 'html',
    starterSource: '<h1>Hi</h1>',
  },
  {
    id: 'logic',
    name: 'main.js',
    language: 'javascript',
    starterSource: 'console.log("Hi")',
  },
];

class ReviewAdapter implements InteractiveWebAdapter {
  readonly start = vi.fn(
    async (snapshot: InteractiveSnapshot): Promise<InteractiveResult> => {
      this.lastSnapshot = snapshot;
      return this.outcome;
    },
  );
  readonly cancel = vi.fn(async () => {});
  readonly dispose = vi.fn(async () => {});
  lastSnapshot?: InteractiveSnapshot;

  constructor(readonly outcome: InteractiveResult) {}
  attach(): void {}
  subscribe(): () => void {
    return () => {};
  }
  dispatch(event: InteractiveEvent): Promise<InteractiveResult> {
    void event;
    return Promise.resolve(this.outcome);
  }
  reload(): Promise<InteractiveResult> {
    return Promise.resolve(this.outcome);
  }
  readText(): string | null {
    return null;
  }
}

const ready: InteractiveResult = {
  generationId: 'review-1',
  status: 'ready',
  message: 'Interactive preview ready',
  output: ['finite'],
  filteredActiveContent: false,
  description: 'A result',
  durationMs: 24,
};

describe('interactive review panel', () => {
  it('runs the current identified files and marks the old result stale on edit', async () => {
    const adapter = new ReviewAdapter(ready);
    const view = render(
      <InteractivePreviewPanel
        adapter={adapter}
        ownerId="guest"
        workspaceId="review"
        files={files}
        sources={{ page: '<h1>Current</h1>', logic: 'console.log("finite")' }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Start interactive' }));
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('ready'),
    );
    expect(adapter.lastSnapshot?.files[0]?.source).toBe('<h1>Current</h1>');
    expect(
      screen.getByLabelText('Interactive console output').textContent,
    ).toContain('finite');
    view.rerender(
      <InteractivePreviewPanel
        adapter={adapter}
        ownerId="guest"
        workspaceId="review"
        files={files}
        sources={{ page: '<h1>Edited</h1>', logic: 'console.log("finite")' }}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'Source changed',
      ),
    );
    expect(adapter.cancel).toHaveBeenCalled();
    expect(
      screen
        .getByRole('button', { name: 'Reload interactive' })
        .hasAttribute('disabled'),
    ).toBe(true);
  });

  it('shows a truthful unavailable result without claiming a Check or completion', async () => {
    const adapter = new ReviewAdapter({
      ...ready,
      status: 'unavailable',
      message: 'Interactive origin unavailable',
      output: [],
    });
    render(
      <InteractivePreviewPanel
        adapter={adapter}
        ownerId="guest"
        workspaceId="review"
        files={files}
        sources={{ page: '<h1>Hi</h1>', logic: '' }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Start interactive' }));
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('unavailable'),
    );
    expect(screen.queryByRole('button', { name: 'Check' })).toBeNull();
    expect(screen.queryByText(/completed/i)).toBeNull();
  });

  it('cancels the prior session when workspace ownership changes', async () => {
    const adapter = new ReviewAdapter(ready);
    const sources = { page: '<h1>Hi</h1>', logic: 'console.log("Hi")' };
    const view = render(
      <InteractivePreviewPanel
        adapter={adapter}
        ownerId="guest-one"
        workspaceId="review"
        files={files}
        sources={sources}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Start interactive' }));
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('ready'),
    );
    const cancels = adapter.cancel.mock.calls.length;
    view.rerender(
      <InteractivePreviewPanel
        adapter={adapter}
        ownerId="guest-two"
        workspaceId="review"
        files={files}
        sources={sources}
      />,
    );
    await waitFor(() =>
      expect(adapter.cancel.mock.calls.length).toBeGreaterThan(cancels),
    );
    expect(screen.queryByLabelText('Interactive console output')).toBeNull();
  });
});
