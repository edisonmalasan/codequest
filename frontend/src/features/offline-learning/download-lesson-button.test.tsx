import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { questFixtures } from '@/features/curriculum/journey-course-test-data';
import { LocalPersistenceError } from '@/lib/local-persistence';
import { DownloadLessonButton } from './download-lesson-button';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  prepare: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('./download', () => ({
  saveLessonForOffline: mocks.save,
  prepareOfflineRunner: mocks.prepare,
}));
vi.mock('@/lib/local-persistence', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/local-persistence')>()),
  lessonSnapshotRepository: {
    loadDownloaded: async () => null,
    remove: mocks.remove,
  },
}));
vi.mock('@/features/auth/supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
    },
  }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.save.mockResolvedValue(undefined);
  mocks.prepare.mockResolvedValue(false);
  mocks.remove.mockResolvedValue(undefined);
});
describe('download preparation feedback', () => {
  it('distinguishes full storage and retries without losing existing source', async () => {
    mocks.save.mockRejectedValueOnce(new LocalPersistenceError('quota'));
    render(
      <DownloadLessonButton
        quest={questFixtures.Q01}
        apiBaseUrl="https://api.test"
      />,
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Download lesson' }),
    );
    await screen.findByText(/Device storage is full/);
    expect(mocks.prepare).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Download lesson' }),
    );
    await screen.findByText(/Offline Run and Check are not verified/);
  });
  it('distinguishes reading-ready from verified local exercises and allows removal', async () => {
    render(
      <DownloadLessonButton
        quest={questFixtures.Q01}
        apiBaseUrl="https://api.test"
      />,
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Download lesson' }),
    );
    await screen.findByText(/Offline Run and Check are not verified/);
    mocks.prepare.mockResolvedValue(true);
    await userEvent.click(
      screen.getByRole('button', { name: 'Refresh download' }),
    );
    await screen.findByText(
      /Saved for offline reading and local Run and Check/,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove download' }),
    );
    await screen.findByRole('button', { name: 'Download lesson' });
    expect(mocks.remove).toHaveBeenCalledWith('guest', 'Q01', '1.0.0', '1.0.0');
  });
  it('reports storage failure and permits retry without success', async () => {
    mocks.save.mockRejectedValue(new Error('quota'));
    render(
      <DownloadLessonButton
        quest={questFixtures.Q01}
        apiBaseUrl="https://api.test"
      />,
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Download lesson' }),
    );
    await screen.findByText(/Download or storage failed/);
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(screen.queryByText(/Saved for offline reading/)).toBeNull();
  });
});
