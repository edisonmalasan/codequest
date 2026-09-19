import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { XPBar } from './xp-bar';

describe('XPBar', () => {
  it('renders display values as progress and text', () => {
    render(<XPBar value={120} max={200} label="Experience" />);
    const bar = screen.getByRole('progressbar', { name: 'Experience' });
    expect(bar.getAttribute('aria-valuenow')).toBe('120');
    expect(screen.getByText('Experience: 120 / 200 XP')).toBeDefined();
  });
});
