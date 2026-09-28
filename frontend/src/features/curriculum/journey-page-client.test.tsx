import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  JourneyProgress,
  ProtectedApiResult,
  PublicApiResult,
} from '@/lib/api-client';
import type { CurriculumApi } from './journey-course-loader';
import {
  flowChapterFixture,
  graphFixture,
  journeyFixture,
  questFixtures,
  valuesChapterFixture,
} from './journey-course-test-data';
import { buildJourneyCourseMap } from './journey-course-model';
import { JourneyPageClient, JourneyPageView } from './journey-page-client';

const authState = vi.hoisted<{
  ownerId: string;
  notify: ((id: string) => void) | null;
}>(() => ({ ownerId: '', notify: null }));
vi.mock('@/features/auth/supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({
        data: {
          session: authState.ownerId
            ? { user: { id: authState.ownerId }, access_token: 'test-token' }
            : null,
        },
        error: null,
      }),
      onAuthStateChange: (
        callback: (
          event: string,
          session: { user: { id: string } } | null,
        ) => void,
      ) => {
        authState.notify = (id) =>
          callback(
            id ? 'SIGNED_IN' : 'SIGNED_OUT',
            id ? { user: { id } } : null,
          );
        return {
          data: {
            subscription: {
              unsubscribe() {
                authState.notify = null;
              },
            },
          },
        };
      },
    },
  }),
}));
afterEach(() => {
  authState.ownerId = '';
  authState.notify = null;
});

function success<T>(data: T): PublicApiResult<T> {
  return { ok: true, data, requestId: 'request-id' };
}

function apiFixture(): CurriculumApi {
  const getJourney: CurriculumApi['getJourney'] = async () =>
    success(journeyFixture);
  const getChapter: CurriculumApi['getChapter'] = async (slug) =>
    success(
      slug === valuesChapterFixture.slug
        ? valuesChapterFixture
        : flowChapterFixture,
    );
  const getQuest: CurriculumApi['getQuest'] = async (slug) => {
    const quest = Object.values(questFixtures).find(
      (candidate) => candidate.slug === slug,
    );
    return quest === undefined
      ? { ok: false, kind: 'invalid-response', status: 200 }
      : success(quest);
  };
  return {
    getJourney: vi.fn(getJourney),
    getChapter: vi.fn(getChapter),
    getQuest: vi.fn(getQuest),
  };
}

function renderClient(
  api: CurriculumApi,
  progressApi?: {
    getJourneyProgress(
      slug: string,
      signal?: AbortSignal,
    ): Promise<ProtectedApiResult<JourneyProgress>>;
  },
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <JourneyPageClient
        slug={journeyFixture.slug}
        api={api}
        progressApi={progressApi}
      />
    </QueryClientProvider>,
  );
}

describe('JourneyPageView', () => {
  it('renders source-backed overview, ordered chapters, progress, and all map states', async () => {
    const user = userEvent.setup();
    const model = buildJourneyCourseMap(graphFixture, {
      authority: 'provisional',
      completedQuestIds: new Set(['Q01']),
    });
    render(<JourneyPageView model={model} />);

    expect(
      screen.getByRole('heading', { level: 1, name: journeyFixture.title }),
    ).toBeDefined();
    expect(
      screen.getByText(
        'Explore JavaScript Foundations through 4 quests across 2 chapters.',
      ),
    ).toBeDefined();
    expect(screen.getByText('Overall journey progress: 1 / 4')).toBeDefined();
    expect(screen.getByText(/device progress is provisional/i)).toBeDefined();
    expect(
      screen.getByText(journeyFixture.outcomes[0].description),
    ).toBeDefined();

    const routes = screen.getAllByText(/^Chapter \d:/);
    expect(routes.map(({ textContent }) => textContent)).toEqual([
      'Chapter 1: Values and state',
      'Chapter 2: Control flow',
    ]);
    expect(screen.getAllByText('Completed')).not.toHaveLength(0);
    expect(screen.getByText('Current quest')).toBeDefined();
    expect(screen.getByText('Available')).toBeDefined();
    expect(screen.getAllByText('Locked')).not.toHaveLength(0);
    expect(
      screen
        .getByRole('link', { name: 'Change state, Current quest' })
        .getAttribute('href'),
    ).toBe('/quests/change-state');
    expect(
      screen.queryByRole('link', { name: /Choose a path, Locked/ }),
    ).toBeNull();
    expect(
      screen.getAllByText('Developing · 15 XP · Guest quest'),
    ).toHaveLength(2);

    await user.click(
      screen.getAllByRole('button', { name: 'Open chapter' })[0],
    );
    expect(document.activeElement?.id).toBe('chapter-values-and-state');
  });
});

