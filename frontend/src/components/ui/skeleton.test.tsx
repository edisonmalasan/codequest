import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('announces loading with its shape class', () => {
    const { container } = render(
      <Skeleton label="Loading quest" className="h-6 w-40" />,
    );
    expect(screen.getByRole('status', { name: 'Loading quest' })).toBeDefined();
    expect(container.querySelector('.h-6')).not.toBeNull();
  });
});
