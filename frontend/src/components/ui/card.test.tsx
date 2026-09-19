import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './card';

describe('Card', () => {
  it('renders title as a heading with content', () => {
    render(<Card title="Quest log">Three quests remain.</Card>);
    expect(screen.getByRole('heading', { name: 'Quest log' })).toBeDefined();
    expect(screen.getByText('Three quests remain.')).toBeDefined();
  });
});
