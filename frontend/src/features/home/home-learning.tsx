'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  createCodequestApi,
  type JourneySummary,
  type PublicApiResult,
} from '@/lib/api-client';
import styles from '@/app/homepage.module.css';

interface HomeLearningApi {
  getJourneys(signal?: AbortSignal): Promise<PublicApiResult<JourneySummary[]>>;
}

type LearningState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly journeys: JourneySummary[] };

export function HomeLearning({
  api,
}: {
  readonly api?: HomeLearningApi;
}): React.JSX.Element {
  const curriculumApi = useMemo(() => api ?? createCodequestApi(), [api]);
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<LearningState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    curriculumApi.getJourneys(controller.signal).then(
      (result) => {
        if (!active) return;
        setState(
          result.ok
            ? { status: 'ready', journeys: result.data }
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
  }, [curriculumApi, retryCount]);

  if (state.status === 'loading') {
    return (
      <div className={styles.learningStatus} role="status" aria-busy="true">
        Loading published learning paths…
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.learningStatus} role="alert">
        <strong>Learning paths are unavailable right now.</strong>
        <p>You can try again or read how learning works while we reconnect.</p>
        <div className={styles.statusActions}>
          <button
            type="button"
            onClick={() => {
              setState({ status: 'loading' });
              setRetryCount((count) => count + 1);
            }}
          >
            Retry loading
          </button>
          <Link href="/onboarding">How it works</Link>
        </div>
      </div>
    );
  }

  if (state.journeys.length === 0) {
    return (
      <div className={styles.learningStatus} role="status">
        <strong>No learning path is available right now.</strong>
        <p>Read how CodeQuest works, or check back for published paths.</p>
        <Link href="/onboarding">How it works →</Link>
      </div>
    );
  }

  return (
    <div className={styles.journeyGrid}>
      {state.journeys.map((journey, index) => (
        <Link
          key={journey.id}
          href={`/journeys/${encodeURIComponent(journey.slug)}`}
          className={styles.journeyCard}
        >
          <span className={styles.journeyIndex}>
            {String(index + 1).padStart(2, '0')} / PUBLISHED JOURNEY
          </span>
          <span className={styles.journeyGlyph} aria-hidden="true">
            ◇
          </span>
          <strong>{journey.title}</strong>
          <span>
            {journey.chapterCount} chapters · {journey.questCount} exercises
          </span>
          <span className={styles.journeyArrow} aria-hidden="true">
            ↗
          </span>
        </Link>
      ))}
    </div>
  );
}
