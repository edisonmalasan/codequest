'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  createCodequestApi,
  type JourneyDetail,
  type PublicApiResult,
} from '@/lib/api-client';
import styles from './journey-overview.module.css';

interface JourneyApi {
  getJourney(
    slug: string,
    signal?: AbortSignal,
  ): Promise<PublicApiResult<JourneyDetail>>;
}

export function JourneyOverview({
  slug,
  api,
}: {
  readonly slug: string;
  readonly api?: JourneyApi;
}): React.JSX.Element {
  const client = useMemo(() => api ?? createCodequestApi(), [api]);
  const query = useQuery({
    queryKey: ['journey-overview', slug],
    queryFn: async ({ signal }) => {
      const result = await client.getJourney(slug, signal);
      if (!result.ok)
        throw new Error(
          result.kind === 'http' && result.status === 404
            ? 'not-found'
            : 'unavailable',
        );
      return result.data;
    },
    retry: false,
  });
  if (query.isPending)
    return (
      <main className={styles.page}>
        <p role="status">Loading Journey…</p>
      </main>
    );
  if (query.isError)
    return (
      <main className={styles.page}>
        <h1>
          {query.error.message === 'not-found'
            ? 'Journey not found'
            : 'Journey unavailable'}
        </h1>
        <button onClick={() => void query.refetch()}>Retry</button>
        <Link href="/courses">Browse courses</Link>
      </main>
    );
  const journey = query.data;
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.crumbs} aria-label="Journey path">
          <Link href="/courses">Courses</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{journey.title}</span>
        </nav>
        <div className={styles.worldIntro}>
          <header className={styles.hero}>
            {journey.slug === 'javascript-foundations' && (
              <span className={styles.heroArt} aria-hidden="true">
                <Image
                  src="/assets/design-system/worlds/signal-road.webp"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 760px) 100vw, 80vw"
                />
              </span>
            )}
            <p className={styles.eyebrow}>Learning Journey</p>
            <h1>{journey.title}</h1>
            <p>
              {journey.courses.length}{' '}
              {journey.courses.length === 1 ? 'course' : 'courses'} ·{' '}
              {journey.questCount} exercises
            </p>
          </header>
          <section className={styles.info} aria-labelledby="journey-outcomes">
            <p className={styles.eyebrow}>The route ahead</p>
            <h2 id="journey-outcomes">What you will learn</h2>
            <ul>
              {journey.outcomes.map((outcome) => (
                <li key={outcome.id}>{outcome.description}</li>
              ))}
            </ul>
          </section>
        </div>
        <section aria-labelledby="journey-courses">
          <p className={styles.eyebrow}>Course map</p>
          <h2 id="journey-courses">Your route through this Journey</h2>
          {journey.courses.length ? (
            <ol
              className={`${styles.list} ${journey.courses.length === 1 ? styles.singleList : ''}`}
            >
              {[...journey.courses]
                .sort((a, b) => a.position - b.position)
                .map((course) => (
                  <li key={course.id}>
                    <Link href={`/courses/${encodeURIComponent(course.slug)}`}>
                      <span>
                        {String(course.position).padStart(2, '0')} / COURSE
                      </span>
                      <strong>{course.title}</strong>
                      <p>{course.summary}</p>
                      <small>
                        {course.chapterCount} chapters · {course.questCount}{' '}
                        exercises
                      </small>
                      <span className={styles.courseArrow} aria-hidden="true">
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
            </ol>
          ) : (
            <p>No Courses are published in this Journey yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
