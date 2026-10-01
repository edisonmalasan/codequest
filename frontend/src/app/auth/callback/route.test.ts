import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const exchangeCodeForSession = vi.fn();

vi.mock('@/features/auth/supabase-server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { exchangeCodeForSession },
  }),
}));

describe('authentication callback', () => {
  afterEach(() => vi.unstubAllEnvs());
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
    vi.stubEnv(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      'publishable-local-test-key',
    );
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it('exchanges a code once and redirects without carrying the code', async () => {
    const response = await GET(
      new NextRequest(
        'http://localhost:3000/auth/callback?code=once&next=%2Faccount',
      ),
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith('once');
    expect(exchangeCodeForSession).toHaveBeenCalledTimes(1);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/account',
    );
  });

  it('redirects a recovery exchange to the local password page without a code', async () => {
    const response = await GET(
      new NextRequest(
        'http://localhost:3000/auth/callback?code=recovery-once&next=%2Faccount%2Fpassword',
      ),
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith('recovery-once');
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/account/password',
    );
  });

  it('rejects missing codes and external return destinations', async () => {
    const response = await GET(
      new NextRequest(
        'http://localhost:3000/auth/callback?next=https://evil.test',
      ),
    );
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login?error=callback',
    );
  });

  it('redirects to the configured app origin when the request URL uses the runner host', async () => {
    const response = await GET(
      new NextRequest('http://localhost:3100/auth/callback'),
    );
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login?error=callback',
    );
  });
});
