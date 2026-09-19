'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './dialog';

describe('Dialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Dialog open={false} title="Settings" onClose={() => {}}>
        Body
      </Dialog>,
    );
    expect(container).toHaveProperty('textContent', '');
  });

  it('focuses inside on open and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog open title="Settings" onClose={onClose}>
        <button type="button">Inside</button>
      </Dialog>,
    );
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeDefined();

    await user.tab();
    expect(document.activeElement).toHaveProperty('textContent', 'Inside');

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the overlay is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <Dialog open title="Settings" onClose={onClose}>
        Body
      </Dialog>,
    );
    const overlay = container.querySelector("[aria-hidden='true']");
    expect(overlay).not.toBeNull();
    await user.click(overlay as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
