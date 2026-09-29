'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import { Button } from '@/components/ui/button';
import { LessonPageView } from '@/features/curriculum/lesson-page-client';
import { getBrowserSupabaseClient } from '@/features/auth/supabase-browser';
import { PendingWorkPanel } from '@/features/progress-sync/pending-work-panel';
import { getConfiguredApiBaseUrl } from '@/lib/api-base';
import type { QuestDetail } from '@/lib/api-client';
import type { AcceptedProgressRecord, LessonSnapshotRecord } from '@/lib/db';
import {
  acceptedProgressRepository,
  lessonSnapshotRepository,
} from '@/lib/local-persistence';

export function OfflineLearningClient(): React.JSX.Element {
  const [owner, setOwner] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonSnapshotRecord[]>([]);
  const [progress, setProgress] = useState<AcceptedProgressRecord[]>([]);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<{
    quest: QuestDetail;
    assets: ReadonlyMap<string, string>;
    savedAt: number;
  } | null>(null);
  const generation = useRef(0);
  const urls = useRef<string[]>([]);
  const revoke = () => {
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current = [];
  };
  useEffect(() => {
    let active = true;
    const load = async (ownerId: string) => {
      const token = ++generation.current;
      setOwner(null);
      setSelected(null);
      revoke();
      try {
        const rows = await lessonSnapshotRepository.listDownloaded(ownerId);
        const facts: AcceptedProgressRecord[] = [];
        if (ownerId !== 'guest') {
          for (const id of new Set(
            rows.map((row) => row.snapshot.hierarchy.journey.id),
          )) {
            const fact = await acceptedProgressRepository.load(ownerId, id);
            if (fact) facts.push(fact);
          }
        }
        if (active && token === generation.current) {
          setLessons(rows);
          setProgress(facts);
          setOwner(ownerId);
          setError(false);
        }
      } catch {
        if (active && token === generation.current) setError(true);
      }
    };
    let unsubscribe: (() => void) | undefined;
    try {
      const auth = getBrowserSupabaseClient().auth;
      const initial = generation.current;
      void auth.getSession().then(
        ({ data, error }) => {
          if (active && generation.current === initial)
            void load(error ? 'guest' : (data.session?.user.id ?? 'guest'));
        },
        () => {
          if (active && generation.current === initial) void load('guest');
        },
      );
      const { data } = auth.onAuthStateChange((_event, session) => {
        if (active) void load(session?.user.id ?? 'guest');
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      void load('guest');
    }
    return () => {
      active = false;
      generation.current++;
      revoke();
      unsubscribe?.();
    };
  }, []);

  const open = async (row: LessonSnapshotRecord) => {
    if (!owner) return;
    const token = generation.current;
    try {
      const saved = await lessonSnapshotRepository.loadDownloaded(
        owner,
        row.questId,
        row.contentVersion,
        row.assessmentVersion,
      );
      if (!saved) throw new Error('Saved lesson missing');
      if (token !== generation.current) return;
      revoke();
      const assets = new Map<string, string>();
      for (const [path, blob] of saved.assets) {
        const url = URL.createObjectURL(blob);
        urls.current.push(url);
        assets.set(path, url);
      }
      setSelected({ quest: saved.snapshot, assets, savedAt: saved.savedAt });
      setError(false);
    } catch {
      if (token === generation.current) setError(true);
    }
  };
  if (selected)
    return (
      <>
        <div className="mx-auto max-w-6xl px-5 pt-5">
          <Button
            variant="secondary"
            onClick={() => {
              revoke();
              setSelected(null);
            }}
          >
            Back to downloaded lessons
          </Button>
          <p role="status" className="mt-3 text-sm text-muted">
            Device-local copy saved{' '}
            {new Date(selected.savedAt).toLocaleString()}. Local feedback is
            provisional; account progress needs a connection.
          </p>
        </div>
        <LessonPageView
          quest={selected.quest}
          apiBaseUrl={getConfiguredApiBaseUrl()}
          offline
          offlineAssets={selected.assets}
        />
        {owner && owner !== 'guest' && (
          <div className="mx-auto max-w-6xl px-5 pb-10">
            <PendingWorkPanel key={owner} accountId={owner} />
          </div>
        )}
      </>
    );
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 text-ink">
      <header className="flex items-center justify-between gap-4">
        <CodeQuestLogo />
        <span className="game-label text-sm">Offline learning</span>
      </header>
      <section className="pixel-corners pixel-frame mt-10 bg-surface-raised p-7">
        <h1 className="font-display text-3xl font-bold">Downloaded lessons</h1>
        <p className="mt-4 text-muted">
          Saved lessons and drafts stay on this device. Clearing browser data
          can remove them. Local Checks are provisional; cached account progress
          is last known.
        </p>
        {error && (
          <p role="alert" className="mt-5 text-danger">
            Device storage or a downloaded lesson is unavailable or damaged.
            Your drafts have not been removed. Reconnect and download the lesson
            again.
          </p>
        )}
        {!owner && !error && (
          <p role="status" className="mt-5">
            Opening device library…
          </p>
        )}
        {owner && (
          <>
            <p className="mt-4 text-sm text-muted">
              {owner === 'guest'
                ? 'Showing guest downloads on this device.'
                : 'Showing this device’s last signed-in account. Offline identity is not backend verification.'}
            </p>
            {lessons.length === 0 && (
              <p className="mt-6">
                No lessons are downloaded for this local owner.
              </p>
            )}
            <ul className="mt-6 space-y-4">
              {lessons.map((row) => {
                const cached = progress.find(
                  (item) =>
                    item.journeyId === row.snapshot.hierarchy.journey.id,
                );
                const fact = cached?.quests.find(
                  (item) =>
                    item.questId === row.questId &&
                    item.contentVersion === row.contentVersion &&
                    item.assessmentVersion === row.assessmentVersion,
                );
                return (
                  <li
                    key={row.id}
                    className="rounded-md border border-line bg-surface-sunken p-4"
                  >
                    <h2 className="font-display text-xl font-bold">
                      {row.snapshot.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {row.questId} · Content {row.contentVersion}
                      {' · '}Assessment {row.assessmentVersion} · Saved{' '}
                      {new Date(row.savedAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm">
                      {fact && cached
                        ? `Last known accepted account status: ${fact.status}; availability: ${fact.availability}. Captured ${new Date(cached.capturedAt).toLocaleString()}.`
                        : 'No version-matched accepted account progress is cached for this lesson.'}
                    </p>
                    <Button className="mt-3" onClick={() => void open(row)}>
                      Open saved lesson
                    </Button>
                    <Button
                      className="mt-3 ml-3"
                      variant="secondary"
                      onClick={() => {
                        const token = generation.current;
                        void lessonSnapshotRepository
                          .remove(
                            owner,
                            row.questId,
                            row.contentVersion,
                            row.assessmentVersion,
                          )
                          .then(
                            () => {
                              if (token === generation.current)
                                setLessons((current) =>
                                  current.filter((item) => item.id !== row.id),
                                );
                            },
                            () => {
                              if (token === generation.current) setError(true);
                            },
                          );
                      }}
                    >
                      Remove saved lesson
                    </Button>
                  </li>
                );
              })}
            </ul>
            {owner !== 'guest' && (
              <div className="mt-8">
                <PendingWorkPanel key={owner} accountId={owner} />
              </div>
            )}
          </>
        )}
        <p className="mt-8 text-sm text-muted">
          AI, leaderboards, community, remote sandboxes, account changes, and
          publishing require a connection.
        </p>
        <Link href="/" className="mt-6 inline-block underline">
          Return to CodeQuest
        </Link>
      </section>
    </main>
  );
}
