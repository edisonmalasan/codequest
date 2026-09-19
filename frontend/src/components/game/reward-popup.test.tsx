'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RewardPopup } from './reward-popup';

describe('RewardPopup', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <RewardPopup
        open={false}
        title="Quest complete"
        description="+50 XP"
        onClose={() => {}}
      />,
    );
    expect(container).toHaveProperty('textContent', '');
  });

  it('announces the reward and focuses dismiss', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <RewardPopup
        open
        title="Quest complete"
        description="+50 XP"
        onClose={onClose}
      />,
    );
    expect(
      screen.getByRole('alertdialog', { name: 'Quest complete' }),
    ).toBeDefined();
    await user.tab();
    expect(document.activeElement).toHaveProperty('textContent', 'Continue');
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
