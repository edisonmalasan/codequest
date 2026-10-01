import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedbackDraft } from './feedback-draft';

describe('device-local feedback', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
          values.set(key, value);
        },
        removeItem: (key: string) => {
          values.delete(key);
        },
        get length() {
          return values.size;
        },
      },
    });
  });

  it('saves once, restores and clears without sending a request', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch');
    const user = userEvent.setup();
    const first = render(<FeedbackDraft />);
    await user.type(screen.getByLabelText('Your feedback'), 'The hint helped.');
    await user.click(
      screen.getByRole('button', { name: 'Save on this device' }),
    );
    expect(screen.getByRole('status').textContent).toContain('not sent');
    first.unmount();
    render(<FeedbackDraft />);
    expect(
      (screen.getByLabelText('Your feedback') as HTMLTextAreaElement).value,
    ).toBe('The hint helped.');
    await user.click(screen.getByRole('button', { name: 'Clear draft' }));
    expect(window.localStorage.length).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('keeps visible text when storage rejects a write', async () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const user = userEvent.setup();
    render(<FeedbackDraft />);
    await user.type(screen.getByLabelText('Your feedback'), 'Keep this text');
    await user.click(
      screen.getByRole('button', { name: 'Save on this device' }),
    );
    expect(
      (screen.getByLabelText('Your feedback') as HTMLTextAreaElement).value,
    ).toBe('Keep this text');
    expect(screen.getByRole('alert').textContent).toContain('copy it');
    vi.restoreAllMocks();
  });
});
