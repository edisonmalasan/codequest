'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { XPBar } from '@/components/game/xp-bar';
import {
  AccountResponse,
  createCodequestApi,
  Streak,
  XpTotal,
} from '@/lib/api-client';
import { getQueryClient } from '@/lib/query-client';
import { getBrowserSupabaseClient } from './supabase-browser';
import { GuestImportPanel } from './guest-import-panel';
import { PendingWorkPanel } from '@/features/progress-sync/pending-work-panel';
import { ACCOUNT_REFRESH } from '@/features/progress-sync/trusted-sync';
import styles from './account-panel.module.css';

type LoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly account: AccountResponse }
  | { readonly status: 'error' };
type XpLoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly xp: XpTotal }
  | { readonly status: 'error' };
type StreakLoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly streak: Streak }
  | { readonly status: 'error' };

function accountApi(
  ownerId: string | null,
): ReturnType<typeof createCodequestApi> {
  const supabase = getBrowserSupabaseClient();
  return createCodequestApi({
    getAccessToken: async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        return error === null && data.session?.user.id === ownerId
          ? (data.session?.access_token ?? null)
          : null;
      } catch {
        return null;
      }
    },
  });
}

export function AccountPanel({ email }: { email: string }): React.JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [xpState, setXpState] = useState<XpLoadState>({ status: 'loading' });
  const [streakState, setStreakState] = useState<StreakLoadState>({
    status: 'loading',
  });
  const [timezoneInput, setTimezoneInput] = useState('UTC');
  const [timezoneSaving, setTimezoneSaving] = useState(false);
  const [timezoneError, setTimezoneError] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const requestGeneration = useRef(0);
  const streakGeneration = useRef(0);
  const accountOwner = useRef<string | null>(null);

  async function loadStreak(
    api = accountApi(accountOwner.current),
  ): Promise<void> {
    const generation = ++streakGeneration.current;
    setStreakState({ status: 'loading' });
    const result = await api.getStreak();
    if (generation !== streakGeneration.current) return;
    setStreakState(
      result.ok
        ? { status: 'ready', streak: result.data }
        : { status: 'error' },
    );
  }

  async function loadXp(api = accountApi(accountOwner.current)): Promise<void> {
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
    try {
      const { data, error } =
        await getBrowserSupabaseClient().auth.getSession();
      if (generation !== requestGeneration.current) return;
      if (error || !data.session) {
        router.replace('/login?next=%2Faccount');
        return;
      }
      const owner = data.session.user.id;
      accountOwner.current = owner;
      const api = accountApi(owner);
      const result = await api.establishAccount();
      if (generation !== requestGeneration.current) return;
      if (result.ok) {
        if (result.data.id !== owner) {
          setState({ status: 'error' });
          return;
        }
        setState({ status: 'ready', account: result.data });
        setTimezoneInput(result.data.timezone);
        await Promise.all([loadXp(api), loadStreak(api)]);
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
    } catch {
      if (generation === requestGeneration.current)
        setState({ status: 'error' });
    }
  }

  useEffect(() => {
    void loadAccount();
    const { data } = getBrowserSupabaseClient().auth.onAuthStateChange(
      (_event, session) => {
        const next = session?.user.id ?? null;
        if (next === accountOwner.current) return;
        accountOwner.current = next;
        requestGeneration.current++;
        streakGeneration.current++;
        setState({ status: 'loading' });
        setXpState({ status: 'loading' });
        setStreakState({ status: 'loading' });
        queueMicrotask(() => {
          router.refresh();
          void loadAccount();
        });
      },
    );
    return () => {
      data.subscription.unsubscribe();
      requestGeneration.current += 1;
      streakGeneration.current += 1;
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'ready') return;
    const accountId = state.account.id;
    const refresh = (event: Event) => {
      if (event instanceof CustomEvent && event.detail === accountId) {
        void loadXp();
        void loadStreak();
      }
    };
    window.addEventListener(ACCOUNT_REFRESH, refresh);
    return () => window.removeEventListener(ACCOUNT_REFRESH, refresh);
  }, [state.status === 'ready' ? state.account.id : null]);

  async function signOut(): Promise<void> {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(false);
    try {
      const { error } = await getBrowserSupabaseClient().auth.signOut();
      if (error !== null) throw error;
      requestGeneration.current += 1;
      streakGeneration.current += 1;
      setState({ status: 'loading' });
      setXpState({ status: 'loading' });
      setStreakState({ status: 'loading' });
      getQueryClient().clear();
      router.replace('/login');
      router.refresh();
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }

  async function saveTimezone(): Promise<void> {
    if (timezoneSaving) return;
    const generation = requestGeneration.current;
    setTimezoneSaving(true);
    setTimezoneError(false);
    const result = await accountApi(accountOwner.current).updateTimezone(
      timezoneInput.trim(),
    );
    if (generation !== requestGeneration.current) return;
    setTimezoneSaving(false);
    if (result.ok) {
      setState({ status: 'ready', account: result.data });
      setTimezoneInput(result.data.timezone);
      await loadStreak();
    } else {
      setTimezoneError(true);
    }
  }

  return (
    <Card title="Learning record" className={styles.record}>
      <p className={styles.email}>Signed in as {email}</p>
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
          <dl className={styles.identity}>
            <div>
              <dt className="font-bold text-muted">Player ID</dt>
              <dd className="font-mono text-ink">{state.account.id}</dd>
            </div>
            <div>
              <dt className="font-bold text-muted">Timezone</dt>
              <dd className="text-ink">{state.account.timezone}</dd>
            </div>
          </dl>
          <form
            className={styles.settings}
            onSubmit={(event) => {
              event.preventDefault();
              void saveTimezone();
            }}
          >
            <label
              htmlFor="learner-timezone"
              className="block text-sm font-bold text-ink"
            >
              Learner timezone
            </label>
            <input
              id="learner-timezone"
              value={timezoneInput}
              onChange={(event) => setTimezoneInput(event.target.value)}
              className="w-full rounded border border-muted px-3 py-2 text-ink"
              autoComplete="off"
            />
            <p className="text-xs text-muted">
              Use an IANA timezone such as Asia/Manila. Changes apply only to
              future accepted completions. Past streak days stay in their
              original timezone. A new timezone cannot credit another day within
              24 hours of the last credited day.
            </p>
            {timezoneError && (
              <p role="alert" className="text-sm text-danger">
                Timezone could not be saved. Check the IANA timezone and try
                again.
              </p>
            )}
            <Button type="submit" variant="secondary" loading={timezoneSaving}>
              Save timezone
            </Button>
          </form>
          <section aria-label="Learner streak" className={styles.fact}>
            <h2 className="font-display text-lg text-ink">Learning streak</h2>
            {streakState.status === 'loading' && (
              <p role="status">Loading streak…</p>
            )}
            {streakState.status === 'error' && (
              <div role="alert">
                <p>Streak is unavailable.</p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void loadStreak()}
                >
                  Retry streak
                </Button>
              </div>
            )}
            {streakState.status === 'ready' && (
              <>
                <p>Current streak: {streakState.streak.currentStreak} days</p>
                <p>Longest streak: {streakState.streak.longestStreak} days</p>
                <p className="text-xs text-muted">
                  Based on first accepted completions. Acceptance uses a
                  client-reported personal-learning check.
                </p>
              </>
            )}
          </section>
          <section aria-label="Level progress" className={styles.fact}>
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
          <PendingWorkPanel accountId={state.account.id} />
          <GuestImportPanel
            accountId={state.account.id}
            onImported={() => {
              void Promise.all([loadXp(), loadStreak()]);
              void getQueryClient().invalidateQueries();
              router.refresh();
            }}
          />
          <Link
            href="/account/password"
            className="inline-block font-bold text-ascent underline"
          >
            Update email password
          </Link>
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
      {signOutError && (
        <p role="alert" className="text-sm text-danger">
          Sign out could not be completed. Please try again.
        </p>
      )}
    </Card>
  );
}
