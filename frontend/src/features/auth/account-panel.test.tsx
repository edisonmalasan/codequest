import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountPanel } from './account-panel';

const replace = vi.fn();
const refresh = vi.fn();
const signOut = vi.fn();
const clear = vi.fn();
const invalidateQueries = vi.fn();
const establishAccount = vi.fn();
const getXp = vi.fn();
const getStreak = vi.fn();
const updateTimezone = vi.fn();

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
  getQueryClient: () => ({ clear, invalidateQueries }),
}));
vi.mock('./guest-import-panel', () => ({
  GuestImportPanel: ({ onImported }: { onImported: () => void }) => (
    <button type="button" onClick={onImported}>
      Simulate confirmed import
    </button>
  ),
}));
vi.mock('@/lib/api-client', () => ({
  createCodequestApi: () => ({
    establishAccount,
    getXp,
    getStreak,
    updateTimezone,
  }),
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
    getXp.mockResolvedValue({
      ok: true,
      data: {
        totalXp: 235,
        clientReported: true,
        level: 3,
        levelStartXp: 200,
        nextLevelAtXp: 300,
        xpIntoLevel: 35,
        xpToNextLevel: 65,
        curveId: 'provisional-linear-100-v1',
        curveProvisional: true,
      },
    });
    getStreak.mockResolvedValue({
      ok: true,
      data: {
        currentStreak: 2,
        longestStreak: 5,
        timezone: 'UTC',
        latestActivityDate: '2026-09-28',
        clientReported: true,
      },
    });
    updateTimezone.mockResolvedValue({
      ok: true,
      data: {
        id: '00000000-0000-4000-8000-000000000001',
        timezone: 'Asia/Manila',
        createdAt: '2026-09-22T00:00:00.000Z',
        updatedAt: '2026-09-28T00:00:00.000Z',
      },
    });
  });

  it('establishes the current account and clears protected state on sign-out', async () => {
    const user = userEvent.setup();
    render(<AccountPanel email="learner@example.test" />);
    expect(await screen.findByText('UTC')).toBeDefined();
    expect(screen.getByText(/00000000-0000/)).toBeDefined();
    expect(await screen.findByText(/Level 3/)).toBeDefined();
    expect(
      screen
        .getByRole('progressbar', { name: 'XP toward Level 4' })
        .getAttribute('aria-valuenow'),
    ).toBe('35');
    expect(screen.getByText(/235 total XP/)).toBeDefined();
    expect(await screen.findByText('Current streak: 2 days')).toBeDefined();
    expect(screen.getByText(/thresholds are provisional/)).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(clear).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('saves the timezone and explains the prospective day rule', async () => {
    const user = userEvent.setup();
    render(<AccountPanel email="learner@example.test" />);
    const input = await screen.findByRole('textbox', {
      name: 'Learner timezone',
    });
    await user.clear(input);
    await user.type(input, 'Asia/Manila');
    await user.click(screen.getByRole('button', { name: 'Save timezone' }));
    await waitFor(() =>
      expect(updateTimezone).toHaveBeenCalledWith('Asia/Manila'),
    );
    expect(await screen.findByText('Asia/Manila')).toBeDefined();
    expect(
      screen.getByText(/Changes apply only to future accepted completions/),
    ).toBeDefined();
  });

  it('keeps the current timezone on update failure', async () => {
    updateTimezone.mockResolvedValueOnce({ ok: false, kind: 'network' });
    const user = userEvent.setup();
    render(<AccountPanel email="learner@example.test" />);
    await screen.findByText('UTC');
    await user.click(screen.getByRole('button', { name: 'Save timezone' }));
    expect(
      await screen.findByText(/Timezone could not be saved/),
    ).toBeDefined();
    expect(screen.getByText('UTC')).toBeDefined();
  });

  it('keeps account details and offers retry when the protected level read fails', async () => {
    getXp.mockResolvedValueOnce({ ok: false, kind: 'network' });
    const user = userEvent.setup();
    render(<AccountPanel email="learner@example.test" />);
    expect(
      await screen.findByText('Level progress is unavailable.'),
    ).toBeDefined();
    expect(screen.getByText('UTC')).toBeDefined();
    expect(screen.queryByRole('progressbar')).toBeNull();
    await user.click(
      screen.getByRole('button', { name: 'Retry level progress' }),
    );
    expect(await screen.findByText(/Level 3/)).toBeDefined();
    expect(getXp).toHaveBeenCalledTimes(2);
  });

  it('refreshes accepted account views after a confirmed import', async () => {
    const user = userEvent.setup();
    render(<AccountPanel email="learner@example.test" />);
    await screen.findByText('UTC');
    await user.click(
      screen.getByRole('button', { name: 'Simulate confirmed import' }),
    );
    await waitFor(() => expect(getXp).toHaveBeenCalledTimes(2));
    expect(getStreak).toHaveBeenCalledTimes(2);
    expect(invalidateQueries).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
  });
});
