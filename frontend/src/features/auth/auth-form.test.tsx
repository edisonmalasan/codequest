import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthForm } from './auth-form';
import { loadFrontendAuthConfig } from './auth-config';

const replace = vi.fn();
const refresh = vi.fn();
const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signInWithOAuth = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}));
vi.mock('./auth-config', () => ({
  loadFrontendAuthConfig: vi.fn(() => ({
    callbackUrl: 'http://localhost:3000/auth/callback',
    supabaseUrl: 'http://127.0.0.1:54321',
    publishableKey: 'publishable-local-test-key',
  })),
}));
vi.mock('./supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: { signInWithPassword, signUp, signInWithOAuth },
  }),
}));

describe('AuthForm', () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    vi.clearAllMocks();
    signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'synthetic-owner' } } },
      error: null,
    });
    signUp.mockResolvedValue({ data: { session: null }, error: null });
    signInWithOAuth.mockResolvedValue({ error: null });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ external: { google: true, github: true } }),
      }),
    );
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
    expect(loadFrontendAuthConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      }),
    );
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
    await waitFor(() =>
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback?next=%2Faccount',
        },
      }),
    );
  });

  it('keeps a disabled provider on the login route with a safe email alternative', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ external: { google: false, github: true } }),
      }),
    );
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);
    await user.click(screen.getByRole('button', { name: 'Google' }));
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Google sign-in is unavailable here. Use email sign-in or try later.',
    );
    expect(signInWithOAuth).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Google' }).hasAttribute('disabled'),
    ).toBe(false);
  });

  it('does not claim login when the provider returns no session', async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText('Email'), 'learner@example.test');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Sign in failed',
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
