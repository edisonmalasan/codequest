import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PublicApiResult, QuestDetail } from '@/lib/api-client';
import { questFixtures } from './journey-course-test-data';
import { LessonPageClient, type LessonApi } from './lesson-page-client';

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
