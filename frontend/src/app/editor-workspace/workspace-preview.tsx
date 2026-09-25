'use client';

import { useEffect, useState } from 'react';

import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import { EditorWorkspace, type WorkspaceFile } from '@/features/editor';
import {
  JavaScriptWorkerAdapter,
  resolveRunnerOrigin,
  type ExecutionAdapter,
} from '@/features/runtime';

const previewFiles: readonly WorkspaceFile[] = [
  {
    id: 'main',
    name: 'main.js',
    language: 'javascript',
    starterSource: `const quest = 'Map the signal';

function report(message) {
  return \`Quest: \${message}\`;
}

console.log(report(quest));`,
  },
  {
    id: 'helpers',
    name: 'helpers.js',
    language: 'javascript',
    starterSource: `export function normalizeSignal(value) {
  return value.trim().toLowerCase();
}`,
  },
];

export function WorkspacePreview(): React.JSX.Element {
  const [executionAdapter, setExecutionAdapter] = useState<ExecutionAdapter>();

  useEffect(() => {
    const applicationOrigin = window.location.origin;
    const runtimeOrigin = resolveRunnerOrigin(
      process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
      applicationOrigin,
    );
    if (runtimeOrigin === null) return;
    const adapter = new JavaScriptWorkerAdapter(runtimeOrigin);
    setExecutionAdapter(adapter);
    return () => {
      void adapter.dispose();
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-canvas px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <CodeQuestLogo />
            <p className="game-label mt-5 text-xs text-ascent">
              Internal review surface
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Reusable workspace preview
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted">
              Edit, preserve, and run local JavaScript. Checks, previews,
              submissions, and progress remain unavailable.
            </p>
          </div>
        </header>
        <EditorWorkspace
          ownerId="preview-guest"
          workspaceId="phase-13-editor-preview"
          files={previewFiles}
          executionAdapter={executionAdapter}
        />
      </div>
    </main>
  );
}
