import { describe, expect, it, vi } from 'vitest';
import PasswordPage from './page';

const { redirect, getTrustedAuthSession } = vi.hoisted(() => ({
  redirect: vi.fn(() => {
    throw new Error('redirected');
  }),
  getTrustedAuthSession: vi.fn(),
}));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('@/features/auth/auth-session', () => ({ getTrustedAuthSession }));

describe('password page', () => {
  it('requires a trusted session', async () => {
    getTrustedAuthSession.mockResolvedValue(undefined);
    await expect(PasswordPage()).rejects.toThrow('redirected');
    expect(redirect).toHaveBeenCalledWith('/login?error=callback');
  });

  it('renders an update form with a session', async () => {
    getTrustedAuthSession.mockResolvedValue({ user: { id: 'owner' } });
    const page = await PasswordPage();
    expect(page.props.title).toBe('Update password');
  });
});
