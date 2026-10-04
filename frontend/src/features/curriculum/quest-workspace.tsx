'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  EditorWorkspace,
  type SaveStatus,
  type WorkspaceFile,
} from '@/features/editor';
import {
  IsolatedInteractiveWebAdapter,
  resolveInteractiveOrigins,
  type InteractiveWebAdapter,
} from '@/features/interactive';
import {
  resolvePreviewOrigin,
  StaticPreviewAdapter,
  type PreviewAdapter,
} from '@/features/preview';
import {
  captureFirstRun,
  captureGuestFirstStart,
  captureObserved,
  updateObservedOwner,
} from '@/features/analytics/observed-analytics';
import { getBrowserSupabaseClient } from '@/features/auth/supabase-browser';
import { getQueryClient } from '@/lib/query-client';
import {
  JavaScriptWorkerAdapter,
  resolveRunnerOrigin,
  type ExecutionAdapter,
} from '@/features/runtime';
import {
  JavaScriptValidationStrategy,
  InteractiveWebValidationStrategy,
  serializeWebSource,
  StaticWebValidationStrategy,
  type ValidationDefinition,
  type ValidationResult,
  type ValidationStrategy,
} from '@/features/validation';
import type { QuestDetail } from '@/lib/api-client';
import { readCapstoneResponses } from './capstone-responses';
import { progressReplay } from '@/features/progress-sync/progress-replay';
import {
  currentSyncOwner,
  ownerSyncApi,
  notifyOutbox,
  refreshAccountFacts,
} from '@/features/progress-sync/trusted-sync';
import {
  guestLearningRepository,
  isGuestQuestId,
  type GuestProgress,
} from './guest-learning';

