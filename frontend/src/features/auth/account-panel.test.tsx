import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountPanel } from './account-panel';

const replace = vi.fn();
const refresh = vi.fn();
const signOut = vi.fn();
const clear = vi.fn();
const establishAccount = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}));
vi.mock('./supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: { access_token: 'test-access-token' } },
        error: null,
      }),
      signOut,
    },
  }),
}));
vi.mock('@/lib/query-client', () => ({
  getQueryClient: () => ({ clear }),
}));
vi.mock('@/lib/api-client', () => ({
  createCodequestApi: () => ({ establishAccount }),
}));

describe('AccountPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signOut.mockResolvedValue({ error: null });
    establishAccount.mockResolvedValue({
      ok: true,
      data: {
        id: '00000000-0000-4000-8000-000000000001',
        timezone: 'UTC',
        createdAt: '2026-09-22T00:00:00.000Z',
        updatedAt: '2026-09-22T00:00:00.000Z',
      },
    });
  });

  it('establishes the current account and clears protected state on sign-out', async () => {
    const user = userEvent.setup();
    render(<AccountPanel email="learner@example.test" />);
    expect(await screen.findByText('UTC')).toBeDefined();
    expect(screen.getByText(/00000000-0000/)).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(clear).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/login');
  });
});
