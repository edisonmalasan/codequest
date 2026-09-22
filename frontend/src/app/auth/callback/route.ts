import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/features/auth/supabase-server';
import { safeReturnPath } from '@/features/auth/return-path';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get('code');
  const destination = safeReturnPath(request.nextUrl.searchParams.get('next'));
  if (code === null || code.length === 0 || code.length > 2_048) {
    return NextResponse.redirect(new URL('/login?error=callback', request.url));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(
    new URL(
      error === null ? destination : '/login?error=callback',
      request.url,
    ),
  );
}
