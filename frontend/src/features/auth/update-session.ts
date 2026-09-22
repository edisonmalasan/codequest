import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { loadFrontendAuthConfig } from './auth-config';

export async function updateAuthSession(
  request: NextRequest,
): Promise<NextResponse> {
  const config = loadFrontendAuthConfig();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    config.supabaseUrl,
    config.publishableKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (updates) => {
          for (const { name, value } of updates) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of updates) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );
  await supabase.auth.getUser();
  return response;
}
