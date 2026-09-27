import { NextRequest, NextResponse } from 'next/server';
import { updateAuthSession } from '@/features/auth/update-session';

export async function middleware(request: NextRequest) {
  const configuredRuntimeOrigin = process.env.NEXT_PUBLIC_RUNTIME_ORIGIN;
  if (configuredRuntimeOrigin) {
    try {
      if (
        request.headers.get('host') === new URL(configuredRuntimeOrigin).host
      ) {
        if (
          !new Set([
            '/runtime/bootstrap.html',
            '/runtime/bootstrap.js',
            '/runtime/javascript-worker.js',
            '/runtime/validation-bootstrap.html',
            '/runtime/validation-bootstrap.js',
            '/runtime/validation-worker.js',
          ]).has(request.nextUrl.pathname)
        ) {
          return new NextResponse(null, { status: 404 });
        }
        return NextResponse.next();
      }
    } catch {
      return new NextResponse(null, { status: 503 });
    }
  }
  const configuredPreviewOrigin = process.env.NEXT_PUBLIC_PREVIEW_ORIGIN;
  if (configuredPreviewOrigin) {
    try {
      if (
        request.headers.get('host') === new URL(configuredPreviewOrigin).host
      ) {
        if (
          request.nextUrl.pathname !== '/preview/bootstrap.html' &&
          request.nextUrl.pathname !== '/preview/bootstrap.js'
        ) {
          return new NextResponse(null, { status: 404 });
        }
        return NextResponse.next();
      }
    } catch {
      return new NextResponse(null, { status: 503 });
    }
  }
  const path = request.nextUrl.pathname;
  if (path.startsWith('/runtime/')) {
    return new NextResponse(null, { status: 404 });
  }
  if (path.startsWith('/preview/')) {
    return new NextResponse(null, { status: 404 });
  }
  if (
    path.startsWith('/_next/static/') ||
    path.startsWith('/_next/image') ||
    path === '/icon.svg' ||
    path.startsWith('/assets/')
  ) {
    return NextResponse.next();
  }
  return updateAuthSession(request);
}

export const config = {
  matcher: ['/:path*'],
};
