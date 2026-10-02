import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { JourneySummary, PublicApiResult } from '@/lib/api-client';
import { HomeLearning } from './home-learning';

const journey: JourneySummary = {
  id: 'journey-1',
  slug: 'javascript-foundations',
  title: 'JavaScript Foundations',
  position: 1,
  chapterCount: 3,
  questCount: 12,
};

function success(data: JourneySummary[]): PublicApiResult<JourneySummary[]> {
  return { ok: true, data, requestId: null };
}

describe('HomeLearning', () => {
  it('renders a published Journey link from the API response', async () => {
    const getJourneys = vi.fn().mockResolvedValue(success([journey]));
    render(<HomeLearning api={{ getJourneys }} />);
    expect(screen.getByText(/Loading published learning paths/)).toBeTruthy();
    const link = await screen.findByRole('link', {
      name: /JavaScript Foundations/,
    });
    expect(link.getAttribute('href')).toBe('/journeys/javascript-foundations');
    expect(link.textContent).toContain('3 chapters');
    expect(link.textContent).toContain('12 exercises');
    expect(getJourneys).toHaveBeenCalledTimes(1);
  });

  it('shows an honest empty state without a fabricated path', async () => {
    render(<HomeLearning api={{ getJourneys: async () => success([]) }} />);
    expect(
      await screen.findByText(/No learning path is available/),
    ).toBeTruthy();
    expect(
      screen.queryByRole('link', { name: /JavaScript Foundations/ }),
    ).toBeNull();
    expect(screen.getByRole('link', { name: /How it works/ })).toBeTruthy();
  });

  it('offers retry after a failed read and then shows the returned path', async () => {
    const user = userEvent.setup();
    const getJourneys = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, kind: 'network' })
      .mockResolvedValueOnce(success([journey]));
    render(<HomeLearning api={{ getJourneys }} />);
    expect(
      await screen.findByText(/Learning paths are unavailable/),
    ).toBeTruthy();
    expect(
      screen.queryByRole('link', { name: /JavaScript Foundations/ }),
    ).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Retry loading' }));
    expect(
      await screen.findByRole('link', { name: /JavaScript Foundations/ }),
    ).toBeTruthy();
    expect(getJourneys).toHaveBeenCalledTimes(2);
  });
});
