import { redirect } from 'next/navigation';
import { AuthForm } from '@/features/auth/auth-form';
import { AuthFrame } from '@/features/auth/auth-frame';
import { getTrustedAuthSession } from '@/features/auth/auth-session';
import { safeReturnPath } from '@/features/auth/return-path';

export const dynamic = 'force-dynamic';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}): Promise<React.JSX.Element> {
  const parameters = await searchParams;
  const destination = safeReturnPath(parameters.next);
  if ((await getTrustedAuthSession()) !== undefined) redirect(destination);
  return (
    <AuthFrame
      title="Create your player ID"
      description="Start with a private account for your learning progress."
    >
      <AuthForm mode="register" nextPath={destination} />
    </AuthFrame>
  );
}
