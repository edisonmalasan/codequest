import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiClientOptions } from '@/lib/api-client';
import { ownerSyncApi } from './trusted-sync';
const mock = vi.hoisted(() => ({
  owner: 'A',
  options: null as ApiClientOptions | null,
}));
vi.mock('@/features/auth/supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: { id: mock.owner },
            access_token: `${mock.owner}-token`,
          },
        },
        error: null,
      }),
    },
  }),
}));
vi.mock('@/lib/api-client', () => ({
  createCodequestApi: (options: ApiClientOptions) => {
    mock.options = options;
    return {};
  },
}));
describe('owner-bound replay credentials', () => {
  beforeEach(() => {
    mock.owner = 'A';
    mock.options = null;
  });
  it('never attaches the new account token to an old owner request', async () => {
    ownerSyncApi('A');
    expect(await mock.options?.getAccessToken?.()).toBe('A-token');
    mock.owner = 'B';
    expect(await mock.options?.getAccessToken?.()).toBeNull();
  });
});
