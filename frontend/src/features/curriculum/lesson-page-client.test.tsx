import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PublicApiResult, QuestDetail } from '@/lib/api-client';
import { questFixtures } from './journey-course-test-data';
import { LessonPageClient, type LessonApi } from './lesson-page-client';

const authState = vi.hoisted(() => ({ ownerId: '' }));
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
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
    },
  }),
}));
afterEach(() => {
  authState.ownerId = '';
  vi.unstubAllGlobals();
});

const quest: QuestDetail = {
  ...questFixtures['Q01'],
  lesson: '# Read this\n\nFollow the instructions.',
  starterCode: 'private starter source',
  cases: [
    {
      id: 'private-case',
      category: 'normal',
      kind: 'console',
      feedback: 'private check',
      expectedOutput: 'x',
    },
  ],
};

function success<T>(data: T): PublicApiResult<T> {
  return { ok: true, data, requestId: 'lesson-request' };
}

function renderClient(api: LessonApi) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LessonPageClient
        slug={quest.slug}
        api={api}
        apiBaseUrl="https://api.codequest.test"
      />
    </QueryClientProvider>,
  );
}

describe('LessonPageClient', () => {
  it('keeps lesson reading available when activity recording fails', async () => {
    authState.ownerId = 'current-owner';
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response('{}', {
          status: 503,
          headers: { 'content-type': 'application/json' },
        }),
    );
    renderClient({ getQuest: async () => success(quest) });
    expect(
      await screen.findByRole('heading', { level: 1, name: quest.title }),
    ).toBeDefined();
    expect(
      await screen.findByText(/Activity could not be saved/i),
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Read this' }),
    ).toBeDefined();
  });

  it('records authenticated lesson start and opened hint without sending owner fields', async () => {
    authState.ownerId = 'current-owner';
    const requests: Array<{
      path: string;
      body: string;
      authorization: string | null;
    }> = [];
    vi.stubGlobal(
      'fetch',
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const request =
          input instanceof Request ? input : new Request(input, init);
        requests.push({
          path: new URL(request.url).pathname,
          body: await request.text(),
          authorization: request.headers.get('authorization'),
        });
        return new Response(
          JSON.stringify({
            questId: quest.id,
            occurredAt: '2026-09-27T00:00:00.000Z',
          }),
          { status: 201, headers: { 'content-type': 'application/json' } },
        );
      },
    );
    renderClient({ getQuest: async () => success(quest) });
    expect(
      await screen.findByRole('heading', { level: 1, name: quest.title }),
    ).toBeDefined();
    await waitFor(() =>
      expect(requests.some((item) => item.path.endsWith('/start'))).toBe(true),
    );
    await userEvent.setup().click(screen.getByText('1. Question hint'));
    await waitFor(() =>
      expect(requests.some((item) => item.path.endsWith('/hints'))).toBe(true),
    );
    expect(
      requests.every(
        (item) =>
          item.authorization === 'Bearer test-token' &&
          !item.body.includes('userId'),
      ),
    ).toBe(true);
  });

  it('loads and presents published reading data without later-phase payloads', async () => {
    const getQuest = vi.fn<LessonApi['getQuest']>(async () => success(quest));
    renderClient({ getQuest });
    expect(screen.getByLabelText('Loading lesson')).toBeDefined();
    expect(
      await screen.findByRole('heading', { level: 1, name: quest.title }),
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Read this' }),
    ).toBeDefined();
    expect(screen.getByText(quest.objective)).toBeDefined();
    expect(screen.queryByText('private starter source')).toBeNull();
    expect(screen.queryByText('private check')).toBeNull();
    expect(getQuest).toHaveBeenCalledWith(quest.slug, expect.any(AbortSignal));
  });

  it('shows safe not-found and invalid-response states', async () => {
    const getQuest = vi.fn<LessonApi['getQuest']>(async () => ({
      ok: false,
      kind: 'http',
      status: 404,
      error: {
        code: 'NOT_FOUND',
        message: 'private draft path',
        status: 404,
        requestId: 'private-id',
      },
    }));
    renderClient({ getQuest });
    expect(
      await screen.findByRole('heading', { name: 'Lesson not found' }),
    ).toBeDefined();
    expect(screen.queryByText(/private draft path/i)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry lesson' })).toBeNull();
  });

  it('retries a recoverable failure', async () => {
    const user = userEvent.setup();
    const getQuest = vi
      .fn<LessonApi['getQuest']>()
      .mockResolvedValueOnce({ ok: false, kind: 'network' })
      .mockResolvedValue(success(quest));
    renderClient({ getQuest });
    await user.click(
      await screen.findByRole('button', { name: 'Retry lesson' }),
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: quest.title }),
    ).toBeDefined();
    expect(getQuest).toHaveBeenCalledTimes(2);
  });
});
