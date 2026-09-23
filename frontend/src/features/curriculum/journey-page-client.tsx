'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import { ChapterCard } from '@/components/game/chapter-card';
import { QuestNode } from '@/components/game/quest-node';
import { QuestPath } from '@/components/game/quest-path';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { createCodequestApi } from '@/lib/api-client';
import {
  type CurriculumApi,
  JourneyLoadError,
  loadJourneyCurriculumGraph,
} from './journey-course-loader';
import {
  buildJourneyCourseMap,
  chapterStatusLabel,
  emptyCompletionSnapshot,
  type JourneyCourseMap,
} from './journey-course-model';

const WORLD_ART = '/assets/design-system/worlds/foundations-valley.webp';

export interface JourneyPageClientProps {
  readonly slug: string;
  readonly api?: CurriculumApi;
}

function journeyQueryKey(slug: string) {
  return ['curriculum', 'journey-course-map', slug] as const;
}

function focusChapter(slug: string): void {
  const chapter = document.getElementById(`chapter-${slug}`);
  chapter?.scrollIntoView?.({ block: 'start' });
  chapter?.focus({ preventScroll: true });
}

function difficultyLabel(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function JourneyPageView({
  model,
}: {
  readonly model: JourneyCourseMap;
}): React.JSX.Element {
  const { journey, chapters, completedQuests, totalQuests } = model;
  const progressNotice =
    model.completionAuthority === 'none'
      ? 'Saved progress is not loaded in this phase. The map currently shows published prerequisite availability.'
      : model.completionAuthority === 'provisional'
        ? 'This device progress is provisional until the backend accepts it.'
        : 'Completion shown here comes from accepted account progress.';

  return (
    <main className="min-h-screen overflow-x-hidden bg-canvas text-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link
          href="/"
          aria-label="CodeQuest home"
          className="rounded-sm outline-none"
        >
          <CodeQuestLogo />
        </Link>
        <Badge variant="ascent">Journey map</Badge>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 pb-16 sm:px-8">
        <section className="pixel-corners pixel-frame relative isolate overflow-hidden p-6 sm:p-10">
          <Image
            src={WORLD_ART}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1152px"
            className="pixel-art -z-20 object-cover opacity-35"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-surface-sunken via-surface/95 to-surface/65"
          />
          <p className="game-label text-xs text-ascent">Primary journey</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight font-bold tracking-wide text-ink sm:text-6xl">
            {journey.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Explore {journey.title} through {journey.questCount} quests across{' '}
            {journey.chapterCount} chapters.
          </p>
          <div className="mt-7 max-w-2xl rounded-md border border-line-strong bg-surface-sunken/90 p-4">
            <Progress
              value={completedQuests}
              max={totalQuests}
              label="Overall journey progress"
            />
            <p className="mt-3 text-sm leading-6 text-muted">
              {progressNotice}
            </p>
          </div>
        </section>

        <section
          aria-labelledby="journey-briefing"
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="rounded-lg border border-line bg-surface-raised p-6">
            <p className="game-label text-xs text-discovery">
              Before departure
            </p>
            <h2
              id="journey-briefing"
              className="mt-2 font-display text-2xl font-bold"
            >
              Entry requirements
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              {journey.entryRequirements.map((requirement) => (
                <li key={requirement} className="flex gap-3">
                  <span aria-hidden="true" className="text-discovery">
                    &gt;
                  </span>
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-line bg-surface-raised p-6">
            <p className="game-label text-xs text-reward">Quest rewards</p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              What you will learn
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              {journey.outcomes.map((outcome) => (
                <li key={outcome.id} className="flex gap-3">
                  <span className="font-mono text-reward">{outcome.id}</span>
                  <span>{outcome.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="chapter-select-heading">
          <p className="game-label text-xs text-ascent">Route briefing</p>
          <h2
            id="chapter-select-heading"
            className="mt-2 font-display text-3xl font-bold"
          >
            Chapters
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {chapters.map(
              ({ chapter, completedQuests, totalQuests, status }) => (
                <ChapterCard
                  key={chapter.id}
                  title={chapter.title}
                  description={chapter.objectiveSummary}
                  eyebrow={`Chapter ${chapter.position}`}
                  artworkSrc={WORLD_ART}
                  completedQuests={completedQuests}
                  totalQuests={totalQuests}
                  statusText={chapterStatusLabel(status)}
                  onOpen={() => focusChapter(chapter.slug)}
                  className="max-w-none"
                />
              ),
            )}
          </div>
        </section>

        <section aria-labelledby="course-map-heading">
          <p className="game-label text-xs text-ascent">World route</p>
          <h2
            id="course-map-heading"
            className="mt-2 font-display text-3xl font-bold"
          >
            Course map
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted">
            Follow each chapter in order. Locked quests name an unmet published
            prerequisite; the current quest marks the earliest route you can
            take next.
          </p>
          <div className="mt-7 flex flex-col gap-8">
            {chapters.map(({ chapter, quests }) => (
              <div
                key={chapter.id}
                id={`chapter-${chapter.slug}`}
                tabIndex={-1}
                className="scroll-mt-6 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-reward"
              >
                <QuestPath
                  label={`Chapter ${chapter.position}: ${chapter.title}`}
                  description={chapter.objectiveSummary}
                  artworkSrc={WORLD_ART}
                >
                  {quests.map(({ quest, status }) => (
                    <QuestNode
                      key={quest.id}
                      status={status}
                      label={quest.title}
                      description={`${difficultyLabel(quest.difficulty)} · ${quest.xpAward} XP${quest.guestEligible ? ' · Guest quest' : ''}`}
                    />
                  ))}
                </QuestPath>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function JourneyLoading(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <div className="mx-auto w-full max-w-6xl" aria-busy="true">
        <CodeQuestLogo />
        <div
          className="mt-12 space-y-5"
          role="status"
          aria-label="Loading Journey"
        >
          <Skeleton label="Loading Journey title" className="h-12 max-w-xl" />
          <Skeleton label="Loading Journey progress" className="h-28" />
          <Skeleton label="Loading Course map" className="h-72" />
        </div>
      </div>
    </main>
  );
}

function JourneyFailure({
  error,
  retry,
}: {
  readonly error: unknown;
  readonly retry: () => void;
}): React.JSX.Element {
  const kind = error instanceof JourneyLoadError ? error.kind : 'unavailable';
  const notFound = kind === 'not-found';
  const invalid = kind === 'invalid-response';
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12 text-ink">
      <section className="pixel-corners pixel-frame w-full max-w-xl bg-surface-raised p-7">
        <CodeQuestLogo />
        <p className="game-label mt-10 text-xs text-danger">
          {notFound ? 'Route not found' : 'Map signal interrupted'}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          {notFound ? 'Journey not found' : 'Journey unavailable'}
        </h1>
        <p className="mt-4 leading-7 text-muted">
          {notFound
            ? 'This Journey is not available. Check the address or return home.'
            : invalid
              ? 'CodeQuest received Journey information it could not safely display.'
              : 'CodeQuest could not load the complete Course map. Try the route again.'}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {!notFound && <Button onClick={retry}>Retry Journey</Button>}
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md border border-line-strong bg-surface-raised px-4 font-bold text-ink outline-none hover:border-discovery"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}

function EmptyCourseMap({ model }: { readonly model: JourneyCourseMap }) {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Link href="/" aria-label="CodeQuest home" className="rounded-sm">
          <CodeQuestLogo />
        </Link>
        <section className="pixel-corners pixel-frame mt-12 bg-surface-raised p-7">
          <p className="game-label text-xs text-discovery">Course map</p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            {model.journey.title}
          </h1>
          <p className="mt-4 leading-7 text-muted">
            This published Journey does not have any quests available yet.
          </p>
        </section>
      </div>
    </main>
  );
}

export function JourneyPageClient({
  slug,
  api,
}: JourneyPageClientProps): React.JSX.Element {
  const curriculumApi = useMemo(() => api ?? createCodequestApi(), [api]);
  const query = useQuery({
    queryKey: journeyQueryKey(slug),
    queryFn: ({ signal }) =>
      loadJourneyCurriculumGraph(curriculumApi, slug, signal),
  });

  if (query.isPending) return <JourneyLoading />;
  if (query.isError) {
    return (
      <JourneyFailure error={query.error} retry={() => void query.refetch()} />
    );
  }

  const model = buildJourneyCourseMap(query.data, emptyCompletionSnapshot);
  return model.totalQuests === 0 ? (
    <EmptyCourseMap model={model} />
  ) : (
    <JourneyPageView model={model} />
  );
}
