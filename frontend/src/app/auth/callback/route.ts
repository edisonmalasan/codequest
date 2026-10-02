import { NextRequest, NextResponse } from 'next/server';
import { loadFrontendAuthConfig } from '@/features/auth/auth-config';
import { createServerSupabaseClient } from '@/features/auth/supabase-server';
import { safeReturnPath } from '@/features/auth/return-path';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const applicationOrigin = loadFrontendAuthConfig().siteUrl;
  const code = request.nextUrl.searchParams.get('code');
  const destination = safeReturnPath(request.nextUrl.searchParams.get('next'));
  const failureDestination = new URL(
    '/login?error=callback',
    applicationOrigin,
  );
  if (destination !== '/account')
    failureDestination.searchParams.set('next', destination);
  if (code === null || code.length === 0 || code.length > 2_048) {
    return NextResponse.redirect(failureDestination);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(
    new URL(
      error === null ? destination : failureDestination,
      applicationOrigin,
    ),
  );
}
