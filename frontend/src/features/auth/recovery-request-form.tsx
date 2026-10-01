'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { loadFrontendAuthConfig } from './auth-config';
import { getBrowserSupabaseClient } from './supabase-browser';

export function RecoveryRequestForm(): React.JSX.Element {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    const email = String(new FormData(event.currentTarget).get('email') ?? '');
    setPending(true);
    try {
      const config = loadFrontendAuthConfig({
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      });
      const callback = new URL(config.callbackUrl);
      callback.searchParams.set('next', '/account/password');
      const { error } =
        await getBrowserSupabaseClient().auth.resetPasswordForEmail(email, {
          redirectTo: callback.toString(),
        });
      if (error !== null) throw error;
      setSubmitted(true);
    } catch {
      // The same acknowledgement covers absent accounts and provider failures.
      setSubmitted(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      {submitted ? (
        <p role="status" className="text-sm leading-6 text-muted">
          If this email can use password recovery, a link will arrive. Check
          your inbox and spam folder.
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => void submit(event)}
          aria-busy={pending}
        >
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
          />
          <Button type="submit" loading={pending}>
            Send recovery link
          </Button>
        </form>
      )}
      <Link href="/login" className="font-bold text-ascent underline">
        Back to sign in
      </Link>
    </div>
  );
}
