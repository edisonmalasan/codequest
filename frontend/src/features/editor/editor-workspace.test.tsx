import { EditorView } from '@codemirror/view';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type {
  DraftIdentity,
  DraftSource,
  EditorDraftRepository,
} from './draft-repository';
import { EditorWorkspace } from './editor-workspace';
import { FileTabs } from './file-tabs';
import { ConsolePanel } from './console-panel';
import { RuntimeStatus } from './runtime-status';
import { TestResults } from './test-results';
import type { WorkspaceFile } from './editor-workspace-types';

const files: readonly WorkspaceFile[] = [
  {
    id: 'main',
    name: 'main.js',
    language: 'javascript',
    starterSource: "const message = 'start';",
  },
  {
    id: 'helper',
    name: 'helper.js',
    language: 'javascript',
    starterSource: 'export const helper = true;',
  },
];

class MemoryDraftRepository implements EditorDraftRepository {
  readonly save = vi.fn(
    async (identity: DraftIdentity, filesToSave: readonly DraftSource[]) => {
      void identity;
      void filesToSave;
    },
  );

  constructor(
    private readonly drafts: DraftSource[] = [],
    failSave = false,
  ) {
    if (failSave) {
      this.save.mockImplementation(async () => {
        throw new Error('storage denied');
      });
    }
  }

  async load(): Promise<DraftSource[]> {
    return this.drafts;
  }
}

function editActiveSource(source: string): void {
  const textbox = screen.getByRole('textbox');
  const editor = textbox.closest('.cm-editor');
  if (!(editor instanceof HTMLElement)) throw new Error('CodeMirror missing');
  const view = EditorView.findFromDOM(editor);
  if (view === null) throw new Error('CodeMirror view missing');
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: source },
  });
}

describe('workspace presentation components', () => {
  it('moves semantic file tabs with arrow, Home, and End keys', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { rerender } = render(
      <FileTabs files={files} activeFileId="main" onSelect={onSelect} />,
    );
    const main = screen.getByRole('tab', { name: 'main.js' });
    main.focus();
    await user.keyboard('{ArrowRight}');
    expect(onSelect).toHaveBeenLastCalledWith('helper');

    rerender(
      <FileTabs files={files} activeFileId="helper" onSelect={onSelect} />,
    );
    const helper = screen.getByRole('tab', { name: 'helper.js' });
    helper.focus();
    await user.keyboard('{Home}');
    expect(onSelect).toHaveBeenLastCalledWith('main');
    await user.keyboard('{End}');
    expect(onSelect).toHaveBeenLastCalledWith('helper');
  });

  it('renders truthful inactive and parent-supplied display states', () => {
    const { rerender } = render(
      <>
        <ConsolePanel />
        <TestResults />
        <RuntimeStatus />
      </>,
    );
    expect(screen.getByText(/Execution is unavailable/)).toBeDefined();
    expect(screen.getByText(/Checks are unavailable/)).toBeDefined();
    expect(screen.getByText('Runtime unavailable')).toBeDefined();

    rerender(
      <>
        <ConsolePanel
          lines={[{ id: '1', kind: 'info', text: 'Display only' }]}
        />
        <TestResults
          results={[{ id: '1', label: 'Example', status: 'idle' }]}
        />
        <RuntimeStatus state={{ kind: 'idle', label: 'Waiting' }} />
      </>,
    );
    expect(screen.getByText('Display only')).toBeDefined();
    expect(screen.getByText('Example')).toBeDefined();
    expect(screen.getByText('Waiting')).toBeDefined();
  });
});

