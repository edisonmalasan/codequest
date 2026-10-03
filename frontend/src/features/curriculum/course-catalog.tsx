'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  createCodequestApi,
  type CourseSummary,
  type PublicApiResult,
} from '@/lib/api-client';
import styles from './course-catalog.module.css';

type CatalogState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly courses: CourseSummary[] };

interface CatalogApi {
  getCourses(signal?: AbortSignal): Promise<PublicApiResult<CourseSummary[]>>;
}

export function CourseCatalog({
  api,
}: {
  readonly api?: CatalogApi;
}): React.JSX.Element {
  const client = useMemo(() => api ?? createCodequestApi(), [api]);
  const [state, setState] = useState<CatalogState>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    void client.getCourses(controller.signal).then(
      (result) => {
        if (active)
          setState(
            result.ok
              ? { status: 'ready', courses: result.data }
              : { status: 'error' },
          );
      },
      () => {
        if (active) setState({ status: 'error' });
      },
    );
    return () => {
      active = false;
      controller.abort();
    };
  }, [client, retry]);

  const topics =
    state.status === 'ready'
      ? [...new Set(state.courses.flatMap((course) => course.topics))].sort()
      : [];
  const query = search.trim().toLocaleLowerCase();
  const visible =
    state.status === 'ready'
      ? state.courses.filter(
          (course) =>
            (topic === 'all' || course.topics.includes(topic)) &&
            (!query ||
              [course.title, course.summary, ...course.topics].some((value) =>
                value.toLocaleLowerCase().includes(query),
              )),
        )
      : [];

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link href="/" className={styles.back}>
          ← Home
        </Link>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Courses</p>
          <h1>Find what you will build next.</h1>
          <p>
            Explore published courses with real chapters and exercises you can
            start now.
          </p>
        </header>
        {state.status === 'loading' && (
          <p className={styles.notice} role="status">
            Loading published courses…
          </p>
        )}
        {state.status === 'error' && (
          <div className={styles.notice} role="alert">
            <strong>Courses are unavailable right now.</strong>
            <p>Try again when the connection is ready.</p>
            <button
              type="button"
              onClick={() => {
                setState({ status: 'loading' });
                setRetry((value) => value + 1);
              }}
            >
              Retry loading
            </button>
          </div>
        )}
        {state.status === 'ready' && (
          <>
            {state.courses.length > 0 && (
              <div className={styles.controls}>
                <label>
                  Search courses
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Try JavaScript or web"
                  />
                </label>
                <label>
                  Topic
                  <select
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                  >
                    <option value="all">All topics</option>
                    {topics.map((item) => (
                      <option key={item} value={item}>
                        {item.replaceAll('-', ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {visible.length === 0 ? (
              <div className={styles.notice} role="status">
                <strong>
                  {state.courses.length === 0
                    ? 'No courses are published yet.'
                    : 'No courses match your search.'}
                </strong>
                {state.courses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setTopic('all');
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className={styles.count}>
                  {visible.length} published{' '}
                  {visible.length === 1 ? 'course' : 'courses'}
                </p>
                <ol
                  className={`${styles.list} ${visible.length === 1 ? styles.singleList : ''}`}
                >
                  {visible.map((course, index) => (
                    <li key={course.id}>
                      <Link
                        className={styles.journey}
                        href={`/journeys/${encodeURIComponent(course.journeySlug)}`}
                      >
                        Explore the Journey <span aria-hidden="true">→</span>
                      </Link>
                      <Link
                        href={`/courses/${encodeURIComponent(course.slug)}`}
                        className={`${styles.course} ${course.id === 'COURSE-JS-FOUNDATIONS' ? styles.courseFeatured : ''}`}
                      >
                        {course.id === 'COURSE-JS-FOUNDATIONS' && (
                          <span className={styles.courseArt} aria-hidden="true">
                            <Image
                              src="/assets/design-system/worlds/beacon-city.webp"
                              alt=""
                              fill
                              sizes="(max-width: 720px) 100vw, 80vw"
                            />
                          </span>
                        )}
                        <span className={styles.number}>
                          Course {String(index + 1).padStart(2, '0')}
                        </span>
                        <strong>{course.title}</strong>
                        <span className={styles.summary}>{course.summary}</span>
                        {course.topics.length > 0 && (
                          <span className={styles.topics}>
                            {course.topics
                              .map((item) => item.replaceAll('-', ' '))
                              .join(' · ')}
                          </span>
                        )}
                        <span className={styles.meta}>
                          {course.chapterCount} chapters · {course.questCount}{' '}
                          exercises
                        </span>
                        <span className={styles.arrow} aria-hidden="true">
                          ↗
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
