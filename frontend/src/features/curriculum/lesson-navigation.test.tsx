import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { JourneyProgress } from '@/lib/api-client';
import { LessonNavigation } from './lesson-navigation';
import {
  flowChapterFixture,
  graphFixture,
  journeyFixture,
  questFixtures,
  valuesChapterFixture,
} from './journey-course-test-data';

const auth = vi.hoisted(() => ({ owner: null as string | null }));
vi.mock('@/features/auth/supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({
        data: {
          session: auth.owner
            ? { user: { id: auth.owner }, access_token: 'synthetic-token' }
            : null,
        },
        error: null,
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
    },
  }),
}));

const publicApi = {
  getJourney: async () => ({
    ok: true as const,
    data: journeyFixture,
    requestId: 'synthetic',
  }),
  getChapter: async (slug: string) => ({
    ok: true as const,
    data:
      slug === flowChapterFixture.slug
        ? flowChapterFixture
        : valuesChapterFixture,
    requestId: 'synthetic',
  }),
  getQuest: async (slug: string) => ({
    ok: true as const,
    data:
      Object.values(questFixtures).find((quest) => quest.slug === slug) ??
      questFixtures.Q01,
    requestId: 'synthetic',
  }),
};

function acceptedProgress(q03Available: boolean): JourneyProgress {
  return {
    journeyId: journeyFixture.id,
    status: 'in_progress',
    availability: 'available',
    unmetPrerequisites: [],
    completedQuests: 2,
    totalQuests: 4,
    percentage: 50,
    chapters: graphFixture.chapters.map(({ chapter, quests }) => ({
      chapterId: chapter.id,
      status: 'in_progress',
      availability: 'available',
      unmetPrerequisites: [],
      completedQuests: quests.filter((quest) =>
        ['Q01', 'Q02'].includes(quest.id),
      ).length,
      totalQuests: quests.length,
      percentage: 0,
      quests: quests.map((quest) => ({
        questId: quest.id,
        status: ['Q01', 'Q02'].includes(quest.id)
          ? ('completed' as const)
          : ('not_started' as const),
        availability:
          quest.id === 'Q03' && !q03Available
            ? ('locked' as const)
            : ('available' as const),
        unmetPrerequisites:
          quest.id === 'Q03' && !q03Available
            ? [{ questId: 'Q02', slug: 'change-state', title: 'Change state' }]
            : [],
        startedAt: null,
        completedAt: null,
        lastActivityAt: null,
        attemptCount: 0,
        hintCount: 0,
      })),
    })),
  };
}

function show({
  owner,
  safeToLeave,
  q03Available = true,
}: {
  owner: string | null;
  safeToLeave: boolean;
  q03Available?: boolean;
}) {
  auth.owner = owner;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LessonNavigation
        quest={questFixtures.Q02}
        offline={false}
        safeToLeave={safeToLeave}
        api={publicApi}
        progressApi={{
          getJourneyProgress: async () => ({
            ok: true,
            data: acceptedProgress(q03Available),
            requestId: 'synthetic',
          }),
        }}
        guestProgressLoader={async () => []}
      />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  auth.owner = null;
});

it('navigates across chapters only when backend availability permits and source is saved', async () => {
  show({ owner: 'owner-a', safeToLeave: true });
  expect(
    (
      await screen.findByRole('link', { name: 'Next: Choose a path' })
    ).getAttribute('href'),
  ).toBe('/quests/choose-a-path');
  expect(screen.getByRole('link', { name: 'Back: First value' })).toBeDefined();
});

it('explains locked and unsaved destinations without a navigation link', async () => {
  const view = show({
    owner: 'owner-a',
    safeToLeave: true,
    q03Available: false,
  });
  expect(await screen.findByText(/Next: Choose a path locked/)).toBeDefined();
  expect(screen.queryByRole('link', { name: /Next:/ })).toBeNull();
  view.unmount();
  show({ owner: 'owner-a', safeToLeave: false });
  expect(
    await screen.findAllByText(/save your work before leaving/),
  ).toHaveLength(2);
});

it('keeps guest sequence provisional and respects published prerequisites', async () => {
  show({ owner: null, safeToLeave: true });
  expect(
    await screen.findByText(/guest progress is provisional/),
  ).toBeDefined();
  expect(screen.getByRole('link', { name: 'Back: First value' })).toBeDefined();
  expect(screen.queryByRole('link', { name: /Next:/ })).toBeNull();
});
