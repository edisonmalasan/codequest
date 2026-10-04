'use client';

import { useEffect, useState } from 'react';
import {
  IsolatedInteractiveWebAdapter,
  resolveInteractiveOrigins,
  type InteractiveWebAdapter,
} from '@/features/interactive';

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
import {
  InteractiveWebValidationStrategy,
  JavaScriptValidationStrategy,
  serializeWebSource,
  StaticWebValidationStrategy,
  type ValidationDefinition,
  type ValidationStrategy,
} from '@/features/validation';

const staticFiles: readonly WorkspaceFile[] = [
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
const interactiveFiles: readonly WorkspaceFile[] = [
  {
    id: 'page',
    name: 'index.html',
    language: 'html',
    starterSource:
      '<button id="trigger">Press</button><p id="answer">Ready</p>',
  },
  {
    id: 'logic',
    name: 'main.js',
    language: 'javascript',
    starterSource:
      'document.getElementById("trigger").addEventListener("click", () => { document.getElementById("answer").textContent = "Done"; });',
  },
];
const staticDefinition: ValidationDefinition = {
  cases: [
    {
      id: 'heading',
      label: 'Heading',
      feedback: 'Add the greeting',
      mode: 'html-element',
      selector: '#answer',
      expectedText: 'Hello',
    },
    {
      id: 'color',
      label: 'Color',
      feedback: 'Use blue',
      mode: 'css-declaration',
      selector: 'h1',
      property: 'color',
      expectedValue: 'blue',
    },
  ],
};
const interactiveDefinition: ValidationDefinition = {
  cases: [
    {
      id: 'clicked',
      label: 'Click response',
      feedback: 'Update the answer after click',
      mode: 'interactive-text',
      selector: '#answer',
      events: [{ type: 'click', targetId: 'trigger' }],
      expectedText: 'Done',
    },
  ],
};

const checkExamples: Record<
  string,
  { source: string; definition: ValidationDefinition }
> = {
  'output-match': {
    source: "console.log('Quest: Map the signal');",
    definition: {
      cases: [
        {
          id: 'printed-message',
          label: 'Printed message',
          feedback: 'Print the target line exactly.',
          mode: 'output-match',
          expectedLines: ['Quest: Map the signal'],
        },
      ],
    },
  },
  'value-test': {
    source: "return { message: 'ready', count: 2 };",
    definition: {
      cases: [
        {
          id: 'returned-value',
          label: 'Returned value',
          feedback: 'Return the expected object.',
          mode: 'value-test',
          expected: { message: 'ready', count: 2 },
        },
      ],
    },
  },
  'function-test': {
    source: 'function double(value) { return value * 2; }',
    definition: {
      cases: [
        {
          id: 'normal-input',
          label: 'Normal input',
          feedback: 'Double a positive number.',
          mode: 'function-test',
          functionName: 'double',
          args: [3],
          expected: 6,
        },
        {
          id: 'boundary-zero',
          label: 'Boundary zero',
          feedback: 'Zero should stay zero.',
          mode: 'function-test',
          functionName: 'double',
          args: [0],
          expected: 0,
        },
      ],
    },
  },
  'custom-test': {
    source: 'return 5;',
    definition: {
      cases: [
        {
          id: 'numeric-range',
          label: 'Numeric range',
          feedback: 'Return a number from 1 through 10.',
          mode: 'custom-test',
          predicate: { kind: 'number-range', min: 1, max: 10 },
        },
      ],
    },
  },
};

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
  const [interactiveAdapter, setInteractiveAdapter] =
    useState<InteractiveWebAdapter>();
  const [validationStrategy, setValidationStrategy] =
    useState<ValidationStrategy>();
  const [checkMode, setCheckMode] = useState('output-match');

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
    const checker =
      checkMode === 'static-web'
        ? new StaticWebValidationStrategy()
        : checkMode === 'interactive-web'
          ? undefined
          : runtimeOrigin
            ? new JavaScriptValidationStrategy(runtimeOrigin)
            : undefined;
    const previewOrigin = resolvePreviewOrigin(
      process.env.NEXT_PUBLIC_PREVIEW_ORIGIN,
      applicationOrigin,
      runtimeOrigin,
    );
    const preview = previewOrigin
      ? new StaticPreviewAdapter(
          previewOrigin,
          runtimeOrigin
            ? new JavaScriptWorkerAdapter(runtimeOrigin)
            : undefined,
        )
      : undefined;
    setPreviewAdapter(preview);
    const interactiveOrigins = resolveInteractiveOrigins(
      applicationOrigin,
      process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
      process.env.NEXT_PUBLIC_PREVIEW_ORIGIN,
    );
    const selectedChecker =
      checkMode === 'interactive-web' && interactiveOrigins
        ? new InteractiveWebValidationStrategy(
            interactiveOrigins.runnerOrigin,
            interactiveOrigins.previewOrigin,
          )
        : checker;
    setValidationStrategy(selectedChecker);
    const interactive = interactiveOrigins
      ? new IsolatedInteractiveWebAdapter(
          interactiveOrigins.runnerOrigin,
          interactiveOrigins.previewOrigin,
        )
      : undefined;
    setInteractiveAdapter(interactive);
    return () => {
      void adapter?.dispose();
      void preview?.dispose();
      void interactive?.dispose();
      void selectedChecker?.dispose();
    };
  }, [checkMode]);

  const example = checkExamples[checkMode] ?? checkExamples['output-match'];
  const files =
    checkMode === 'static-web'
      ? staticFiles
      : checkMode === 'interactive-web'
        ? interactiveFiles
        : [
            { ...previewFiles[0], starterSource: example.source },
            ...previewFiles.slice(1),
          ];
  const definition =
    checkMode === 'static-web'
      ? staticDefinition
      : checkMode === 'interactive-web'
        ? interactiveDefinition
        : example.definition;

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
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label htmlFor="check-mode" className="text-sm font-semibold">
            Local check example
          </label>
          <select
            id="check-mode"
            value={checkMode}
            onChange={(event) => setCheckMode(event.target.value)}
            className="rounded-md border border-line bg-surface px-3 py-2 text-ink"
          >
            {[
              ...Object.keys(checkExamples),
              'static-web',
              'interactive-web',
            ].map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
        <EditorWorkspace
          ownerId="preview-guest"
          workspaceId={`phase-16-${checkMode}`}
          files={files}
          executionAdapter={executionAdapter}
          previewAdapter={previewAdapter}
          interactiveAdapter={interactiveAdapter}
          validationStrategy={validationStrategy}
          validationDefinition={definition}
          captureValidationSource={
            checkMode === 'static-web' || checkMode === 'interactive-web'
              ? (supplied, sources) =>
                  serializeWebSource({
                    schemaVersion: 1,
                    questId: 'Q01',
                    contentVersion: '1.0.0',
                    assessmentVersion: '1.0.0',
                    mode: checkMode,
                    files: supplied.map((file) => ({
                      id: file.id,
                      language: file.language,
                      source: sources[file.id] ?? file.starterSource,
                    })),
                  })
              : undefined
          }
        />
      </div>
    </main>
  );
}
