import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthForm } from './auth-form';

const replace = vi.fn();
const refresh = vi.fn();
const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signInWithOAuth = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}));
vi.mock('./auth-config', () => ({
  loadFrontendAuthConfig: () => ({
    callbackUrl: 'http://localhost:3000/auth/callback',
  }),
}));
vi.mock('./supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: { signInWithPassword, signUp, signInWithOAuth },
  }),
}));

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInWithPassword.mockResolvedValue({ error: null });
    signUp.mockResolvedValue({ data: { session: null }, error: null });
    signInWithOAuth.mockResolvedValue({ error: null });
  });

  it('signs in with labelled controls and a safe local destination', async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" nextPath="/account" />);
    await user.type(screen.getByLabelText('Email'), 'learner@example.test');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'learner@example.test',
      password: 'password123',
    });
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/account'));
  });

  it('shows confirmation state without exposing provider error details', async () => {
    const user = userEvent.setup();
    const registration = render(<AuthForm mode="register" />);
    await user.type(screen.getByLabelText('Email'), 'learner@example.test');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect((await screen.findByRole('status')).textContent).toContain(
      'Check your email',
    );
    registration.unmount();

    signInWithPassword.mockRejectedValue(new Error('token=private-token'));
    render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText('Email'), 'learner@example.test');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect((await screen.findByRole('alert')).textContent).not.toContain(
      'private-token',
    );
  });

  it('starts each approved OAuth provider with the callback and safe return path', async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" nextPath="/account" />);
    await user.click(screen.getByRole('button', { name: 'Google' }));
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback?next=%2Faccount',
      },
    });
  });
});
