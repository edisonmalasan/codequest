import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CourseSummary, PublicApiResult } from '@/lib/api-client';
import { CourseCatalog } from './course-catalog';

const course: CourseSummary = {
  id: 'COURSE-JS-FOUNDATIONS',
  slug: 'javascript-foundations',
  journeyId: 'JAVASCRIPT-FOUNDATIONS',
  journeySlug: 'javascript-foundations',
  title: 'JavaScript Foundations',
  summary: 'Learn JavaScript through exercises.',
  position: 1,
  topics: ['javascript'],
  chapterCount: 7,
  questCount: 25,
};

function published(courses: CourseSummary[]): PublicApiResult<CourseSummary[]> {
  return { ok: true, data: courses, requestId: null };
}

describe('CourseCatalog', () => {
  it('renders only the published API response and filters by title or topic', async () => {
    const user = userEvent.setup();
    render(
      <CourseCatalog api={{ getCourses: async () => published([course]) }} />,
    );
    const link = await screen.findByRole('link', {
      name: /JavaScript Foundations/,
    });
    expect(link.getAttribute('href')).toBe('/courses/javascript-foundations');
    await user.type(screen.getByRole('searchbox'), 'no match');
    expect(
      screen.queryByRole('link', { name: /JavaScript Foundations/ }),
    ).toBeNull();
    expect(screen.getByText('No courses match your search.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(
      screen.getByRole('link', { name: /JavaScript Foundations/ }),
    ).toBeTruthy();
  });

  it('never invents a Course after an empty or failed read', async () => {
    const getCourses = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, kind: 'network' })
      .mockResolvedValueOnce(published([]));
    const user = userEvent.setup();
    render(<CourseCatalog api={{ getCourses }} />);
    expect(
      await screen.findByText('Courses are unavailable right now.'),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Retry loading' }));
    expect(
      await screen.findByText('No courses are published yet.'),
    ).toBeTruthy();
    expect(
      screen.queryByRole('link', { name: /JavaScript Foundations/ }),
    ).toBeNull();
  });
});
