'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { loadFrontendAuthConfig } from './auth-config';

let browserClient: SupabaseClient | undefined;

export function getBrowserSupabaseClient(): SupabaseClient {
  if (browserClient === undefined) {
    const config = loadFrontendAuthConfig();
    browserClient = createBrowserClient(
      config.supabaseUrl,
      config.publishableKey,
    );
  }
  return browserClient;
}
