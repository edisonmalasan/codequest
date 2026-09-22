'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { loadFrontendAuthConfig } from './auth-config';
import { safeReturnPath } from './return-path';
import { getBrowserSupabaseClient } from './supabase-browser';

type AuthMode = 'login' | 'register';
type OAuthProvider = 'google' | 'github';

export function AuthForm({
  mode,
  nextPath,
  callbackFailed = false,
}: {
  mode: AuthMode;
  nextPath?: string;
  callbackFailed?: boolean;
}): React.JSX.Element {
  const router = useRouter();
  const destination = safeReturnPath(nextPath);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(
    callbackFailed
      ? 'Authentication could not be completed. Please try again.'
      : '',
  );
  const [confirmationPending, setConfirmationPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    setConfirmationPending(false);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const supabase = getBrowserSupabaseClient();

    try {
      if (mode === 'register') {
        const config = loadFrontendAuthConfig();
        const callback = new URL(config.callbackUrl);
        callback.searchParams.set('next', destination);
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callback.toString() },
        });
        if (authError !== null) throw authError;
        if (data.session === null) {
          setConfirmationPending(true);
          return;
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError !== null) throw authError;
      }
      router.replace(destination);
      router.refresh();
    } catch {
      setError(
        mode === 'login'
          ? 'Sign in failed. Check your details and try again.'
          : 'Registration failed. Check your details and try again.',
      );
    } finally {
      setPending(false);
    }
  }

  async function startOAuth(provider: OAuthProvider): Promise<void> {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const config = loadFrontendAuthConfig();
      const callback = new URL(config.callbackUrl);
      callback.searchParams.set('next', destination);
      const { error: authError } =
        await getBrowserSupabaseClient().auth.signInWithOAuth({
          provider,
          options: { redirectTo: callback.toString() },
        });
      if (authError !== null) throw authError;
    } catch {
      setError('Provider sign in could not start. Please try again.');
      setPending(false);
    }
  }

  if (confirmationPending) {
    return (
      <div role="status" tabIndex={-1} className="space-y-4" autoFocus>
        <h2 className="font-display text-xl text-reward">Check your email</h2>
        <p className="text-sm leading-6 text-muted">
          Follow the confirmation link to finish creating your account. You are
          not signed in yet.
        </p>
        <Link className="font-bold text-ascent underline" href="/login">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form className="space-y-5" onSubmit={submit} aria-busy={pending}>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={8}
          required
          disabled={pending}
          helperText={
            mode === 'register' ? 'Use at least 8 characters.' : undefined
          }
        />
        {error && (
          <p role="alert" className="text-sm font-semibold text-danger">
            {error}
          </p>
        )}
        <Button className="w-full" type="submit" loading={pending}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          or
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => void startOAuth('google')}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => void startOAuth('github')}
        >
          GitHub
        </Button>
      </div>

      <p className="text-center text-sm text-muted">
        {mode === 'login' ? 'New to CodeQuest?' : 'Already have an account?'}{' '}
        <Link
          className="font-bold text-ascent underline"
          href={`${mode === 'login' ? '/register' : '/login'}?next=${encodeURIComponent(destination)}`}
        >
          {mode === 'login' ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
}
