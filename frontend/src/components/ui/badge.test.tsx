import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it.each(['neutral', 'ascent', 'reward', 'danger', 'outline'] as const)(
    'renders the %s variant with its label',
    (variant) => {
      render(<Badge variant={variant}>Level 3</Badge>);
      expect(screen.getByText('Level 3')).toBeDefined();
    },
  );
});
