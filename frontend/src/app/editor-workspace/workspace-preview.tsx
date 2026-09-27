'use client';

import { useEffect, useState } from 'react';

import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import { EditorWorkspace, type WorkspaceFile } from '@/features/editor';
import {
  resolvePreviewOrigin,
  StaticPreviewAdapter,
  type PreviewAdapter,
} from '@/features/preview';
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
    id: 'page',
    name: 'index.html',
    language: 'html',
    starterSource: `<main class="preview-page">
  <h1>Build a tiny web page</h1>
  <p>HTML and CSS render in an isolated static preview.</p>
</main>`,
  },
  {
    id: 'styles',
    name: 'styles.css',
    language: 'css',
    starterSource: `.preview-page { font-family: system-ui; padding: 2rem; color: #172b46; }
h1 { color: #2357a5; }`,
  },
];

export function WorkspacePreview(): React.JSX.Element {
  const [executionAdapter, setExecutionAdapter] = useState<ExecutionAdapter>();
  const [previewAdapter, setPreviewAdapter] = useState<PreviewAdapter>();

  useEffect(() => {
    const applicationOrigin = window.location.origin;
    const runtimeOrigin = resolveRunnerOrigin(
      process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
      applicationOrigin,
    );
    const adapter = runtimeOrigin
      ? new JavaScriptWorkerAdapter(runtimeOrigin)
      : undefined;
    setExecutionAdapter(adapter);
    const previewOrigin = resolvePreviewOrigin(
      process.env.NEXT_PUBLIC_PREVIEW_ORIGIN,
      applicationOrigin,
      runtimeOrigin,
    );
    if (previewOrigin) {
      const preview = new StaticPreviewAdapter(
        previewOrigin,
        runtimeOrigin ? new JavaScriptWorkerAdapter(runtimeOrigin) : undefined,
      );
      setPreviewAdapter(preview);
    }
    return () => {
      void adapter?.dispose();
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
              Edit local HTML, CSS, and JavaScript. Preview shows static markup;
              JavaScript runs separately and prints text below it.
            </p>
          </div>
        </header>
        <EditorWorkspace
          ownerId="preview-guest"
          workspaceId="phase-13-editor-preview"
          files={previewFiles}
          executionAdapter={executionAdapter}
          previewAdapter={previewAdapter}
        />
      </div>
    </main>
  );
}
