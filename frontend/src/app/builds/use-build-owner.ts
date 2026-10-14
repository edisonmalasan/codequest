'use client';

import { useEffect, useState } from 'react';
import { getBrowserSupabaseClient } from '@/features/auth/supabase-browser';

export type BuildOwnerState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly ownerId: string }
  | { readonly kind: 'error' };

export function useBuildOwner(): {
  readonly owner: BuildOwnerState;
  readonly retry: () => void;
} {
  const [owner, setOwner] = useState<BuildOwnerState>({ kind: 'loading' });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let active = true;
    let revision = 0;
    setOwner({ kind: 'loading' });
    try {
      const auth = getBrowserSupabaseClient().auth;
      const { data: listener } = auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        revision++;
        setOwner({ kind: 'ready', ownerId: session?.user.id ?? 'guest' });
      });
      const initialRevision = revision;
      void auth.getSession().then(
        ({ data, error }) => {
          if (!active || revision !== initialRevision) return;
          setOwner(
            error
              ? { kind: 'error' }
              : { kind: 'ready', ownerId: data.session?.user.id ?? 'guest' },
          );
        },
        () => {
          if (active && revision === initialRevision)
            setOwner({ kind: 'error' });
        },
      );
      return () => {
        active = false;
        listener.subscription.unsubscribe();
      };
    } catch {
      queueMicrotask(() => {
        if (active) setOwner({ kind: 'error' });
      });
    }
    return () => {
      active = false;
    };
  }, [retryToken]);

  return {
    owner,
    retry: () => setRetryToken((value) => value + 1),
  };
}
