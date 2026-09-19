import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChapterCard } from './chapter-card';

describe('ChapterCard', () => {
  it('renders chapter summary from display props', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <ChapterCard
        title="Foundations"
        description="First steps with variables."
        completedQuests={2}
        totalQuests={5}
        statusText="In progress"
        onOpen={onOpen}
      />,
    );
    expect(screen.getByText('Foundations')).toBeDefined();
    expect(screen.getByText('In progress')).toBeDefined();
    expect(screen.getByText('Foundations quests: 2 / 5')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Open chapter' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
