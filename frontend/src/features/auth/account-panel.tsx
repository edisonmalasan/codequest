'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { AccountResponse, createCodequestApi } from '@/lib/api-client';
import { getQueryClient } from '@/lib/query-client';
import { getBrowserSupabaseClient } from './supabase-browser';

type LoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly account: AccountResponse }
  | { readonly status: 'error' };

export function AccountPanel({ email }: { email: string }): React.JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [signingOut, setSigningOut] = useState(false);

  async function loadAccount(): Promise<void> {
    setState({ status: 'loading' });
    const supabase = getBrowserSupabaseClient();
    const api = createCodequestApi({
      getAccessToken: async () => {
        const { data, error } = await supabase.auth.getSession();
        return error === null ? (data.session?.access_token ?? null) : null;
      },
    });
    const result = await api.establishAccount();
    if (result.ok) {
      setState({ status: 'ready', account: result.data });
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
  }, []);

  async function signOut(): Promise<void> {
    if (signingOut) return;
    setSigningOut(true);
    await getBrowserSupabaseClient().auth.signOut();
    getQueryClient().clear();
    setState({ status: 'loading' });
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
