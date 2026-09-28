import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuestProgress } from '@/features/curriculum/guest-learning';
import { GuestImportPanel } from './guest-import-panel';

const getSession = vi.fn();
vi.mock('./supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({ auth: { getSession } }),
}));

const first: GuestProgress = {
  questId: 'Q01',
  startedAt: 1,
  eventId: '00000000-0000-4000-8000-000000000001',
  contentVersion: '1.0.0',
  assessmentVersion: '1.0.0',
  submission: {
    clientEventId: '00000000-0000-4000-8000-000000000001',
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    source: 'original source',
    report: {},
  },
};

describe('explicit guest import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue({
      data: { session: { user: { id: 'account-a' }, access_token: 'token' } },
      error: null,
    });
  });

  it('waits for explicit action, submits in quest order, and keeps source visible', async () => {
    const user = userEvent.setup();
    const imported = vi.fn();
    const importGuestAttempt = vi.fn().mockResolvedValue({
      ok: true,
      data: { accepted: true },
    });
    render(
      <GuestImportPanel
        accountId="account-a"
        api={{ importGuestAttempt }}
        repository={{
          list: async () => [
            {
              ...first,
              questId: 'Q02',
              eventId: '00000000-0000-4000-8000-000000000002',
              submission: {
                clientEventId: '00000000-0000-4000-8000-000000000002',
                contentVersion: '1.0.0',
                assessmentVersion: '1.0.0',
                source: 'original source',
                report: {},
              },
            },
            first,
          ],
        }}
        onImported={imported}
      />,
    );
    await screen.findByText(/Q01: provisional Check saved/);
    expect(importGuestAttempt).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', {
        name: 'Import guest work into this account',
      }),
    );
    await waitFor(() => expect(importGuestAttempt).toHaveBeenCalledTimes(2));
    expect(importGuestAttempt.mock.calls.map((call) => call[0])).toEqual([
      'Q01',
      'Q02',
    ]);
    expect(imported).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('original source')).toHaveLength(2);
  });

  it('does not submit under a different current account', async () => {
    getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'account-b' } } },
      error: null,
    });
    const importGuestAttempt = vi.fn();
    const user = userEvent.setup();
    render(
      <GuestImportPanel
        accountId="account-a"
        api={{ importGuestAttempt }}
        repository={{ list: async () => [first] }}
      />,
    );
    await screen.findByText(/Q01: provisional Check saved/);
    await user.click(
      screen.getByRole('button', {
        name: 'Import guest work into this account',
      }),
    );
    await waitFor(() => expect(screen.getByText(/unavailable/)).toBeDefined());
    expect(importGuestAttempt).not.toHaveBeenCalled();
  });

  it('preserves the event and source through rejection and retry', async () => {
    const user = userEvent.setup();
    const importGuestAttempt = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        kind: 'http',
        status: 409,
        error: {
          message: 'Quest version changed; retry with the current version',
        },
      })
      .mockResolvedValueOnce({ ok: true, data: { accepted: true } });
    render(
      <GuestImportPanel
        accountId="account-a"
        api={{ importGuestAttempt }}
        repository={{ list: async () => [first] }}
      />,
    );
    await screen.findByText(/Q01: provisional Check saved/);
    await user.click(
      screen.getByRole('button', {
        name: 'Import guest work into this account',
      }),
    );
    await screen.findByText(/retry-required/);
    expect(screen.getByText('original source')).toBeDefined();
    await user.click(
      screen.getByRole('button', {
        name: 'Import guest work into this account',
      }),
    );
    await screen.findByText(/accepted/);
    expect(importGuestAttempt.mock.calls[0][1]).toEqual(
      importGuestAttempt.mock.calls[1][1],
    );
  });

  it('retries an uncertain response with the exact same event', async () => {
    const user = userEvent.setup();
    const importGuestAttempt = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, kind: 'network' })
      .mockResolvedValueOnce({
        ok: true,
        data: { accepted: true, reportedPassed: true },
      });
    render(
      <GuestImportPanel
        accountId="account-a"
        api={{ importGuestAttempt }}
        repository={{ list: async () => [first] }}
      />,
    );
    await screen.findByText(/Q01: provisional Check saved/);
    await user.click(
      screen.getByRole('button', {
        name: 'Import guest work into this account',
      }),
    );
    await screen.findByText(/uncertain/);
    await user.click(
      screen.getByRole('button', {
        name: 'Import guest work into this account',
      }),
    );
    await screen.findByText(/accepted/);
    expect(importGuestAttempt.mock.calls[0][1].clientEventId).toBe(
      importGuestAttempt.mock.calls[1][1].clientEventId,
    );
  });
});
