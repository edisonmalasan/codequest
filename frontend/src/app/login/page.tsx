import { redirect } from 'next/navigation';
import { AuthForm } from '@/features/auth/auth-form';
import { AuthFrame } from '@/features/auth/auth-frame';
import { getTrustedAuthSession } from '@/features/auth/auth-session';
import { safeReturnPath } from '@/features/auth/return-path';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}): Promise<React.JSX.Element> {
  const parameters = await searchParams;
  const destination = safeReturnPath(parameters.next);
  if ((await getTrustedAuthSession()) !== undefined) redirect(destination);
  return (
    <AuthFrame
      title="Resume your quest"
      description="Sign in to reach your private CodeQuest account and accepted progress."
    >
      <AuthForm
        mode="login"
        nextPath={destination}
        callbackFailed={parameters.error === 'callback'}
      />
    </AuthFrame>
  );
}
