'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  createCodequestApi,
  type PublicApiResult,
  type QuestDetail,
} from '@/lib/api-client';
import { getConfiguredApiBaseUrl } from '@/lib/api-base';
import { LessonDocument } from './lesson-document';
import { LessonHints } from './lesson-hints';

export interface LessonApi {
  getQuest(
    slug: string,
    signal?: AbortSignal,
  ): Promise<PublicApiResult<QuestDetail>>;
}

export interface LessonPageClientProps {
  readonly slug: string;
  readonly api?: LessonApi;
  readonly apiBaseUrl?: string;
}

class LessonLoadError extends Error {
  constructor(readonly kind: 'not-found' | 'invalid-response' | 'unavailable') {
    super(kind);
  }
}

async function loadLesson(
  api: LessonApi,
  slug: string,
  signal: AbortSignal,
): Promise<QuestDetail> {
  const result = await api.getQuest(slug, signal);
  if (result.ok) return result.data;
  if (result.kind === 'cancelled')
    throw new DOMException('Cancelled', 'AbortError');
  if (result.kind === 'http' && result.status === 404)
    throw new LessonLoadError('not-found');
  throw new LessonLoadError(
    result.kind === 'invalid-response' ? 'invalid-response' : 'unavailable',
  );
}

function difficultyLabel(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function LessonPageView({
  quest,
  apiBaseUrl,
}: {
  readonly quest: QuestDetail;
  readonly apiBaseUrl: string;
}): React.JSX.Element {
  const journeyHref = `/journeys/${encodeURIComponent(quest.hierarchy.journey.slug)}`;
  return (
    <main className="min-h-screen overflow-x-hidden bg-canvas text-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" aria-label="CodeQuest home" className="rounded-sm">
          <CodeQuestLogo />
        </Link>
        <Badge variant="outline">Lesson</Badge>
      </header>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <article className="min-w-0">
          <nav
            aria-label="Lesson breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link
              href={journeyHref}
              className="rounded-sm font-bold text-discovery underline underline-offset-4"
            >
              {quest.hierarchy.journey.title}
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href={`${journeyHref}#chapter-${encodeURIComponent(quest.hierarchy.chapter.slug)}`}
              className="rounded-sm underline underline-offset-4"
            >
              {quest.hierarchy.chapter.title}
            </Link>
          </nav>
          <header className="pixel-corners pixel-frame mt-6 bg-surface-raised p-6 sm:p-8">
            <p className="game-label text-xs text-ascent">
              Published quest · {quest.id}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight font-bold sm:text-5xl">
              {quest.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              {quest.objective}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="outline">
                {difficultyLabel(quest.difficulty)}
              </Badge>
              <Badge variant="reward">{quest.xpAward} XP</Badge>
              {quest.guestEligible && (
                <Badge variant="ascent">Guest quest</Badge>
              )}
              <Badge variant="neutral">Version {quest.contentVersion}</Badge>
            </div>
          </header>
          <section
            aria-label="Lesson content"
            className="mt-8 max-w-[72ch] rounded-lg border border-line bg-surface-raised px-5 py-7 shadow-soft sm:px-8 sm:py-9"
          >
            <LessonDocument
              markdown={quest.lesson}
              questSlug={quest.slug}
              contentVersion={quest.contentVersion}
              apiBaseUrl={apiBaseUrl}
            />
          </section>
          <div className="mt-8 max-w-[72ch]">
            <LessonHints value={quest.hints} />
          </div>
        </article>
        <aside className="rounded-lg border border-line bg-surface-raised p-5 lg:sticky lg:top-6">
          <p className="game-label text-xs text-discovery">Quest briefing</p>
          <h2 className="mt-2 font-display text-xl font-bold">Concepts</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
            {quest.concepts.map((concept) => (
              <li key={concept.id}>
                <span className="font-mono text-discovery">{concept.id}</span> ·{' '}
                {concept.title}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-line pt-5 text-sm leading-6 text-muted">
            This page is for reading. Editing, running, checking, and submitting
            arrive in later work.
          </p>
        </aside>
      </div>
    </main>
  );
}

function LessonLoading(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink">
      <div className="mx-auto max-w-5xl" aria-busy="true">
        <CodeQuestLogo />
        <div
          role="status"
          aria-label="Loading lesson"
          className="mt-12 space-y-5"
        >
          <Skeleton className="h-12 max-w-2xl" />
          <Skeleton className="h-80" />
        </div>
      </div>
    </main>
  );
}

function LessonFailure({
  error,
  retry,
}: {
  readonly error: unknown;
  readonly retry: () => void;
}): React.JSX.Element {
  const kind = error instanceof LessonLoadError ? error.kind : 'unavailable';
  const notFound = kind === 'not-found';
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12 text-ink">
      <section className="pixel-corners pixel-frame w-full max-w-xl bg-surface-raised p-7">
        <CodeQuestLogo />
        <p className="game-label mt-10 text-xs text-danger">
          {notFound ? 'Lesson not found' : 'Lesson signal interrupted'}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          {notFound ? 'Lesson not found' : 'Lesson unavailable'}
        </h1>
        <p className="mt-4 leading-7 text-muted">
          {notFound
            ? 'This lesson is not available. Check the address or return to a Journey.'
            : kind === 'invalid-response'
              ? 'CodeQuest received lesson information it could not safely display.'
              : 'CodeQuest could not load this lesson. Try again.'}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {!notFound && <Button onClick={retry}>Retry lesson</Button>}
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-4 font-bold"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}

export function LessonPageClient({
  slug,
  api,
  apiBaseUrl = getConfiguredApiBaseUrl(),
}: LessonPageClientProps): React.JSX.Element {
  const curriculumApi = useMemo(() => api ?? createCodequestApi(), [api]);
  const query = useQuery({
    queryKey: ['curriculum', 'lesson', slug],
    queryFn: ({ signal }) => loadLesson(curriculumApi, slug, signal),
  });
  if (query.isPending) return <LessonLoading />;
  if (query.isError)
    return (
      <LessonFailure error={query.error} retry={() => void query.refetch()} />
    );
  return <LessonPageView quest={query.data} apiBaseUrl={apiBaseUrl} />;
}
