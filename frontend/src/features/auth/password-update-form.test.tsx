import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordUpdateForm } from './password-update-form';

const updateUser = vi.fn();
vi.mock('./supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({ auth: { updateUser } }),
}));

describe('password update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateUser.mockResolvedValue({ error: null });
  });

  it('updates through Auth, clears the field and reports success', async () => {
    render(<PasswordUpdateForm />);
    await userEvent
      .setup()
      .type(screen.getByLabelText('New password'), 'freshpassword123');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Update password' }));
    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({ password: 'freshpassword123' }),
    );
    expect(screen.getByRole('status').textContent).toBe('Password updated.');
    expect(
      (screen.getByLabelText('New password') as HTMLInputElement).value,
    ).toBe('');
  });

  it('keeps provider errors private', async () => {
    updateUser.mockRejectedValue(new Error('private-token'));
    render(<PasswordUpdateForm />);
    await userEvent
      .setup()
      .type(screen.getByLabelText('New password'), 'freshpassword123');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Update password' }));
    expect((await screen.findByRole('alert')).textContent).not.toContain(
      'private-token',
    );
  });
});
