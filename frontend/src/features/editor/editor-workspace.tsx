'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CodeEditor } from '@/components/editor/code-editor';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import type { ExecutionAdapter, ExecutionResult } from '@/features/runtime';
import {
  editorDraftRepository,
  type DraftSource,
  type EditorDraftRepository,
} from './draft-repository';
import { ConsolePanel } from './console-panel';
import { EditorToolbar } from './editor-toolbar';
import { FileTabs } from './file-tabs';
import { RuntimeStatus } from './runtime-status';
import { TestResults } from './test-results';
import type {
  ConsoleLine,
  RuntimeDisplayState,
  SaveStatus,
  WorkspaceFile,
  WorkspaceTestResult,
} from './editor-workspace-types';
import { WorkspaceActions } from './workspace-actions';

const AUTOSAVE_DELAY_MS = 600;

export interface EditorWorkspaceProps {
  ownerId: string;
  workspaceId: string;
  files: readonly WorkspaceFile[];
  draftRepository?: EditorDraftRepository;
  consoleLines?: readonly ConsoleLine[];
  testResults?: readonly WorkspaceTestResult[];
  runtimeState?: RuntimeDisplayState;
  executionAdapter?: ExecutionAdapter;
  onSourcesChange?: (sources: Readonly<Record<string, string>>) => void;
}

interface ExecutionPresentation {
  lines: readonly ConsoleLine[];
  state: RuntimeDisplayState;
  running: boolean;
}

const unavailableExecution: ExecutionPresentation = {
  lines: [],
  state: { kind: 'unavailable', label: 'Runtime unavailable' },
  running: false,
};

function presentExecution(result: ExecutionResult): ExecutionPresentation {
  const lines: ConsoleLine[] = result.output.map((text, index) => ({
    id: `${result.runId}-output-${index}`,
    kind: 'output',
    text,
  }));
  if (result.status === 'success' && result.value) {
    lines.push({
      id: `${result.runId}-value`,
      kind: 'info',
      text: `Return: ${result.value}`,
    });
  } else if (result.message) {
    lines.push({
      id: `${result.runId}-message`,
      kind: result.status === 'cancelled' ? 'info' : 'error',
      text: result.message,
    });
  }

  const seconds = (result.durationMs / 1_000).toFixed(2);
  if (result.status === 'success') {
    return {
      lines,
      running: false,
      state: { kind: 'ready', label: `Completed in ${seconds} seconds` },
    };
  }
  if (result.status === 'cancelled') {
    return {
      lines,
      running: false,
      state: { kind: 'idle', label: 'Execution cancelled' },
    };
  }
  return {
    lines,
    running: false,
    state: {
      kind: 'error',
      label: `${result.status.replaceAll('-', ' ')} after ${seconds} seconds`,
    },
  };
}

function starterSources(
  files: readonly WorkspaceFile[],
): Record<string, string> {
  return Object.fromEntries(files.map((file) => [file.id, file.starterSource]));
}

function sourceEntries(
  files: readonly WorkspaceFile[],
  sources: Readonly<Record<string, string>>,
): DraftSource[] {
  return files.map((file) => ({
    fileId: file.id,
    source: sources[file.id] ?? file.starterSource,
  }));
}

