import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { questFixtures } from '@/features/curriculum/journey-course-test-data';
import { OfflineLearningClient } from './offline-learning-client';

const mocks = vi.hoisted(() => ({
  ownerId: 'owner-a',
  notify: null as ((owner: string | null) => void) | null,
  list: vi.fn(),
  load: vi.fn(),
  progress: vi.fn(),
}));
vi.mock('@/features/auth/supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: mocks.ownerId } } },
        error: null,
      }),
      onAuthStateChange: (
        callback: (
          event: string,
          session: { user: { id: string } } | null,
        ) => void,
      ) => {
        mocks.notify = (owner) =>
          callback('change', owner ? { user: { id: owner } } : null);
        return {
          data: {
            subscription: {
              unsubscribe() {
                mocks.notify = null;
              },
            },
          },
        };
      },
    },
  }),
}));
vi.mock('@/lib/local-persistence', () => ({
  lessonSnapshotRepository: {
    listDownloaded: mocks.list,
    loadDownloaded: mocks.load,
  },
  acceptedProgressRepository: { load: mocks.progress },
}));
vi.mock('@/features/progress-sync/pending-work-panel', () => ({
  PendingWorkPanel: ({ accountId }: { accountId: string }) => (
    <section aria-label="Pending account work">
      {accountId} pending source
    </section>
  ),
}));
vi.mock('@/features/curriculum/lesson-page-client', () => ({
  LessonPageView: ({
    quest,
    offline,
  }: {
    quest: { title: string };
    offline: boolean;
  }) => (
    <p>
      {quest.title} {offline ? 'offline mode' : 'online mode'}
    </p>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.ownerId = 'owner-a';
  const quest = questFixtures.Q01;
  mocks.list.mockImplementation(async (owner: string) =>
    owner === 'owner-a'
      ? [
          {
            id: 'saved',
            ownerId: owner,
            questId: quest.id,
            contentVersion: quest.contentVersion,
            assessmentVersion: quest.assessmentVersion,
            snapshot: quest,
            savedAt: 42,
            assetPaths: [],
          },
        ]
      : [],
  );
  mocks.load.mockResolvedValue({
    snapshot: quest,
    assets: new Map(),
    savedAt: 42,
  });
  mocks.progress.mockResolvedValue({
    journeyId: quest.hierarchy.journey.id,
    capturedAt: 42,
    quests: [
      {
        questId: quest.id,
        contentVersion: quest.contentVersion,
        assessmentVersion: quest.assessmentVersion,
        status: 'completed',
        availability: 'available',
      },
    ],
  });
});

describe('device-local offline library', () => {
  it('labels accepted facts last known, opens exact saved version and clears on account switch', async () => {
    const user = userEvent.setup();
    render(<OfflineLearningClient />);
    await screen.findByText(/Last known accepted account status: completed/);
    expect(screen.getByText('owner-a pending source')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Open saved lesson' }));
    expect(await screen.findByText(/First value offline mode/)).toBeTruthy();
    expect(screen.getByText('owner-a pending source')).toBeTruthy();
    expect(mocks.load).toHaveBeenCalledWith('owner-a', 'Q01', '1.0.0', '1.0.0');
    act(() => mocks.notify?.('owner-b'));
    await screen.findByText('No lessons are downloaded for this local owner.');
    expect(screen.queryByText(/First value offline mode/)).toBeNull();
    expect(screen.queryByText(/Last known accepted account status/)).toBeNull();
    expect(screen.queryByText('owner-a pending source')).toBeNull();
    expect(screen.getByText('owner-b pending source')).toBeTruthy();
    act(() => mocks.notify?.(null));
    await screen.findByText('Showing guest downloads on this device.');
    expect(
      screen.queryByRole('region', { name: 'Pending account work' }),
    ).toBeNull();
  });
  it('reports evicted or damaged assets without discarding work or calling them ready', async () => {
    mocks.load.mockRejectedValue(new Error('missing illustration'));
    render(<OfflineLearningClient />);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Open saved lesson' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain(
        'drafts have not been removed',
      ),
    );
    expect(screen.queryByText(/offline mode/)).toBeNull();
  });
});
