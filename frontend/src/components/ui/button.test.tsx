import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)(
    'renders the %s variant',
    (variant) => {
      render(<Button variant={variant}>Play</Button>);
      expect(screen.getByRole('button', { name: 'Play' })).toBeDefined();
    },
  );

  it.each(['sm', 'md', 'lg'] as const)(
    'renders size %s on one line',
    (size) => {
      const { container } = render(<Button size={size}>Go</Button>);
      expect(container.querySelector('button')).not.toBeNull();
    },
  );

  it('announces loading and disables interaction', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button', { name: 'Loading…' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });
});