type SubmissionState =
  | { status: 'idle' | 'submitting' | 'pending' }
  | { status: 'confirmed' }
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
    } else if (item.kind === 'html-element') {
      if (
        typeof item.selector !== 'string' ||
        typeof item.expectedText !== 'string'
      )
        return undefined;
      cases.push({
        id: item.id,
        label: item.id,
        feedback: item.feedback,
        mode: 'html-element',
        selector: item.selector,
        expectedText: item.expectedText,
      });
    } else if (item.kind === 'css-declaration') {
      if (
        typeof item.selector !== 'string' ||
        typeof item.property !== 'string' ||
        typeof item.expectedValue !== 'string'
      )
        return undefined;
      if (
        !['color', 'background-color', 'display', 'font-size'].includes(
          item.property,
        )
      )
        return undefined;
      cases.push({
        id: item.id,
        label: item.id,
        feedback: item.feedback,
        mode: 'css-declaration',
        selector: item.selector,
        property: item.property as
          'color' | 'background-color' | 'display' | 'font-size',
        expectedValue: item.expectedValue,
      });
    } else if (item.kind === 'interactive-text') {
      if (
        typeof item.selector !== 'string' ||
        typeof item.expectedText !== 'string' ||
        !Array.isArray(item.events) ||
        !item.events.every(
          (event) =>
            typeof event === 'object' &&
            event !== null &&
            ['click', 'input', 'change'].includes(String(event.type)) &&
            typeof event.targetId === 'string' &&
            (event.value === undefined || typeof event.value === 'string'),
        )
      )
        return undefined;
      const events = item.events.map((event) => ({
        type: event.type as 'click' | 'input' | 'change',
        targetId: event.targetId as string,
        ...(typeof event.value === 'string' ? { value: event.value } : {}),
      }));
      cases.push({
        id: item.id,
        label: item.id,
        feedback: item.feedback,
        mode: 'interactive-text',
        selector: item.selector,
        events,
        expectedText: item.expectedText,
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
  offline = false,
  activePanel,
  onSaveStatusChange,
}: {
  readonly quest: QuestDetail;
  readonly offline?: boolean;
  readonly activePanel?: 'lesson' | 'code' | 'results';
  readonly onSaveStatusChange?: (status: SaveStatus) => void;
}): React.JSX.Element | null {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [responsesReady, setResponsesReady] = useState(false);
  const [executionAdapter, setExecutionAdapter] = useState<ExecutionAdapter>();
  const [validationStrategy, setValidationStrategy] =
    useState<ValidationStrategy>();
  const [previewAdapter, setPreviewAdapter] = useState<PreviewAdapter>();
  const [interactiveAdapter, setInteractiveAdapter] =
    useState<InteractiveWebAdapter>();
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  });
  const [guestProgress, setGuestProgress] = useState<GuestProgress | null>(
    null,
  );
  const [guestStorageError, setGuestStorageError] = useState(false);
  const [guestSaving, setGuestSaving] = useState(false);
  const guestAllowed = quest.guestEligible && isGuestQuestId(quest.id);
  const pendingEventRef = useRef<{ key: string; id: string } | null>(null);
  const sessionGeneration = useRef(0);
  const definition = useMemo(() => questValidationDefinition(quest), [quest]);
  const responseFields = useMemo(
    () =>
      quest.kind === 'capstone'
        ? [
            {
              id: 'explanation',
              label: 'Debug explanation',
              prompt:
                quest.explanationPrompt ??
                'Explain your revealing test and correction.',
              maxLength: 2000,
            },
            {
              id: 'transfer',
              label: 'Transfer response',
              prompt:
                quest.transferPrompt ??
                'Explain your new requirement and test.',
              maxLength: 2000,
            },
          ]
        : [],
    [quest],
  );
  const files = useMemo<readonly WorkspaceFile[]>(
    () =>
      quest.exercise?.files ?? [
        {
          id: 'main',
          name: 'main.js',
          language: 'javascript',
          starterSource: quest.starterCode,
        },
      ],
    [quest.exercise, quest.starterCode],
  );
  const mode = quest.exercise?.mode ?? 'javascript';
  const captureSource = useMemo(
    () =>
      mode === 'javascript'
        ? undefined
        : (
            selectedFiles: readonly WorkspaceFile[],
            sources: Readonly<Record<string, string>>,
          ) =>
            serializeWebSource({
              schemaVersion: 1,
              questId: quest.id,
              contentVersion: quest.contentVersion,
              assessmentVersion: quest.assessmentVersion,
              mode,
              files: selectedFiles.map((file) => ({
                id: file.id,
                language: file.language,
                source: sources[file.id] ?? file.starterSource,
              })),
            }),
    [mode, quest.id, quest.contentVersion, quest.assessmentVersion],
  );

  useEffect(() => {
    const origin = resolveRunnerOrigin(
      process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
      window.location.origin,
    );
    const runner =
      mode === 'javascript' && origin
        ? new JavaScriptWorkerAdapter(origin)
        : undefined;
    const previewOrigin = resolvePreviewOrigin(
      process.env.NEXT_PUBLIC_PREVIEW_ORIGIN,
      window.location.origin,
      origin,
    );
    const preview =
      mode === 'static-web' && previewOrigin
        ? new StaticPreviewAdapter(previewOrigin)
        : undefined;
    const interactiveOrigins =
      mode === 'interactive-web'
        ? resolveInteractiveOrigins(
            window.location.origin,
            process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
            process.env.NEXT_PUBLIC_PREVIEW_ORIGIN,
          )
        : null;
    const interactive = interactiveOrigins
      ? new IsolatedInteractiveWebAdapter(
          interactiveOrigins.runnerOrigin,
          interactiveOrigins.previewOrigin,
        )
      : undefined;
    const checker =
      mode === 'static-web'
        ? new StaticWebValidationStrategy()
        : mode === 'interactive-web'
          ? interactiveOrigins
            ? new InteractiveWebValidationStrategy(
                interactiveOrigins.runnerOrigin,
                interactiveOrigins.previewOrigin,
              )
            : undefined
          : origin
            ? new JavaScriptValidationStrategy(origin)
            : undefined;
    setExecutionAdapter(runner);
    setPreviewAdapter(preview);
    setInteractiveAdapter(interactive);
    setValidationStrategy(checker);
    return () => {
      void runner?.dispose();
      void preview?.dispose();
      void interactive?.dispose();
      void checker?.dispose();
    };
  }, [mode]);

  useEffect(() => {
    if (!ready || ownerId !== null || !guestAllowed) return;
    let active = true;
    captureGuestFirstStart(quest.id, {
      quest_id: quest.id,
      content_version: quest.contentVersion,
      assessment_version: quest.assessmentVersion,
    });
    void guestLearningRepository.start(quest.id).then(
      (progress) => {
        if (active) {
          setGuestProgress(progress);
        }
      },
      () => {
        if (active) setGuestStorageError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [
    ready,
    ownerId,
    guestAllowed,
    quest.id,
    quest.contentVersion,
    quest.assessmentVersion,
  ]);

  async function recordGuestCheck(snapshot: {
    source: string;
    validation: ValidationResult;
  }): Promise<void> {
    if (
      ownerId !== null ||
      !guestAllowed ||
      snapshot.validation.status !== 'completed' ||
      !snapshot.validation.passed
    )
      return;
    setGuestSaving(true);
    try {
      const progress = await guestLearningRepository.pass(
        quest.id,
        quest.contentVersion,
        quest.assessmentVersion,
        snapshot.source,
        snapshot.validation,
      );
      setGuestProgress(progress);
      setGuestStorageError(false);
      void getQueryClient().invalidateQueries({
        queryKey: ['lesson-navigation-guest', quest.hierarchy.journey.slug],
      });
    } catch {
      setGuestStorageError(true);
    } finally {
      setGuestSaving(false);
    }
  }

  const analyticsProperties = {
    quest_id: quest.id,
    content_version: quest.contentVersion,
    assessment_version: quest.assessmentVersion,
  };

  useEffect(() => {
    let active = true;
    try {
      const auth = getBrowserSupabaseClient().auth;
      const initial = sessionGeneration.current;
      const update = (next: string | null) => {
        updateObservedOwner(next);
        sessionGeneration.current++;
        setOwnerId(next);
        setSubmission({ status: 'idle' });
        setResponsesReady(false);
        pendingEventRef.current = null;
        setReady(true);
      };
      void auth.getSession().then(
        ({ data, error }) => {
          if (!active || sessionGeneration.current !== initial) return;
          update(error === null ? (data.session?.user.id ?? null) : null);
        },
        () => {
          if (active) setReady(true);
        },
      );
      const { data: listener } = auth.onAuthStateChange((_event, session) => {
        if (active) update(session?.user.id ?? null);
      });
      return () => {
        active = false;
        sessionGeneration.current++;
        listener.subscription.unsubscribe();
      };
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
    responses?: Readonly<Record<string, string>>;
  }): Promise<void> {
    if (ownerId === null || submission.status === 'submitting') return;
    const responses =
      quest.kind === 'capstone'
        ? readCapstoneResponses(snapshot.responses)
        : null;
    if (quest.kind === 'capstone' && !responses) {
      setSubmission({
        status: 'error',
        message:
          'Add both written responses: nonblank text, at most 2000 characters and 4000 UTF-8 bytes each.',
      });
      return;
    }
    const report = {
      ...snapshot.validation,
      ...(responses ? { capstoneResponses: responses } : {}),
    };
    if (new TextEncoder().encode(JSON.stringify(report)).length > 16_384) {
      setSubmission({
        status: 'error',
        message:
          'The combined report and written responses exceed 16 KiB. Shorten your responses before submitting.',
      });
      return;
    }
    const key = `${snapshot.validation.checkId}:${snapshot.source}:${JSON.stringify(responses)}`;
    if (pendingEventRef.current?.key !== key)
      pendingEventRef.current = { key, id: crypto.randomUUID() };
    setSubmission({ status: 'submitting' });
    const token = sessionGeneration.current;
    const account = ownerId;
    const body = {
      clientEventId: pendingEventRef.current.id,
      contentVersion: quest.contentVersion,
      assessmentVersion: quest.assessmentVersion,
      source: snapshot.source,
      report,
    };
    try {
      if ((await currentSyncOwner()) !== account) {
        if (token === sessionGeneration.current)
          setSubmission({
            status: 'error',
            message:
              'Sign in to the same account before saving this submission.',
          });
        return;
      }
      await progressReplay.save(account, quest.id, body);
      if (token !== sessionGeneration.current) return;
      notifyOutbox(account);
      setSubmission({ status: 'pending' });
      if (!navigator.onLine) return;
      const summary = await progressReplay.replay(
        account,
        ownerSyncApi(account),
        currentSyncOwner,
      );
      if (token !== sessionGeneration.current) return;
      if (summary.confirmed) refreshAccountFacts(account);
      const row = (await progressReplay.repository.list(account)).find(
        (item) => item.eventId === body.clientEventId,
      );
      if (token !== sessionGeneration.current) return;
      if (row?.delivery?.status === 'blocked')
        setSubmission({ status: 'error', message: row.delivery.message });
      else if (row?.delivery?.status === 'confirmed')
        setSubmission({ status: 'confirmed' });
    } catch {
      if (token === sessionGeneration.current)
        setSubmission({
          status: 'error',
          message:
            'Submission storage or replay unavailable. Your source is editable; check saved submissions on your account before leaving.',
        });
    }
  }

  if (!ready) return null;
  if (ownerId === null && !guestAllowed)
    return (
      <p role="status" className="mx-auto max-w-6xl px-5 pb-16 text-sm">
        Guest practice is limited to published Q01–Q04 quests.{' '}
        <Link href="/login" className="underline">
          Sign in
        </Link>{' '}
        to work on this quest.
      </p>
    );
  if (!definition)
    return <p role="status">This quest has no supported local assessment.</p>;
  return (
    <section aria-label="Quest workspace" className="min-w-0">
      <h2 className="sr-only">Practice and submit</h2>
      <p className="mb-3 text-sm leading-6 text-muted">
        {offline
          ? 'Run and Check stay local and provisional. Signed-in Submit saves a snapshot on this device for delivery after reconnecting. Account completion and rewards require backend acceptance.'
          : ownerId === null
            ? 'Run and Check stay on this device. Passing Check is provisional until you explicitly import after signup. Clearing browser data can erase it.'
            : 'Run and Check stay local. Submit sends your source and check report to CodeQuest for a personal-learning decision.'}
      </p>
      <EditorWorkspace
        presentation={activePanel ? 'integrated' : 'standalone'}
        activePanel={activePanel}
        key={ownerId ?? 'guest'}
        ownerId={ownerId ?? 'guest'}
        workspaceId={
          mode === 'javascript'
            ? `${quest.id}-${quest.contentVersion}`
            : `${quest.id}-${quest.contentVersion}-${quest.assessmentVersion}-${mode}`
        }
        files={files}
        responseFields={responseFields}
        executionAdapter={executionAdapter}
        previewAdapter={previewAdapter}
        interactiveAdapter={interactiveAdapter}
        validationStrategy={validationStrategy}
        validationDefinition={definition}
        captureValidationSource={captureSource}
        onSaveStatusChange={onSaveStatusChange}
        submitting={submission.status === 'submitting'}
        onSubmit={
          ownerId && (quest.kind !== 'capstone' || responsesReady)
            ? (snapshot) => {
                void submit(snapshot);
              }
            : undefined
        }
        onCheckComplete={(snapshot) => {
          if (snapshot.validation.status === 'completed')
            captureObserved({
              name: 'validation_checked',
              ownerId,
              eventId: crypto.randomUUID(),
              properties: {
                ...analyticsProperties,
                outcome_category: snapshot.validation.passed
                  ? 'passed'
                  : 'failed',
              },
            });
          if (
            snapshot.validation.status === 'completed' &&
            !snapshot.validation.passed
          )
            captureObserved({
              name: 'validation_failed',
              ownerId,
              eventId: crypto.randomUUID(),
              properties: {
                ...analyticsProperties,
                outcome_category: 'failed',
              },
            });
          if (ownerId === null) void recordGuestCheck(snapshot);
        }}
        onRunComplete={(outcome) => {
          if (outcome.status === 'cancelled') return;
          captureObserved({
            name: 'code_run',
            ownerId,
            eventId: crypto.randomUUID(),
            properties: {
              ...analyticsProperties,
              outcome_category: outcome.status,
            },
          });
          captureFirstRun(ownerId, analyticsProperties);
          if (outcome.status !== 'success')
            captureObserved({
              name: 'execution_error',
              ownerId,
              eventId: crypto.randomUUID(),
              properties: {
                ...analyticsProperties,
                error_category: outcome.status,
              },
            });
        }}
        onSourcesChange={(sources) => {
          setSubmission({ status: 'idle' });
          setResponsesReady(
            readCapstoneResponses({
              explanation: sources['response:explanation'],
              transfer: sources['response:transfer'],
            }) !== null,
          );
        }}
      />
      {quest.kind === 'capstone' && (
        <p className="mt-4 text-sm">
          Submit requires both written responses and a current Check. Each
          response allows 2000 characters and 4000 UTF-8 bytes. Presence is
          required; Check does not grade reasoning quality. Backend acceptance
          is personal learning, not certification.
        </p>
      )}
      {ownerId === null && (
        <p className="mt-4 text-sm">
          {guestSaving &&
            'Saving this Check on your device. Wait before leaving. '}
          {guestProgress?.submission
            ? 'Provisional completion saved on this device. No account XP, streak, or unlock has been accepted. '
            : guestProgress
              ? 'Guest activity saved on this device. Passing Check is needed for provisional completion. '
              : 'Guest activity has not been saved on this device. '}
          <Link href="/register?next=%2Faccount" className="underline">
            Sign up
          </Link>{' '}
          and choose Import on your account to request acceptance.
        </p>
      )}
      {guestStorageError && (
        <p role="alert" className="mt-4 text-sm text-danger">
          Guest progress could not be saved on this device. Your current code
          remains editable; copy it before leaving if local storage is
          unavailable.
        </p>
      )}
      {submission.status === 'confirmed' && (
        <p role="status" className="mt-4 text-sm">
          Submission delivery confirmed. Read your account progress for the
          backend acceptance decision. Checks are client-reported, not
          independently graded.
        </p>
      )}
      {submission.status === 'error' && (
        <p role="alert" className="mt-4 text-sm">
          {submission.message}
        </p>
      )}
      {submission.status === 'pending' && (
        <p role="status" className="mt-4 text-sm">
          Submission saved on this device; delivery is pending or uncertain. No
          completion is claimed. Reconnect or retry from saved submissions in
          downloaded lessons or your account.
        </p>
      )}
    </section>
  );
}
