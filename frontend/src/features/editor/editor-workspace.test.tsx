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
  ExecutionAdapter,
  ExecutionRequest,
  ExecutionResult,
  ExecutionStatus,
} from '@/features/runtime';
import type { PreviewAdapter, PreviewResult } from '@/features/preview';
import type {
  ValidationDefinition,
  ValidationResult,
  ValidationStrategy,
} from '@/features/validation';
import { parseWebSource, serializeWebSource } from '@/features/validation';
import type {
  DraftIdentity,
  DraftSource,
  EditorDraftRepository,
} from './draft-repository';
import type { WorkspacePreferenceRepository } from '@/lib/local-persistence';
import { EditorWorkspace } from './editor-workspace';
import { FileTabs } from './file-tabs';
import { ConsolePanel } from './console-panel';
import { RuntimeStatus } from './runtime-status';
import { TestResults } from './test-results';
import type { WorkspaceFile } from './editor-workspace-types';

vi.mock('./deferred-code-editor', async () => {
  const { CodeEditor } = await import('@/components/editor/code-editor');
  return { DeferredCodeEditor: CodeEditor };
});

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

class MemoryPreferenceRepository implements WorkspacePreferenceRepository {
  readonly load = vi.fn(async (ownerId: string): Promise<string | null> =>
    ownerId === 'owner-a' ? this.ownerAFileId : null,
  );
  readonly save = vi.fn(
    async (...args: Parameters<WorkspacePreferenceRepository['save']>) => {
      void args;
    },
  );
  constructor(private readonly ownerAFileId: string | null = null) {}
}

function executionResult(
  status: ExecutionStatus,
  overrides: Partial<ExecutionResult> = {},
): ExecutionResult {
  return {
    runId: 'run-1',
    status,
    output: [],
    value: '',
    message: '',
    durationMs: 25,
    ...overrides,
  };
}

