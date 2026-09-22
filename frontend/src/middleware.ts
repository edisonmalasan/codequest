import { NextRequest } from 'next/server';
import { updateAuthSession } from '@/features/auth/update-session';

export async function middleware(request: NextRequest) {
  return updateAuthSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icon.svg|assets/).*)'],
};
