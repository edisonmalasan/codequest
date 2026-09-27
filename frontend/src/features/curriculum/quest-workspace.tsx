'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EditorWorkspace } from '@/features/editor';
import { getBrowserSupabaseClient } from '@/features/auth/supabase-browser';
import {
  JavaScriptWorkerAdapter,
  resolveRunnerOrigin,
  type ExecutionAdapter,
} from '@/features/runtime';
import {
  JavaScriptValidationStrategy,
  type ValidationDefinition,
  type ValidationResult,
  type ValidationStrategy,
} from '@/features/validation';
import { createCodequestApi, type QuestDetail } from '@/lib/api-client';

type SubmissionState =
  | { status: 'idle' | 'submitting' }
  | { status: 'accepted' | 'recorded'; attemptCount: number }
  | { status: 'error'; message: string };

export function questValidationDefinition(
  quest: Pick<QuestDetail, 'cases'>,
): ValidationDefinition | undefined {
  const cases: ValidationDefinition['cases'][number][] = [];
  for (const item of quest.cases) {
    if (item.kind === 'console') {
      if (typeof item.expectedOutput !== 'string') return undefined;
      cases.push({
        id: item.id,
        label: item.id,
        feedback: item.feedback,
        mode: 'output-match',
        expectedLines: item.expectedOutput.split('\n'),
      });
    } else {
      if (
        typeof item.functionName !== 'string' ||
        !Array.isArray(item.args) ||
        item.expected === undefined
      )
        return undefined;
      cases.push({
        id: item.id,
        label: item.id,
        feedback: item.feedback,
        mode: 'function-test',
        functionName: item.functionName,
        args: item.args,
        expected: item.expected,
      });
    }
  }
  return cases.length > 0 && cases.length <= 10 ? { cases } : undefined;
}

export function QuestWorkspace({
  quest,
}: {
  readonly quest: QuestDetail;
}): React.JSX.Element | null {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [executionAdapter, setExecutionAdapter] = useState<ExecutionAdapter>();
  const [validationStrategy, setValidationStrategy] =
    useState<ValidationStrategy>();
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  });
  const pendingEventRef = useRef<{ key: string; id: string } | null>(null);
  const definition = useMemo(() => questValidationDefinition(quest), [quest]);
  const file = useMemo(
    () => [
      {
        id: 'main',
        name: 'main.js',
        language: 'javascript' as const,
        starterSource: quest.starterCode,
      },
    ],
    [quest.starterCode],
  );

  useEffect(() => {
    const origin = resolveRunnerOrigin(
      process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
      window.location.origin,
    );
    const runner = origin ? new JavaScriptWorkerAdapter(origin) : undefined;
    const checker = origin
      ? new JavaScriptValidationStrategy(origin)
      : undefined;
    setExecutionAdapter(runner);
    setValidationStrategy(checker);
    return () => {
      void runner?.dispose();
      void checker?.dispose();
    };
  }, []);

  useEffect(() => {
    let active = true;
    try {
      void getBrowserSupabaseClient()
        .auth.getSession()
        .then(
          ({ data, error }) => {
            if (!active) return;
            setOwnerId(error === null ? (data.session?.user.id ?? null) : null);
            setReady(true);
          },
          () => {
            if (active) setReady(true);
          },
        );
    } catch {
      queueMicrotask(() => {
        if (active) setReady(true);
      });
    }
    return () => {
      active = false;
    };
  }, []);

  async function submit(snapshot: {
    source: string;
    validation: ValidationResult;
  }): Promise<void> {
    if (ownerId === null || submission.status === 'submitting') return;
    const key = `${snapshot.validation.checkId}:${snapshot.source}`;
    if (pendingEventRef.current?.key !== key)
      pendingEventRef.current = { key, id: crypto.randomUUID() };
    setSubmission({ status: 'submitting' });
    const api = createCodequestApi({
      getAccessToken: async () => {
        const { data, error } =
          await getBrowserSupabaseClient().auth.getSession();
        return error === null ? (data.session?.access_token ?? null) : null;
      },
    });
    const result = await api.submitAttempt(quest.slug, {
      clientEventId: pendingEventRef.current.id,
      contentVersion: quest.contentVersion,
      assessmentVersion: quest.assessmentVersion,
      source: snapshot.source,
      report: { ...snapshot.validation },
    });
    if (result.ok) {
      setSubmission({
        status: result.data.accepted ? 'accepted' : 'recorded',
        attemptCount: result.data.attemptCount,
      });
    } else {
      setSubmission({
        status: 'error',
        message:
          result.kind === 'http'
            ? result.error.message
            : 'Submission unavailable. Your local code is preserved.',
      });
    }
  }

  if (!ready) return null;
  if (!definition)
    return <p role="status">This quest has no supported local assessment.</p>;
  return (
    <section
      aria-label="Quest workspace"
      className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8"
    >
      <h2 className="mb-4 font-display text-2xl font-bold">
        Practice and submit
      </h2>
      <p className="mb-5 text-sm text-muted">
        Run and Check stay local. Submit sends your source and check report to
        CodeQuest for a personal-learning decision.
      </p>
      <EditorWorkspace
        ownerId={ownerId ?? 'guest'}
        workspaceId={`${quest.id}-${quest.contentVersion}`}
        files={file}
        executionAdapter={executionAdapter}
        validationStrategy={validationStrategy}
        validationDefinition={definition}
        submitting={submission.status === 'submitting'}
        onSubmit={
          ownerId
            ? (snapshot) => {
                void submit(snapshot);
              }
            : undefined
        }
        onSourcesChange={() => setSubmission({ status: 'idle' })}
      />
      {ownerId === null && (
        <p className="mt-4 text-sm">
          <Link href="/login" className="underline">
            Sign in
          </Link>{' '}
          to submit an attempt.
        </p>
      )}
      {submission.status === 'accepted' && (
        <p role="status" className="mt-4 text-sm">
          Personal-learning completion accepted from your reported check.
          Attempt {submission.attemptCount}. This is not independently graded.
        </p>
      )}
      {submission.status === 'recorded' && (
        <p role="status" className="mt-4 text-sm">
          Attempt {submission.attemptCount} recorded. No new completion was
          accepted.
        </p>
      )}
      {submission.status === 'error' && (
        <p role="alert" className="mt-4 text-sm">
          {submission.message}
        </p>
      )}
    </section>
  );
}
