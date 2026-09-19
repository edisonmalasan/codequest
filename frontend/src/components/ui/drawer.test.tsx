'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './drawer';

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Drawer open={false} title="Menu" onClose={() => {}}>
        Body
      </Drawer>,
    );
    expect(container).toHaveProperty('textContent', '');
  });

  it('opens as a labelled panel and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Drawer open title="Menu" onClose={onClose}>
        <button type="button">Panel action</button>
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeDefined();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
