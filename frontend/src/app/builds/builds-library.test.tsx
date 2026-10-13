import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BuildRecord } from '@/features/builds/build-repository';
import { BuildsLibrary } from './builds-library';

const harness = vi.hoisted(() => ({
  owner: { kind: 'ready' as const, ownerId: 'guest' },
  push: vi.fn(),
  list: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: harness.push }),
}));
vi.mock('./use-build-owner', () => ({
  useBuildOwner: () => ({ owner: harness.owner, retry: vi.fn() }),
}));
vi.mock('@/features/builds/build-repository', () => ({
  buildRepository: {
    list: harness.list,
    create: harness.create,
    remove: harness.remove,
  },
}));

const first: BuildRecord = {
  id: '00000000-0000-4000-8000-000000000001',
  ownerId: 'guest',
  workspaceId: 'build:00000000-0000-4000-8000-000000000001',
  schemaVersion: 1,
  manifestVersion: 1,
  templateVersion: 1,
  fileIds: ['index.html', 'style.css', 'main.js'],
  createdAt: Date.UTC(2026, 9, 14),
  updatedAt: Date.UTC(2026, 9, 14),
};

afterEach(() => {
  harness.owner = { kind: 'ready', ownerId: 'guest' };
  vi.clearAllMocks();
});

describe('BuildsLibrary', () => {
  it('keeps creation disabled while loading and lets the learner retry a storage read', async () => {
    const user = userEvent.setup();
    harness.list.mockRejectedValueOnce(new Error('IndexedDB unavailable'));
    harness.list.mockResolvedValueOnce([]);
    render(<BuildsLibrary />);
    expect(
      screen
        .getByRole('button', { name: 'New Build' })
        .hasAttribute('disabled'),
    ).toBe(true);
    expect(
      await screen.findByText(
        'Your local Builds could not be read. Existing files were not removed.',
      ),
    ).toBeTruthy();
    await user.click(
      screen.getByRole('button', { name: 'Retry local storage' }),
    );
    expect(
      await screen.findByText('No Builds on this device yet.'),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('button', { name: 'New Build' })
        .hasAttribute('disabled'),
    ).toBe(false);
  });

  it('shows the device-only boundary and creates a guest Build without a learning action', async () => {
    const user = userEvent.setup();
    harness.list.mockResolvedValue([]);
    harness.create.mockResolvedValue(first);
    render(<BuildsLibrary />);
    expect(
      await screen.findByText('No Builds on this device yet.'),
    ).toBeTruthy();
    expect(screen.getByText(/no cloud backup or published page/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'New Build' }));
    await waitFor(() => expect(harness.create).toHaveBeenCalledWith('guest'));
    expect(harness.push).toHaveBeenCalledWith(`/builds/${first.id}`);
    expect(screen.queryByRole('button', { name: 'Check' })).toBeNull();
  });

  it('removes a Build only after confirmation and retains the list when removal fails', async () => {
    const user = userEvent.setup();
    harness.list.mockResolvedValue([first]);
    harness.remove.mockRejectedValueOnce(new Error('quota'));
    harness.remove.mockResolvedValueOnce(true);
    render(<BuildsLibrary />);
    const link = await screen.findByRole('link', { name: 'Open Web Build 1' });
    expect(link.getAttribute('href')).toBe(`/builds/${first.id}`);
    await user.click(
      screen.getByRole('button', { name: 'Remove Build 1 from this device' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Remove this Build?' });
    expect(harness.remove).not.toHaveBeenCalled();
    await user.click(
      within(dialog).getByRole('button', { name: 'Remove from device' }),
    );
    expect(await screen.findByText(/could not be removed/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open Web Build 1' })).toBeTruthy();
    await user.click(
      within(dialog).getByRole('button', { name: 'Remove from device' }),
    );
    await waitFor(() => expect(harness.remove).toHaveBeenCalledTimes(2));
    expect(harness.remove).toHaveBeenCalledWith('guest', first.id);
    expect(
      await screen.findByText('No Builds on this device yet.'),
    ).toBeTruthy();
  });

  it('never displays an old owner list after account scope changes', async () => {
    const other = {
      ...first,
      id: '00000000-0000-4000-8000-000000000002',
      ownerId: 'account-b',
      workspaceId: 'build:00000000-0000-4000-8000-000000000002',
    };
    harness.list.mockImplementation((owner: string) =>
      Promise.resolve(owner === 'guest' ? [first] : [other]),
    );
    const view = render(<BuildsLibrary />);
    expect(
      await screen.findByRole('link', { name: 'Open Web Build 1' }),
    ).toBeTruthy();
    harness.owner = { kind: 'ready', ownerId: 'account-b' };
    view.rerender(<BuildsLibrary />);
    await waitFor(() => expect(harness.list).toHaveBeenCalledWith('account-b'));
    expect(await screen.findByText('Account · this device')).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Open Web Build 1' })
        .getAttribute('href'),
    ).toBe(`/builds/${other.id}`);
    expect(screen.queryByRole('link', { name: 'Open Web Build 2' })).toBeNull();
  });
});
