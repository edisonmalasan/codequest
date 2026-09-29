export const SHELL_ASSETS = [
  '/offline.html',
  '/offline.css',
  '/assets/design-system/brand/codequest-mark.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
] as const;

export const OFFLINE_LEARNING_DOCUMENT = '/offline-learning';

export const MAX_SHELL_ENTRY_BYTES = 2 * 1024 * 1024;
export const MAX_SHELL_BYTES = 12 * 1024 * 1024;

export function isPublicShellPath(path: string): boolean {
  return (
    path === OFFLINE_LEARNING_DOCUMENT ||
    SHELL_ASSETS.some((asset) => asset === path) ||
    /^\/_next\/static\/(?:chunks|css|media)\/[A-Za-z0-9_./-]+\.(?:js|css|woff2?)$/.test(
      path,
    )
  );
}

export function isPublicShellUrl(value: string): boolean {
  return (
    value.startsWith('/') && !value.startsWith('//') && isPublicShellPath(value)
  );
}

export function assertShellBudget(entries: readonly { size: number }[]): void {
  if (
    entries.some(
      ({ size }) =>
        !Number.isFinite(size) || size < 0 || size > MAX_SHELL_ENTRY_BYTES,
    ) ||
    entries.reduce((sum, { size }) => sum + size, 0) > MAX_SHELL_BYTES
  )
    throw new Error('Public PWA shell exceeds its approved cache budget.');
}

export function canServeShell(request: Request, origin: string): boolean {
  const url = new URL(request.url);
  return (
    request.method === 'GET' &&
    url.origin === origin &&
    !url.search &&
    !request.headers.has('authorization') &&
    !request.headers.has('rsc') &&
    !request.headers.has('next-router-prefetch') &&
    isPublicShellPath(url.pathname)
  );
}

export function canUseOfflineFallback(
  request: Request,
  origin: string,
): boolean {
  const url = new URL(request.url);
  return (
    request.method === 'GET' &&
    request.mode === 'navigate' &&
    url.origin === origin &&
    !request.headers.has('authorization') &&
    !request.headers.has('rsc') &&
    !/^\/(?:api|auth|runtime|preview)(?:\/|$)/.test(url.pathname)
  );
}
