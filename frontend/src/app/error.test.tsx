import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RouteError from './error';
import { getBrowserMonitoring } from '@/features/monitoring/browser-monitoring';

vi.mock('@/features/monitoring/browser-monitoring', () => ({
  getBrowserMonitoring: vi.fn(),
}));

describe('route recovery', () => {
  it('shows safe text, captures once and calls reset', async () => {
    const capture = vi.fn();
    vi.mocked(getBrowserMonitoring).mockReturnValue({ capture });
    const reset = vi.fn();
    const error = new Error('learner source canary');
    render(<RouteError error={error} reset={reset} />);
    expect(screen.getByRole('alert').textContent).not.toContain('canary');
    await waitFor(() => expect(capture).toHaveBeenCalledOnce());
    expect(capture).toHaveBeenCalledWith('route_render', error);
    screen.getByRole('button', { name: 'Try again' }).click();
    expect(reset).toHaveBeenCalledOnce();
  });
});
