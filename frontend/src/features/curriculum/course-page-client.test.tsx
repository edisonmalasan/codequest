import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  CourseDetail,
  CourseProgress,
  ProtectedApiResult,
  PublicApiResult,
} from '@/lib/api-client';
import { valuesChapterFixture } from './journey-course-test-data';
import type { GuestProgress } from './guest-learning';
import { CoursePageClient } from './course-page-client';

const auth = vi.hoisted(() => ({ ownerId: '' }));
vi.mock('@/features/auth/supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({
        data: {
          session: auth.ownerId
            ? { user: { id: auth.ownerId }, access_token: 'test-token' }
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
  auth.ownerId = '';
});

const course: CourseDetail = {
  id: 'COURSE-JS-FOUNDATIONS',
  slug: 'javascript-foundations',
  journeyId: 'JAVASCRIPT-FOUNDATIONS',
  journeySlug: 'javascript-foundations',
  title: 'JavaScript Foundations',
  summary: 'Learn JavaScript through exercises.',
  position: 1,
  topics: ['javascript'],
  chapterCount: 1,
  questCount: 2,
  outcomes: [{ id: 'C1', description: 'Use values.' }],
  chapters: [
    {
      id: valuesChapterFixture.id,
      slug: valuesChapterFixture.slug,
      title: valuesChapterFixture.title,
      position: valuesChapterFixture.position,
      objectiveSummary: valuesChapterFixture.objectiveSummary,
      questCount: 2,
    },
  ],
};
function success<T>(data: T): PublicApiResult<T> {
  return { ok: true, data, requestId: null };
}
function view(
  progress: ProtectedApiResult<CourseProgress>,
  guest: GuestProgress[] = [],
) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <CoursePageClient
        slug="javascript-foundations"
        api={{
          getPublishedCourse: async () => success(course),
          getChapter: async () => success(valuesChapterFixture),
        }}
        guestProgressLoader={async () => guest}
        progressApi={{ getPublishedCourseProgress: async () => progress }}
      />
    </QueryClientProvider>,
  );
}

describe('CoursePageClient', () => {
  it('shows published guest practice as provisional', async () => {
    view({ ok: false, kind: 'unauthenticated' });
    expect(
      await screen.findByRole('heading', { name: 'JavaScript Foundations' }),
    ).toBeTruthy();
    expect(screen.getByText(/Guest work is provisional/)).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: /First value, Guest practice/ })
        .getAttribute('href'),
    ).toBe('/quests/first-value');
  });

  it('withholds account unlock claims when protected progress fails', async () => {
    auth.ownerId = 'synthetic-owner';
    view({ ok: false, kind: 'network' });
    expect(
      await screen.findByText(/Saved progress is unavailable/),
    ).toBeTruthy();
    expect(screen.queryByRole('link', { name: /First value/ })).toBeNull();
  });

  it('shows device-local started work without treating it as accepted completion', async () => {
    view({ ok: false, kind: 'unauthenticated' }, [
      { questId: 'Q01', startedAt: 1 },
    ]);
    expect(
      await screen.findByText('Started on this device · provisional'),
    ).toBeTruthy();
    expect(screen.queryByText(/completed from your account/)).toBeNull();
  });
});