class ControlledExecutionAdapter implements ExecutionAdapter {
  readonly execute = vi.fn((request: ExecutionRequest) => {
    return new Promise<ExecutionResult>((resolve) => {
      this.resolve = resolve;
      request.signal?.addEventListener(
        'abort',
        () =>
          resolve(
            executionResult('cancelled', { message: 'Execution cancelled' }),
          ),
        { once: true },
      );
    });
  });
  readonly cancel = vi.fn(async () => undefined);
  readonly dispose = vi.fn(async () => undefined);
  resolve: (result: ExecutionResult) => void = () => undefined;
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
      <FileTabs
        files={files}
        activeFileId="main"
        onSelect={onSelect}
        panelId="test-panel"
      />,
    );
    const main = screen.getByRole('tab', { name: 'main.js' });
    main.focus();
    await user.keyboard('{ArrowRight}');
    expect(onSelect).toHaveBeenLastCalledWith('helper');
    expect(main.getAttribute('aria-controls')).toBe('test-panel');

    rerender(
      <FileTabs
        files={files}
        activeFileId="helper"
        onSelect={onSelect}
        panelId="test-panel"
      />,
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
  it('keeps source and result state while integrated regions change', async () => {
    const repository = new MemoryDraftRepository();
    const { rerender } = render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="integrated-regions"
        files={files}
        draftRepository={repository}
        consoleLines={[
          { id: 'line-1', kind: 'output', text: 'Earlier output' },
        ]}
        presentation="integrated"
        activePanel="code"
      />,
    );
    await screen.findByText('Starter source ready');
    editActiveSource("console.log('kept');");
    rerender(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="integrated-regions"
        files={files}
        draftRepository={repository}
        consoleLines={[
          { id: 'line-1', kind: 'output', text: 'Earlier output' },
        ]}
        presentation="integrated"
        activePanel="results"
      />,
    );
    expect(screen.getByRole('textbox').textContent).toContain(
      "console.log('kept');",
    );
    expect(screen.getByText('Earlier output')).toBeDefined();
    expect(
      screen.getAllByRole('button', { name: 'Save locally' }),
    ).toHaveLength(1);
    expect(
      screen.getByRole('complementary', { name: 'Results region' }),
    ).toBeDefined();
  });
  it('shows no preview controls without an adapter and announces a preview timeout', async () => {
    const user = userEvent.setup();
    const webFiles: readonly WorkspaceFile[] = [
      {
        id: 'page',
        name: 'index.html',
        language: 'html',
        starterSource: '<p>Safe</p>',
      },
    ];
    const repository = new MemoryDraftRepository();
    const { rerender } = render(
      <EditorWorkspace
        ownerId="guest"
        workspaceId="optional-preview"
        files={webFiles}
        draftRepository={repository}
      />,
    );
    expect(screen.queryByRole('button', { name: /^Preview$/ })).toBeNull();
    const adapter: PreviewAdapter = {
      attach: vi.fn(),
      preview: vi.fn(async (): Promise<PreviewResult> => ({
        generationId: 'timeout-1',
        status: 'timeout',
        message: 'Preview timed out',
        filteredActiveContent: false,
      })),
      reload: vi.fn(async (): Promise<PreviewResult> => ({
        generationId: 'timeout-2',
        status: 'error',
        message: 'Preview returned an invalid result',
        filteredActiveContent: false,
      })),
      cancel: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    };
    rerender(
      <EditorWorkspace
        ownerId="guest"
        workspaceId="optional-preview"
        files={webFiles}
        draftRepository={repository}
        previewAdapter={adapter}
      />,
    );
    await user.click(await screen.findByRole('button', { name: /^Preview$/ }));
    await screen.findByText('Preview timed out');
    await user.click(screen.getByRole('button', { name: 'Reload preview' }));
    await screen.findByText('Preview returned an invalid result');
  });
  it('captures HTML/CSS/JavaScript sources for an optional preview and reloads the captured version', async () => {
    const user = userEvent.setup();
    const previewFiles: readonly WorkspaceFile[] = [
      {
        id: 'page',
        name: 'index.html',
        language: 'html',
        starterSource: '<h1>Start</h1>',
      },
      {
        id: 'style',
        name: 'styles.css',
        language: 'css',
        starterSource: 'h1 { color: blue }',
      },
      {
        id: 'logic',
        name: 'main.js',
        language: 'javascript',
        starterSource: "console.log('start')",
      },
    ];
    const ready: PreviewResult = {
      generationId: 'preview-1',
      status: 'ready',
      message: 'Static preview ready',
      filteredActiveContent: false,
    };
    const adapter: PreviewAdapter = {
      attach: vi.fn(),
      preview: vi.fn(async () => ready),
      reload: vi.fn(async () => ({ ...ready, generationId: 'preview-2' })),
      cancel: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    };
    const { unmount } = render(
      <EditorWorkspace
        ownerId="guest"
        workspaceId="static-preview"
        files={previewFiles}
        draftRepository={new MemoryDraftRepository()}
        previewAdapter={adapter}
      />,
    );
    await screen.findByRole('button', { name: /^Preview$/ });
    await waitFor(() => expect(adapter.attach).toHaveBeenCalled());
    editActiveSource('<h1>Edited</h1>');
    await user.click(screen.getByRole('button', { name: /^Preview$/ }));
    await waitFor(() => expect(adapter.preview).toHaveBeenCalled());
    const snapshot = vi.mocked(adapter.preview).mock.calls[0]?.[0];
    expect(snapshot).toEqual([
      { id: 'page', language: 'html', source: '<h1>Edited</h1>' },
      { id: 'style', language: 'css', source: 'h1 { color: blue }' },
      { id: 'logic', language: 'javascript', source: "console.log('start')" },
    ]);
    await screen.findByRole('button', { name: 'Reload preview' });
    expect(
      within(screen.getByRole('region', { name: 'Web preview' })).getByRole(
        'status',
      ).textContent,
    ).toContain('Static preview ready');
    await user.click(screen.getByRole('button', { name: 'Reload preview' }));
    await waitFor(() => expect(adapter.reload).toHaveBeenCalledOnce());
    unmount();
    expect(adapter.cancel).toHaveBeenCalled();
    expect(adapter.dispose).not.toHaveBeenCalled();
  });
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
    await waitFor(() =>
      expect(screen.getByRole('textbox').textContent).toContain('restored'),
    );
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

  it('retries a failed save without dropping the edited source', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('quota'))
      .mockResolvedValue(undefined);
    const repository: EditorDraftRepository = { load: async () => [], save };
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={repository}
        preferenceRepository={new MemoryPreferenceRepository()}
      />,
    );
    await screen.findByText('Starter source ready');
    editActiveSource("const message = 'recoverable';");
    await user.click(screen.getByRole('button', { name: /Save locally/ }));
    await screen.findByText(/Local save failed/);
    expect(screen.getByRole('textbox').textContent).toContain('recoverable');
    await user.click(screen.getByRole('button', { name: /Save locally/ }));
    await screen.findByText('Saved on this device');
    expect(save).toHaveBeenCalledTimes(2);
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

  it('coalesces explicit, hidden, and page-exit saves while preserving the newest edit', async () => {
    let releaseFirst: (() => void) | undefined;
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            releaseFirst = resolve;
          }),
      )
      .mockResolvedValue(undefined);
    const repository: EditorDraftRepository = { load: async () => [], save };
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={repository}
        preferenceRepository={new MemoryPreferenceRepository()}
      />,
    );
    await screen.findByText('Starter source ready');
    editActiveSource("const message = 'first';");
    await user.click(screen.getByRole('button', { name: /Save locally/ }));
    expect(save).toHaveBeenCalledTimes(1);
    editActiveSource("const message = 'latest';");
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    try {
      act(() => document.dispatchEvent(new Event('visibilitychange')));
      act(() => window.dispatchEvent(new Event('pagehide')));
      expect(save).toHaveBeenCalledTimes(1);
      const leaving = new Event('beforeunload', { cancelable: true });
      act(() => window.dispatchEvent(leaving));
      expect(leaving.defaultPrevented).toBe(true);
      await act(async () => {
        releaseFirst?.();
        await Promise.resolve();
      });
      await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
      expect(save.mock.calls[1]?.[1]).toContainEqual({
        fileId: 'main',
        source: "const message = 'latest';",
      });
      await screen.findByText('Saved on this device');
      act(() => window.dispatchEvent(new Event('pagehide')));
      expect(save).toHaveBeenCalledTimes(2);
      const cleanExit = new Event('beforeunload', { cancelable: true });
      act(() => window.dispatchEvent(cleanExit));
      expect(cleanExit.defaultPrevented).toBe(false);
    } finally {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'visible',
      });
    }
  });

  it('restores only the current owner file preference and saves later selection', async () => {
    const preferences = new MemoryPreferenceRepository('helper');
    const repository = new MemoryDraftRepository();
    const user = userEvent.setup();
    const { rerender } = render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={repository}
        preferenceRepository={preferences}
      />,
    );
    await waitFor(() =>
      expect(
        screen
          .getByRole('tab', { name: 'helper.js' })
          .getAttribute('aria-selected'),
      ).toBe('true'),
    );
    rerender(
      <EditorWorkspace
        ownerId="owner-b"
        workspaceId="workspace-a"
        files={files}
        draftRepository={repository}
        preferenceRepository={preferences}
      />,
    );
    await waitFor(() =>
      expect(
        screen
          .getByRole('tab', { name: 'main.js' })
          .getAttribute('aria-selected'),
      ).toBe('true'),
    );
    await user.click(screen.getByRole('tab', { name: 'helper.js' }));
    expect(preferences.save).toHaveBeenCalledWith(
      'owner-b',
      'workspace-a',
      'helper',
    );
  });

  it('falls back from a missing file preference and keeps source after preference storage fails', async () => {
    const preferences: WorkspacePreferenceRepository = {
      load: async () => 'removed-file',
      save: async () => {
        throw new Error('storage denied');
      },
    };
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={new MemoryDraftRepository()}
        preferenceRepository={preferences}
      />,
    );
    await screen.findByText('Starter source ready');
    expect(
      screen
        .getByRole('tab', { name: 'main.js' })
        .getAttribute('aria-selected'),
    ).toBe('true');
    editActiveSource("const message = 'kept';");
    await user.click(screen.getByRole('tab', { name: 'helper.js' }));
    await screen.findByText(
      'File selection could not be saved on this device.',
    );
    await user.click(screen.getByRole('tab', { name: 'main.js' }));
    expect(screen.getByRole('textbox').textContent).toContain('kept');
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

  it('runs an immutable source snapshot through the runtime presentation seams', async () => {
    const adapter = new ControlledExecutionAdapter();
    const onRunComplete = vi.fn();
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={new MemoryDraftRepository()}
        executionAdapter={adapter}
        onRunComplete={onRunComplete}
      />,
    );
    await screen.findByText('Starter source ready');
    editActiveSource("console.log('snapshot'); return 42;");
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(adapter.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "console.log('snapshot'); return 42;",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(screen.getByText('Running main.js')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDefined();

    act(() => {
      adapter.resolve(
        executionResult('success', {
          output: ['snapshot'],
          value: '42',
          durationMs: 50,
        }),
      );
    });
    await screen.findByText('snapshot');
    expect(screen.getByText('Return: 42')).toBeDefined();
    expect(screen.getByText('Completed in 0.05 seconds')).toBeDefined();
    expect(screen.getByRole('textbox').textContent).toContain('snapshot');
    expect(screen.getByText(/Checks are unavailable/)).toBeDefined();
    expect(onRunComplete).toHaveBeenCalledExactlyOnceWith({
      status: 'success',
    });
  });

  it('cancels execution without changing source and supports the scoped Run shortcut', async () => {
    const adapter = new ControlledExecutionAdapter();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={new MemoryDraftRepository()}
        executionAdapter={adapter}
      />,
    );
    await screen.findByText('Starter source ready');
    const textbox = screen.getByRole('textbox');
    fireEvent.keyDown(textbox, { key: 'Enter', ctrlKey: true });
    await screen.findByRole('button', { name: 'Cancel' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(await screen.findAllByText('Execution cancelled')).toHaveLength(2);
    expect(screen.getByRole('textbox').textContent).toContain('start');
    expect(screen.getByRole('button', { name: 'Run' })).toBeDefined();
  });

  it('keeps the run snapshot immutable and ignores a stale completion after a fresh run', async () => {
    const pending: Array<(result: ExecutionResult) => void> = [];
    const adapter: ExecutionAdapter = {
      execute: vi.fn(
        () =>
          new Promise<ExecutionResult>((resolve) => {
            pending.push(resolve);
          }),
      ),
      cancel: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    };
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={new MemoryDraftRepository()}
        executionAdapter={adapter}
      />,
    );
    await screen.findByText('Starter source ready');
    editActiveSource('return 1;');
    await user.click(screen.getByRole('button', { name: 'Run' }));
    editActiveSource('return 2;');
    fireEvent.keyDown(screen.getByRole('textbox'), {
      key: 'Enter',
      ctrlKey: true,
    });
    await waitFor(() => expect(adapter.execute).toHaveBeenCalledTimes(2));
    expect(adapter.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ source: 'return 1;' }),
    );
    expect(adapter.execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ source: expect.stringContaining('return 2;') }),
    );

    act(() => pending[0]?.(executionResult('success', { value: 'stale' })));
    expect(screen.queryByText('Return: stale')).toBeNull();
    expect(screen.getByText('Running main.js')).toBeDefined();
    act(() => pending[1]?.(executionResult('success', { value: 'fresh' })));
    expect(await screen.findByText('Return: fresh')).toBeDefined();
    expect(screen.getByRole('textbox').textContent).toContain('return 2;');
  });

  it.each([
    'syntax-error',
    'runtime-error',
    'timeout',
    'output-limit',
    'internal-error',
  ] as const)(
    'announces a %s result without implying a Check',
    async (status) => {
      const adapter: ExecutionAdapter = {
        execute: vi.fn(async () =>
          executionResult(status, { message: `${status} detail` }),
        ),
        cancel: vi.fn(async () => undefined),
        dispose: vi.fn(async () => undefined),
      };
      const user = userEvent.setup();
      render(
        <EditorWorkspace
          ownerId="owner-a"
          workspaceId="workspace-a"
          files={files}
          draftRepository={new MemoryDraftRepository()}
          executionAdapter={adapter}
        />,
      );
      await screen.findByText('Starter source ready');
      await user.click(screen.getByRole('button', { name: 'Run' }));
      expect(await screen.findByText(`${status} detail`)).toBeDefined();
      expect(
        document.querySelector('[data-runtime="error"]')?.textContent,
      ).toContain(status.replace('-', ' '));
      expect(screen.queryByRole('button', { name: /Check|Submit/ })).toBeNull();
    },
  );

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

  it('checks an immutable source snapshot and clears stale local results on edit', async () => {
    const onCheckComplete = vi.fn();
    const pending: Array<(value: ValidationResult) => void> = [];
    const strategy: ValidationStrategy = {
      validate: vi.fn(
        () => new Promise<ValidationResult>((resolve) => pending.push(resolve)),
      ),
      cancel: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    };
    const definition: ValidationDefinition = {
      cases: [
        {
          id: 'one',
          label: 'One',
          feedback: 'Try again',
          mode: 'output-match',
          expectedLines: ['ready'],
        },
      ],
    };
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="workspace-a"
        files={files}
        draftRepository={new MemoryDraftRepository()}
        validationStrategy={strategy}
        validationDefinition={definition}
        onCheckComplete={onCheckComplete}
      />,
    );
    await screen.findByText('Starter source ready');
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(strategy.validate).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "const message = 'start';",
        definition,
      }),
    );
    act(() => editActiveSource("console.log('ready');"));
    act(() =>
      pending[0]?.({
        checkId: 'stale',
        status: 'completed',
        passed: true,
        cases: [
          { id: 'one', label: 'One', status: 'passed', message: 'Passed' },
        ],
        failedCaseIds: [],
        feedback: '',
        durationMs: 10,
      }),
    );
    expect(screen.queryByText(/Local check passed/)).toBeNull();
    expect(onCheckComplete).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(strategy.validate).toHaveBeenLastCalledWith(
      expect.objectContaining({ source: "console.log('ready');" }),
    );
    act(() =>
      pending[1]?.({
        checkId: 'fresh',
        status: 'completed',
        passed: true,
        cases: [
          { id: 'one', label: 'One', status: 'passed', message: 'Passed' },
        ],
        failedCaseIds: [],
        feedback: '',
        durationMs: 12,
      }),
    );
    expect(await screen.findByText(/Local check passed/)).toBeDefined();
    expect(onCheckComplete).toHaveBeenCalledWith({
      source: "console.log('ready');",
      validation: expect.objectContaining({ checkId: 'fresh' }),
    });
    expect(screen.getByText(/unverified, no progress recorded/)).toBeDefined();
  });

  it('submits only the checked source through an optional parent action', async () => {
    const result: ValidationResult = {
      checkId: '00000000-0000-4000-8000-000000000001',
      status: 'completed',
      passed: true,
      cases: [{ id: 'one', label: 'One', status: 'passed', message: 'Passed' }],
      failedCaseIds: [],
      feedback: 'Passed',
      durationMs: 8,
    };
    const strategy: ValidationStrategy = {
      validate: vi.fn(async () => result),
      cancel: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    };
    const definition: ValidationDefinition = {
      cases: [
        {
          id: 'one',
          label: 'One',
          feedback: 'Try again',
          mode: 'output-match',
          expectedLines: ['ready'],
        },
      ],
    };
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="submission-test"
        files={files}
        draftRepository={new MemoryDraftRepository()}
        validationStrategy={strategy}
        validationDefinition={definition}
        onSubmit={onSubmit}
      />,
    );
    await screen.findByText('Starter source ready');
    expect(screen.queryByRole('button', { name: 'Submit attempt' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Check' }));
    await screen.findByText(/Local check passed/);
    await user.click(screen.getByRole('button', { name: 'Submit attempt' }));
    expect(onSubmit).toHaveBeenCalledWith({
      source: "const message = 'start';",
      validation: result,
    });
    act(() => editActiveSource('new source'));
    expect(screen.queryByRole('button', { name: 'Submit attempt' })).toBeNull();
  });

  it('checks and submits one exact multi-file snapshot, then invalidates it after a CSS edit', async () => {
    const webFiles: readonly WorkspaceFile[] = [
      {
        id: 'page',
        name: 'index.html',
        language: 'html',
        starterSource: '<h1 id="answer">Hello</h1>',
      },
      {
        id: 'style',
        name: 'style.css',
        language: 'css',
        starterSource: 'h1 { color: blue; }',
      },
    ];
    const definition: ValidationDefinition = {
      cases: [
        {
          id: 'heading',
          label: 'Heading',
          feedback: 'Add heading',
          mode: 'html-element',
          selector: '#answer',
          expectedText: 'Hello',
        },
      ],
    };
    const result: ValidationResult = {
      checkId: 'web-check',
      status: 'completed',
      passed: true,
      cases: [
        {
          id: 'heading',
          label: 'Heading',
          status: 'passed',
          message: 'Passed',
        },
      ],
      failedCaseIds: [],
      feedback: 'Passed',
      durationMs: 5,
    };
    const strategy: ValidationStrategy = {
      validate: vi.fn(async () => result),
      cancel: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    };
    const onSubmit = vi.fn();
    const capture = (
      selected: readonly WorkspaceFile[],
      sources: Readonly<Record<string, string>>,
    ) =>
      serializeWebSource({
        schemaVersion: 1,
        questId: 'Q01',
        contentVersion: '1.0.0',
        assessmentVersion: '1.0.0',
        mode: 'static-web',
        files: selected.map((file) => ({
          id: file.id,
          language: file.language,
          source: sources[file.id] ?? file.starterSource,
        })),
      });
    const user = userEvent.setup();
    render(
      <EditorWorkspace
        ownerId="owner-a"
        workspaceId="web-submission"
        files={webFiles}
        draftRepository={new MemoryDraftRepository()}
        validationStrategy={strategy}
        validationDefinition={definition}
        captureValidationSource={capture}
        onSubmit={onSubmit}
      />,
    );
    await screen.findByText('Starter source ready');
    await user.click(screen.getByRole('button', { name: 'Check' }));
    await screen.findByText(/Local check passed/);
    await user.click(screen.getByRole('button', { name: 'Submit attempt' }));
    const submitted: unknown = onSubmit.mock.calls[0]?.[0];
    if (
      typeof submitted !== 'object' ||
      submitted === null ||
      !('source' in submitted) ||
      typeof submitted.source !== 'string'
    )
      throw new Error('Missing web source');
    expect(
      parseWebSource(submitted.source)?.files.map((file) => file.id),
    ).toEqual(['page', 'style']);
    await user.click(screen.getByRole('tab', { name: 'style.css' }));
    act(() => editActiveSource('h1 { color: red; }'));
    expect(screen.queryByRole('button', { name: 'Submit attempt' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(
      vi.mocked(strategy.validate).mock.calls.at(-1)?.[0].source,
    ).toContain('h1 { color: red; }');
  });
});
