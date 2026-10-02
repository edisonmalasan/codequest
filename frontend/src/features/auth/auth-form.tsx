'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { FrontendAuthConfig, loadFrontendAuthConfig } from './auth-config';
import { safeReturnPath } from './return-path';
import { getBrowserSupabaseClient } from './supabase-browser';

type AuthMode = 'login' | 'register';
type OAuthProvider = 'google' | 'github';

async function providerIsEnabled(
  config: FrontendAuthConfig,
  provider: OAuthProvider,
): Promise<boolean> {
  const response = await fetch(
    new URL('/auth/v1/settings', config.supabaseUrl),
    {
      headers: { apikey: config.publishableKey },
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    },
  );
  if (!response.ok) throw new Error('Auth settings unavailable');
  const settings: unknown = await response.json();
  if (
    settings === null ||
    typeof settings !== 'object' ||
    !('external' in settings) ||
    settings.external === null ||
    typeof settings.external !== 'object'
  ) {
    throw new Error('Invalid Auth settings');
  }
  if (provider === 'google')
    return 'google' in settings.external && settings.external.google === true;
  return 'github' in settings.external && settings.external.github === true;
}

function browserAuthConfig() {
  return loadFrontendAuthConfig({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

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
    try {
      const supabase = getBrowserSupabaseClient();
      if (mode === 'register') {
        const config = browserAuthConfig();
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
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (authError !== null) throw authError;
        if (data.session === null) throw new Error('No session after sign-in');
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
      const config = browserAuthConfig();
      if (!(await providerIsEnabled(config, provider))) {
        setError(
          `${provider === 'google' ? 'Google' : 'GitHub'} sign-in is unavailable here. Use email sign-in or try later.`,
        );
        setPending(false);
        return;
      }
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

      {mode === 'login' && (
        <Link
          href="/recover"
          className="inline-block font-bold text-ascent underline"
        >
          Forgot password?
        </Link>
      )}

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
