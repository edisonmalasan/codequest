import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from './progress';

describe('Progress', () => {
  it('exposes value bounds and a text label', () => {
    render(<Progress value={30} max={60} label="Chapter progress" />);
    const bar = screen.getByRole('progressbar', { name: 'Chapter progress' });
    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    expect(bar.getAttribute('aria-valuemax')).toBe('60');
    expect(screen.getByText('Chapter progress: 30 / 60')).toBeDefined();
  });

  it('clamps out-of-range values', () => {
    render(<Progress value={200} max={100} label="Overfull" />);
    expect(
      screen
        .getByRole('progressbar', { name: 'Overfull' })
        .getAttribute('aria-valuenow'),
    ).toBe('100');
  });
});
