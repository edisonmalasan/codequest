'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CodeEditor } from '@/components/editor/code-editor';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
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
  onSourcesChange?: (sources: Readonly<Record<string, string>>) => void;
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
        onSourcesChange?.(restored);
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
  }, [draftRepository, fileDefinitionKey, identity, onSourcesChange]);

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
    onSourcesChange?.(next);
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
    onSourcesChange?.(next);
    void persist(next, revision);
  };

  const onWorkspaceKeyDown = (event: React.KeyboardEvent): void => {
    if (!(event.ctrlKey || event.metaKey)) return;
    if (event.key.toLowerCase() === 's' && !event.shiftKey) {
      event.preventDefault();
      saveCurrent();
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
        aria-labelledby="editor-workspace-title"
        className="rounded-lg border border-line bg-surface-raised p-6 text-ink"
      >
        <h1
          id="editor-workspace-title"
          className="font-display text-2xl font-bold"
        >
          Editor Workspace
        </h1>
        <p className="mt-3 text-muted">No editable files are available.</p>
      </section>
    );
  }

  return (
    <section
      ref={workspaceRef}
      aria-labelledby="editor-workspace-title"
      onKeyDown={onWorkspaceKeyDown}
      className="min-w-0 overflow-hidden rounded-lg border border-line-strong bg-surface text-ink shadow-soft"
    >
      <div className="border-b border-line bg-surface-raised px-4 py-4 sm:px-5">
        <p className="game-label text-xs text-discovery">Local coding space</p>
        <h1
          id="editor-workspace-title"
          className="mt-1 font-display text-2xl font-bold"
        >
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
      />
      <div className="grid min-w-0 gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div id="editor-workspace-panel" role="tabpanel" className="min-w-0">
          <CodeEditor
            value={sources[activeFile.id] ?? activeFile.starterSource}
            language={activeFile.language}
            label={`${activeFile.name} code editor`}
            onChange={updateSource}
          />
          <div className="mt-4">
            <ConsolePanel lines={consoleLines} />
          </div>
        </div>
        <aside
          aria-label="Workspace information"
          className="grid content-start gap-4"
        >
          <RuntimeStatus state={runtimeState} />
          <TestResults results={testResults} />
          <div className="rounded-md border border-line bg-surface-raised p-4">
            <WorkspaceActions
              onSave={saveCurrent}
              onReset={requestReset}
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
