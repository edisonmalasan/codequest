'use client';

import { FormEvent, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { getBrowserSupabaseClient } from './supabase-browser';

export function PasswordUpdateForm(): React.JSX.Element {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<'idle' | 'error' | 'success'>('idle');

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const password = String(new FormData(form).get('password') ?? '');
    if (password.length < 8) {
      setMessage('error');
      return;
    }
    setPending(true);
    setMessage('idle');
    try {
      const { error } = await getBrowserSupabaseClient().auth.updateUser({
        password,
      });
      if (error !== null) throw error;
      form.reset();
      setMessage('success');
    } catch {
      setMessage('error');
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => void submit(event)}
      aria-busy={pending}
    >
      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        disabled={pending}
        helperText="Use at least 8 characters."
      />
      {message === 'error' && (
        <p role="alert" className="text-sm text-danger">
          Password could not be updated. Check your new password and try again.
        </p>
      )}
      {message === 'success' && (
        <p role="status" className="text-sm text-reward">
          Password updated.
        </p>
      )}
      <Button type="submit" loading={pending}>
        Update password
      </Button>
    </form>
  );
}
