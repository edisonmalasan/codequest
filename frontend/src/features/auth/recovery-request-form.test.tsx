import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecoveryRequestForm } from './recovery-request-form';

const resetPasswordForEmail = vi.fn();
vi.mock('./auth-config', () => ({
  loadFrontendAuthConfig: () => ({
    callbackUrl: 'https://app.example.test/auth/callback',
  }),
}));
vi.mock('./supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({ auth: { resetPasswordForEmail } }),
}));

describe('recovery request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it('uses the trusted callback and gives a generic success message', async () => {
    render(<RecoveryRequestForm />);
    await userEvent
      .setup()
      .type(screen.getByLabelText('Email'), 'learner@example.test');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Send recovery link' }));
    await waitFor(() =>
      expect(resetPasswordForEmail).toHaveBeenCalledWith(
        'learner@example.test',
        {
          redirectTo:
            'https://app.example.test/auth/callback?next=%2Faccount%2Fpassword',
        },
      ),
    );
    expect(screen.getByRole('status').textContent).toContain('If this email');
    expect(screen.queryByText('learner@example.test')).toBeNull();
  });

  it('does not distinguish provider failure from an eligible address', async () => {
    resetPasswordForEmail.mockRejectedValue(
      new Error('secret provider detail'),
    );
    render(<RecoveryRequestForm />);
    await userEvent
      .setup()
      .type(screen.getByLabelText('Email'), 'unknown@example.test');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Send recovery link' }));
    expect((await screen.findByRole('status')).textContent).toContain(
      'If this email',
    );
    expect(screen.queryByText('secret provider detail')).toBeNull();
  });
});