describe('JourneyPageClient', () => {
  it('renders only backend-accepted owner progress and withholds failed protected reads', async () => {
    authState.ownerId = 'current-owner';
    const data: JourneyProgress = {
      journeyId: journeyFixture.id,
      status: 'in_progress',
      completedQuests: 1,
      totalQuests: 4,
      percentage: 25,
      chapters: graphFixture.chapters.map(({ chapter, quests }) => ({
        chapterId: chapter.id,
        status:
          chapter.id === graphFixture.chapters[0].chapter.id
            ? 'in_progress'
            : 'not_started',
        completedQuests:
          chapter.id === graphFixture.chapters[0].chapter.id ? 1 : 0,
        totalQuests: quests.length,
        percentage: chapter.id === graphFixture.chapters[0].chapter.id ? 50 : 0,
        quests: quests.map((quest) => ({
          questId: quest.id,
          status: quest.id === 'Q01' ? 'completed' : 'not_started',
          startedAt: null,
          completedAt: null,
          lastActivityAt: null,
          attemptCount: 0,
          hintCount: 0,
        })),
      })),
    };
    const getJourneyProgress = vi.fn(async () => ({
      ok: true as const,
      data,
      requestId: 'progress-request',
    }));
    renderClient(apiFixture(), { getJourneyProgress });
    expect(
      await screen.findByText('Overall journey progress: 1 / 4'),
    ).toBeDefined();
    expect(
      screen.getByText(/backend-accepted personal-learning progress/i),
    ).toBeDefined();
    expect(getJourneyProgress).toHaveBeenCalledWith(
      journeyFixture.slug,
      expect.any(AbortSignal),
    );
    act(() => {
      authState.ownerId = '';
      authState.notify?.('');
    });
    expect(
      await screen.findByText('Overall journey progress: 0 / 4'),
    ).toBeDefined();
    expect(screen.getByText(/Sign in to see saved progress/i)).toBeDefined();
  });

  it('does not present a false zero snapshot when protected progress fails', async () => {
    authState.ownerId = 'current-owner';
    renderClient(apiFixture(), {
      getJourneyProgress: async () => ({ ok: false, kind: 'network' }),
    });
    expect(
      await screen.findByRole('heading', { name: 'Journey unavailable' }),
    ).toBeDefined();
    expect(screen.queryByText('Overall journey progress: 0 / 4')).toBeNull();
  });

  it('retries a failed protected progress read', async () => {
    authState.ownerId = 'current-owner';
    const data: JourneyProgress = {
      journeyId: journeyFixture.id,
      status: 'not_started',
      completedQuests: 0,
      totalQuests: 4,
      percentage: 0,
      chapters: graphFixture.chapters.map(({ chapter, quests }) => ({
        chapterId: chapter.id,
        status: 'not_started',
        completedQuests: 0,
        totalQuests: quests.length,
        percentage: 0,
        quests: quests.map((quest) => ({
          questId: quest.id,
          status: 'not_started',
          startedAt: null,
          completedAt: null,
          lastActivityAt: null,
          attemptCount: 0,
          hintCount: 0,
        })),
      })),
    };
    const getJourneyProgress = vi
      .fn<
        NonNullable<Parameters<typeof renderClient>[1]>['getJourneyProgress']
      >()
      .mockResolvedValueOnce({ ok: false, kind: 'network' })
      .mockResolvedValue({ ok: true, data, requestId: 'retry' });
    renderClient(apiFixture(), { getJourneyProgress });
    expect(
      await screen.findByRole('heading', { name: 'Journey unavailable' }),
    ).toBeDefined();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Retry Journey' }));
    expect(
      await screen.findByText('Overall journey progress: 0 / 4'),
    ).toBeDefined();
    expect(getJourneyProgress).toHaveBeenCalledTimes(2);
  });

  it('loads the generated curriculum graph and reports the honest empty snapshot', async () => {
    const api = apiFixture();
    renderClient(api);

    expect(screen.getByLabelText('Loading Journey')).toBeDefined();
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: journeyFixture.title,
      }),
    ).toBeDefined();
    expect(screen.getByText('Overall journey progress: 0 / 4')).toBeDefined();
    expect(screen.getByText(/Sign in to see saved progress/i)).toBeDefined();
    expect(api.getJourney).toHaveBeenCalledTimes(1);
  });

  it('renders a safe not-found state without exposing backend error text', async () => {
    const api = apiFixture();
    const getJourney: CurriculumApi['getJourney'] = async () => ({
      ok: false,
      kind: 'http',
      status: 404,
      error: {
        code: 'CURRICULUM_NOT_FOUND',
        message: 'secret draft path',
        status: 404,
        requestId: 'private-request-id',
      },
    });
    api.getJourney = vi.fn(getJourney);
    renderClient(api);

    expect(
      await screen.findByRole('heading', { name: 'Journey not found' }),
    ).toBeDefined();
    expect(screen.queryByText(/secret draft path/i)).toBeNull();
    expect(screen.queryByText(/private-request-id/i)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry Journey' })).toBeNull();
  });

  it('retries a recoverable failure and replaces it with the Journey', async () => {
    const user = userEvent.setup();
    const api = apiFixture();
    const successfulGetJourney = api.getJourney;
    const getJourney = vi
      .fn<CurriculumApi['getJourney']>()
      .mockResolvedValueOnce({ ok: false, kind: 'network' })
      .mockImplementation(successfulGetJourney);
    api.getJourney = getJourney;
    renderClient(api);

    expect(
      await screen.findByRole('heading', { name: 'Journey unavailable' }),
    ).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Retry Journey' }));
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: journeyFixture.title,
      }),
    ).toBeDefined();
    expect(getJourney).toHaveBeenCalledTimes(2);
  });

  it('shows the explicit empty Course map state', async () => {
    const api = apiFixture();
    api.getJourney = vi.fn(async () =>
      success({
        ...journeyFixture,
        chapterCount: 0,
        questCount: 0,
        chapters: [],
      }),
    );
    renderClient(api);

    expect(
      await screen.findByText(
        'This published Journey does not have any quests available yet.',
      ),
    ).toBeDefined();
  });

  it('withholds the map when nested data is malformed', async () => {
    const api = apiFixture();
    const getChapter: CurriculumApi['getChapter'] = async () => ({
      ok: false,
      kind: 'invalid-response',
      status: 200,
    });
    api.getChapter = vi.fn(getChapter);
    renderClient(api);

    expect(
      await screen.findByText(
        'CodeQuest received Journey information it could not safely display.',
      ),
    ).toBeDefined();
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Course map' })).toBeNull(),
    );
  });
});