describe('EditorWorkspace', () => {
  it('restores drafts and preserves independent edits across file switches', async () => {
    const repository = new MemoryDraftRepository([
      { fileId: 'main', source: "const message = 'restored';" },
    ]);
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={repository}
      />,
    );

    await screen.findByText('Saved on this device');
    expect(screen.getByRole('textbox').textContent).toContain('restored');
    editActiveSource("const message = 'edited';");
    await user.click(screen.getByRole('tab', { name: 'helper.js' }));
    editActiveSource('export const helper = false;');
    await user.click(screen.getByRole('tab', { name: 'main.js' }));
    expect(screen.getByRole('textbox').textContent).toContain('edited');
  });

  it('saves explicitly, announces failure, and keeps edited source', async () => {
    const repository = new MemoryDraftRepository([], true);
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={repository}
      />,
    );
    await screen.findByText('Starter source ready');
    editActiveSource("const message = 'kept';");
    await user.click(screen.getByRole('button', { name: /Save locally/ }));
    await screen.findByText(/Local save failed/);
    expect(screen.getByRole('textbox').textContent).toContain('kept');
  });

  it('autosaves settled edits and does not mark a newer revision saved', async () => {
    let releaseSave: (() => void) | undefined;
    const repository: EditorDraftRepository = {
      load: async () => [],
      save: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            releaseSave = resolve;
          }),
      ),
    };
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={repository}
      />,
    );
    await screen.findByText('Starter source ready');
    vi.useFakeTimers();
    try {
      act(() => editActiveSource("const message = 'first revision';"));
      expect(screen.getByText('Unsaved local changes')).toBeDefined();
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Saving locally…')).toBeDefined();

      act(() => editActiveSource("const message = 'newer revision';"));
      await act(async () => {
        releaseSave?.();
        await Promise.resolve();
      });
      expect(screen.getByText('Unsaved local changes')).toBeDefined();
      expect(screen.getByRole('textbox').textContent).toContain(
        'newer revision',
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('confirms reset, supports cancel, and persists the starter source', async () => {
    const repository = new MemoryDraftRepository();
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={repository}
      />,
    );
    await screen.findByText('Starter source ready');
    editActiveSource("const message = 'changed';");
    const reset = screen.getByRole('button', { name: /Reset file/ });
    await user.click(reset);
    expect(
      screen.getByRole('dialog', { name: 'Reset main.js?' }),
    ).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Keep edits' }));
    expect(screen.getByRole('textbox').textContent).toContain('changed');
    await waitFor(() => expect(document.activeElement).toBe(reset));

    await user.click(reset);
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Reset file',
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox').textContent).toContain('start'),
    );
    await waitFor(() => expect(repository.save).toHaveBeenCalled());
    expect(repository.save.mock.calls.at(-1)?.[1]).toContainEqual({
      fileId: 'main',
      source: "const message = 'start';",
    });
  });

  it('scopes save and reset shortcuts to focused workspace content', async () => {
    const repository = new MemoryDraftRepository();
    render(
      <>
        <button type="button">Outside</button>
        <EditorWorkspace
          ownerId="owner-a"
          workspaceId="workspace-a"
          files={files}
          draftRepository={repository}
        />
      </>,
    );
    await screen.findByText('Starter source ready');
    const outside = screen.getByRole('button', { name: 'Outside' });
    const outsideEvent = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    outside.dispatchEvent(outsideEvent);
    expect(outsideEvent.defaultPrevented).toBe(false);
    expect(repository.save).not.toHaveBeenCalled();

    const textbox = screen.getByRole('textbox');
    textbox.focus();
    fireEvent.keyDown(textbox, { key: 's', ctrlKey: true });
    await waitFor(() => expect(repository.save).toHaveBeenCalledTimes(1));
    editActiveSource("const message = 'shortcut reset';");
    fireEvent.keyDown(textbox, {
      key: 'Backspace',
      ctrlKey: true,
      shiftKey: true,
    });
    expect(
      screen.getByRole('dialog', { name: 'Reset main.js?' }),
    ).toBeDefined();
    expect(
      screen.queryByRole('button', { name: /Run|Check|Submit/ }),
    ).toBeNull();
  });

  it('reconciles a newer parent snapshot for the same stable file', async () => {
    const repository = new MemoryDraftRepository();
    const mainFile = files[0];
    const helperFile = files[1];
    if (mainFile === undefined || helperFile === undefined) {
      throw new Error('Workspace fixtures are incomplete');
    }
    const { rerender } = render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={repository}
      />,
    );
    await screen.findByText('Starter source ready');
    rerender(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={[
          { ...mainFile, starterSource: "const message = 'new snapshot';" },
          helperFile,
        ]}
        draftRepository={repository}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox').textContent).toContain('new snapshot'),
    );
  });

  it('renders an explicit empty state without loading or saving', () => {
    const repository = new MemoryDraftRepository();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={[]}
        draftRepository={repository}
      />,
    );
    expect(screen.getByText('No editable files are available.')).toBeDefined();
    expect(repository.save).not.toHaveBeenCalled();
  });
});
