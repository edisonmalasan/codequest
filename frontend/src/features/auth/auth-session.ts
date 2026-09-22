import { User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from './supabase-server';

export interface TrustedAuthSession {
  readonly user: User;
  readonly accessToken: string;
}

export async function getTrustedAuthSession(): Promise<
  TrustedAuthSession | undefined
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError !== null || user === null) return undefined;

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError !== null || session === null) return undefined;
  return Object.freeze({ user, accessToken: session.access_token });
}
