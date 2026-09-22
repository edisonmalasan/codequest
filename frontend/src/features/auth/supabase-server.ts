import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { loadFrontendAuthConfig } from './auth-config';

export async function createServerSupabaseClient() {
  const config = loadFrontendAuthConfig();
  const cookieStore = await cookies();
  return createServerClient(config.supabaseUrl, config.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (updates) => {
        for (const { name, value, options } of updates) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}
