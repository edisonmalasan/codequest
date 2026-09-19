import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AchievementCard } from './achievement-card';

describe('AchievementCard', () => {
  it('marks unlocked achievements in text', () => {
    render(
      <AchievementCard
        title="First run"
        description="Ran code once."
        unlocked
      />,
    );
    expect(screen.getByText('Unlocked')).toBeDefined();
  });

  it('marks locked achievements in text, not color alone', () => {
    render(
      <AchievementCard
        title="Marathon"
        description="Finish a chapter."
        unlocked={false}
      />,
    );
    expect(screen.getByText('Locked')).toBeDefined();
  });
});
