'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dropdown } from './dropdown';

const options = [
  { value: 'easy', label: 'Easy' },
  { value: 'normal', label: 'Normal' },
];

describe('Dropdown', () => {
  it('opens, selects with keyboard, and reports the choice', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Dropdown label="Difficulty" options={options} onSelect={onSelect} />,
    );
    const trigger = screen.getByRole('button', { name: 'Difficulty' });
    await user.click(trigger);
    expect(screen.getByRole('menu', { name: 'Difficulty' })).toBeDefined();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('normal');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Dropdown label="Difficulty" options={options} />);
    await user.click(screen.getByRole('button', { name: 'Difficulty' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('moves focus into the menu on keyboard open for announcement', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Dropdown label="Difficulty" options={options} onSelect={onSelect} />,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu', { name: 'Difficulty' })).toBeDefined();
    expect(document.activeElement).toHaveProperty('textContent', 'Easy');
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toHaveProperty('textContent', 'Normal');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('normal');
  });
});
