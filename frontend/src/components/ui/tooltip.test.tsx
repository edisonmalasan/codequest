'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  it('describes its trigger and reveals on focus', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip tip="Grants progress">
        <button type="button">Quest</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Quest' });
    const tip = screen.getByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(
      tip.getAttribute('id'),
    );
    await user.tab();
    expect(document.activeElement).toBe(trigger);
    expect(tip.className).toContain('opacity-100');
  });
});
