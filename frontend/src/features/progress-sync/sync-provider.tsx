'use client';

import { useEffect } from 'react';
import { getBrowserSupabaseClient } from '@/features/auth/supabase-browser';
import { getQueryClient } from '@/lib/query-client';
import { acceptedProgressRepository } from '@/lib/local-persistence';
import { progressReplay } from './progress-replay';
import {
  currentSyncOwner,
  ownerSyncApi,
  refreshAccountFacts,
  OUTBOX_CHANGED,
} from './trusted-sync';

export function ProgressSyncLifecycle(): null {
  useEffect(() => {
    let active = true;
    let owner: string | null = null;
    let generation = 0;
    let initialGeneration = 0;
    const run = async (refresh: boolean) => {
      const token = generation;
      const account = owner;
      if (!active || !account) return;
      if (refresh) refreshAccountFacts(account);
      if (!navigator.onLine) return;
      let failed = false;
      try {
        const summary = await progressReplay.replay(
          account,
          ownerSyncApi(account),
          async () =>
            active && token === generation ? currentSyncOwner() : null,
        );
        if (active && token === generation && summary.confirmed)
          refreshAccountFacts(account);
      } catch {
        failed = true;
      }
      if (active && token === generation)
        window.dispatchEvent(
          new CustomEvent('codequest-replay-finished', {
            detail: { ownerId: account, failed },
          }),
        );
    };
    const changeOwner = (next: string | null) => {
      if (!active) return;
      if (owner !== next) {
        if (owner)
          void acceptedProgressRepository.clear(owner).catch(() => {
            window.dispatchEvent(
              new Event('codequest-offline-progress-clear-failed'),
            );
          });
        generation++;
        getQueryClient().removeQueries({ queryKey: ['progress'] });
      }
      owner = next;
      queueMicrotask(() => {
        void run(true);
      });
    };
    const reconnect = () => void run(true);
    const disconnected = () => {
      if (owner) refreshAccountFacts(owner);
    };
    const foreground = () => {
      if (document.visibilityState === 'visible') void run(true);
    };
    const queued = () => void run(false);
    window.addEventListener('online', reconnect);
    window.addEventListener('offline', disconnected);
    window.addEventListener('focus', reconnect);
    document.addEventListener('visibilitychange', foreground);
    window.addEventListener(OUTBOX_CHANGED, queued);
    let unsubscribe: (() => void) | undefined;
    try {
      const auth = getBrowserSupabaseClient().auth;
      const initial = initialGeneration;
      void auth.getSession().then(
        ({ data, error }) => {
          if (initialGeneration === initial)
            changeOwner(error ? null : (data.session?.user.id ?? null));
        },
        () => {
          if (initialGeneration === initial) changeOwner(null);
        },
      );
      const { data } = auth.onAuthStateChange((_event, session) => {
        initialGeneration++;
        changeOwner(session?.user.id ?? null);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      changeOwner(null);
    }
    return () => {
      active = false;
      generation++;
      unsubscribe?.();
      window.removeEventListener('online', reconnect);
      window.removeEventListener('offline', disconnected);
      window.removeEventListener('focus', reconnect);
      document.removeEventListener('visibilitychange', foreground);
      window.removeEventListener(OUTBOX_CHANGED, queued);
    };
  }, []);
  return null;
}