export function EditorWorkspace({
  ownerId,
  workspaceId,
  files,
  draftRepository = editorDraftRepository,
  consoleLines,
  testResults,
  runtimeState,
  executionAdapter,
  onSourcesChange,
}: EditorWorkspaceProps): React.JSX.Element {
  const fileDefinitionKey = JSON.stringify(
    files.map(({ id, name, language, starterSource }) => ({
      id,
      name,
      language,
      starterSource,
    })),
  );
  const [activeFileId, setActiveFileId] = useState(files[0]?.id ?? '');
  const [sources, setSources] = useState<Record<string, string>>(() =>
    starterSources(files),
  );
  const sourcesRef = useRef(sources);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    files.length > 0 ? 'loading' : 'ready',
  );
  const [hydrated, setHydrated] = useState(files.length === 0);
  const [resetOpen, setResetOpen] = useState(false);
  const revisionRef = useRef(0);
  const workspaceRef = useRef<HTMLElement | null>(null);
  const executionControllerRef = useRef<AbortController | null>(null);
  const executionTokenRef = useRef(0);
  const [execution, setExecution] =
    useState<ExecutionPresentation>(unavailableExecution);
  const onSourcesChangeRef = useRef(onSourcesChange);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const panelId = `${baseId}-panel`;

  onSourcesChangeRef.current = onSourcesChange;

  const identity = useMemo(
    () => ({ ownerId, workspaceId }),
    [ownerId, workspaceId],
  );
  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];

  useEffect(() => {
    let cancelled = false;
    const base = starterSources(files);
    sourcesRef.current = base;
    setSources(base);
    setActiveFileId((current) =>
      files.some((file) => file.id === current)
        ? current
        : (files[0]?.id ?? ''),
    );
    setResetOpen(false);
    revisionRef.current = 0;
    if (files.length === 0) {
      setHydrated(true);
      setSaveStatus('ready');
      return () => {
        cancelled = true;
      };
    }

    setHydrated(false);
    setSaveStatus('loading');
    void draftRepository
      .load(
        identity,
        files.map((file) => file.id),
      )
      .then((drafts) => {
        if (cancelled) return;
        const restored = { ...base };
        for (const draft of drafts) restored[draft.fileId] = draft.source;
        sourcesRef.current = restored;
        setSources(restored);
        onSourcesChangeRef.current?.(restored);
        setSaveStatus(drafts.length > 0 ? 'saved' : 'ready');
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSaveStatus('failed');
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [draftRepository, fileDefinitionKey, identity]);

  const persist = useCallback(
    async (
      snapshot: Readonly<Record<string, string>>,
      revision: number,
    ): Promise<void> => {
      if (files.length === 0) return;
      setSaveStatus('saving');
      try {
        await draftRepository.save(identity, sourceEntries(files, snapshot));
        setSaveStatus(revisionRef.current === revision ? 'saved' : 'unsaved');
      } catch {
        setSaveStatus('failed');
      }
    },
    [draftRepository, files, identity],
  );

  const saveCurrent = useCallback((): void => {
    void persist(sourcesRef.current, revisionRef.current);
  }, [persist]);

  useEffect(() => {
    return () => {
      executionTokenRef.current += 1;
      executionControllerRef.current?.abort();
      void executionAdapter?.cancel();
    };
  }, [executionAdapter]);

  const runCurrent = useCallback((): void => {
    if (executionAdapter === undefined || activeFile === undefined) return;
    executionControllerRef.current?.abort();
    const controller = new AbortController();
    executionControllerRef.current = controller;
    executionTokenRef.current += 1;
    const token = executionTokenRef.current;
    const source =
      sourcesRef.current[activeFile.id] ?? activeFile.starterSource;
    setExecution({
      lines: [],
      running: true,
      state: { kind: 'busy', label: `Running ${activeFile.name}` },
    });
    void executionAdapter.execute({ source, signal: controller.signal }).then(
      (result) => {
        if (executionTokenRef.current !== token) return;
        executionControllerRef.current = null;
        setExecution(presentExecution(result));
      },
      () => {
        if (executionTokenRef.current !== token) return;
        executionControllerRef.current = null;
        setExecution({
          lines: [
            {
              id: `internal-${token}`,
              kind: 'error',
              text: 'Isolated runtime unavailable',
            },
          ],
          running: false,
          state: { kind: 'error', label: 'Runtime unavailable' },
        });
      },
    );
  }, [activeFile, executionAdapter]);

  const cancelExecution = useCallback((): void => {
    executionControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!hydrated || saveStatus !== 'unsaved') return;
    const timeout = window.setTimeout(saveCurrent, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [hydrated, saveCurrent, saveStatus, sources]);

  const updateSource = (source: string): void => {
    if (activeFile === undefined) return;
    revisionRef.current += 1;
    const next = { ...sourcesRef.current, [activeFile.id]: source };
    sourcesRef.current = next;
    setSources(next);
    setSaveStatus('unsaved');
    onSourcesChangeRef.current?.(next);
  };

  const requestReset = (): void => {
    if (activeFile === undefined) return;
    if (sourcesRef.current[activeFile.id] === activeFile.starterSource) return;
    setResetOpen(true);
  };

  const confirmReset = (): void => {
    if (activeFile === undefined) return;
    revisionRef.current += 1;
    const revision = revisionRef.current;
    const next = {
      ...sourcesRef.current,
      [activeFile.id]: activeFile.starterSource,
    };
    sourcesRef.current = next;
    setSources(next);
    setResetOpen(false);
    onSourcesChangeRef.current?.(next);
    void persist(next, revision);
  };

  const onWorkspaceKeyDown = (event: React.KeyboardEvent): void => {
    if (!(event.ctrlKey || event.metaKey)) return;
    if (event.key.toLowerCase() === 's' && !event.shiftKey) {
      event.preventDefault();
      saveCurrent();
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey && executionAdapter) {
      event.preventDefault();
      runCurrent();
      return;
    }
    if (event.key === 'Backspace' && event.shiftKey) {
      event.preventDefault();
      requestReset();
    }
  };

  if (files.length === 0 || activeFile === undefined) {
    return (
      <section
        aria-labelledby={titleId}
        className="rounded-lg border border-line bg-surface-raised p-6 text-ink"
      >
        <h1 id={titleId} className="font-display text-2xl font-bold">
          Editor Workspace
        </h1>
        <p className="mt-3 text-muted">No editable files are available.</p>
      </section>
    );
  }

  return (
    <section
      ref={workspaceRef}
      aria-labelledby={titleId}
      onKeyDown={onWorkspaceKeyDown}
      className="min-w-0 overflow-hidden rounded-lg border border-line-strong bg-surface text-ink shadow-soft"
    >
      <div className="border-b border-line bg-surface-raised px-4 py-4 sm:px-5">
        <p className="game-label text-xs text-discovery">Local coding space</p>
        <h1 id={titleId} className="mt-1 font-display text-2xl font-bold">
          Editor Workspace
        </h1>
      </div>
      <EditorToolbar
        fileName={activeFile.name}
        language={activeFile.language}
        saveStatus={saveStatus}
      />
      <FileTabs
        files={files}
        activeFileId={activeFile.id}
        onSelect={setActiveFileId}
        panelId={panelId}
      />
      <div className="grid min-w-0 gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div id={panelId} role="tabpanel" className="min-w-0">
          <CodeEditor
            value={sources[activeFile.id] ?? activeFile.starterSource}
            language={activeFile.language}
            label={`${activeFile.name} code editor`}
            onChange={updateSource}
          />
          <div className="mt-4">
            <ConsolePanel
              lines={executionAdapter ? execution.lines : consoleLines}
            />
          </div>
        </div>
        <aside
          aria-label="Workspace information"
          className="grid content-start gap-4"
        >
          <RuntimeStatus
            state={executionAdapter ? execution.state : runtimeState}
          />
          <TestResults results={testResults} />
          <div className="rounded-md border border-line bg-surface-raised p-4">
            <WorkspaceActions
              onSave={saveCurrent}
              onReset={requestReset}
              onRun={executionAdapter ? runCurrent : undefined}
              onCancel={executionAdapter ? cancelExecution : undefined}
              running={execution.running}
              disabled={!hydrated || saveStatus === 'saving'}
            />
          </div>
          <p className="text-xs leading-5 text-muted">
            Drafts stay in this browser. They are not cloud backups and do not
            record progress.
          </p>
        </aside>
      </div>
      <Dialog
        open={resetOpen}
        title={`Reset ${activeFile.name}?`}
        description="Your local edits in this file will be replaced with its starter source."
        onClose={() => setResetOpen(false)}
      >
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setResetOpen(false)}
          >
            Keep edits
          </Button>
          <Button type="button" variant="danger" onClick={confirmReset}>
            Reset file
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
