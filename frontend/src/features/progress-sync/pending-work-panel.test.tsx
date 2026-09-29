import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PendingWorkPanel } from './pending-work-panel';
const mock = vi.hoisted(() => ({
  list: vi.fn(),
  remove: vi.fn(),
  replay: vi.fn(),
  owner: 'A',
  refresh: vi.fn(),
}));
vi.mock('./progress-replay', async () => ({
  ...(await vi.importActual<typeof import('./progress-replay')>(
    './progress-replay',
  )),
  progressReplay: {
    repository: { list: mock.list, remove: mock.remove },
    replay: mock.replay,
  },
}));
vi.mock('./trusted-sync', () => ({
  currentSyncOwner: async () => mock.owner,
  ownerSyncApi: () => ({}),
  refreshAccountFacts: mock.refresh,
  notifyOutbox: vi.fn(),
  OUTBOX_CHANGED: 'test-outbox',
}));
describe('pending source recovery', () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    vi.clearAllMocks();
    mock.owner = 'A';
    mock.list.mockResolvedValue([
      {
        eventId: 'event',
        ownerId: 'A',
        questId: 'Q01',
        schemaVersion: 1,
        operationType: 'attempt-submit',
        contentVersion: '1.0.0',
        assessmentVersion: '1.0.0',
        createdAt: 1,
        payload: JSON.stringify({ source: 'private source', report: {} }),
      },
    ]);
    mock.replay.mockResolvedValue({ confirmed: 1, pending: false });
  });
  it('shows device-only pending source without automatically retrying and refreshes confirmed replay', async () => {
    render(<PendingWorkPanel accountId="A" />);
    await screen.findByText(/Q01: pending/);
    expect(mock.replay).not.toHaveBeenCalled();
    expect(screen.getByText('private source')).toBeDefined();
    await userEvent.click(
      screen.getByRole('button', { name: 'Retry saved submissions' }),
    );
    await waitFor(() => expect(mock.refresh).toHaveBeenCalledWith('A'));
    expect(mock.replay).toHaveBeenCalledWith(
      'A',
      {},
      expect.any(Function),
      true,
    );
  });
  it('does not retry or remove old-owner source with another account', async () => {
    const view = render(<PendingWorkPanel accountId="A" />);
    await screen.findByText(/Q01: pending/);
    mock.owner = 'B';
    await userEvent.click(
      screen.getByRole('button', { name: 'Retry saved submissions' }),
    );
    expect(mock.replay).not.toHaveBeenCalled();
    mock.list.mockResolvedValue([]);
    view.rerender(<PendingWorkPanel accountId="B" />);
    await screen.findByText('No saved submissions on this device.');
    expect(screen.queryByText('private source')).toBeNull();
  });
  it('allows offline source recovery and removal while disabling network retry', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    render(<PendingWorkPanel accountId="A" />);
    await screen.findByText(/Q01: pending/);
    const retry = screen.getByRole('button', {
      name: 'Retry saved submissions',
    });
    expect(retry).toHaveProperty('disabled', true);
    await userEvent.click(retry);
    expect(mock.replay).not.toHaveBeenCalled();
    expect(screen.getByText('private source')).toBeDefined();
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove this device copy' }),
    );
    expect(mock.remove).toHaveBeenCalledWith('A', 'event');
  });
  it('guards retry when connectivity changes before its event is received', async () => {
    const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    render(<PendingWorkPanel accountId="A" />);
    await screen.findByText(/Q01: pending/);
    online.mockReturnValue(false);
    await userEvent.click(
      screen.getByRole('button', { name: 'Retry saved submissions' }),
    );
    expect(mock.replay).not.toHaveBeenCalled();
  });
});
