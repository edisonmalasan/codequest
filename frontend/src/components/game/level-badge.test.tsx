import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LevelBadge } from './level-badge';

describe('LevelBadge', () => {
  it('renders the given level as text', () => {
    render(<LevelBadge level={7} title="Debugger" />);
    expect(screen.getByText('Level 7 — Debugger')).toBeDefined();
  });
});
