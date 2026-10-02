'use client';

import Image from 'next/image';
import Link from 'next/link';
import { QuestNode, type QuestStatus } from '@/components/game/quest-node';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { getBrowserSupabaseClient } from '@/features/auth/supabase-browser';
import { guestLearningRepository, type GuestProgress } from './guest-learning';
import {
  createCodequestApi,
  type ChapterDetail,
  type CourseDetail,
  type CourseProgress,
  type ProtectedApiResult,
  type PublicApiResult,
} from '@/lib/api-client';
import styles from './course-page.module.css';

interface CourseApi {
  getPublishedCourse(
    slug: string,
    signal?: AbortSignal,
  ): Promise<PublicApiResult<CourseDetail>>;
  getChapter(
    slug: string,
    signal?: AbortSignal,
  ): Promise<PublicApiResult<ChapterDetail>>;
}

interface CourseProgressApi {
  getPublishedCourseProgress(
    slug: string,
    signal?: AbortSignal,
  ): Promise<ProtectedApiResult<CourseProgress>>;
}

interface CourseGraph {
  readonly course: CourseDetail;
  readonly chapters: readonly ChapterDetail[];
}

async function loadCourse(
  api: CourseApi,
  slug: string,
  signal?: AbortSignal,
): Promise<CourseGraph> {
  const result = await api.getPublishedCourse(slug, signal);
  if (!result.ok)
    throw new Error(
      result.kind === 'http' && result.status === 404
        ? 'not-found'
        : 'unavailable',
    );
  const course = result.data;
  const chapters = await Promise.all(
    course.chapters.map(async (summary) => {
      const response = await api.getChapter(summary.slug, signal);
      if (!response.ok) throw new Error('unavailable');
      const chapter = response.data;
      if (
        chapter.id !== summary.id ||
        chapter.questCount !== summary.questCount ||
        chapter.journey.id !== course.journeyId
      )
        throw new Error('invalid-response');
      return chapter;
    }),
  );
  if (
    chapters.reduce((count, chapter) => count + chapter.quests.length, 0) !==
    course.questCount
  )
    throw new Error('invalid-response');
  return { course, chapters: chapters.sort((a, b) => a.position - b.position) };
}

