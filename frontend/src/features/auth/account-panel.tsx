'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { XPBar } from '@/components/game/xp-bar';
import { AccountResponse, createCodequestApi, XpTotal } from '@/lib/api-client';
import { getQueryClient } from '@/lib/query-client';
import { getBrowserSupabaseClient } from './supabase-browser';

type LoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly account: AccountResponse }
  | { readonly status: 'error' };
type XpLoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly xp: XpTotal }
  | { readonly status: 'error' };

function accountApi(): ReturnType<typeof createCodequestApi> {
  const supabase = getBrowserSupabaseClient();
  return createCodequestApi({
    getAccessToken: async () => {
      const { data, error } = await supabase.auth.getSession();
      return error === null ? (data.session?.access_token ?? null) : null;
    },
  });
}

export function AccountPanel({ email }: { email: string }): React.JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [xpState, setXpState] = useState<XpLoadState>({ status: 'loading' });
  const [signingOut, setSigningOut] = useState(false);
  const requestGeneration = useRef(0);

  async function loadXp(api = accountApi()): Promise<void> {
    const generation = ++requestGeneration.current;
    setXpState({ status: 'loading' });
    const result = await api.getXp();
    if (generation !== requestGeneration.current) return;
    setXpState(
      result.ok ? { status: 'ready', xp: result.data } : { status: 'error' },
    );
  }

  async function loadAccount(): Promise<void> {
    const generation = ++requestGeneration.current;
    setState({ status: 'loading' });
    const api = accountApi();
    const result = await api.establishAccount();
    if (generation !== requestGeneration.current) return;
    if (result.ok) {
      setState({ status: 'ready', account: result.data });
      await loadXp(api);
      return;
    }
    if (
      result.kind === 'unauthenticated' ||
      (result.kind === 'http' && result.status === 401)
    ) {
      router.replace('/login?next=%2Faccount');
      router.refresh();
      return;
    }
    setState({ status: 'error' });
  }

  useEffect(() => {
    void loadAccount();
    return () => {
      requestGeneration.current += 1;
    };
  }, []);

  async function signOut(): Promise<void> {
    if (signingOut) return;
    setSigningOut(true);
    requestGeneration.current += 1;
    setState({ status: 'loading' });
    setXpState({ status: 'loading' });
    await getBrowserSupabaseClient().auth.signOut();
    getQueryClient().clear();
    router.replace('/login');
    router.refresh();
  }

  return (
    <Card title="Current account" className="space-y-5">
      <p className="text-sm text-muted">Signed in as {email}</p>
      {state.status === 'loading' && (
        <p role="status" className="text-sm text-muted">
          Establishing your account…
        </p>
      )}
      {state.status === 'error' && (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-danger">
            Your account could not be loaded. No progress was changed.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadAccount()}
          >
            Retry
          </Button>
        </div>
      )}
      {state.status === 'ready' && (
        <>
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="font-bold text-muted">Player ID</dt>
              <dd className="font-mono text-ink">{state.account.id}</dd>
            </div>
            <div>
              <dt className="font-bold text-muted">Timezone</dt>
              <dd className="text-ink">{state.account.timezone}</dd>
            </div>
          </dl>
          <section aria-label="Level progress" className="space-y-3">
            {xpState.status === 'loading' && (
              <p role="status" className="text-sm text-muted">
                Loading level progress…
              </p>
            )}
            {xpState.status === 'error' && (
              <div role="alert" className="space-y-2">
                <p className="text-sm text-muted">
                  Level progress is unavailable.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void loadXp()}
                >
                  Retry level progress
                </Button>
              </div>
            )}
            {xpState.status === 'ready' && (
              <>
                <p className="font-display text-lg text-ink">
                  Level {xpState.xp.level}{' '}
                  {xpState.xp.curveProvisional && (
                    <span className="text-sm font-normal text-muted">
                      (provisional)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  {xpState.xp.totalXp} total XP · {xpState.xp.xpToNextLevel} XP
                  to Level {xpState.xp.level + 1}
                </p>
                <XPBar
                  value={xpState.xp.xpIntoLevel}
                  max={xpState.xp.xpIntoLevel + xpState.xp.xpToNextLevel}
                  label={`XP toward Level ${xpState.xp.level + 1}`}
                />
                <p className="text-xs text-muted">
                  {xpState.xp.curveProvisional &&
                    'Level thresholds are provisional. '}
                  XP reflects accepted personal-learning activity, not mastery.
                </p>
              </>
            )}
          </section>
        </>
      )}
      <Button
        type="button"
        variant="secondary"
        loading={signingOut}
        onClick={() => void signOut()}
      >
        Sign out
      </Button>
    </Card>
  );
}
