'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs } from './tabs';

const tabs = [
  { id: 'learn', label: 'Learn', content: 'Lesson text' },
  { id: 'practice', label: 'Practice', content: 'Exercise text' },
];

describe('Tabs', () => {
  it('shows the default panel and switches on click', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} label="Quest views" />);
    expect(screen.getByText('Lesson text')).toBeDefined();
    await user.click(screen.getByRole('tab', { name: 'Practice' }));
    expect(screen.getByText('Exercise text')).toBeDefined();
    expect(
      screen
        .getByRole('tab', { name: 'Practice' })
        .getAttribute('aria-selected'),
    ).toBe('true');
  });

  it('moves between tabs with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} label="Quest views" />);
    screen.getByRole('tab', { name: 'Learn' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveProperty('textContent', 'Practice');
    expect(screen.getByText('Exercise text')).toBeDefined();
  });
});
