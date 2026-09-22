import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const exchangeCodeForSession = vi.fn();

vi.mock('@/features/auth/supabase-server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { exchangeCodeForSession },
  }),
}));

describe('authentication callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
