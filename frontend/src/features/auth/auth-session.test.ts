import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTrustedAuthSession } from './auth-session';

const getUser = vi.fn();
const getSession = vi.fn();

vi.mock('./supabase-server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser, getSession } }),
}));

describe('trusted Auth session', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns only a verified user and current access token', async () => {
    const user = { id: '00000000-0000-4000-8000-000000000001' };
    getUser.mockResolvedValue({ data: { user }, error: null });
    getSession.mockResolvedValue({
      data: { session: { access_token: 'current-access-token' } },
      error: null,
    });
    await expect(getTrustedAuthSession()).resolves.toEqual({
      user,
      accessToken: 'current-access-token',
    });
  });

  it('fails closed when user verification fails and does not read a session', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('expired private token'),
    });
    await expect(getTrustedAuthSession()).resolves.toBeUndefined();
    expect(getSession).not.toHaveBeenCalled();
  });
});
