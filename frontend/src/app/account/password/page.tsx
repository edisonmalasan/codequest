import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthFrame } from '@/features/auth/auth-frame';
import { getTrustedAuthSession } from '@/features/auth/auth-session';
import { PasswordUpdateForm } from '@/features/auth/password-update-form';

export const dynamic = 'force-dynamic';

export default async function PasswordPage(): Promise<React.JSX.Element> {
  if ((await getTrustedAuthSession()) === undefined)
    redirect('/login?error=callback');
  return (
    <AuthFrame
      title="Update password"
      description="Set a new password for your email account. Provider sign-in remains available for Google and GitHub accounts."
    >
      <div className="space-y-5">
        <PasswordUpdateForm />
        <Link href="/account" className="font-bold text-ascent underline">
          Back to account
        </Link>
      </div>
    </AuthFrame>
  );
}
