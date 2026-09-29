'use client';

import { useEffect, useRef, useState } from 'react';
import { getBrowserSupabaseClient } from '@/features/auth/supabase-browser';
import type { QuestDetail } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  lessonSnapshotRepository,
  LocalPersistenceError,
} from '@/lib/local-persistence';
import { prepareOfflineRunner, saveLessonForOffline } from './download';

type DownloadState =
  'checking' | 'idle' | 'saving' | 'reading' | 'exercise' | 'error' | 'full';

export function DownloadLessonButton({
  quest,
  apiBaseUrl,
}: {
  readonly quest: QuestDetail;
  readonly apiBaseUrl: string;
}): React.JSX.Element | null {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [state, setState] = useState<DownloadState>('checking');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    let active = true;
    const inspect = async (owner: string | null) => {
      if (!active) return;
      const current = ++generation.current;
      setOwnerId(owner);
      setSavedAt(null);
      if (owner === null && !quest.guestEligible) {
        setState('idle');
        return;
      }
      try {
        const saved = await lessonSnapshotRepository.loadDownloaded(
          owner ?? 'guest',
          quest.id,
          quest.contentVersion,
          quest.assessmentVersion,
        );
        if (active && current === generation.current) {
          setSavedAt(saved?.savedAt ?? null);
          setState(saved ? 'reading' : 'idle');
        }
      } catch {
        if (active && current === generation.current) setState('error');
      }
    };
    try {
      const auth = getBrowserSupabaseClient().auth;
      const initial = generation.current;
      void auth.getSession().then(
        ({ data, error }) => {
          if (generation.current === initial)
            void inspect(error ? null : (data.session?.user.id ?? null));
        },
        () => {
          if (generation.current === initial) void inspect(null);
        },
      );
      const { data: listener } = auth.onAuthStateChange((_event, session) => {
        void inspect(session?.user.id ?? null);
      });
      return () => {
        active = false;
        generation.current++;
        listener.subscription.unsubscribe();
      };
    } catch {
      void inspect(null);
      return () => {
        active = false;
        generation.current++;
      };
    }
  }, [
    quest.id,
    quest.contentVersion,
    quest.assessmentVersion,
    quest.guestEligible,
  ]);

  if (ownerId === null && !quest.guestEligible) return null;
  const owner = ownerId ?? 'guest';
  const save = async () => {
    if (state === 'saving') return;
    const current = generation.current;
    setState('saving');
    try {
      await saveLessonForOffline(owner, quest, apiBaseUrl);
      const saved = await lessonSnapshotRepository.loadDownloaded(
        owner,
        quest.id,
        quest.contentVersion,
        quest.assessmentVersion,
      );
      const exerciseReady = await prepareOfflineRunner().catch(() => false);
      if (current === generation.current) {
        setSavedAt(saved?.savedAt ?? null);
        setState(exerciseReady ? 'exercise' : 'reading');
      }
    } catch (cause) {
      if (current === generation.current)
        setState(
          cause instanceof LocalPersistenceError && cause.kind === 'quota'
            ? 'full'
            : 'error',
        );
    }
  };
  const remove = async () => {
    const current = generation.current;
    try {
      await lessonSnapshotRepository.remove(
        owner,
        quest.id,
        quest.contentVersion,
        quest.assessmentVersion,
      );
      if (current === generation.current) {
        setSavedAt(null);
        setState('idle');
      }
    } catch {
      if (current === generation.current) setState('error');
    }
  };
  return (
    <div className="mt-6 rounded-md border border-line bg-surface-sunken p-4">
      <p className="text-sm font-bold">Keep on this device</p>
      <p className="mt-1 text-xs text-muted">
        Content {quest.contentVersion} · Assessment {quest.assessmentVersion}
        {savedAt !== null && ` · Saved ${new Date(savedAt).toLocaleString()}`}
      </p>
      <p className="mt-1 text-sm text-muted">
        {state === 'checking' && 'Checking this device…'}
        {state === 'idle' &&
          'Download this published version for offline reading and practice.'}
        {state === 'saving' && 'Saving lesson and illustrations…'}
        {state === 'reading' &&
          'Saved for offline reading. Offline Run and Check are not verified on this device.'}
        {state === 'exercise' &&
          'Saved for offline reading and local Run and Check. Account progress still needs a connection.'}
        {state === 'error' &&
          'Download or storage failed. Your current lesson and source are still available; retry while online.'}
        {state === 'full' &&
          'Device storage is full. Remove a downloaded lesson and retry. Your existing source has not been removed.'}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {(state === 'idle' || state === 'error' || state === 'full') && (
          <Button onClick={() => void save()}>Download lesson</Button>
        )}
        {(state === 'reading' || state === 'exercise') && (
          <>
            <Button onClick={() => void save()}>Refresh download</Button>
            <Button variant="secondary" onClick={() => void remove()}>
              Remove download
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
