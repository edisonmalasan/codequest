import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { ProgressSyncLifecycle } from './sync-provider';

const state = vi.hoisted(() => ({
  owner: 'A' as string | null,
  replay: vi.fn(),
  refresh: vi.fn(),
  remove: vi.fn(),
  listener: null as ((event: string, session: Session | null) => void) | null,
}));
vi.mock('@/features/auth/supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: state.owner ? { user: { id: state.owner } } : null },
        error: null,
      }),
      onAuthStateChange: (callback: typeof state.listener) => {
        state.listener = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    },
  }),
}));
vi.mock('@/lib/query-client', () => ({
  getQueryClient: () => ({ removeQueries: state.remove }),
}));
vi.mock('./progress-replay', () => ({
  progressReplay: { replay: state.replay },
}));
vi.mock('./trusted-sync', () => ({
  currentSyncOwner: async () => state.owner,
  ownerSyncApi: (owner: string) => ({ owner }),
  refreshAccountFacts: state.refresh,
  OUTBOX_CHANGED: 'test-outbox-changed',
}));

describe('trusted reconnect lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.owner = 'A';
    state.listener = null;
    state.replay.mockResolvedValue({
      confirmed: 0,
      blocked: 0,
      pending: false,
    });
  });
  it('refreshes on entry, online and focus even with no local pending work', async () => {
    render(<ProgressSyncLifecycle />);
    await waitFor(() => expect(state.replay).toHaveBeenCalledTimes(1));
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    await waitFor(() => expect(state.refresh).toHaveBeenCalledTimes(3));
    expect(state.refresh).toHaveBeenLastCalledWith('A');
  });
  it('clears protected memory on logout and does not replay guest work', async () => {
    render(<ProgressSyncLifecycle />);
    await waitFor(() => expect(state.replay).toHaveBeenCalledTimes(1));
    await act(async () => {
      state.owner = null;
      state.listener?.('SIGNED_OUT', null);
      window.dispatchEvent(new Event('online'));
    });
    expect(state.remove).toHaveBeenCalledWith({ queryKey: ['progress'] });
    expect(state.replay).toHaveBeenCalledTimes(1);
  });
  it('refreshes unavailable account views on disconnect without replaying offline work', async () => {
    render(<ProgressSyncLifecycle />);
    await waitFor(() => expect(state.replay).toHaveBeenCalledTimes(1));
    await act(async () => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(state.refresh).toHaveBeenCalledTimes(2);
    expect(state.replay).toHaveBeenCalledTimes(1);
  });
});