export function CoursePageClient({
  slug,
  api,
  progressApi,
  guestProgressLoader,
}: {
  readonly slug: string;
  readonly api?: CourseApi;
  readonly progressApi?: CourseProgressApi;
  readonly guestProgressLoader?: () => Promise<GuestProgress[]>;
}): React.JSX.Element {
  const publicApi = useMemo(() => api ?? createCodequestApi(), [api]);
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
  const trustedApi = useMemo(
    () =>
      progressApi ??
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
    [progressApi, owner.id],
  );
  const courseQuery = useQuery({
    queryKey: ['catalog-course', slug],
    queryFn: ({ signal }) => loadCourse(publicApi, slug, signal),
  });
  const progressQuery = useQuery({
    queryKey: ['catalog-course-progress', owner.id, slug],
    enabled: owner.ready && owner.id !== null,
    retry: false,
    queryFn: async ({ signal }) => {
      const result = await trustedApi.getPublishedCourseProgress(slug, signal);
      if (!result.ok) throw new Error('Saved Course progress unavailable');
      return result.data;
    },
  });
  const guestQuery = useQuery({
    queryKey: ['catalog-guest-course-progress', slug],
    enabled: owner.ready && owner.id === null,
    retry: false,
    queryFn: guestProgressLoader ?? (() => guestLearningRepository.list()),
  });

  if (
    courseQuery.isPending ||
    !owner.ready ||
    (owner.id && progressQuery.isPending) ||
    (!owner.id && guestQuery.isPending)
  )
    return (
      <main className={styles.page}>
        <p role="status">Loading Course…</p>
      </main>
    );
  if (courseQuery.isError)
    return (
      <main className={styles.page}>
        <h1>
          {courseQuery.error.message === 'not-found'
            ? 'Course not found'
            : 'Course unavailable'}
        </h1>
        <p>Published Course information could not be loaded.</p>
        <button onClick={() => void courseQuery.refetch()}>Retry</button>
        <Link href="/courses">Browse courses</Link>
      </main>
    );

  const { course, chapters } = courseQuery.data;
  const trusted =
    owner.id && progressQuery.isSuccess ? progressQuery.data : null;
  const guestFacts =
    owner.id === null && guestQuery.isSuccess ? guestQuery.data : null;
  const trustedChapters = new Map(
    trusted?.chapters.map((chapter) => [chapter.chapterId, chapter]),
  );
  const complete =
    trusted !== null &&
    trusted.courseId === course.id &&
    trusted.chapters.length === chapters.length &&
    chapters.every((chapter) => {
      const saved = trustedChapters.get(chapter.id);
      return (
        saved?.quests.length === chapter.quests.length &&
        chapter.quests.every((quest) =>
          saved.quests.some((fact) => fact.questId === quest.id),
        )
      );
    });
  const orderedQuests = chapters.flatMap((chapter) =>
    [...chapter.quests]
      .sort((left, right) => left.position - right.position)
      .map((quest) => ({
        quest,
        fact: trustedChapters
          .get(chapter.id)
          ?.quests.find((item) => item.questId === quest.id),
      })),
  );
  const nextQuest = complete
    ? orderedQuests.find(
        ({ fact }) =>
          fact?.availability === 'available' && fact.status !== 'completed',
      )?.quest
    : owner.id === null
      ? orderedQuests.find(({ quest }) => quest.guestEligible)?.quest
      : undefined;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.crumbs} aria-label="Course path">
          <Link href="/courses">Courses</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/journeys/${encodeURIComponent(course.journeySlug)}`}>
            Journey
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{course.title}</span>
        </nav>
        <header className={styles.hero}>
          {course.id === 'COURSE-JS-FOUNDATIONS' && (
            <span className={styles.heroArt} aria-hidden="true">
              <Image
                src="/assets/design-system/worlds/beacon-city.webp"
                alt=""
                fill
                priority
                sizes="(max-width: 760px) 100vw, 80vw"
              />
            </span>
          )}
          <p className={styles.eyebrow}>
            Course {String(course.position).padStart(2, '0')}
          </p>
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
          <span>
            {course.chapterCount} chapters · {course.questCount} exercises
          </span>
        </header>
        {owner.id ? (
          !complete ? (
            <p role="alert" className={styles.notice}>
              Saved progress is unavailable. The outline remains visible;
              exercise availability cannot be confirmed right now.
            </p>
          ) : (
            <p role="status" className={styles.notice}>
              {trusted.completedQuests} of {trusted.totalQuests} exercises
              completed from your account.
            </p>
          )
        ) : (
          <p
            role={guestFacts === null ? 'alert' : 'status'}
            className={styles.notice}
          >
            {guestFacts === null
              ? 'Device progress is unavailable. Exercises remain available, but provisional completion cannot be confirmed.'
              : 'Guest work is provisional on this device. Sign in to see backend-accepted progress.'}
          </p>
        )}
        {nextQuest && (
          <Link
            className={styles.next}
            href={`/quests/${encodeURIComponent(nextQuest.slug)}`}
          >
            {complete ? 'Continue learning' : 'Start guest practice'}:{' '}
            {nextQuest.title}
          </Link>
        )}
        <section className={styles.outcomes} aria-labelledby="course-outcomes">
          <h2 id="course-outcomes">Course outcomes</h2>
          <ul>
            {course.outcomes.map((outcome) => (
              <li key={outcome.id}>{outcome.description}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="course-chapters">
          <p className={styles.eyebrow}>Your route</p>
          <h2 id="course-chapters">Chapters and exercises</h2>
          <ol className={styles.chapters}>
            {chapters.map((chapter) => {
              const saved = complete
                ? trustedChapters.get(chapter.id)
                : undefined;
              const savedQuests = new Map(
                saved?.quests.map((quest) => [quest.questId, quest]),
              );
              return (
                <li key={chapter.id} className={styles.chapter}>
                  <div className={styles.chapterHeading}>
                    <span>
                      CHAPTER {String(chapter.position).padStart(2, '0')}
                    </span>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.objectiveSummary}</p>
                    {saved && (
                      <small>
                        {saved.completedQuests} / {saved.totalQuests} complete
                      </small>
                    )}
                  </div>
                  <ol className={styles.quests}>
                    {[...chapter.quests]
                      .sort((a, b) => a.position - b.position)
                      .map((quest) => {
                        const fact = savedQuests.get(quest.id);
                        const guestFact = guestFacts?.find(
                          (item) => item.questId === quest.id,
                        );
                        const guestComplete =
                          guestFact?.submission?.contentVersion ===
                            quest.contentVersion &&
                          guestFact.submission.assessmentVersion ===
                            quest.assessmentVersion;
                        const status = complete
                          ? fact?.status === 'completed'
                            ? 'Completed'
                            : fact?.availability === 'locked'
                              ? 'Locked'
                              : 'Available'
                          : owner.id
                            ? 'Availability unavailable'
                            : !quest.guestEligible
                              ? 'Sign in to practice'
                              : guestComplete
                                ? 'Completed on this device · provisional'
                                : guestFact
                                  ? 'Started on this device · provisional'
                                  : 'Guest practice · provisional';
                        const nodeStatus: QuestStatus = complete
                          ? fact?.status === 'completed'
                            ? 'completed'
                            : fact?.availability === 'locked'
                              ? 'locked'
                              : 'available'
                          : owner.id
                            ? 'unavailable'
                            : !quest.guestEligible
                              ? 'locked'
                              : guestComplete
                                ? 'completed'
                                : guestFact
                                  ? 'in_progress'
                                  : 'available';
                        return (
                          <QuestNode
                            key={quest.id}
                            className={styles.quest}
                            label={quest.title}
                            status={nodeStatus}
                            statusText={status}
                            description={`Exercise ${String(quest.position).padStart(2, '0')}${fact?.unmetPrerequisites.length ? ` · Requires ${fact.unmetPrerequisites.map((item) => item.title).join(', ')}` : ''}`}
                            href={
                              nodeStatus === 'locked' ||
                              nodeStatus === 'unavailable'
                                ? undefined
                                : `/quests/${encodeURIComponent(quest.slug)}`
                            }
                          />
                        );
                      })}
                  </ol>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
}
