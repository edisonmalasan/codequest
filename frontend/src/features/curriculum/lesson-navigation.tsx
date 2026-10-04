'use client';

import Link from 'next/link';
import type { QuestStatus } from '@/components/game/quest-node';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBrowserSupabaseClient } from '@/features/auth/supabase-browser';
import {
  createCodequestApi,
  type JourneyProgress,
  type ProtectedApiResult,
  type QuestDetail,
} from '@/lib/api-client';
import { guestLearningRepository } from './guest-learning';
import {
  loadJourneyCurriculumGraph,
  type CurriculumApi,
} from './journey-course-loader';
import { buildJourneyCourseMap } from './journey-course-model';

interface NavigationEntry {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly status: QuestStatus;
  readonly unmet: readonly { readonly title: string }[];
}

export function LessonNavigation({
  quest,
  offline,
  safeToLeave,
  api,
  progressApi,
  guestProgressLoader,
}: {
  readonly quest: QuestDetail;
  readonly offline: boolean;
  readonly safeToLeave: boolean;
  readonly api?: CurriculumApi;
  readonly progressApi?: {
    getJourneyProgress(
      slug: string,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<JourneyProgress>>;
  };
  readonly guestProgressLoader?: typeof guestLearningRepository.list;
}): React.JSX.Element {
  const [owner, setOwner] = useState<{ ready: boolean; id: string | null }>({
    ready: false,
    id: null,
  });
  useEffect(() => {
    let active = true;
    try {
      const auth = getBrowserSupabaseClient().auth;
      void auth.getSession().then(
        ({ data, error }) => {
          if (active)
            setOwner({
              ready: true,
              id: error ? null : (data.session?.user.id ?? null),
            });
        },
        () => {
          if (active) setOwner({ ready: true, id: null });
        },
      );
      const { data } = auth.onAuthStateChange((_event, session) => {
        if (active) setOwner({ ready: true, id: session?.user.id ?? null });
      });
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch {
      queueMicrotask(() => {
        if (active) setOwner({ ready: true, id: null });
      });
      return () => {
        active = false;
      };
    }
  }, []);
  const publicApi = useMemo(() => api ?? createCodequestApi(), [api]);
  const protectedApi = useMemo(
    () =>
      createCodequestApi({
        getAccessToken: async () => {
          try {
            const { data, error } =
              await getBrowserSupabaseClient().auth.getSession();
            return !error && data.session?.user.id === owner.id
              ? data.session.access_token
              : null;
          } catch {
            return null;
          }
        },
      }),
    [owner.id],
  );
  const graph = useQuery({
    queryKey: ['lesson-navigation-graph', quest.hierarchy.journey.slug],
    enabled: !offline,
    queryFn: ({ signal }) =>
      loadJourneyCurriculumGraph(
        publicApi,
        quest.hierarchy.journey.slug,
        signal,
      ),
    retry: false,
  });
  const progress = useQuery({
    queryKey: [
      'progress',
      'lesson-navigation',
      owner.id,
      quest.hierarchy.journey.slug,
    ],
    enabled: !offline && owner.ready && owner.id !== null,
    queryFn: async ({ signal }) => {
      const response = await (progressApi ?? protectedApi).getJourneyProgress(
        quest.hierarchy.journey.slug,
        signal,
      );
      if (!response.ok) throw new Error('Saved availability unavailable');
      return response.data;
    },
    retry: false,
  });
  const guest = useQuery({
    queryKey: ['lesson-navigation-guest', quest.hierarchy.journey.slug],
    enabled: !offline && owner.ready && owner.id === null,
    queryFn: guestProgressLoader ?? (() => guestLearningRepository.list()),
    retry: false,
  });
  let entries: readonly NavigationEntry[] = [];
  let error = false;
  if (!offline && graph.isSuccess && owner.ready) {
    try {
      if (owner.id !== null && progress.isSuccess) {
        const mapped = buildJourneyCourseMap(graph.data, {
          authority: 'accepted',
          progress: progress.data,
        });
        entries = mapped.chapters.flatMap((chapter) =>
          chapter.quests.map(({ quest: item, status, unmetPrerequisites }) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            status,
            unmet: unmetPrerequisites,
          })),
        );
      } else if (owner.id === null && guest.isSuccess) {
        const published = new Map(
          graph.data.chapters.flatMap(({ quests }) =>
            quests.map((quest) => [quest.id, quest] as const),
          ),
        );
        const completedQuestIds = new Set(
          guest.data
            .filter((item) => {
              const quest = published.get(item.questId);
              return (
                item.submission &&
                quest &&
                item.contentVersion === quest.contentVersion &&
                item.assessmentVersion === quest.assessmentVersion
              );
            })
            .map((item) => item.questId),
        );
        const mapped = buildJourneyCourseMap(graph.data, {
          authority: 'provisional',
          completedQuestIds,
        });
        entries = mapped.chapters.flatMap((chapter) =>
          chapter.quests.map(({ quest: item, status, unmetPrerequisites }) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            status,
            unmet: unmetPrerequisites,
          })),
        );
      }
    } catch {
      error = true;
    }
  }
  const index = entries.findIndex((entry) => entry.id === quest.id);
  const previous = index > 0 ? entries[index - 1] : undefined;
  const next = index >= 0 ? entries[index + 1] : undefined;
  const unavailable =
    offline ||
    graph.isError ||
    progress.isError ||
    guest.isError ||
    error ||
    (graph.isSuccess &&
      owner.ready &&
      (owner.id === null ? guest.isSuccess : progress.isSuccess) &&
      index < 0);
  const mapHref = `/journeys/${encodeURIComponent(quest.hierarchy.journey.slug)}`;
  const renderStep = (entry: NavigationEntry | undefined, label: string) => {
    if (!entry) return <span className="text-muted">{label}: end of path</span>;
    if (entry.status === 'unavailable' || entry.status === 'not_started')
      return (
        <span className="text-muted">
          {label}: {entry.title} unavailable
        </span>
      );
    if (entry.status === 'locked')
      return (
        <span
          title={entry.unmet.map((item) => item.title).join(', ')}
          className="text-muted"
        >
          {label}: {entry.title} locked
          {entry.unmet.length
            ? ` — complete ${entry.unmet.map((item) => item.title).join(', ')}`
            : ''}
        </span>
      );
    if (!safeToLeave)
      return (
        <span className="text-muted">
          {label}: save your work before leaving
        </span>
      );
    return (
      <Link
        className="rounded-sm font-bold text-discovery underline underline-offset-4"
        href={`/quests/${encodeURIComponent(entry.slug)}`}
      >
        {label}: {entry.title}
      </Link>
    );
  };
  return (
    <nav
      aria-label="Exercise sequence"
      className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-5 text-sm sm:px-8"
    >
      {unavailable ? (
        <p role="status">
          Exercise sequence unavailable. Open the{' '}
          <Link className="underline" href={mapHref}>
            Journey map
          </Link>{' '}
          to continue.
        </p>
      ) : !owner.ready ||
        graph.isPending ||
        (owner.id !== null && progress.isPending) ||
        (owner.id === null && guest.isPending) ? (
        <p role="status">Loading exercise sequence…</p>
      ) : (
        <>
          {renderStep(previous, 'Back')}
          <span className="text-muted">
            Exercise {index + 1} of {entries.length}
            {owner.id === null ? ' · guest progress is provisional' : ''}
          </span>
          {renderStep(next, 'Next')}
        </>
      )}
    </nav>
  );
}
