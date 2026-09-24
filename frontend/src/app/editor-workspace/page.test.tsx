import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({ notFound }));

describe('EditorWorkspacePage', () => {
  beforeEach(() => {
    vi.resetModules();
    notFound.mockClear();
  });

  it('renders the review workspace outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { default: Page } = await import('./page');
    render(<Page />);
    expect(
      screen.getByRole('heading', { name: 'Reusable workspace preview' }),
    ).toBeDefined();
    vi.unstubAllEnvs();
  });

  it('returns not found in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { default: Page } = await import('./page');
    expect(() => Page()).toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });
});
